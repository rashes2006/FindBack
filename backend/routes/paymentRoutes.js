const express = require('express');
const router = express.Router();
const {
  getConfig,
  createOrder,
  verifyPayment,
  getMyPayments,
  getItemPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', getConfig);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/item/:itemId', protect, getItemPayments);

module.exports = router;
