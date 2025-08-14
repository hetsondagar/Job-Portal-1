const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.user_type 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Configure Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/api/oauth/google/callback",
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({
        where: {
          oauth_provider: 'google',
          oauth_id: profile.id
        }
      });

      if (!user) {
        // Check if user exists with same email
        const existingUser = await User.findOne({
          where: { email: profile.emails[0].value }
        });

        if (existingUser) {
          // Link OAuth account to existing user
          await existingUser.update({
            oauth_provider: 'google',
            oauth_id: profile.id,
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
            oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
            is_email_verified: true
          });
          user = existingUser;
        } else {
          // Create new user
          user = await User.create({
            email: profile.emails[0].value,
            first_name: profile.name.givenName || profile.displayName.split(' ')[0],
            last_name: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
            oauth_provider: 'google',
            oauth_id: profile.id,
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
            oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
            avatar: profile.photos[0]?.value,
            is_email_verified: true,
            account_status: 'active',
            user_type: 'jobseeker'
          });
        }
      } else {
        // Update existing OAuth user's tokens
        await user.update({
          oauth_access_token: accessToken,
          oauth_refresh_token: refreshToken,
          oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
          last_login_at: new Date()
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configure Facebook OAuth Strategy (only if credentials are provided)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8000/api/oauth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({
        where: {
          oauth_provider: 'facebook',
          oauth_id: profile.id
        }
      });

      if (!user) {
        // Check if user exists with same email
        const existingUser = await User.findOne({
          where: { email: profile.emails[0].value }
        });

        if (existingUser) {
          // Link OAuth account to existing user
          await existingUser.update({
            oauth_provider: 'facebook',
            oauth_id: profile.id,
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
            oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
            is_email_verified: true
          });
          user = existingUser;
        } else {
          // Create new user
          const nameParts = profile.displayName.split(' ');
          user = await User.create({
            email: profile.emails[0].value,
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            oauth_provider: 'facebook',
            oauth_id: profile.id,
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
            oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
            avatar: profile.photos[0]?.value,
            is_email_verified: true,
            account_status: 'active',
            user_type: 'jobseeker'
          });
        }
      } else {
        // Update existing OAuth user's tokens
        await user.update({
          oauth_access_token: accessToken,
          oauth_refresh_token: refreshToken,
          oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
          last_login_at: new Date()
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Google OAuth routes
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

router.get('/google/callback', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, () => {
    try {
      const user = req.user;
      const token = generateToken(user);
      
      // Check if user needs to set up a password (OAuth users without password)
      const needsPasswordSetup = !user.password && user.oauth_provider === 'google';
      
      // Redirect to frontend with token and setup flag
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=google&needsPasswordSetup=${needsPasswordSetup}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  });
});

// Facebook OAuth routes
router.get('/facebook', (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Facebook OAuth is not configured'
    });
  }
  passport.authenticate('facebook', { scope: ['email'] })(req, res);
});

router.get('/facebook/callback', (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  passport.authenticate('facebook', { session: false, failureRedirect: '/login' })(req, res, () => {
    try {
      const user = req.user;
      const token = generateToken(user);
      
      // Check if user needs to set up a password (OAuth users without password)
      const needsPasswordSetup = !user.password && user.oauth_provider === 'facebook';
      
      // Redirect to frontend with token and setup flag
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=facebook&needsPasswordSetup=${needsPasswordSetup}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  });
});

// Setup password for OAuth users
router.post('/setup-password', async (req, res) => {
  try {
    const { password } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }
    
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is OAuth user without password
    if (user.password || (user.oauth_provider === 'local')) {
      return res.status(400).json({
        success: false,
        message: 'Password already set or user is not OAuth user'
      });
    }
    
    // Set password for OAuth user
    await user.update({ password });
    
    res.status(200).json({
      success: true,
      message: 'Password set successfully'
    });
    
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get OAuth URLs for frontend
router.get('/urls', (req, res) => {
  const urls = {};
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    urls.google = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/oauth/google`;
  }
  
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    urls.facebook = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/oauth/facebook`;
  }
  
  res.json({
    success: true,
    data: urls
  });
});

module.exports = router;
