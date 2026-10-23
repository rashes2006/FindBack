const crypto = require('crypto');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Generate 6-digit secure numerical OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @desc    Submit a claim for a found item
// @route   POST /api/claims
// @access  Private (student or staff)
exports.submitClaim = async (req, res, next) => {
  try {
    const { itemId, answers, proofDescription, proofImageUrl } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.type !== 'found') {
      return res.status(400).json({
        success: false,
        message: 'Claims can only be filed against Found items'
      });
    }

    if (item.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been verified and returned to its rightful owner'
      });
    }

    // Reporter cannot claim their own found item
    if (item.reportedBy.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot file a claim on an item that you reported finding'
      });
    }

    // Check for existing claim by this user
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user.id
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item. Check "My Claims" to monitor its status.'
      });
    }

    if (!proofDescription || proofDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear proof description (at least 10 characters) demonstrating ownership'
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user.id,
      answers: answers || [],
      proofDescription,
      proofImageUrl: proofImageUrl || '',
      status: 'pending'
    });

    // Update item status to indicate claim in progress
    if (item.status === 'open') {
      item.status = 'claim_pending';
      await item.save();
    }

    // Notify the finder that a new claim has arrived
    await Notification.create({
      recipient: item.reportedBy,
      title: 'New Claim Received',
      message: `${req.user.name} submitted a claim with verification proof for "${item.title}".`,
      type: 'claim_received',
      link: `/items/${item._id}`
    });

    // Audit Log
    await AuditLog.create({
      action: 'CLAIM_SUBMITTED',
      entityType: 'Claim',
      entityId: claim._id,
      performedBy: req.user.id,
      details: `Claim filed by ${req.user.name} for item "${item.title}"`
    });

    res.status(201).json({
      success: true,
      message: 'Claim successfully submitted. The finder/campus security will review your verification answers.',
      claim
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims for a specific item (for finder/admin review)
// @route   GET /api/claims/item/:itemId
// @access  Private (Finder or Admin/Staff)
exports.getClaimsForItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isReporter = item.reportedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or campus security officers can review claims for this item'
      });
    }

    const claims = await Claim.find({ item: req.params.itemId })
      .populate('claimant', 'name email phone studentOrStaffId department')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's claims
