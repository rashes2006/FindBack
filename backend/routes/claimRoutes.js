const express = require('express');
const router = express.Router();
const {
  submitClaim,
  getClaimsForItem,
  getMyClaims,
  reviewClaim,
  verifyHandoverOtp
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submitClaim);
router.get('/my-claims', protect, getMyClaims);
router.get('/item/:itemId', protect, getClaimsForItem);
router.put('/:id/review', protect, reviewClaim);
router.post('/verify-handover', protect, verifyHandoverOtp);

module.exports = router;
