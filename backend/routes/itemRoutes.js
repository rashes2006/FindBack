const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems
} = require('../controllers/itemController');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/', optionalProtect, getItems);
router.get('/user/me', protect, getMyItems);
router.get('/:id', optionalProtect, getItemById);
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
