const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Product type filter
    if (req.query.productType) {
      filter.productType = req.query.productType;
    }

    // Fabric type filter
    if (req.query.fabricType) {
      filter.fabricType = req.query.fabricType;
    }

    // Size filter
    if (req.query.size) {
      filter.size = req.query.size;
    }

    // Color filter
    if (req.query.color) {
      filter.color = new RegExp(req.query.color, 'i');
    }

    // Handmade filter
    if (req.query.isHandmade) {
      filter.isHandmade = req.query.isHandmade === 'true';
    }

    // Premium filter
    if (req.query.isPremium) {
      filter.isPremium = req.query.isPremium === 'true';
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Collection filter
    if (req.query.collection) {
      filter.collections = req.query.collection;
    }

    // Search filter - IMPROVED
if (req.query.keyword) {
  // Split search query into words for better matching
  const searchTerms = req.query.keyword.trim().split(/\s+/);
  
  // Create regex patterns for each word (case-insensitive, partial match)
  const regexPatterns = searchTerms.map(term => new RegExp(term, 'i'));
  
  filter.$or = [
    // Match if ALL search terms appear in name
    { name: { $regex: req.query.keyword, $options: 'i' } },
    // Match if ALL search terms appear in description
    { description: { $regex: req.query.keyword, $options: 'i' } },
    // Match if ANY search term appears in name
    { name: { $in: regexPatterns } },
    // Match if ANY search term appears in description
    { description: { $in: regexPatterns } },
    // Match product type
    { productType: { $regex: req.query.keyword, $options: 'i' } },
    // Match fabric type
    { fabricType: { $regex: req.query.keyword, $options: 'i' } },
    // Match color
    { color: { $regex: req.query.keyword, $options: 'i' } },
  ];
}

    // Sort options
    let sortOption = {};
    if (req.query.sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (req.query.sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (req.query.sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (req.query.sort === 'popular') {
      sortOption = { viewCount: -1, rating: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('frequentlyBoughtTogether', 'name price images rating');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Add to user's recently viewed (if user is logged in)
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        // Remove product if already in recently viewed
        user.recentlyViewed = user.recentlyViewed.filter(
          (id) => id.toString() !== product._id.toString()
        );
        // Add to beginning of array
        user.recentlyViewed.unshift(product._id);
        // Keep only last 20 items
        if (user.recentlyViewed.length > 20) {
          user.recentlyViewed = user.recentlyViewed.slice(0, 20);
        }
        await user.save();
      }
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured/list
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isPremium: true })
      .populate('category', 'name')
      .sort({ rating: -1, viewCount: -1 })
      .limit(8);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending products
// @route   GET /api/products/trending/list
// @access  Public
const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ purchaseCount: -1, viewCount: -1 })
      .limit(8);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by collection
// @route   GET /api/products/collection/:collectionName
// @access  Public
const getProductsByCollection = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      collections: req.params.collectionName,
    }).populate('category', 'name');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  getProductsByCollection,
};