const Address = require('../models/Address');
const { STORE_LOCATION, DELIVERY_RULES } = require('../config/delivery');
const { calculateDistance, calculateDeliveryCharge, isServiceable, estimateDeliveryTime } = require('../utils/distance');

// @desc    Get all addresses for logged-in user
// @route   GET /api/addresses
// @access  Private
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
      isActive: true,
    }).sort({ isDefault: -1, createdAt: -1 });

    const updatedAddresses = await Promise.all(
      addresses.map(async (address) => {
        if (
          (address.distanceFromStore === null || address.distanceFromStore === undefined || address.distanceFromStore === 0) &&
          address.latitude &&
          address.longitude
        ) {
          console.log('📍 Recalculating distance for address:', address._id);

          // Calculate distance
          const distance = calculateDistance(
            STORE_LOCATION.latitude,
            STORE_LOCATION.longitude,
            address.latitude,
            address.longitude
          );

          // Calculate delivery charge
          const charge = calculateDeliveryCharge(
            distance,
            DELIVERY_RULES.FREE_DELIVERY_DISTANCE,
            DELIVERY_RULES.PER_KM_RATE
          );

          // Estimate delivery time
          const time = estimateDeliveryTime(distance);

          // Check serviceability
          const serviceable = isServiceable(distance, DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE);

          // Update address
          address.distanceFromStore = distance;
          address.deliveryCharge = charge;
          address.estimatedDeliveryTime = time;
          address.isServiceable = serviceable;

          await address.save();

          console.log('✅ Distance recalculated:', distance, 'km');
        }

        return address;
      })
    );

    res.json({
      success: true,
      addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching addresses',
    });
  }
};

// @desc    Get single address by ID
// @route   GET /api/addresses/:id
// @access  Private
const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.json({
      success: true,
      address,
    });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching address',
    });
  }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
const createAddress = async (req, res) => {
  try {
    const {
      label,
      fullName,
      phone,
      houseStreet,
      areaLandmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      placeId,
      formattedAddress,
      isDefault,
    } = req.body;

    console.log('Creating address with coordinates:', { latitude, longitude });

    // ✅ Calculate distance and delivery details
    let distanceFromStore = null;
    let deliveryCharge = 0;
    let estimatedDeliveryTime = null;
    let serviceableStatus = false;

    if (latitude && longitude) {
      // Calculate distance from store
      distanceFromStore = calculateDistance(
        STORE_LOCATION.latitude,
        STORE_LOCATION.longitude,
        latitude,
        longitude
      );

      console.log('✅ Distance calculated:', distanceFromStore, 'km');

      // Check serviceability
      serviceableStatus = isServiceable(
        distanceFromStore,
        DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE
      );

      console.log('✅ Serviceable:', serviceableStatus);

      if (!serviceableStatus) {
        return res.status(400).json({
          success: false,
          message: `Sorry, we do not deliver to locations more than ${DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE} km away. Your location is ${distanceFromStore} km from our store.`,
          distance: distanceFromStore,
          maxDistance: DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE,
        });
      }

      // Calculate delivery charge
      deliveryCharge = calculateDeliveryCharge(
        distanceFromStore,
        DELIVERY_RULES.FREE_DELIVERY_DISTANCE,
        DELIVERY_RULES.PER_KM_RATE
      );

      // Estimate delivery time
      estimatedDeliveryTime = estimateDeliveryTime(distanceFromStore);

      console.log('✅ Delivery charge:', deliveryCharge);
      console.log('✅ Delivery time:', estimatedDeliveryTime, 'hours');
    }

    // Check if first address (make it default)
    const existingAddresses = await Address.countDocuments({
      user: req.user._id,
      isActive: true,
    });

    const shouldBeDefault = existingAddresses === 0 || isDefault;

    // If setting as default, unset other defaults
    if (shouldBeDefault) {
      await Address.updateMany(
        { user: req.user._id, isActive: true },
        { $set: { isDefault: false } }
      );
    }

    // Create address
    const address = await Address.create({
      user: req.user._id,
      label,
      fullName,
      phone,
      houseStreet,
      areaLandmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      placeId,
      formattedAddress,
      distanceFromStore,
      deliveryCharge,
      estimatedDeliveryTime,
      isServiceable: serviceableStatus,
      isDefault: shouldBeDefault,
      isVerified: !!(latitude && longitude),
      verifiedAt: latitude && longitude ? Date.now() : null,
    });

    console.log('✅ Address created successfully');

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      address,
      deliveryInfo: {
        distance: distanceFromStore,
        charge: deliveryCharge,
        estimatedTime: estimatedDeliveryTime,
        isServiceable: serviceableStatus,
        freeDeliveryThreshold: DELIVERY_RULES.FREE_DELIVERY_DISTANCE,
      },
    });
  } catch (error) {
    console.error('❌ Create address error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating address',
    });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const {
      label,
      fullName,
      phone,
      houseStreet,
      areaLandmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      placeId,
      formattedAddress,
      isDefault,
    } = req.body;

    // Recalculate if coordinates changed
    let distanceFromStore = address.distanceFromStore;
    let deliveryCharge = address.deliveryCharge;
    let estimatedDeliveryTime = address.estimatedDeliveryTime;
    let serviceableStatus = address.isServiceable;

    if (latitude && longitude && (latitude !== address.latitude || longitude !== address.longitude)) {
      distanceFromStore = calculateDistance(
        STORE_LOCATION.latitude,
        STORE_LOCATION.longitude,
        latitude,
        longitude
      );

      serviceableStatus = isServiceable(
        distanceFromStore,
        DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE
      );

      if (!serviceableStatus) {
        return res.status(400).json({
          success: false,
          message: `Sorry, we do not deliver to locations more than ${DELIVERY_RULES.MAX_SERVICEABLE_DISTANCE} km away.`,
          distance: distanceFromStore,
        });
      }

      deliveryCharge = calculateDeliveryCharge(
        distanceFromStore,
        DELIVERY_RULES.FREE_DELIVERY_DISTANCE,
        DELIVERY_RULES.PER_KM_RATE
      );

      estimatedDeliveryTime = estimateDeliveryTime(distanceFromStore);
    }

    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.user._id, isActive: true, _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }

    // Update address
    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.houseStreet = houseStreet || address.houseStreet;
    address.areaLandmark = areaLandmark;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.latitude = latitude || address.latitude;
    address.longitude = longitude || address.longitude;
    address.placeId = placeId || address.placeId;
    address.formattedAddress = formattedAddress || address.formattedAddress;
    address.distanceFromStore = distanceFromStore;
    address.deliveryCharge = deliveryCharge;
    address.estimatedDeliveryTime = estimatedDeliveryTime;
    address.isServiceable = serviceableStatus;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating address',
    });
  }
};

// @desc    Delete address (soft delete)
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Soft delete
    address.isActive = false;
    await address.save();

    // If this was default, set another as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({
        user: req.user._id,
        isActive: true,
        _id: { $ne: req.params.id },
      }).sort({ createdAt: -1 });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting address',
    });
  }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Unset all other defaults
    await Address.updateMany(
      { user: req.user._id, isActive: true },
      { $set: { isDefault: false } }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated',
      address,
    });
  } catch (error) {
    console.error('Set default error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error setting default address',
    });
  }
};

// @desc    Get store location
// @route   GET /api/addresses/store-location
// @access  Public
const getStoreLocation = async (req, res) => {
  try {
    res.json({
      success: true,
      storeLocation: STORE_LOCATION,
      deliveryRules: DELIVERY_RULES,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getStoreLocation,
};