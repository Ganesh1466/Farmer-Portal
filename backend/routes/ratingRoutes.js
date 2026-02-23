const express = require('express');
const router = express.Router();
const { submitRating, getFarmerRating, getFarmerRatings } = require('../controllers/ratingController');

// POST /api/ratings - Submit a rating
router.post('/', submitRating);

// GET /api/ratings/farmer/:farmerId - Get farmer's average rating
router.get('/farmer/:farmerId', getFarmerRating);

// GET /api/ratings/farmer/:farmerId/details - Get all ratings for a farmer
router.get('/farmer/:farmerId/details', getFarmerRatings);

module.exports = router;
