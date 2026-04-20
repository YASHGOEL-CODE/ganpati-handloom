const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Address Label
    label: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
    // Manual Entry Fields
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (v) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please provide a valid 10-digit Indian mobile number',
      },
    },
    houseStreet: {
      type: String,
      required: [true, 'House/Street address is required'],
      trim: true,
    },
    areaLandmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v);
        },
        message: 'Please provide a valid 6-digit pincode',
      },
      index: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    // Map-based Location Data
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    // Google Maps Data
    placeId: {
      type: String, // Google Place ID
    },
    formattedAddress: {
      type: String, // Google's formatted address
    },
    // Delivery Calculation
    distanceFromStore: {
      type: Number, // in kilometers
    },
    estimatedDeliveryTime: {
      type: Number, // in hours
    },
    // Address Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    // Address Status
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    distanceFromStore: {
      type: Number, // in kilometers
      index: true,
    },
    deliveryCharge: {
      type: Number, // in rupees
      default: 0,
    },
    estimatedDeliveryTime: {
      type: Number, // in hours
    },
    isServiceable: {
      type: Boolean,
      default: true,
      index: true,
    },
    },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
addressSchema.index({ location: '2dsphere' });

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Update location.coordinates when latitude/longitude changes
addressSchema.pre('save', function (next) {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});

// Virtual for full address
addressSchema.virtual('fullAddress').get(function () {
  return `${this.houseStreet}, ${this.areaLandmark ? this.areaLandmark + ', ' : ''}${
    this.city
  }, ${this.state} - ${this.pincode}`;
});

// Ensure virtuals are included when converting to JSON
addressSchema.set('toJSON', { virtuals: true });
addressSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Address', addressSchema);