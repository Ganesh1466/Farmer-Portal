const express = require('express');
const router = express.Router();
const { getSeasonCrops } = require('../controllers/cropSeason');

router.post('/', getSeasonCrops);

module.exports = router;
