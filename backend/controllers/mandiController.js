const axios = require('axios');

const getMandiPrices = async (req, res) => {
    try {
        const apiKey = process.env.MANDI_API_KEY;
        const baseUrl = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24";

        const { state } = req.query;

        if (!state) {
            return res.status(400).json({ message: "State required" })
        }

        // Construct query parameters
        const params = new URLSearchParams({
            'api-key': apiKey,
            'format': 'json',
            'limit': '10000'
        });

        if (state) params.append('filters[State]', state);

        // Add User-Agent ensuring we look like a legitimate browser/client
        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const response = await axios.get(`${baseUrl}?${params.toString()}`, config);

        res.json(response.data);

    } catch (error) {
        console.error("MANDI FETCH ERROR:", error.message);

        // Specific handling for 403 Forbidden (Blocked/Quota Exceeded)
        if (error.response && error.response.status === 403) {
            console.error("Upstream API Blocked Request (403)");
            return res.status(503).json({
                message: "Mandi data source blocked or access denied. The government API may be down or the key limit exceeded.",
                sourceStatus: 403,
                upstreamError: error.response.data
            })
        }

        res.status(500).json({
            message: "Failed to fetch mandi prices",
            error: error.message,
            upstreamError: error.response ? error.response.data : null
        });
    }
};

module.exports = { getMandiPrices };
