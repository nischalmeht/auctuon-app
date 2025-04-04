const Bid = require('../model/bidder-model'); // Assuming you have a Bid model
// const Auction = require('../model/auction-model'); // Assuming you have an Auction model
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { ErrorHandler } = require('../middlewares/errorHandler');
const User = require('../model/userSchema-model');

// Place a bid API
const placeBid =catchAsyncErrors(async (req, res) => {
    const {id}=req.params;
    const auctionItems=await Auction.findById(id);
    if (!auctionItem) {
        return next(new ErrorHandler("Auction Item not found.", 404));
      }
      const {amount}=req.body;
    if (!amount) {
        return next(new ErrorHandler("Bid amount is required.", 400));
    }

    if (amount <= auctionItem.currentBid) {
        return next(
          new ErrorHandler("Bid amount must be greater than the current bid.", 404)
        );
      }
      if (amount < auctionItem.startingBid) {
        return next(
          new ErrorHandler("Bid amount must be greater than starting bid.", 404)
        );
      }
    

    try {
        const existingBid = await Bid.findOne(
            {
                "bidder.id": req.user._id,
                "auctionItem.id":auctionItems.id
            }
        );
        const existingBidInAuction = auctionItems.bids.find(
            (bid) => bid.userId.toString() == req.user._id.toString()
          );
          if (existingBid && existingBidInAuction) {
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;
            await existingBidInAuction.save();
            await existingBid.save();
            auctionItem.currentBid = amount;
          } else{
            const bidderDetails = await User.findById(req.user._id);           
            const bid =await Bid.create({
                amount,
                bidder: {
                  id: bidderDetails._id,
                  userName: bidderDetails.userName,
                  profileImage: bidderDetails.profileImage?.url,
                },
                auctionItem: auctionItems._id,
              });

            auctionItems.bids.push({
                userId: req.user._id,
                userName: bidderDetails.userName,
                profileImage: bidderDetails.profileImage?.url,
                amount,
              });
              auctionItems.currentBid = amount;
          }
          
    res.status(201).json({
        success: true,
        message: "Bid placed.",
        currentBid: auctionItems.currentBid,
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = { placeBid };