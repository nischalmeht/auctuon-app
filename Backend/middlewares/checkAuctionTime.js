// const Auction = require('../model/auction-model'); // Adjust the path as needed
const catchAsyncErrors = require('./catchAsyncErrors');
const { ErrorHandler } = require('./errorHandler');

const checkAuctionTime = catchAsyncErrors(async (req, res, next) => {
    try {
        const auctionId = req.params.id; 
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler("Invalud ID format.", 400));
          }
        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return next(new ErrorHandler("Auction not found.", 404));
          }
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        const currentTime = new Date();
        if (new Date(auction.startTime)< currentTime) {
            return next(new ErrorHandler("Auction has not started yet.", 400));
          }
        if (currentTime > auction.endTime) {
            return res.status(400).json({ message: 'Auction has already ended' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = checkAuctionTime;