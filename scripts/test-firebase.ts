
console.log("🚀 Starting Firebase Test Script...");

const fs = require('fs');
const path = require('path');

// 1. Manually load .env variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    console.log(`📂 Loading .env from ${envPath}`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            if (key.startsWith('#')) return;
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
} else {
    console.warn("⚠️ No .env file found!");
}

async function run() {
    try {
        console.log("📦 Importing checkFirebaseConnection...");
        const { checkFirebaseConnection } = await import('../lib/checkFirebase');
        console.log("▶️ Running check...");
        await checkFirebaseConnection();
    } catch (e) {
        console.error("❌ Failed to run check:", e);
    }
}

run();
