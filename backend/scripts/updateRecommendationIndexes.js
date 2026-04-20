const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');
const recommendationEngine = require('../services/recommendationEngine');

dotenv.config();

const updateIndexes = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    console.log('📊 Creating indexes for UserInteraction...');
    
    // Create indexes manually for UserInteraction
    await UserInteraction.collection.createIndex({ user: 1, timestamp: -1 });
    await UserInteraction.collection.createIndex({ sessionId: 1, timestamp: -1 });
    await UserInteraction.collection.createIndex({ product: 1, interactionType: 1 });
    await UserInteraction.collection.createIndex({ timestamp: -1 });
    await UserInteraction.collection.createIndex({ user: 1, product: 1, interactionType: 1 });
    await UserInteraction.collection.createIndex({ timestamp: -1, interactionType: 1, interactionWeight: -1 });
    
    console.log('✅ UserInteraction indexes created');

    console.log('📊 Creating indexes for Product...');
    
    // Create indexes manually for Product
    await Product.collection.createIndex({ recommendationScore: -1 });
    await Product.collection.createIndex({ trendingScore: -1, createdAt: -1 });
    await Product.collection.createIndex({ category: 1, fabricType: 1, productType: 1 });
    await Product.collection.createIndex({ isActive: 1, rating: -1 });
    
    console.log('✅ Product indexes created');

    console.log('🔄 Updating product recommendation scores...');
    await recommendationEngine.updateProductScores();

    console.log('✅ All indexes and scores updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

updateIndexes();