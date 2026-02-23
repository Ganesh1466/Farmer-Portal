const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let geminiModel = null;

if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // ✅ "gemini-pro" is deprecated — use "gemini-1.5-flash" (free tier) or "gemini-1.5-pro"
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("✅ Gemini API initialized successfully");
    } catch (err) {
        console.error("❌ Gemini initialization error:", err.message);
    }
} else {
    console.warn("⚠️ GEMINI_API_KEY is missing. Gemini features will not work.");
}

module.exports = geminiModel;