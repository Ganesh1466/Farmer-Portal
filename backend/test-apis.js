const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function testGemini() {
    console.log("\n=== Testing Gemini API ===");
    console.log("Key present:", !!process.env.GEMINI_API_KEY);
    console.log("Key prefix:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        console.log("✅ Gemini works! Response:", response.text().substring(0, 100));
    } catch (err) {
        console.error("❌ Gemini FAILED:", err.message);
        if (err.status) console.error("   Status:", err.status);
        if (err.errorDetails) console.error("   Details:", JSON.stringify(err.errorDetails));
    }
}

async function testOpenAI() {
    console.log("\n=== Testing OpenAI API ===");
    console.log("Key present:", !!process.env.OPENAI_API_KEY);
    console.log("Key prefix:", process.env.OPENAI_API_KEY?.substring(0, 10) + "...");
    try {
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say hello in one word" }],
            max_tokens: 10,
        });
        console.log("✅ OpenAI works! Response:", completion.choices[0].message.content);
    } catch (err) {
        console.error("❌ OpenAI FAILED:", err.message);
        if (err.status) console.error("   Status:", err.status);
        if (err.code) console.error("   Code:", err.code);
    }
}

(async () => {
    await testGemini();
    await testOpenAI();
    console.log("\n=== Done ===");
})();
