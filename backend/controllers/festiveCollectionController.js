const FestiveCollection = require('../models/FestiveCollection');

// @desc    Get all festive collections sorted by priority
// @route   GET /api/festive-collections
// @access  Public
const getAll = async (req, res) => {
  try {
    const collections = await FestiveCollection.find()
      .sort({ priority: 1, createdAt: -1 });

    res.json({ success: true, collections });
  } catch (error) {
    console.error('❌ getAll festive collections error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single festive collection
// @route   GET /api/festive-collections/:id
// @access  Public
const getById = async (req, res) => {
  try {
    const collection = await FestiveCollection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }
    res.json({ success: true, collection });
  } catch (error) {
    console.error('❌ getById festive collection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create festive collection (admin)
// @route   POST /admin/festive-collections
// @access  Private/Admin
const create = async (req, res) => {
  try {
    const { title, slug, description, bannerImage, isActive, priority } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, message: 'Title and slug are required' });
    }

    // Check duplicate slug
    const existing = await FestiveCollection.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A collection with this slug already exists' });
    }

    const collection = await FestiveCollection.create({
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: description || '',
      bannerImage: bannerImage || '',
      isActive: isActive || false,
      priority: priority || 0,
    });

    console.log('✅ Festive collection created:', collection._id);
    res.status(201).json({ success: true, collection });
  } catch (error) {
    console.error('❌ create festive collection error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update festive collection (admin)
// @route   PUT /admin/festive-collections/:id
// @access  Private/Admin
const update = async (req, res) => {
  try {
    const collection = await FestiveCollection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const { title, slug, description, bannerImage, isActive, priority } = req.body;

    if (title)       collection.title       = title;
    if (slug)        collection.slug        = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (description !== undefined) collection.description = description;
    if (bannerImage !== undefined) collection.bannerImage = bannerImage;
    if (isActive    !== undefined) collection.isActive    = isActive;
    if (priority    !== undefined) collection.priority    = priority;

    await collection.save();
    console.log('✅ Festive collection updated:', collection._id);
    res.json({ success: true, collection });
  } catch (error) {
    console.error('❌ update festive collection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle isActive (admin)
// @route   PATCH /admin/festive-collections/:id/toggle
// @access  Private/Admin
const toggle = async (req, res) => {
  try {
    const collection = await FestiveCollection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    collection.isActive = !collection.isActive;
    await collection.save();

    console.log(`✅ Festive collection toggled: ${collection._id} → isActive: ${collection.isActive}`);
    res.json({ success: true, collection, isActive: collection.isActive });
  } catch (error) {
    console.error('❌ toggle festive collection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete festive collection (admin)
// @route   DELETE /admin/festive-collections/:id
// @access  Private/Admin
const remove = async (req, res) => {
  try {
    const collection = await FestiveCollection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    await collection.deleteOne();
    console.log('✅ Festive collection deleted:', req.params.id);
    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('❌ delete festive collection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, getById, create, update, toggle, remove };