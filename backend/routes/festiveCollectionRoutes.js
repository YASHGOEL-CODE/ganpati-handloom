const express        = require('express');
const router         = express.Router();
const {
  getAll, getById, create, update, toggle, remove,
} = require('../controllers/festiveCollectionController');
const { protect }    = require('../middleware/auth');
const { isAdmin }    = require('../middleware/admin');
const uploadFestive  = require('../middleware/uploadFestive');

// ── Public ──
router.get('/', getAll);

// ✅ IMPORTANT: Static routes MUST come before /:id param routes
// POST /api/festive-collections/upload-image
router.post(
  '/upload-image',
  protect,
  isAdmin,
  uploadFestive.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const url = `/uploads/festive/${req.file.filename}`;
    console.log('✅ Festive banner uploaded:', url);
    res.json({ success: true, url });
  }
);

// ── /:id routes AFTER all static routes ──
router.get('/:id',           getById);
router.post('/',             protect, isAdmin, create);
router.put('/:id',           protect, isAdmin, update);
router.patch('/:id/toggle',  protect, isAdmin, toggle);
router.delete('/:id',        protect, isAdmin, remove);

module.exports = router;