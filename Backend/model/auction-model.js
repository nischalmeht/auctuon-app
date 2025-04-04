const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    title: String,
    description: String,
    startingBid: Number,
    category: String,
    currentBid: { type: Number, default: 0 },
    startTime: String,
    endTime: String,
    image: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      bids: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bid",
          },
          userName: String,
          profileImage: String,
          amount: Number,
        },
      ],
      highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      commissionCalculated: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      condition: {
        type: String,
        enum: ["New", "Used"],
      },
}, { timestamps: true });

// Prevent re-compiling the model
const Auctionmodel = mongoose.models.Auctionmodel || mongoose.model('Auctionmodel', auctionSchema);

module.exports = Auctionmodel;
