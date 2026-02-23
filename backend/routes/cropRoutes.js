const express = require('express');
const router = express.Router();
const { getCrops, getCropById } = require('../controllers/cropController');

router.get('/', getCrops);
router.get('/:id', getCropById);

module.exports = router;
