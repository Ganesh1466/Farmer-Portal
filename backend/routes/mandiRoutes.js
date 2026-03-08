const express = require('express');
const router = express.Router();
const { indiaMandiStructure, getMandisForDistrict } = require('../data/indiaMandiStructure');
const { generateMandiData } = require('../utils/priceGenerator');

// GET /api/states
router.get('/states', (req, res) => {
    try {
        const states = Object.keys(indiaMandiStructure).sort();
        res.json(states);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/districts?state=Maharashtra
router.get('/districts', (req, res) => {
    try {
        const { state } = req.query;
        if (!state) {
            return res.status(400).json({ message: "State parameter is required" });
        }
        const districts = indiaMandiStructure[state] || [];
        res.json(districts.sort());
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /api/mandis?district=Buldhana
router.get('/mandis', (req, res) => {
    try {
        const { district } = req.query;
        if (!district) {
            return res.status(400).json({ message: "District parameter is required" });
        }

        // We dynamically generate standard mandis for any district provided
        const mandis = getMandisForDistrict(district);
        res.json(mandis);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Helper function to check if date is in future
const isFutureDate = (dateStr) => {
    // Basic format expectation: YYYY-MM-DD
    const selectedDate = new Date(dateStr);

    // Need to clean the time portion of specifically "today" to accurately compare pure dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate > today;
};

// GET /api/prices?state=Maharashtra&district=Buldhana&mandi=Khamgaon&date=2026-03-08
router.get('/prices', (req, res) => {
    try {
        const { state, district, mandi, date } = req.query;

        if (!state || !district || !mandi || !date) {
            return res.status(400).json({ message: "Missing required query parameters: state, district, mandi, date" });
        }

        // Rule: Do not show data for future dates
        if (isFutureDate(date)) {
            return res.status(400).json({ message: "No mandi data available for future dates" });
        }

        // Generate dynamic mock data based on parameters
        const responseData = generateMandiData(state, district, mandi, date);
        res.json(responseData);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
