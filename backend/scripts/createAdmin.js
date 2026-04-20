const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // ✅ CHANGE THESE CREDENTIALS
    const adminEmail = 'yashgoel2030@gmail.com'; // ← YOUR EMAIL
    const adminPassword = 'Admin@123'; // ← CHANGE THIS PASSWORD
    const adminName = 'Yash Goel'; // ← YOUR NAME
    const adminPhone = '9999999999'; // ← YOUR PHONE (optional)

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('✅ Admin account already exists:', adminEmail);
        console.log('📛 Name:', existingAdmin.fullName);
        console.log('👤 Role:', existingAdmin.role);
        console.log('');
        console.log('💡 To login, use:');
        console.log('   Email:', adminEmail);
        console.log('   Password: (the password you set)');
        process.exit(0);
      } else {
        // Update existing user to admin
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        existingAdmin.isEmailVerified = true;
        await existingAdmin.save();
        console.log('✅ User upgraded to admin:', adminEmail);
        process.exit(0);
      }
    }

    // Create new admin user
    const admin = await User.create({
      fullName: adminName,
      email: adminEmail,
      password: adminPassword, // Will be hashed automatically by pre-save hook
      phone: adminPhone,
      role: 'admin',
      isVerified: true, // Admin doesn't need email verification
      isEmailVerified: true,
      isActive: true,
    });

    console.log('✅ Admin account created successfully!');
    console.log('');
    console.log('📋 ADMIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📛 Name:', admin.fullName);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminPassword);
    console.log('📱 Phone:', admin.phone);
    console.log('👤 Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Change the password after first login!');
    console.log('   2. Do NOT share these credentials.');
    console.log('   3. Use a password manager.');
    console.log('');
    console.log('🚀 You can now login at: http://localhost:3000/signin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();