const catchAsyncErrors = require("../middlewares/catchAsyncErrors")
const AuctionModel = require("../model/auction-model")
const PaymentProofsModel = require("../model/commissionProofModel");
const User = require("../model/userSchema-model");
class SuperAdminController {
    static deletAuctionItem = catchAsyncErrors(async (req, res, next) => {
        {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorHandler("Invalid Id format.", 400));
            }
            const auctionItem = await AuctionModel.findById(id);
            if (!auctionItem) {
                return next(new ErrorHandler("Auction not found.", 404));
            }
            await auctionItem.deleteOne();
            res.status(200).json({
                success: true,
                message: "Auction item deleted successfully.",
            });
        }
    })
    static getAllPaymentProofs = catchAsyncErrors(async (req, res, next) => {
        const paymentProofs = await PaymentProofsModel.find();
        res.status(200).json({
            success: true,
            paymentProofs,
        });
    })
    static getPaymentProofById = catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler("Invalid Id format.", 400));
        }
        const paymentProof = await PaymentProofsModel.findById(id);
        if (!paymentProof) {
            return next(new ErrorHandler("Payment proof not found.", 404));
        }
        res.status(200).json({
            success: true,
            paymentProof,
        });
    })
    static deletePaymentProof = catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler("Invalid Id format.", 400));
        }
        const paymentProof = await PaymentProofsModel.findById(id);
        if (!paymentProof) {
            return next(new ErrorHandler("Payment proof not found.", 404));
        }
        await paymentProof.deleteOne();
        res.status(200).json({
            success: true,
            message: "Payment proof deleted successfully.",
        });
    })
    static updatePaymentProof = catchAsyncErrors(async (req, res, next) => {
        const { id } = req.params;
        const { status, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new ErrorHandler("Invalid Id format.", 400));
        }

        let paymentProof = await PaymentProofsModel.findById(id);
        if (!paymentProof) {
            return next(new ErrorHandler("Payment proof not found.", 404));
        }
        paymentProof = await PaymentProofsModel.findByIdAndUpdate(
            id,
            { status, amount },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        )


        res.status(200).json({
            success: true,
            message: "Payment proof updated successfully.",
            paymentProof,
        });
    })
    static fetchAllUsers = catchAsyncErrors(async (req, res, next) => {
        const users = await User.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $month: "$createdAt" },
                        role: "$role",
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    month: "$_id.month",
                    year: "$_id.year",
                    role: "$_id.role",
                    count: 1,
                    _id: 0,
                },
            },
            {
                $sort: { year: 1, month: 1 },
            },
        ])
        const bidders = users.filter((user) => user.role === "Bidder");
        const auctioneers = users.filter((user) => user.role === "Auctioneer");
        const tranformDataToMonthlyArray = (data, totalMonths = 12) => {
            const result = Array(totalMonths).fill(0);

            data.forEach((item) => {
                result[item.month - 1] = item.count;
            });

            return result;
        };
        const biddersArray = tranformDataToMonthlyArray(bidders);
        const auctioneersArray = tranformDataToMonthlyArray(auctioneers);

        res.status(200).json({
            success: true,
            biddersArray,
            auctioneersArray,
        });
    })
    
    static fetchMonthlyCreatedCommissions = catchAsyncErrors(async (req, res, next) => {
        const commissions = await PaymentProofsModel.aggregate([
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
              },
        ]);

        const transformDataToMonthlyArray = (data, totalMonths = 12) => {
            const result = Array(totalMonths).fill({ totalAmount: 0, count: 0 });

            data.forEach((item) => {
                result[item.month - 1] = {
                    totalAmount: item.totalAmount,
                    count: item.count,
                };
            });

            return result;
        };

        const monthlyCommissions = transformDataToMonthlyArray(commissions);

        res.status(200).json({
            success: true,
            monthlyCommissions,
        });
    });
}
module.exports = SuperAdminController