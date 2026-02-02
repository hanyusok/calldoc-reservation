'use server'
// Forces recompile

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import * as soap from "soap"
import { Client as FtpClient } from "basic-ftp"
import { createNotification } from "@/lib/notifications"
import { Readable } from "stream"

const BAROBILL_CERT_KEY = process.env.BAROBILL_CERT_KEY!;
const BAROBILL_WSDL = process.env.BAROBILL_WSDL!;
const BAROBILL_CORP_NUM = process.env.BAROBILL_CORP_NUM || "1209084343";
const BAROBILL_USER_ID = process.env.BAROBILL_USER_ID || "hanyusok";
const BAROBILL_SENDER_NUMBER = process.env.BAROBILL_SENDER_NUMBER || "00000000";

// FTP Configuration (Add these to .env)
const FTP_HOST = process.env.BAROBILL_FTP_HOST || "testftp.barobill.co.kr"; // Default to test
const FTP_USER = process.env.BAROBILL_FTP_USER || BAROBILL_USER_ID; // Default to BaroBill User ID
const FTP_PASSWORD = process.env.BAROBILL_FTP_PASSWORD || "";

export async function sendFax(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const file = formData.get("file") as File;
        const prescriptionId = formData.get("prescriptionId") as string;

        if (!file || !prescriptionId) return { error: "Missing file or prescription ID" };

        const prescription = await prisma.prescription.findUnique({
            where: { id: prescriptionId },
            include: { appointment: { include: { patient: true } } }
        });

        if (!prescription) return { error: "Prescription not found" };

        const receiverFax = prescription.pharmacyFax;
        const receiverName = prescription.pharmacyName || "Pharmacy";

        if (!receiverFax) {
            return { error: "Pharmacy fax number is missing" };
        }

        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`; // Sanitize filename
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[Fax] Starting process for Prescription ${prescriptionId}`);
        console.log(`[Fax] Receiver: ${receiverName} (${receiverFax})`);

        // 1. Upload to FTP
        const ftpPort = parseInt(process.env.BAROBILL_FTP_PORT || "9030");
        console.log(`[Fax] Uploading ${fileName} to FTP (${FTP_HOST}:${ftpPort})...`);
        const ftp = new FtpClient(30000); // Set timeout to 30s
        // ftp.ftp.verbose = true; // Verbose logging disabled after verification

        try {
            await ftp.access({
                host: FTP_HOST,
                user: FTP_USER,
                password: FTP_PASSWORD,
                port: ftpPort,
                secure: false, // Default to plain FTP
            });

            // Upload to root
            const source = Readable.from(buffer);

            await ftp.uploadFrom(source, fileName);
            console.log("[Fax] FTP Upload Successful");

        } catch (ftpError) {
            console.error("[Fax] FTP Error:", ftpError);
            return { error: `FTP Upload Failed: ${(ftpError as Error).message}` };
        } finally {
            ftp.close();
        }

        // 2. Call SendFaxFromFTP
        console.log("[Fax] Connecting to BaroBill SOAP Service...");
        const client = await soap.createClientAsync(BAROBILL_WSDL);

        console.log("[Fax] Sending Fax via FTP reference...");
        // Debug params (hide credentials)
        console.log(`[Fax] Params: SenderID=${BAROBILL_USER_ID}, From=${BAROBILL_SENDER_NUMBER}, To=${receiverFax}`);

        const sendArgs = {
            CERTKEY: BAROBILL_CERT_KEY,
            CorpNum: BAROBILL_CORP_NUM,
            SenderID: BAROBILL_USER_ID,
            FileName: fileName, // Only the filename
            FromNumber: BAROBILL_SENDER_NUMBER,
            ToNumber: receiverFax,
            ReceiveCorp: receiverName,
            ReceiveName: receiverName,
            SendDT: "", // Immediate
            RefKey: ""
        };

        const sendResponse = await client.SendFaxFromFTPAsync(sendArgs);
        // Response format is array, first element is result object
        // The property name depends on the WSDL, usually SendFaxFromFTPResult
        const result = sendResponse[0].SendFaxFromFTPResult;

        console.log(`[Fax] SendFaxFromFTP Result: ${result}`);

        if (!result || (parseInt(result) < 0)) {
            // Error handling
            // If result is negative 5 digit number, it's an error code.
            console.error("[Fax] SendFaxFromFTP Failed. Result:", result);

            // Try to get error string
            try {
                const errResponse = await client.GetErrStringAsync({
                    CERTKEY: BAROBILL_CERT_KEY,
                    ErrCode: result
                });
                const errMsg = errResponse[0].GetErrStringResult;
                console.error(`[Fax] Error Details: ${errMsg}`);
                return { error: `Fax Send Failed (${result}): ${errMsg}` };
            } catch {
                return { error: `Fax Send Failed. Code: ${result}` };
            }
        }

        console.log("[Fax] Fax Sent Successfully. SendKey:", result);

        // 3. Update Status
        await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
                status: 'ISSUED',
                fileUrl: "FAX_SENT_VIA_BAROBILL"
            }
        });

        revalidatePath('/admin/appointments');
        return { success: true, receiptNum: result };

    } catch (error) {
        console.error("[Fax] Failed to send fax via SOAP/FTP lib", error);
        return { error: "Failed to send fax request: " + (error as Error).message };

    }
}

export async function checkFaxStatus(receiptNum: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return { error: "Unauthorized" }

    try {
        console.log(`Checking Fax Status for Receipt: ${receiptNum}...`);
        const client = await soap.createClientAsync(BAROBILL_WSDL);

        const response = await client.GetFaxMessageEx2Async({
            CERTKEY: BAROBILL_CERT_KEY,
            CorpNum: BAROBILL_CORP_NUM,
            SendKey: receiptNum
        });

        // Response structure depends on WSDL. Based on user sample:
        // message.SendState
        const message = response[0].GetFaxMessageEx2Result;

        if (!message) {
            return { error: "No status returned" };
        }

        const sendState = parseInt(message.SendState);
        const sendResult = message.SendResult; // String "802" etc.

        console.log(`Fax Status - State: ${sendState}, Result: ${sendResult}`);

        let statusText = "UNKNOWN";
        let isSuccess = false;
        let isFail = false;

        if (sendState < 0) {
            // API Call Failed associated with the receipt??? Or just GetErrString request?
            const errResponse = await client.GetErrStringAsync({
                CERTKEY: BAROBILL_CERT_KEY,
                ErrCode: sendState
            });
            const errMsg = errResponse[0].GetErrStringResult;
            return { error: `Status Check Failed: ${errMsg}` };

        } else if (sendState === 0 || sendState === 1 || sendState === 2) {
            statusText = "SENDING"; // Processing
        } else if (sendState === 3) {
            if (sendResult === "802") {
                statusText = "SUCCESS";
                isSuccess = true;
            } else {
                statusText = "FAILED";
                isFail = true;
            }
        } else if (sendState === 4 || sendState === 5) {
            statusText = "FAILED"; // Conversion/DB Error
            isFail = true;
        }

        return {
            success: true,
            state: sendState,
            resultCode: sendResult,
            status: statusText,
            isSuccess,
            isFail
        };

    } catch (error) {
        console.error("Failed to check fax status", error);
        return { error: "Failed to check status: " + (error as Error).message };
    }
}
