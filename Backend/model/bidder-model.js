const mongoose = require('mongoose');

const bidderSchema = new mongoose.Schema({
    amount: Number,
    bidder: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    userName: String,
    profileImage: String,

    },
    auctionItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
        required: true,
      },
}, {
    timestamps: true,
});

const Bidder = mongoose.model('Bidder', bidderSchema);

module.exports = Bidder;