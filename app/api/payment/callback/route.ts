import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        // Kiwoom Pay sends data as form-urlencoded or JSON? 
        // Typically PGs send form-data for callbacks.
        const contentType = req.headers.get("content-type") || "";
        let data: any = {};

        if (contentType.includes("application/json")) {
            data = await req.json();
        } else {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                data[key] = value;
            });
        }

        console.log("Kiwoom Payment Callback Received:", data);

        // Required fields from Kiwoom Callback (based on standard PG patterns, specific fields valid from docs)
        // Usually: RES_CD (0000), RES_MSG, ORDERNO, AMOUNT, AUTHNO, DAOUTRX etc.
        const { RES_CD, ORDERNO, AUTHNO, AMOUNT, DAOUTRX } = data;

        if (RES_CD === '0000') {
            // Success
            // Find payment
            const payment = await prisma.payment.findUnique({
                where: { id: ORDERNO },
                include: { appointment: true }
            });

            if (payment) {
                // Update payment status if not already completed
                if (payment.status !== 'COMPLETED') {
                    await prisma.$transaction([
                        prisma.payment.update({
                            where: { id: ORDERNO },
                            data: {
                                status: 'COMPLETED',
                                confirmedAt: new Date(),
                                method: PaymentMethod.KIWOOM,
                                paymentKey: DAOUTRX || AUTHNO // Save DAOUTRX (TRXID) for cancellation, fallback to AuthNo
                            }
                        }),
                        prisma.appointment.update({
                            where: { id: payment.appointmentId },
                            data: {
                                status: 'CONFIRMED'
                            }
                        })
                    ]);
                    console.log(`Payment ${ORDERNO} confirmed via Callback`);
                } else {
                    console.log(`Payment ${ORDERNO} already completed`);
                }
            } else {
                console.error(`Payment ${ORDERNO} not found`);
            }

            // Return 'OK' or specific string required by Kiwoom
            return new NextResponse("OK", { status: 200 });

        } else {
            // Failure
            console.warn(`Payment ${ORDERNO} failed: ${data.RES_MSG}`);
            // Optionally update DB to FAILED
            return new NextResponse("OK", { status: 200 }); // Still acknowledge receipt
        }

    } catch (error) {
        console.error("Callback Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