// @route   GET /api/claims/my-claims
// @access  Private
exports.getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user.id })
      .populate({
        path: 'item',
        select: 'title category location imageUrl status reportedBy handoverRecord',
        populate: { path: 'reportedBy', select: 'name email role department' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review a claim (Approve or Reject with feedback)
// @route   PUT /api/claims/:id/review
// @access  Private (Finder or Admin/Staff)
exports.reviewClaim = async (req, res, next) => {
  try {
    const { action, reviewNotes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const item = await Item.findById(claim.item._id);
    const isReporter = item.reportedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or campus staff can approve or reject claims'
      });
    }

    if (action === 'approve') {
      // Generate a secure 6-digit OTP valid for 48 hours
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      claim.status = 'approved';
      claim.reviewNotes = reviewNotes || 'Verification answers matched expected criteria.';
      claim.reviewedBy = req.user.id;
      claim.reviewedAt = new Date();
      claim.handoverOtp = otp;
      claim.handoverOtpExpiresAt = expiresAt;
      await claim.save();

      // Update Item status
      item.status = 'approved_for_handover';
      item.claimedBy = claim.claimant;
      item.currentClaim = claim._id;
      await item.save();

      // Notify the claimant with instructions
      await Notification.create({
        recipient: claim.claimant,
        title: 'Claim Approved! Handover Token Issued',
        message: `Your claim for "${item.title}" was approved! Your Handover Verification Token is ${otp}. Present this code at the campus collection desk.`,
        type: 'handover_ready',
        link: `/my-claims`
      });

      // Audit Log
      await AuditLog.create({
        action: 'CLAIM_STATUS_UPDATED',
        entityType: 'Claim',
        entityId: claim._id,
        performedBy: req.user.id,
        details: `Claim approved by ${req.user.name}. Handover OTP generated for item "${item.title}"`
      });

      return res.json({
        success: true,
        message: 'Claim approved! The claimant has been notified with their Handover OTP.',
        claim
      });
    } else {
      // Reject claim
      claim.status = 'rejected';
      claim.reviewNotes = reviewNotes || 'Verification answers did not match ownership criteria.';
      claim.reviewedBy = req.user.id;
      claim.reviewedAt = new Date();
      await claim.save();

      // Check if there are other pending claims for this item
      const otherPending = await Claim.countDocuments({
        item: item._id,
        status: { $in: ['pending', 'under_review'] }
      });

      if (otherPending === 0 && item.status !== 'returned') {
        item.status = 'open';
        item.claimedBy = null;
        item.currentClaim = null;
        await item.save();
      }

      // Notify the claimant of rejection
      await Notification.create({
        recipient: claim.claimant,
        title: 'Claim Status Update',
        message: `Your claim for "${item.title}" could not be verified. Note: ${claim.reviewNotes}`,
        type: 'claim_rejected',
        link: `/my-claims`
      });

      // Audit Log
      await AuditLog.create({
        action: 'CLAIM_REJECTED',
        entityType: 'Claim',
        entityId: claim._id,
        performedBy: req.user.id,
        details: `Claim rejected by ${req.user.name} for item "${item.title}". Note: ${claim.reviewNotes}`
      });

      return res.json({
        success: true,
        message: 'Claim has been rejected with feedback notes.',
        claim
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Handover OTP and complete item release
// @route   POST /api/claims/verify-handover
// @access  Private (Finder or Admin/Staff)
exports.verifyHandoverOtp = async (req, res, next) => {
  try {
    const { itemId, otp, notes } = req.body;

    if (!itemId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the item ID and the 6-digit handover OTP'
      });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isReporter = item.reportedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the finder or campus security officer can verify handover OTPs'
      });
    }

    // Find the approved claim for this item matching the OTP
    const claim = await Claim.findOne({
      item: itemId,
      handoverOtp: otp.trim(),
      status: 'approved'
    }).populate('claimant', 'name email studentOrStaffId department');

    if (!claim) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Handover OTP or claim is not in approved status. Please verify the code.'
      });
    }

    // Check expiry
    if (claim.handoverOtpExpiresAt && new Date() > claim.handoverOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This Handover OTP has expired. Please ask the claimant to request a re-verification.'
      });
    }

    // Handover successful! Complete state transition atomically
    const completedAt = new Date();

    claim.status = 'collected';
    claim.handoverCompletedAt = completedAt;
    claim.handoverVerifiedBy = req.user.id;
    await claim.save();

    item.status = 'returned';
    item.handoverRecord = {
      handedOverAt: completedAt,
      handedOverBy: req.user.id,
      receivedBy: claim.claimant._id,
      notes: notes || 'Physical handover successfully verified via 6-digit OTP'
    };
    await item.save();

    // Reject or close any remaining pending claims on this item
    await Claim.updateMany(
      { item: itemId, _id: { $ne: claim._id } },
      {
        status: 'rejected',
        reviewNotes: 'Item has been collected by the verified rightful owner.'
      }
    );

    // Notify claimant
    await Notification.create({
      recipient: claim.claimant._id,
      title: 'Item Handover Complete! 🎉',
      message: `Your item "${item.title}" has been handed over and marked as Returned.`,
      type: 'item_returned',
      link: `/items/${item._id}`
    });

    // Audit Log
    await AuditLog.create({
      action: 'ITEM_RETURNED',
      entityType: 'Item',
      entityId: item._id,
      performedBy: req.user.id,
      details: `Item "${item.title}" successfully handed over to verified owner ${claim.claimant.name} (${claim.claimant.studentOrStaffId || 'Student'})`,
      metadata: {
        claimantId: claim.claimant._id,
        verifiedBy: req.user.id,
        completedAt
      }
    });

    res.json({
      success: true,
      message: 'Item handover successfully verified! Item status updated to Returned.',
      item,
      claim
    });
  } catch (error) {
    next(error);
  }
};
