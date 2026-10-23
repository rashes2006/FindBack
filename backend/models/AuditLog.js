const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'ITEM_REPORTED',
        'ITEM_UPDATED',
        'CLAIM_SUBMITTED',
        'CLAIM_STATUS_UPDATED',
        'HANDOVER_OTP_GENERATED',
        'HANDOVER_OTP_VERIFIED',
        'ITEM_RETURNED',
        'CLAIM_REJECTED'
      ]
    },
    entityType: {
      type: String,
      enum: ['Item', 'Claim', 'User'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ entityId: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
