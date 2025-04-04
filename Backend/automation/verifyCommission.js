const cron = require("node-cron");
const AuctionModel = require("../model/auction-model");
const userModel = require("../model/userSchema-model");
const Bidder = require("../model/bidder-model");
const commissionProof = require("../model/commissionProofModel");
const commissionModel = require("../model/commissionModel")
const CommissionController = require("../controllers/commissionController");

const sendEmail = require("../utils/sendMail")

const verifyCommissionCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        console.log("Running Verify Commission Cron...");
        const approvedProofs = await commissionProof.find({ status: "Approved" });
        for (const proof of approvedProofs) {

            try {
                const user = await userModel.findById(proof.userId);
                let updatedUserData = {};
                if (user) {
                    if (user.unpaidCommission >= proof.amount) {
                        updatedUserData = await User.findByIdAndUpdate(
                            user._id,
                            {
                                $inc: {
                                    unpaidCommission: -proof.amount,
                                },
                            },
                            { new: true }
                        );
                    }
                    await commissionProof.findByIdAndUpdate(proof._id, {
                        status: "Settled",
                    })
                } else {
                    updatedUserData = await userModel.findByIdAndUpdate(
                        user._id,
                        {
                            unpaidCommission: 0,
                        },
                        { new: true }
                    );
                    await commissionProof.findByIdAndUpdate(proof._id, {
                        status: "Settled",
                    });
                }
                await commissionModel.create({
                    amount: proof.amount,
                    user: user._id,
                });
                const settlementDate = new Date(Date.now())
                    .toString()
                    .substring(0, 15);

                const subject = `Your Payment Has Been Successfully Verified And Settled`;
                const message = `Dear ${user.userName},\n\nWe are pleased to inform you that your recent payment has been successfully verified and settled. Thank you for promptly providing the necessary proof of payment. Your account has been updated, and you can now proceed with your activities on our platform without any restrictions.\n\nPayment Details:\nAmount Settled: ${proof.amount}\nUnpaid Amount: ${updatedUserData.unpaidCommission}\nDate of Settlement: ${settlementDate}\n\nBest regards,\nZeeshu Auction Team`;
                sendEmail({ email: user.email, subject, message });
            
        console.log(`User ${proof.userId} paid commission of ${proof.amount}`);
        }
        catch (error) {
            console.error(
                `Error processing commission proof for user ${proof.userId}: ${error.message}`
            );
        }
    }
        
    })
}