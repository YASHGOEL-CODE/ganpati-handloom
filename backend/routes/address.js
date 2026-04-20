const express = require('express');
const router = express.Router();
const {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getStoreLocation,
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/store-location', getStoreLocation);

// Protected routes
router.route('/')
  .get(protect, getUserAddresses)
  .post(protect, createAddress);

router.route('/:id')
  .get(protect, getAddressById)
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.put('/:id/default', protect, setDefaultAddress);

module.exports = router;