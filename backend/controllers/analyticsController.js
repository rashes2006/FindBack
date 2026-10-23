const Item = require('../models/Item');
const Claim = require('../models/Claim');
const AuditLog = require('../models/AuditLog');

// @desc    Get campus lost & found analytics and activity feed
// @route   GET /api/analytics/dashboard
// @access  Public (stats) / Private (audit logs)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalFound = await Item.countDocuments({ type: 'found' });
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalReturned = await Item.countDocuments({ status: 'returned' });
    const totalPendingClaims = await Claim.countDocuments({ status: 'pending' });
    const totalApprovedClaims = await Claim.countDocuments({ status: 'approved' });

    // Recovery rate percentage
    const recoveryRate =
      totalFound > 0 ? Math.round((totalReturned / totalFound) * 100) : 0;

    // Category breakdown
    const categoryStats = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          recovered: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Campus Zone Hotspots
    const zoneHotspots = await Item.aggregate([
      {
        $group: {
          _id: '$location.campusZone',
          totalItems: { $sum: 1 },
          foundCount: {
            $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] }
          },
          lostCount: {
            $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalItems: -1 } },
      { $limit: 6 }
    ]);

    // Status distribution
    const statusDistribution = await Item.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent 10 audit activities
    const recentActivity = await AuditLog.find()
      .populate('performedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalItems: totalFound + totalLost,
        totalFound,
        totalLost,
        totalReturned,
        totalPendingClaims,
        totalApprovedClaims,
        recoveryRate
      },
      categoryStats,
      zoneHotspots,
      statusDistribution,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};
