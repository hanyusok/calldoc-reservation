
import * as soap from "soap";

const BAROBILL_WSDL = "https://testws.baroservice.com/FAX.asmx?WSDL";

async function debugSoap() {
    try {
        console.log("Creating client for:", BAROBILL_WSDL);
        const client = await soap.createClientAsync(BAROBILL_WSDL);
        console.log("Client created.");

        const description = client.describe();
        console.log("--- Client Description (Methods) ---");
        console.log(JSON.stringify(description, null, 2));

        console.log("\n--- Client Keys/Functions ---");
        // Print keys of client that are functions
        Object.keys(client).forEach(key => {
            // @ts-ignore
            if (typeof client[key] === 'function') {
                console.log(key);
            }
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

debugSoap();
