const openai = require("../config/openai");
const geminiModel = require("../config/gemini");

console.log("📋 Chat Controller Loaded");
console.log("🔵 Gemini Model:", geminiModel ? "Available" : "Not Available");
console.log("🟢 OpenAI Client:", openai ? "Available" : "Not Available");

const SYSTEM_PROMPT = `You are a highly intelligent AI assistant integrated into a real-time crop advisory system. 
Follow these rules strictly:

1. Be friendly, clear, and concise.
2. Answer user queries with actionable steps when possible.
3. Provide crop-specific advice on farming, pest control, soil health, weather impacts, market trends, and best practices.
4. If the user asks for code, examples, or explanations, provide them.
5. Adapt tone based on the question: professional for technical, casual for general queries.
6. Always handle errors gracefully: if unsure, respond with "I am unable to answer that fully, please try again."

Focus areas:
- Crop cultivation and seasonal guidance
- Pest and disease identification and treatment
- Soil management and fertilizer recommendations
- Weather impact and irrigation advice
- Market prices and contract farming
- Government schemes and subsidies for farmers`;

// Convert conversation history to Gemini format
// Gemini requires alternating user/model roles — no system messages, no consecutive same roles
const convertToGeminiFormat = (messages) => {
  const filtered = messages
    .filter((msg) => msg.role !== "system") // Remove system messages
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  // ✅ Fix: Gemini requires strictly alternating roles starting with "user"
  // Merge consecutive same-role messages to avoid API errors
  const merged = [];
  for (const msg of filtered) {
    if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
      // Merge with previous message
      merged[merged.length - 1].parts[0].text += "\n" + msg.parts[0].text;
    } else {
      merged.push(msg);
    }
  }

  // Ensure it starts with a user message
  if (merged.length > 0 && merged[0].role !== "user") {
    merged.shift();
  }

  return merged;
};

// Call Gemini API
const callGemini = async (messages) => {
  if (!geminiModel) {
    throw new Error("Gemini API not configured — check GEMINI_API_KEY in .env");
  }

  const geminiMessages = convertToGeminiFormat(messages);

  if (geminiMessages.length === 0) {
    throw new Error("No valid messages to send to Gemini");
  }

  // History is everything except the last message
  const history = geminiMessages.slice(0, -1);
  const lastMessage = geminiMessages[geminiMessages.length - 1];

  const chat = geminiModel.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
    // ✅ Pass system prompt via systemInstruction (supported in gemini-1.5+)
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await chat.sendMessage(lastMessage.parts[0].text);
  const response = await result.response;
  return response.text();
};

// Call OpenAI API
const callOpenAI = async (messages) => {
  if (!openai) {
    throw new Error("OpenAI API not configured — check OPENAI_API_KEY in .env");
  }

  // ✅ Ensure system prompt is prepended if not already present
  const hasSystemPrompt = messages.some((m) => m.role === "system");
  const fullMessages = hasSystemPrompt
    ? messages
    : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: fullMessages,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
};

const chatWithBot = async (req, res) => {
  try {
    const { message, messages } = req.body;

    // Validate input
    if (!message && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build conversation history
    let conversationMessages = [];

    if (messages && messages.length > 0) {
      conversationMessages = messages;
    } else {
      conversationMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ];
    }

    let reply = "";
    let apiUsed = "";

    // Try Gemini first
    try {
      console.log("🔵 Attempting Gemini API...");
      reply = await callGemini(conversationMessages);
      apiUsed = "gemini";
      console.log("✅ Gemini API responded successfully");
    } catch (geminiError) {
      console.log("⚠️ Gemini API failed:", geminiError.message);

      // Fallback to OpenAI
      try {
        console.log("🟢 Switching to OpenAI API...");
        reply = await callOpenAI(conversationMessages);
        apiUsed = "openai";
        console.log("✅ OpenAI API responded successfully");
      } catch (openaiError) {
        console.error("❌ Both APIs failed");
        console.error("   Gemini error:", geminiError.message);
        console.error("   OpenAI error:", openaiError.message);
        return res.status(503).json({
          error: "I am unable to answer that fully, please try again.",
          details: "Both Gemini and OpenAI services are currently unavailable",
        });
      }
    }

    res.status(200).json({ reply, apiUsed });

  } catch (error) {
    console.error("❌ Chatbot error:", error);
    res.status(500).json({
      error: "I am unable to answer that fully, please try again.",
    });
  }
};

module.exports = { chatWithBot };