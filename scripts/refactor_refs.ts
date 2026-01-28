
import fs from 'fs';
import path from 'path';

const dir = '/home/han/calldoc-reservation/barobill_references';

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.ts')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace require with import
        content = content.replace(/const soap = require\(['"]soap['"]\);?/g, 'import * as soap from "soap";');

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
