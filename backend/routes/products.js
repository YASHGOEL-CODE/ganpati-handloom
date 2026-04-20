const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  getProductsByCollection,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { trackProductView } = require('../middleware/trackInteraction');

router.get('/', getProducts);
router.get('/featured/list', getFeaturedProducts);
router.get('/trending/list', getTrendingProducts);
router.get('/collection/:collectionName', getProductsByCollection);
router.get('/:id', trackProductView, getProductById);

module.exports = router;