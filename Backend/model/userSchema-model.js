const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const brcypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, "Username must caontain at least 3 characters."],
        maxLength: [40, "Username cannot exceed 40 characters."],
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        phone: {
            type: String,
            minLength: [11, "Phone Number must caontain exact 11 digits."],
            maxLength: [11, "Phone Number must caontain exact 11 digits."],
          },    
        lowercase: true
    },
    password: {
        type: String,
        selected:false,
        minLength: [8, "Password must caontain at least 8 characters."],
        required: true
    },
    profileImage: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      paymentMethods: {
        bankTransfer: {
          bankAccountNumber: String,
          bankAccountName: String,
          bankName: String,
        },        
        paypal: {
          paypalEmail: String,
        },
      },
      role: {
        type: String,
        enum: ["Auctioneer", "Bidder", "Super Admin"],
      },
      unpaidCommission: {
        type: Number,
        default: 0,
      },
      auctionsWon: {
        type: Number,
        default: 0,
      },
      moneySpent: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
});

const User = mongoose.model('User', userSchema);

module.exports = User;