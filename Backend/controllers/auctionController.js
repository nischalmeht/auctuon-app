const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { ErrorHandler } = require('../middlewares/errorHandler');
const AuctionModel = require('../model/auction-Model');
const cloudinary = require('cloudinary').v2;
// Controller to get all items from the auction
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
  });
const getAllItems = catchAsyncErrors(async (req, res) => {
    try {
        const items = await AuctionModel.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching auction items', error: error.message });
    }
});

// Controller to remove an auction item by ID
const removeAuction = catchAsyncErrors(async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid auction item ID' });
        }
        const deletedItem = await AuctionModel.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Auction item not found' });
        }
        res.status(200).json({ message: 'Auction item removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing auction item', error: error.message });
    }
});

// Controller to get an auction item by ID
const getAuctionById = catchAsyncErrors(async (req, res) => {
    try {
        const { id } = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid auction item ID' });
        }
        const item = await AuctionModel.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Auction item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching auction item', error: error.message });
    }
});

// Controller to save a new auction item
const saveAuctionItem = catchAsyncErrors(async (req, res,next) => {
    const { files } = req;
    if (!files || Object.keys(files).length === 0) {
        return next(new ErrorHandler("Please upload an image.", 400));
    }
    let { image } = req.files;
   
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedFormats.includes(image.mimetype)) {
        return next(new ErrorHandler("File format not supported.", 400));
    }
    try {
        const {
            title,
            description,
            startingBid,
            category,
            startTime,
            endTime,                              
        } = req.body;

        if (!title || !description || !startingBid || !category || !startTime || !endTime ) {
            
            return next(new ErrorHandler("All fields are required.", 400));
        }
        if (new Date(startTime) < Date.now()) {
            return next(
                new ErrorHandler(
                    "Auction starting time must be greater than present time.",
                    400
                )
            );
        }
        if (new Date(startTime) >= new Date(endTime)) {
            return next(
                new ErrorHandler(
                    "Auction starting time must be less than ending time.",
                    400
                )
            );
        }
        const activeAuction = await AuctionModel.findOne({
            createdBy:req.user._id,
            endTime: { $gt: Date.now() },
        });

        if (activeAuction) {
            return next(new ErrorHandler("An active auction already exists in this category.", 400));
        }

        console.log(image,'imageimageimage')
        const cloudinaryResponse = await cloudinary.uploader.upload(image.tempFilePath, {
            folder: "MERN_AUCTION_PLATFORM_USERS",
        });
        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error(
                "Cloudinary error:",
                cloudinaryResponse.error || "Unknown cloudinary error."
            );
            return next(
                new ErrorHandler("Failed to upload profile image to cloudinary.", 500)
            );
        }

        const newAuctionItem = new Auction({
            title,
            description,
            startingBid,
            category,
            startTime,
            endTime,
            image: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
              },
            createdBy: req.user._id,
        });


        const savedItem = await newAuctionItem.save();
        return res.status(201).json({
            success: true,
            message: `Auction item created and will be listed on auction page at ${startTime}`,
            savedItem,
          });
        // res.status(201).json(savedItem);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error saving auction item', error: error.message });
    }
});
// Controller to get auction details created by the logged-in user
const getMyAuctionDetails =catchAsyncErrors(async(req, res) => {
    try {
        const myAuctions = await AuctionModel.find({ createdBy: req.user._id });
        if (!myAuctions || myAuctions.length === 0) {
            return res.status(404).json({ message: 'No auctions found for the user' });
        }
        res.status(200).json(myAuctions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user auctions', error: error.message });
    }
});



// Controller to republish an auction item by ID
const republishItem = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startTime, endTime } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler("Invalid auction item ID", 400));
        }

        if (!startTime || !endTime) {
            return next(new ErrorHandler("Start time and end time are required.", 400));
        }
        

        if (new Date(startTime) < Date.now()) {
            return next(
                new ErrorHandler(
                    "Auction starting time must be greater than present time.",
                    400
                )
            );
        }

        if (new Date(startTime) >= new Date(endTime)) {
            return next(
                new ErrorHandler(
                    "Auction starting time must be less than ending time.",
                    400
                )
            );
        }
        const auctionItem = await Auction.findById(id);
        if (!auctionItem) {
            return next(new ErrorHandler("Auction item not found", 404));
        }

        if (auctionItem.createdBy.toString() !== req.user._id.toString()) {
            return next(new ErrorHandler("You are not authorized to republish this item", 403));
        }
        

        const updatedItem = await auctionItem.save();

        res.status(200).json({
            success: true,
            message: "Auction item republished successfully",
            updatedItem,
        });
    } catch (error) {
        res.status(500).json({ message: "Error republishing auction item", error: error.message });
    }
});
module.exports = {
    getAllItems,
    removeAuction,
    getAuctionById,
    saveAuctionItem,
    getMyAuctionDetails,
    republishItem
};


