const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const { houseStreet, city, state, pincode, isDefault } = req.body;

      // If this is set as default, unset all other defaults
      if (isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      const newAddress = {
        houseStreet,
        city,
        state,
        pincode,
        isDefault: isDefault || user.addresses.length === 0,
      };

      user.addresses.push(newAddress);
      await user.save();

      res.status(201).json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const address = user.addresses.id(req.params.addressId);

      if (address) {
        address.houseStreet = req.body.houseStreet || address.houseStreet;
        address.city = req.body.city || address.city;
        address.state = req.body.state || address.state;
        address.pincode = req.body.pincode || address.pincode;

        // If setting as default, unset all others
        if (req.body.isDefault) {
          user.addresses.forEach((addr) => {
            addr.isDefault = false;
          });
          address.isDefault = true;
        }

        await user.save();
        res.json(user.addresses);
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.addresses = user.addresses.filter(
        (addr) => addr._id.toString() !== req.params.addressId
      );

      // If no addresses left or deleted default, set first as default
      if (user.addresses.length > 0) {
        const hasDefault = user.addresses.some((addr) => addr.isDefault);
        if (!hasDefault) {
          user.addresses[0].isDefault = true;
        }
      }

      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'recentlyViewed',
      populate: { path: 'category', select: 'name' },
    });

    res.json(user.recentlyViewed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getRecentlyViewed,
};