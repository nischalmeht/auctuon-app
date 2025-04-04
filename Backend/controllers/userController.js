const User = require('../model/userSchema-model');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { ErrorHandler } = require('../middlewares/errorHandler');
const { uploadMediaToCloudinary } = require('../utils/cloudinary');
const generateToken = require('../utils/generateToken');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
  });

// Register Controller
const registerUser = catchAsyncErrors(async (req, res,next) => {
    try {
        const { files } = req;        
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
            if (!paypalEmail) {
                return next(new ErrorHandler("Please provide your paypal email.", 400));
              }
        }
          const isRegsitered = await User.findOne({ email });
            if (isRegsitered) {
                return next(new ErrorHandler("User already registered.", 400));
            }
            // const cloudinaryResponse = await uploadMediaToCloudinary(req.files, {
            //     folder: "MERN_AUCTION_PLATFORM_USERS",
            // });

        const cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath,{
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
       

        const token = generateToken(newUser,"User Registered.", 201, res);
        // res.status(201).json({
        //     success: true,
        //     message: "User registered successfully.",
        //     user: {
        //     id: newUser._id,
        //     name: newUser.name,
        //     email: newUser.email,
        //     role: newUser.role,
        //     token:token,
        //     },
        // });
    } catch (error) {
        console.error(error,'errrrrr');
        res.status(500).json({ message: 'Server error' });
    }
    // Login Controller
    
});
const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password.", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password.", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password.", 401));
    }

    const token = generateToken(user, "User logged in successfully.", 200, res);
});

const getUser= catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
})
const fetchLeaderBoard= catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ "moneySpent": { $gt: 0 } }).sort({ moneySpent: -1 });

  res.status(200).json({
    success: true,
    users
  });
})
const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(0), // Immediately expire the cookie
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logout Successfully.",
  });
});


module.exports = { registerUser, loginUser,getUser,fetchLeaderBoard ,logout};
