import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

// Ensure we have a 32-byte key for AES-256
const appKey = process.env.APP_KEY || "base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
let rawKey: Buffer;
if (appKey.startsWith("base64:")) {
    rawKey = Buffer.from(appKey.substring(7), "base64");
} else {
    rawKey = Buffer.from(appKey);
}

if (rawKey.length !== 32) {
    const temp = Buffer.alloc(32);
    rawKey.copy(temp);
    rawKey = temp;
}

export function encrypt(text: string | null): string | null {
    if (!text) return text;
    
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", rawKey, iv);
    
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");
    
    // Format: iv:authTag:ciphertext
    return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

const decryptCache = new Map<string, string>();
const MAX_CACHE_SIZE = 10000;

export function decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) return encryptedText;
    
    const cached = decryptCache.get(encryptedText);
    if (cached !== undefined) return cached;

    try {
        const parts = encryptedText.split(":");
        if (parts.length !== 3) return encryptedText; // Probably not encrypted
        
        const iv = Buffer.from(parts[0], "base64");
        const authTag = Buffer.from(parts[1], "base64");
        const ciphertext = parts[2];
        
        if (iv.length !== 12 || authTag.length !== 16) {
            return encryptedText;
        }
        
        const decipher = createDecipheriv("aes-256-gcm", rawKey, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(ciphertext, "base64", "utf8");
        decrypted += decipher.final("utf8");
        
        if (decryptCache.size >= MAX_CACHE_SIZE) {
            const firstKey = decryptCache.keys().next().value;
            if (firstKey !== undefined) decryptCache.delete(firstKey);
        }
        decryptCache.set(encryptedText, decrypted);

        return decrypted;
    } catch {
        return encryptedText; // Fallback to raw text
    }
}

