const express = require('express');
const { getMandiPrices } = require('../controllers/mandiController');
const router = express.Router();

router.get('/', getMandiPrices);

module.exports = router;
