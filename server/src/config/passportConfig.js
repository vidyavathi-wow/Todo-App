const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const isProduction = process.env.NODE_ENV === 'production';
const callbackURL = isProduction
  ? 'https://tms-backend-5dcu.onrender.com/api/v1/auth/google/callback'
  : 'http://localhost:5000/api/v1/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const googleId = profile.id;
        const profilePic = profile.photos?.[0]?.value || null;

        if (!email) return done(new Error('No email found'), null);

        let user = await User.findOne({
          where: { googleId },
        });

        if (!user) {
          // If Google ID not found, check by email
          user = await User.findOne({ where: { email } });

          if (user) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.profilePic = profilePic;
            await user.save();
          } else {
            // Create new Google user
            user = await User.create({
              name,
              email,
              googleId,
              password: null,
              profilePic,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        console.error('Google Auth Error:', err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
