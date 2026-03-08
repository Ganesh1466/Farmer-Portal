require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 15) + "..." : "MISSING");

const g = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const m = g.getGenerativeModel({ model: "gemini-1.5-flash" });

m.generateContent("Say hello")
    .then((r) => {
        console.log("SUCCESS:", r.response.text().substring(0, 100));
    })
    .catch((e) => {
        const msg = e.message || "";
        console.log("ERROR_STATUS:", e.status || "unknown");
        // Print key parts of the error
        if (msg.includes("API key")) console.log("ISSUE: API key invalid or expired");
        else if (msg.includes("429") || msg.includes("quota")) console.log("ISSUE: Quota exceeded / rate limited");
        else if (msg.includes("403")) console.log("ISSUE: API not enabled or forbidden");
        else console.log("ISSUE: Unknown -", msg.substring(0, 200));
    });
