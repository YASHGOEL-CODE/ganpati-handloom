// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // User exists — mark as verified and log them in
          if (!user.isVerified) {
            user.isVerified      = true;
            user.isEmailVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        // User does not exist — create new one
        user = await User.create({
          fullName:        profile.displayName || email.split('@')[0],
          email,
          password:        'google-oauth-' + Math.random().toString(36).slice(-10),
          isVerified:      true,
          isEmailVerified: true,
          googleId:        profile.id,
        });

        return done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Not using sessions — just need these as stubs for passport to work
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser((id, done) => done(null, { _id: id }));

module.exports = passport;