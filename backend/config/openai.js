const OpenAI = require("openai");

let openai = null;

if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        console.log("✅ OpenAI API initialized successfully");
    } catch (err) {
        console.error("❌ OpenAI initialization error:", err.message);
    }
} else {
    console.warn("⚠️ OPENAI_API_KEY is missing. OpenAI features will not work.");
}

module.exports = openai;