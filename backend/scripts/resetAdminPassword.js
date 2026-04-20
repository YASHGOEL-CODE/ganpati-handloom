const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    const adminEmail = 'yashgoel2030@gmail.com';
    const newPassword = 'Admin@123'; // New password

    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    // Hash the new password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and ensure admin role
    user.password = hashedPassword;
    user.role = 'admin';
    user.isVerified = true;
    user.isEmailVerified = true;

    // Save without triggering pre-save hook
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          isEmailVerified: true,
        },
      }
    );

    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 Role:', 'admin');
    console.log('');
    console.log('🚀 You can now login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();