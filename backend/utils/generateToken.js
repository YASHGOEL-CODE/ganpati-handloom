const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

// Generate Access Token (short-lived)
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m', // 15 minutes
      issuer: 'ganpati-handloom',
      audience: 'ganpati-handloom-users',
    }
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = async (userId, ipAddress) => {
  // Create a refresh token that expires in 7 days
  const token = crypto.randomBytes(40).toString('hex');
  
  const refreshToken = await RefreshToken.create({
    token,
    user: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdByIp: ipAddress,
  });

  return refreshToken.token;
};

// Verify Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'ganpati-handloom',
      audience: 'ganpati-handloom-users',
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Revoke Refresh Token
const revokeToken = async (token, ipAddress) => {
  const refreshToken = await RefreshToken.findOne({ token });

  if (!refreshToken || !refreshToken.isActive) {
    throw new Error('Invalid token');
  }

  // Revoke token
  refreshToken.revokedAt = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
};

// Get valid refresh token
const getRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token }).populate('user');

  if (!refreshToken || !refreshToken.isActive) {
    throw new Error('Invalid token');
  }

  return refreshToken;
};

// Rotate refresh token
const rotateRefreshToken = async (oldToken, ipAddress) => {
  const refreshToken = await getRefreshToken(oldToken);
  
  // Generate new refresh token
  const newToken = await generateRefreshToken(refreshToken.user._id, ipAddress);
  
  // Revoke old token and link to new token
  refreshToken.revokedAt = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newToken;
  await refreshToken.save();
  
  return newToken;
};

// Clean up expired tokens (run periodically)
const removeExpiredTokens = async () => {
  await RefreshToken.deleteMany({
    $or: [
      { expiresAt: { $lt: Date.now() } },
      { revokedAt: { $ne: null } },
    ],
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  revokeToken,
  getRefreshToken,
  rotateRefreshToken,
  removeExpiredTokens,
};