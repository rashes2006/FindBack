const Razorpay = require('razorpay');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_findback_campus';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_secret_findback_2026';
const RAZORPAY_MODE = process.env.RAZORPAY_MODE || 'test';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
} catch (err) {
  console.warn('⚠️ Razorpay initialization warning:', err.message);
}

module.exports = {
  razorpay: razorpayInstance,
  keyId: RAZORPAY_KEY_ID,
  keySecret: RAZORPAY_KEY_SECRET,
  mode: RAZORPAY_MODE
};
