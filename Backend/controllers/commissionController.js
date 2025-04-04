
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const { ErrorHandler } = require("../middlewares/errorHandler");
const Auction = require("../model/auction-model");
const User = require("../model/userSchema-model");
const commissionProofModel = require("../model/commissionProofModel");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
});
class CommissionController {
    static calculatCommision = catchAsyncErrors(async (auctionId) => {
        const auction = await Auction.findById(auctionId);
        if (!mongoose.Types.ObjectId.isValid(auctionId)) {
            return next(new ErrorHandler("Invalid Auction Id format.", 400));
        }
        const commissionRate = 0.05;
        const commission = auction.currentBid * commissionRate;
        return commission;
    })
    static proofOfPayment = catchAsyncErrors(async (auctionId, paymentDetails) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return next(new ErrorHandler("Payment Proof Screenshot required.", 400));
        }
        const { proof } = req.files;
        const { amount, comment } = req.body;
        const user = await User.findById(req.user._id);

        if (!amount || !comment) {
            return next(
                new ErrorHandler("Ammount & comment are required fields.", 400)
            );
        }
        if (user.unpaidCommission === 0) {
            return res.status(200).json({
                success: true,
                message: "You don't have any unpaid commissions.",
            });
        }
        if (user.unpaidCommission < amount) {
            return next(
                new ErrorHandler(
                    `The amount exceeds your unpaid commission balance. Please enter an amount up to ${user.unpaidCommission}`,
                    403
                )
            );
        }
        const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedFormats.includes(proof.mimetype)) {
            return next(new ErrorHandler("ScreenShot format not supported.", 400));
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(proof.tempFilePath, {
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
        const commissionProof=await commissionProofModel.create({
            userId: req.user._id,
            proof: {
              public_id: cloudinaryResponse.public_id,
              url: cloudinaryResponse.secure_url,
            },
            amount,
            comment,
        })
        res.status(201).json({
            success: true,
            message:
              "Your proof has been submitted successfully. We will review it and responed to you within 24 hours.",
              commissionProof,
          });
    });

}

module.exports = CommissionController