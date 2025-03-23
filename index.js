const TelegramBot = require("node-telegram-bot-api");
const crypto = require("crypto");

// Hardcoded Telegram Bot Token
const BOT_TOKEN = process.env.KEY;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const userState = {};

// Encrypt Function (AES-128-ECB)
function encrypt(text, key) {
    try {
        if (key.length !== 16) return { error: "❌ Key must be exactly 16 characters!" };

        const cipher = crypto.createCipheriv("aes-128-ecb", Buffer.from(key, "utf-8"), null);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        return { encryptedData: encrypted };
    } catch (err) {
        return { error: "⚠️ Encryption failed!" };
    }
}

// Decrypt Function (AES-128-ECB)
function decrypt(encryptedData, key) {
    try {
        if (key.length !== 16) return { error: "❌ Key must be exactly 16 characters!" };

        const decipher = crypto.createDecipheriv("aes-128-ecb", Buffer.from(key, "utf-8"), null);
        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return { decrypted };
    } catch (err) {
        return { error: "⚠️ Decryption failed! Check your key." };
    }
}

// Handle /start Command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🤖 *AES-128 Encryption Bot*\n\n" +
        "🔹 Type `/encrypt` to encrypt text.\n" +
        "🔹 Type `/decrypt` to decrypt text.\n\n" +
        "🔒 Uses AES-128-ECB (no IV needed).", { parse_mode: "Markdown" });
});

// Handle /encrypt Flow
bot.onText(/\/encrypt/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { action: "encrypt" };
    bot.sendMessage(chatId, "✍️ *Send me the text you want to encrypt:*", { parse_mode: "Markdown" });
});

// Handle /decrypt Flow
bot.onText(/\/decrypt/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { action: "decrypt" };
    bot.sendMessage(chatId, "✍️ *Send me the encrypted text:*", { parse_mode: "Markdown" });
});

// Handle User Input
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!userState[chatId]) return;

    const state = userState[chatId];

    if (state.action === "encrypt" && !state.text) {
        state.text = text;
        bot.sendMessage(chatId, "🔑 *Now send me a 16-character encryption key:*", { parse_mode: "Markdown" });
    } else if (state.action === "encrypt" && !state.key) {
        if (text.length !== 16) {
            bot.sendMessage(chatId, "❌ *Key must be exactly 16 characters!*", { parse_mode: "Markdown" });
            return;
        }
        state.key = text;
        const result = encrypt(state.text, state.key);
        if (result.error) {
            bot.sendMessage(chatId, result.error);
        } else {
            bot.sendMessage(chatId, `✅ *Encrypted Data:* \n\`${result.encryptedData}\``, { parse_mode: "Markdown" });
        }
        delete userState[chatId];
    } else if (state.action === "decrypt" && !state.encryptedText) {
        state.encryptedText = text;
        bot.sendMessage(chatId, "🔑 *Send me the 16-character decryption key:*", { parse_mode: "Markdown" });
    } else if (state.action === "decrypt" && !state.key) {
        if (text.length !== 16) {
            bot.sendMessage(chatId, "❌ *Key must be exactly 16 characters!*", { parse_mode: "Markdown" });
            return;
        }
        state.key = text;
        const result = decrypt(state.encryptedText, state.key);
        if (result.error) {
            bot.sendMessage(chatId, result.error);
        } else {
            bot.sendMessage(chatId, `✅ *Decrypted Text:* \n\`${result.decrypted}\``, { parse_mode: "Markdown" });
        }
        delete userState[chatId];
    }
});

const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World!");
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


console.log("✅ AES-128 Telegram Bot is running...");
                                                 
