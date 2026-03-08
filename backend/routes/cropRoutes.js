const express = require('express');
const router = express.Router();
const { getCrops, getCropById } = require('../controllers/cropController');

// Get all crops
router.get('/', getCrops);

// Get a single crop by ID
router.get('/:id', getCropById);

module.exports = router;
