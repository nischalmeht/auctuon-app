const express = require('express');
const auctionController = require('../controllers/auctionController');
const Authentication = require('../middlewares/authenication');

const router = express.Router();

router.post('/create', Authentication.isAuthenticated,auctionController.saveAuctionItem);
router.get('/allitems', auctionController.getAllItems);
router.delete("/delete/:id", Authentication.isAuthenticated,Authentication.isAuthorized("Auctioneer"),auctionController.removeAuction);
router.get("/auction/:id", Authentication.isAuthenticated,auctionController.getAuctionById);
router.post('/myitems', Authentication.isAuthenticated,Authentication.isAuthorized("Auctioneer"),auctionController.getMyAuctionDetails);
router.put('/item/republish/:id', Authentication.isAuthenticated,Authentication.isAuthorized("Auctioneer"),auctionController.republishItem);


module.exports = router;