const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true
    },
    paymentId: {
      type: String,
      default: null,
      index: true
    },
    signature: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: [true, 'Please specify the amount in INR']
    },
    amountInPaise: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed'],
      default: 'created'
    },
    purpose: {
      type: String,
      enum: ['finder_reward', 'desk_handling_fee', 'campus_donation'],
      default: 'finder_reward'
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    receipt: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'test'
    },
    paymentMethod: {
      type: String,
      default: 'test_mode_razorpay'
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ recipient: 1, createdAt: -1 });
paymentSchema.index({ item: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
