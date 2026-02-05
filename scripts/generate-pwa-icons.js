const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_ICON = 'app/icon.png';
const OUTPUT_DIR = 'public/icons';

const SIZES = [
    { name: 'android-chrome-192x192.png', width: 192, height: 192 },
    { name: 'android-chrome-512x512.png', width: 512, height: 512 },
    { name: 'apple-touch-icon.png', width: 180, height: 180 }, // Standard for iOS
];

async function generateIcons() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const size of SIZES) {
        await sharp(INPUT_ICON)
            .resize(size.width, size.height)
            .toFile(path.join(OUTPUT_DIR, size.name));
        console.log(`Generated ${size.name}`);
    }
}

generateIcons().catch(console.error);
