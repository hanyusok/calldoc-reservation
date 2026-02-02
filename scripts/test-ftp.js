
const ftp = require("basic-ftp");
require("dotenv").config();

async function testFtp() {
    console.log("Starting FTP Diagnostic...");
    const client = new ftp.Client(10000); // 10s timeout for test
    client.ftp.verbose = true;

    const HOST = process.env.BAROBILL_FTP_HOST || "testftp.barobill.co.kr";
    const USER = process.env.BAROBILL_FTP_USER || process.env.BAROBILL_USER_ID || "hanyusok";
    const PASS = process.env.BAROBILL_FTP_PASSWORD || "";
    const PORT = parseInt(process.env.BAROBILL_FTP_PORT || 9031);

    console.log(`Target: ${HOST}:${PORT}, User: ${USER}`);

    try {
        console.log("\n--- Attempt 1: Plain FTP, Passive (Default) ---");
        await client.access({
            host: HOST,
            user: USER,
            password: PASS,
            port: PORT,
            secure: false
        });
        console.log("Connected! Listing files...");
        await client.list();
        console.log("List successful (PASV working).");
        client.close();
    } catch (err) {
        console.error("Attempt 1 Failed:", err.message);
        client.close();
    }

    try {
        console.log("\n--- Attempt 2: Secure (Explicit TLS), Passive ---");
        const client2 = new ftp.Client(10000);
        client2.ftp.verbose = true;
        await client2.access({
            host: HOST,
            user: USER,
            password: PASS,
            port: PORT,
            secure: true,
            secureOptions: { rejectUnauthorized: false } // Accept self-signed
        });
        console.log("Connected Securely! Listing files...");
        await client2.list();
        console.log("Secure List successful.");
        client2.close();
    } catch (err) {
        console.error("Attempt 2 Failed:", err.message);
    }
}

testFtp();
