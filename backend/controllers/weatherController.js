const axios = require('axios');

const getWeather = async (req, res) => {
    try {
        const { city, days = 7 } = req.query;

        if (!city) {
            return res.status(400).json({ error: "City parameter is required" });
        }

        const response = await axios.get(
            `https://api.weatherapi.com/v1/forecast.json`,
            {
                params: {
                    key: process.env.WEATHER_API_KEY,
                    q: city,
                    days: days,
                    aqi: "no",
                    alerts: "no"
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const details = error.response?.data || error.message;
        console.error("Error fetching weather data for city:", city, "Status:", status, "Details:", details);
        res.status(status).json({ error: "Weather fetch failed", details });
    }
};

module.exports = {
    getWeather
};
