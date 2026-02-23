const express = require('express');
const router = express.Router();
const { generateContract, getContractDetails, updateDeliveryStatus, acceptDeal } = require('../controllers/contractController');

// POST /generate
// Expects JSON body: { listingId, buyerId, farmerId, paymentMode }
router.post('/generate', generateContract);

// GET /:contractId - Get contract details
router.get('/:contractId', getContractDetails);

// PUT /:contractId/delivery - Update delivery status
router.put('/:contractId/delivery', updateDeliveryStatus);

// POST /api/contracts/accept - Accept a deal
router.post('/accept', acceptDeal);

module.exports = router;
