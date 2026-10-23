const Item = require('../models/Item');
const Claim = require('../models/Claim');
const AuditLog = require('../models/AuditLog');

// Helper to sanitize verification clues for public consumption
const sanitizeItem = (item, currentUserId, currentUserRole) => {
  const itemObj = item.toObject ? item.toObject() : { ...item };
  const isReporter =
    currentUserId &&
    itemObj.reportedBy &&
    (itemObj.reportedBy._id
      ? itemObj.reportedBy._id.toString() === currentUserId.toString()
      : itemObj.reportedBy.toString() === currentUserId.toString());
  const isAdminOrStaff =
    currentUserRole === 'admin' || currentUserRole === 'staff';

  // If not reporter and not admin/staff, omit expectedAnswerHint from verification clues
  if (!isReporter && !isAdminOrStaff && itemObj.verificationClues) {
    itemObj.verificationClues = itemObj.verificationClues.map((clue) => ({
      _id: clue._id,
      question: clue.question
      // expectedAnswerHint is intentionally excluded for anti-fraud protection
    }));
  }

  return itemObj;
};

// @desc    Get all items with search, category, location, and status filters
// @route   GET /api/items
// @access  Public (optional auth)
exports.getItems = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      campusZone,
      status,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Filter by item type (found or lost)
    if (type && ['found', 'lost'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by campus zone
    if (campusZone && campusZone !== 'All') {
      query['location.campusZone'] = campusZone;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Keyword search over title and description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'location.specificSpot': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'date_occurred') {
      sortOption = { dateOccurred: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(query);

    const items = await Item.find(query)
      .populate('reportedBy', 'name role department studentOrStaffId')
      .populate('claimedBy', 'name studentOrStaffId')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : null;

    const sanitizedItems = items.map((item) => sanitizeItem(item, userId, userRole));

    res.json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      items: sanitizedItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public (optional auth)
exports.getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name role department email phone studentOrStaffId')
      .populate('claimedBy', 'name department studentOrStaffId')
      .populate('handoverRecord.handedOverBy', 'name role')
      .populate('handoverRecord.receivedBy', 'name studentOrStaffId');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? req.user.role : null;

    const sanitized = sanitizeItem(item, userId, userRole);

    // If item is 'lost', find potential matching 'found' items
    let potentialMatches = [];
    if (item.type === 'lost' && item.status !== 'returned') {
      potentialMatches = await Item.find({
        type: 'found',
        status: { $in: ['open', 'claim_pending'] },
        $or: [
          { category: item.category },
          { 'location.campusZone': item.location.campusZone },
          { title: { $regex: item.title.split(' ')[0], $options: 'i' } }
        ]
      })
        .limit(4)
        .select('title category location imageUrl status dateOccurred');
    }

    res.json({
      success: true,
      item: sanitized,
      potentialMatches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item report (Found or Lost)
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      category,
      description,
      location,
      dateOccurred,
      imageUrl,
      verificationClues
    } = req.body;

    if (!title || !description || !location || !location.campusZone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, and campus zone)'
      });
    }

    // Found items should have at least 1 anti-fraud verification question
    let clues = [];
    if (type === 'found' && Array.isArray(verificationClues)) {
      clues = verificationClues.filter((c) => c && c.question && c.question.trim() !== '');
    }

    const item = await Item.create({
      type: type || 'found',
      title,
      category: category || 'Others',
      description,
      location: {
        campusZone: location.campusZone,
        specificSpot: location.specificSpot || 'General area'
      },
      dateOccurred: dateOccurred || Date.now(),
      imageUrl: imageUrl || '',
      verificationClues: clues,
      reportedBy: req.user.id
    });

    // Create Audit Log
    await AuditLog.create({
      action: 'ITEM_REPORTED',
      entityType: 'Item',
      entityId: item._id,
      performedBy: req.user.id,
      details: `New ${item.type.toUpperCase()} item reported: "${item.title}" in ${item.location.campusZone}`
    });

    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Only original reporter or admin/staff can update
    const isReporter = item.reportedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this item report'
      });
    }

    const { title, description, category, location, dateOccurred, imageUrl, verificationClues } =
      req.body;

    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;
    if (dateOccurred) item.dateOccurred = dateOccurred;
    if (location) {
      if (location.campusZone) item.location.campusZone = location.campusZone;
      if (location.specificSpot !== undefined)
        item.location.specificSpot = location.specificSpot;
    }
    if (verificationClues && Array.isArray(verificationClues)) {
      item.verificationClues = verificationClues;
    }

    await item.save();

    await AuditLog.create({
      action: 'ITEM_UPDATED',
      entityType: 'Item',
      entityId: item._id,
      performedBy: req.user.id,
      details: `Item details updated for "${item.title}"`
    });

    res.json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const isReporter = item.reportedBy.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item report'
      });
    }

    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item and associated claims successfully removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get items reported by logged-in user
// @route   GET /api/items/user/me
// @access  Private
exports.getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user.id })
      .populate('claimedBy', 'name studentOrStaffId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
};
