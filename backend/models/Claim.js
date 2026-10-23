const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [
      {
        question: {
          type: String,
          required: true
        },
        answer: {
          type: String,
          required: true
        }
      }
    ],
    proofDescription: {
      type: String,
      required: [true, 'Please provide details proving ownership of this item'],
      maxlength: [1000, 'Proof description cannot exceed 1000 characters']
    },
    proofImageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'collected'],
      default: 'pending'
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    // Cryptographic / time-bounded OTP for physical handover
    handoverOtp: {
      type: String,
      default: null
    },
    handoverOtpExpiresAt: {
      type: Date,
      default: null
    },
    handoverCompletedAt: {
      type: Date,
      default: null
    },
    handoverVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent a user from spamming multiple active claims on the exact same item
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
