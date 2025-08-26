const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const { sequelize } = require('../config/sequelize');

const router = express.Router();

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
};

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
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth Strategy - Profile:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      // Check if user already exists with this OAuth ID
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
          console.log('📝 Linking OAuth account to existing user:', existingUser.id);
                  // Link OAuth account to existing user and sync profile data
        await existingUser.update({
          oauth_provider: 'google',
          oauth_id: profile.id,
          oauth_access_token: accessToken,
          oauth_refresh_token: refreshToken,
          oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
          is_email_verified: true,
          last_login_at: new Date(),
          // Sync Google profile data if not already set
          first_name: existingUser.first_name || profile.name.givenName || profile.displayName.split(' ')[0],
          last_name: existingUser.last_name || profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || '',
          avatar: existingUser.avatar || profile.photos[0]?.value,
          headline: existingUser.headline || profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
          current_location: existingUser.current_location || profile._json?.locale || 'Not specified',
          last_profile_update: new Date()
        });
          user = existingUser;
        } else {
          console.log('📝 Creating new OAuth user');
          // Create new user - default to jobseeker, will be updated in callback if needed
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
            user_type: 'jobseeker', // Default, will be updated in callback if needed
            // Sync additional Google profile data
            headline: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
            summary: `Profile synced from Google account`,
            current_location: profile._json?.locale || 'Not specified',
            profile_completion: 60, // Basic profile completion
            last_profile_update: new Date()
          });
        }
      } else {
        console.log('📝 Updating existing OAuth user tokens:', user.id);
        // Update existing OAuth user's tokens and sync latest profile data
        await user.update({
          oauth_access_token: accessToken,
          oauth_refresh_token: refreshToken,
          oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
          last_login_at: new Date(),
          // Sync latest Google profile data
          first_name: profile.name.givenName || user.first_name,
          last_name: profile.name.familyName || user.last_name,
          avatar: profile.photos[0]?.value || user.avatar,
          headline: profile.displayName || user.headline,
          current_location: profile._json?.locale || user.current_location,
          last_profile_update: new Date()
        });
      }

      console.log('✅ Google OAuth Strategy - User ready:', {
        id: user.id,
        email: user.email,
        userType: user.user_type
      });

      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth Strategy error:', error);
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
      console.log('🔍 Facebook OAuth Strategy - Profile:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      // Check if user already exists with this OAuth ID
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
          console.log('📝 Linking OAuth account to existing user:', existingUser.id);
          // Link OAuth account to existing user
          await existingUser.update({
            oauth_provider: 'facebook',
            oauth_id: profile.id,
            oauth_access_token: accessToken,
            oauth_refresh_token: refreshToken,
            oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
            is_email_verified: true,
            last_login_at: new Date()
          });
          user = existingUser;
        } else {
          console.log('📝 Creating new OAuth user');
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
            user_type: 'jobseeker' // Default, will be updated in callback if needed
          });
        }
      } else {
        console.log('📝 Updating existing OAuth user tokens:', user.id);
        // Update existing OAuth user's tokens
        await user.update({
          oauth_access_token: accessToken,
          oauth_refresh_token: refreshToken,
          oauth_token_expires_at: new Date(Date.now() + 3600000), // 1 hour
          last_login_at: new Date()
        });
      }

      console.log('✅ Facebook OAuth Strategy - User ready:', {
        id: user.id,
        email: user.email,
        userType: user.user_type
      });

      return done(null, user);
    } catch (error) {
      console.error('❌ Facebook OAuth Strategy error:', error);
      return done(error, null);
    }
  }));
}

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured'
    });
  }
  
  // Store the state parameter in session for later use
  if (req.query.state) {
    req.session.oauthState = req.query.state;
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  console.log('🔍 Google OAuth Callback - Query params:', req.query);
  
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('❌ Google OAuth authentication failed:', err || info);
      // Redirect to appropriate login page based on state parameter
      const state = req.query?.state;
      const loginPage = state === 'employer' ? '/employer-login' : '/login';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${loginPage}?error=oauth_failed`);
    }
    
    // Handle successful authentication
    (async () => {
      try {
        // Get state from session or query params
        const state = req.session?.oauthState || req.query?.state;
        console.log('📝 Google OAuth Callback - Processing user:', {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          state: state
        });
        
        // If state indicates employer and user is not already an employer, update user type
        if (state === 'employer' && user.user_type !== 'employer') {
          console.log('🔄 Updating user type to employer');
          
          // Start a transaction to create company and update user
          const transaction = await sequelize.transaction();
          
          try {
            // Create a default company for the employer
            const companyName = `${user.first_name} ${user.last_name}'s Company`;
            const companySlug = generateSlug(companyName);
            
            const company = await Company.create({
              name: companyName,
              slug: companySlug,
              industry: 'Other',
              companySize: '1-50',
              email: user.email,
              phone: user.phone,
              contactPerson: `${user.first_name} ${user.last_name}`,
              contactEmail: user.email,
              contactPhone: user.phone,
              companyStatus: 'active',
              isActive: true
            }, { transaction });

            console.log('✅ Company created for OAuth employer:', company.id);
            
            // Update user with employer type and company ID
            await user.update({ 
              user_type: 'employer',
              company_id: company.id
            }, { transaction });
            
            // Commit the transaction
            await transaction.commit();
            
            // Refresh user object to get updated user_type
            await user.reload();
          } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error('❌ Error creating company for OAuth employer:', error);
            throw error;
          }
        }
        
        const token = generateToken(user);
        
        // Check if user needs to set up a password (OAuth users without password)
        const needsPasswordSetup = !user.password && user.oauth_provider === 'google';
        
        console.log('📝 Google OAuth Callback - Final user state:', {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          needsPasswordSetup: needsPasswordSetup
        });
        
        // Determine redirect URL based on user type
        let redirectUrl;
        if (user.user_type === 'employer') {
          redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer-oauth-callback?token=${token}&provider=google&needsPasswordSetup=${needsPasswordSetup}&userType=employer`;
        } else {
          redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=google&needsPasswordSetup=${needsPasswordSetup}&userType=jobseeker`;
        }
        
        console.log('✅ Google OAuth Callback - Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ Google OAuth callback error:', error);
        // Redirect to appropriate login page based on state parameter
        const state = req.query?.state;
        const loginPage = state === 'employer' ? '/employer-login' : '/login';
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${loginPage}?error=oauth_failed`);
      }
    })();
  })(req, res);
});

// Facebook OAuth routes
router.get('/facebook', (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Facebook OAuth is not configured'
    });
  }
  
  // Store the state parameter in session for later use
  if (req.query.state) {
    req.session.oauthState = req.query.state;
  }
  
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

router.get('/facebook/callback', (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  console.log('🔍 Facebook OAuth Callback - Query params:', req.query);
  
  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('❌ Facebook OAuth authentication failed:', err || info);
      // Redirect to appropriate login page based on state parameter
      const state = req.query?.state;
      const loginPage = state === 'employer' ? '/employer-login' : '/login';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${loginPage}?error=oauth_failed`);
    }
    
    // Handle successful authentication
    (async () => {
      try {
        // Get state from session or query params
        const state = req.session?.oauthState || req.query?.state;
        console.log('📝 Facebook OAuth Callback - Processing user:', {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          state: state
        });
        
        // If state indicates employer and user is not already an employer, update user type
        if (state === 'employer' && user.user_type !== 'employer') {
          console.log('🔄 Updating user type to employer');
          
          // Start a transaction to create company and update user
          const transaction = await sequelize.transaction();
          
          try {
            // Create a default company for the employer
            const companyName = `${user.first_name} ${user.last_name}'s Company`;
            const companySlug = generateSlug(companyName);
            
            const company = await Company.create({
              name: companyName,
              slug: companySlug,
              industry: 'Other',
              companySize: '1-50',
              email: user.email,
              phone: user.phone,
              contactPerson: `${user.first_name} ${user.last_name}`,
              contactEmail: user.email,
              contactPhone: user.phone,
              companyStatus: 'active',
              isActive: true
            }, { transaction });

            console.log('✅ Company created for OAuth employer:', company.id);
            
            // Update user with employer type and company ID
            await user.update({ 
              user_type: 'employer',
              company_id: company.id
            }, { transaction });
            
            // Commit the transaction
            await transaction.commit();
            
            // Refresh user object to get updated user_type
            await user.reload();
          } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error('❌ Error creating company for OAuth employer:', error);
            throw error;
          }
        }
        
        const token = generateToken(user);
        
        // Check if user needs to set up a password (OAuth users without password)
        const needsPasswordSetup = !user.password && user.oauth_provider === 'facebook';
        
        console.log('📝 Facebook OAuth Callback - Final user state:', {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          needsPasswordSetup: needsPasswordSetup
        });
        
        // Determine redirect URL based on user type
        let redirectUrl;
        if (user.user_type === 'employer') {
          redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer-oauth-callback?token=${token}&provider=facebook&needsPasswordSetup=${needsPasswordSetup}&userType=employer`;
        } else {
          redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=facebook&needsPasswordSetup=${needsPasswordSetup}&userType=jobseeker`;
        }
        
        console.log('✅ Facebook OAuth Callback - Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('❌ Facebook OAuth callback error:', error);
        // Redirect to appropriate login page based on state parameter
        const state = req.query?.state;
        const loginPage = state === 'employer' ? '/employer-login' : '/login';
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${loginPage}?error=oauth_failed`);
      }
    })();
  })(req, res);
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
  const { userType = 'jobseeker' } = req.query;
  const urls = {};
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const googleUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/oauth/google`;
    urls.google = userType === 'employer' ? `${googleUrl}?state=employer` : googleUrl;
  }
  
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    const facebookUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/oauth/facebook`;
    urls.facebook = userType === 'employer' ? `${facebookUrl}?state=employer` : facebookUrl;
  }
  
  res.json({
    success: true,
    data: urls
  });
});

// Sync Google profile data endpoint
router.post('/sync-google-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.id);

    if (!user || user.oauth_provider !== 'google') {
      return res.status(400).json({
        success: false,
        message: 'User not found or not a Google OAuth user'
      });
    }

    // Fetch additional profile data from Google
    const googleProfileData = await fetchGoogleProfileData(user.oauth_access_token);
    
    if (googleProfileData) {
      // Update user with additional Google profile data
      await user.update({
        first_name: googleProfileData.given_name || user.first_name,
        last_name: googleProfileData.family_name || user.last_name,
        avatar: googleProfileData.picture || user.avatar,
        headline: googleProfileData.name || user.headline,
        current_location: googleProfileData.locale || user.current_location,
        summary: googleProfileData.name ? `Profile synced from Google account - ${googleProfileData.name}` : user.summary,
        last_profile_update: new Date(),
        profile_completion: Math.min(user.profile_completion + 20, 100) // Increase profile completion
      });

      console.log('✅ Google profile data synced for user:', user.id);
    }

    // Get updated user data
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'oauth_access_token', 'oauth_refresh_token'] }
    });

    res.json({
      success: true,
      message: 'Google profile data synced successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('❌ Error syncing Google profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync Google profile data'
    });
  }
});

// Helper function to fetch Google profile data
async function fetchGoogleProfileData(accessToken) {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📝 Fetched Google profile data:', {
        name: data.name,
        email: data.email,
        picture: data.picture,
        locale: data.locale
      });
      return data;
    } else {
      console.error('❌ Failed to fetch Google profile data:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching Google profile data:', error);
    return null;
  }
}

module.exports = router;
