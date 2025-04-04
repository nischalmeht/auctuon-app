const mongoose = require("mongoose");
const PaymentProofSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      proof: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Approved", "Rejected", "Settled"],
      },
      amount: Number,
      comment: String,
})

 const Commission = mongoose.model("PaymentProof", PaymentProofSchema);
 module.exports=Commission