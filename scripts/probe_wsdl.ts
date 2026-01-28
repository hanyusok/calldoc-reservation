
import * as soap from "soap";

const URLS = [
    "https://testws.baroservice.com/File.asmx?WSDL",
    "https://testws.baroservice.com/Common.asmx?WSDL",
    "https://testws.baroservice.com/Base.asmx?WSDL",
    "https://testws.baroservice.com/Upload.asmx?WSDL"
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
            console.log(`Failed ${url}: ${(e as Error).message.split('\n')[0]}`);
        }
    }
}

probe();
