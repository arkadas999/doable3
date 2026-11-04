import fs from 'fs';
import crypto from 'crypto';

const newKey = `base64:${crypto.randomBytes(32).toString('base64')}`;

if (fs.existsSync('.env')) {
    let envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('APP_KEY=')) {
        envContent = envContent.replace(/APP_KEY=.*/, `APP_KEY=${newKey}`);
    } else {
        envContent += `\nAPP_KEY=${newKey}\n`;
    }
    fs.writeFileSync('.env', envContent);
    console.log(`🔑 Successfully updated .env with new encryption key:\nAPP_KEY=${newKey}`);
} else {
    console.log(`🔑 Generated encryption key:\nAPP_KEY=${newKey}`);
    console.log(`\nCopy this line into your .env file!`);
}
