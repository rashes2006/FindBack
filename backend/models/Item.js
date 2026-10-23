const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['found', 'lost'],
      required: true,
      default: 'found'
    },
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Please specify an item category'],
      enum: [
        'Electronics',
        'IDs & Cards',
        'Keys & Wallets',
        'Books & Stationery',
        'Clothing & Accessories',
        'Bags',
        'Personal Essentials',
        'Others'
      ],
      default: 'Others'
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
      campusZone: {
        type: String,
        required: [true, 'Please select a campus zone'],
        enum: [
          'Central Library',
          'Main Cafeteria',
          'Auditorium Complex',
          'Sports Arena',
          'Academic Block A',
          'Academic Block B',
          'Hostel Block 1',
          'Hostel Block 2',
          'Computer Science Lab',
          'Admin Building',
          'Campus Grounds / Parking'
        ]
      },
      specificSpot: {
        type: String,
        default: 'General area'
      }
    },
    dateOccurred: {
      type: Date,
      default: Date.now
    },
    imageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'claim_pending', 'approved_for_handover', 'returned'],
      default: 'open'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Anti-fraud hidden security clues
    // Only the questions are exposed to claimants; hints/expected answers stay private to finder/admin
    verificationClues: [
      {
        question: {
          type: String,
          required: true
        },
        expectedAnswerHint: {
          type: String,
          default: ''
        }
      }
    ],
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    currentClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null
    },
    handoverRecord: {
      handedOverAt: { type: Date },
      handedOverBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast searching and filtering
itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ 'location.campusZone': 1 });

module.exports = mongoose.model('Item', itemSchema);
