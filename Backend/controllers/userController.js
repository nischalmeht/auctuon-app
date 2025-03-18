const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { ErrorHandler } = require('../middlewares/errorHandler');
const cloudinary = require('cloudinary').v2;

// Register Controller
const registerUser = catchAsyncErrors(async (req, res) => {
    try {
        const { files } = req.body;
        if (!files || Object.keys(files).length === 0) {
            return next(new ErrorHandler("Please upload an image.", 400));
        }
        const {profileImage}=req.files;
        const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedFormats.includes(profileImage.mimetype)) {
          return next(new ErrorHandler("File format not supported.", 400));
        }

        const {userName,email,password,phone,address,role,bankAccountNumber,bankAccountName,bankName,paypalEmail,
          } = req.body;
          if (!userName || !email || !phone || !password || !address || !role) {
            return next(new ErrorHandler("Please fill full form.", 400));
          }
          if (role === "Auctioneer") {
            if (!bankAccountName || !bankAccountNumber || !bankName) {
              return next(
                new ErrorHandler("Please provide your full bank details.", 400)
              );
            }
        }
        if (!paypalEmail) {
            return next(new ErrorHandler("Please provide your paypal email.", 400));
          }
          const isRegsitered = await User.findOne({ email });
            if (isRegsitered) {
                return next(new ErrorHandler("User already registered.", 400));
            }
        const cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath, {
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

        const newUser = await User.create({
            name: userName,
            email,
            phone,
            password,
            profileImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            paymentMethods: {
                bankTransfer: {
                    bankAccountNumber: bankAccountNumber || null,
                    bankAccountName: bankAccountName || null,
                    bankName: bankName || null,
                },
                paypal: {
                    paypalEmail: paypalEmail || null,
                },
            },
            role,
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = { registerUser };