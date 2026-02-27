import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://farmer-portal.onrender.com';

export const fetchWeather = async (city, days = 7) => {
    try {
        const response = await axios.get(`${API_URL}/api/weather`, {
            params: {
                city: city,
                days: days,
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }
};