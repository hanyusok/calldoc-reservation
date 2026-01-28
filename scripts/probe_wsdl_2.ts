
import * as soap from "soap";

const URLS = [
    "https://testws.baroservice.com/ElectronicTax.asmx?WSDL",
    "https://testws.baroservice.com/TiXML.asmx?WSDL",
    "https://testws.baroservice.com/SMS.asmx?WSDL",
    "https://testws.baroservice.com/CashBill.asmx?WSDL"
];

async function probe() {
    for (const url of URLS) {
        try {
            console.log(`Checking ${url}...`);
            const client = await soap.createClientAsync(url);
            const methods = Object.keys(client.describe()[Object.keys(client.describe())[0]][Object.keys(client.describe()[Object.keys(client.describe())[0]])[0]]);
            console.log(`Methods found: ${methods.length}`);
            if (methods.includes("UploadFile")) {
                console.log("!!! FOUND UploadFile in " + url + " !!!");
            }
        } catch (e) {
            console.log(`Failed ${url}: ${e.message.split('\n')[0]}`);
        }
    }
}

probe();
