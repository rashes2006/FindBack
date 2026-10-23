const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { optionalProtect } = require('../middleware/auth');

router.get('/dashboard', optionalProtect, getDashboardStats);

module.exports = router;
