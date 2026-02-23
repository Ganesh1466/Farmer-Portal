import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `
You are "Bhumi Putra Assistant", a knowledgeable and friendly agricultural expert for Indian farmers. 
Your primary goal is to provide accurate "Mandi Bhav" (market prices) and expert farming advice.

Context:
- The user is a farmer in India.
- If asked about market prices (Mandi Bhav), try to provide realistic ranges based on general knowledge for major crops (Wheat, Rice, Cotton, Soybean, Onion, etc.) in Indian states (Maharashtra, Punjab, MP, etc.). 
- Always clarify that these are "estimated market rates" and they should check with their local mandi for exact prices.
- Answer in a simple, encouraging, and respectful tone.
- You can answer in English or Hinglish (Hindi written in English) if the user prefers.

Topics you cover:
1. Mandi Prices (Commodity rates)
2. Crop Advisory (Pest control, fertilizer, sowing time)
3. Weather impact on crops
4. Government schemes for farmers

If you don't know something, suggest they contact a local agricultural officer (Krishi Kendra).
`;

export const getChatResponse = async (messages) => {
    try {
        if (!API_KEY) {
            throw new Error("OpenAI API Key is missing. Please check your settings.");
        }

        // Format messages for OpenAI (System prompt + History)
        const apiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text }))
        ];

        const response = await axios.post(
            API_URL,
            {
                model: "gpt-3.5-turbo", // Cost-effective model
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 300,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error("Error calling OpenAI:", error);

        // Handle Quota Exceeded (429) specifically
        if (error.response && error.response.status === 429) {
            return `⚠️ **API LIMIT REACHED (Demo Mode Active)** ⚠️

Your OpenAI API key has exceeded its quota (or is a new free account that needs credit).

---
**🌱 Simulated Response for "${messages[messages.length - 1].content}":**

"Namaste! based on current market trends:
- **Onion**: ₹1400 - ₹2200 per quintal (Nashik)
- **Cotton**: ₹6800 - ₹7200 per quintal
- **Soybean**: ₹4500 - ₹4800 per quintal

*Advisor Note*: Prices are stable. Good time to sell vegetables, but hold cotton if possible. Check with your local APMC for exact spot prices today."`;
        }

        if (error.response) {
            // Other API errors
            return `Error: ${error.response.data.error.message}`;
        }
        return "Sorry, I am having trouble connecting to the server. Please try again later.";
    }
};
