const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('./catchAsyncErrors');
const { ErrorHandler } = require('./errorHandler');
const User = require('../model/userSchema-model');

class Authentication {
    static isAuthenticated = catchAsyncErrors(async (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            return next(new ErrorHandler('Login first to access this resource.', 401));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
            next();
        } catch (error) {
            return next(new ErrorHandler('Invalid or expired token.', 400));
        }
    });

    static isAuthorized = (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource.`, 403));
            }
            next();
        };
    };
}

module.exports = Authentication;
