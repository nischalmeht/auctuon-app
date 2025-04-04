const express = require('express');
const Authentication = require('../middlewares/authenication');
const CommissionController = require('../controllers/commissionController');

const router = express.Router();

router.post("/proof-of-payment",Authentication.isAuthenticated,Authentication.isAuthorized("Auctioneer"),CommissionController.proofOfPayment)

module.exports = router;