const mongoose = require("mongoose");
const commissionSchema=new mongoose({
    amount:Number,
    user: mongoose.Schema.Types.ObjectId,
    createdAt: {
      type: Date,
      default: Date.now,
    },
})

export const Commission = mongoose.model("Commission", commissionSchema);