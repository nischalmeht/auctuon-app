const express = require('express');
const {placeBid } = require('../controllers/bidController');
const Authentication = require('../middlewares/authenication');
const checkAuctionTime = require('../middlewares/checkAuctionTime');

const router = express.Router();

router.post('/place/:id',Authentication.isAuthenticated,Authentication.isAuthorized("Bidder"),checkAuctionTime, placeBid); // Create a new bidder


module.exports = router;