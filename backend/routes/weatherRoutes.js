const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');

// Route to get weather data
// GET /api/weather
router.get('/', getWeather);

module.exports = router;
