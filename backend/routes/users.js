const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getRecentlyViewed,
  changePassword,
  deleteAccount, 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.get('/recently-viewed', protect, getRecentlyViewed);
router.put('/change-password', protect, changePassword); 
router.delete('/delete-account', protect, deleteAccount);
module.exports = router;