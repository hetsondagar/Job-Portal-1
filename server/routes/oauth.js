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
          // Only update last_login_at if user has logged in before
          ...(existingUser.last_login_at && { last_login_at: new Date() }),
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
            profile_completion: 0, // Start with 0 for first-time users to trigger setup dialogs
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
          // Only update last_login_at if user has logged in before
          ...(user.last_login_at && { last_login_at: new Date() }),
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
            // Only update last_login_at if user has logged in before
            ...(existingUser.last_login_at && { last_login_at: new Date() })
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
          // Only update last_login_at if user has logged in before
          ...(user.last_login_at && { last_login_at: new Date() })
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
  
  console.log('🔍 Google OAuth Initiation - Query params:', req.query);
  
  // Store the state parameter in session for later use
  if (req.query.state) {
    req.session.oauthState = req.query.state;
    console.log('📝 Stored OAuth state in session:', req.query.state);
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  console.log('🔍 Google OAuth Callback - Query params:', req.query);
  console.log('🔍 Google OAuth Callback - Session state:', req.session?.oauthState);
  console.log('🔍 Google OAuth Callback - Raw query string:', req.url);
  console.log('🔍 Google OAuth Callback - Headers:', req.headers);
  
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error('❌ Google OAuth authentication failed:', err || info);
      // Redirect to appropriate login page based on state parameter
      const state = req.session?.oauthState || req.query?.state;
      console.log('🔍 Redirecting to login page with state:', state);
      const loginPage = state === 'employer' ? '/employer-login' : '/login';
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}${loginPage}?error=oauth_failed`);
    }
    
    // Handle successful authentication
    (async () => {
      try {
        // Get state from session or query params - try multiple sources
        const state = req.session?.oauthState || req.query?.state || req.query?.userType;
        console.log('📝 Google OAuth Callback - Processing user:', {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          state: state,
          sessionState: req.session?.oauthState,
          queryState: req.query?.state,
          queryUserType: req.query?.userType
        });
        
        // If state indicates employer, ensure user is set as employer
        if (state === 'employer') {
          console.log('🔄 Processing employer OAuth - State detected as employer');
          
          // Always ensure user is set as employer for employer OAuth flow
          if (user.user_type !== 'employer') {
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
              
              console.log('✅ User successfully updated to employer type');
            } catch (error) {
              // Rollback transaction on error
              await transaction.rollback();
              console.error('❌ Error creating company for OAuth employer:', error);
              
              // Even if company creation fails, still set user as employer
              console.log('🔄 Setting user as employer without company (will be created later)');
              await user.update({ user_type: 'employer' });
              await user.reload();
            }
          } else {
            console.log('✅ User is already an employer');
          }
          
          // Double-check that user type is set correctly
          if (user.user_type !== 'employer') {
            console.log('🔄 Force updating user type to employer');
            await user.update({ user_type: 'employer' });
            await user.reload();
          }
          
          // Clear any existing OAuth data to ensure clean state
          await user.update({
            oauth_provider: 'google',
            oauth_id: req.user?.oauth_id || user.oauth_id,
            oauth_access_token: req.user?.oauth_access_token || user.oauth_access_token,
            oauth_refresh_token: req.user?.oauth_refresh_token || user.oauth_refresh_token,
            oauth_token_expires_at: req.user?.oauth_token_expires_at || user.oauth_token_expires_at
          });
          
          console.log('✅ OAuth data updated for employer user');
        } else {
          // FORCE jobseeker processing when state is NOT 'employer' (including undefined, null, etc.)
          console.log('📝 Processing jobseeker OAuth - No employer state detected');
          console.log('📝 State value:', state);
          console.log('📝 Session state:', req.session?.oauthState);
          console.log('📝 Query state:', req.query?.state);
          
          // ALWAYS force jobseeker type for jobseeker OAuth flow - regardless of previous user type
          console.log('🔄 Force updating user type to jobseeker for jobseeker OAuth flow');
          await user.update({ 
            user_type: 'jobseeker'
            // Don't set profile_completion here - let it remain 0 for first-time users
          });
          await user.reload();
          
          // Double-check that user type is set correctly for jobseekers
          if (user.user_type !== 'jobseeker') {
            console.log('🔄 Force updating user type to jobseeker');
            await user.update({ user_type: 'jobseeker' });
            await user.reload();
          }
          
          // For jobseekers, ensure basic profile data is set
          if (!user.headline && user.first_name) {
            await user.update({ 
              headline: `Professional at ${user.first_name} ${user.last_name || ''}`.trim(),
              // Don't increase profile_completion here - let it remain 0 for first-time users
            });
            console.log('✅ Basic profile data set for jobseeker');
          }
          
          // Ensure jobseeker has proper account status
          if (user.account_status !== 'active') {
            await user.update({ account_status: 'active' });
            console.log('✅ Account status set to active for jobseeker');
          }
          
          // Update OAuth data for jobseeker
          await user.update({
            oauth_provider: 'google',
            oauth_id: req.user?.oauth_id || user.oauth_id,
            oauth_access_token: req.user?.oauth_access_token || user.oauth_access_token,
            oauth_refresh_token: req.user?.oauth_refresh_token || user.oauth_refresh_token,
            oauth_token_expires_at: req.user?.oauth_token_expires_at || user.oauth_token_expires_at
          });
          
          console.log('✅ OAuth data updated for jobseeker user');
        }
        
        // Only update last login time for returning users (users who have logged in before)
        // For first-time OAuth users, we'll update this after they complete setup
        if (user.last_login_at) {
          await user.update({ last_login_at: new Date() });
          console.log('✅ Updated last login time for returning user:', user.id);
        } else {
          console.log('📝 First-time OAuth user - not updating last_login_at yet');
        }
        
        const token = generateToken(user);
        
        // Check if user needs to set up a password (OAuth users without password)
        const needsPasswordSetup = !user.password;
        
        console.log('📝 Google OAuth Callback - Final user state:', {
          id: user.id,
          email: user.email,
          userType: user.user_type,
          needsPasswordSetup: needsPasswordSetup,
          state: state
        });
        
        // Determine redirect URL based on user type and state - BE VERY EXPLICIT
        let redirectUrl;
        if (user.user_type === 'employer') {
          console.log('✅ Redirecting employer to employer-oauth-callback');
          redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer-oauth-callback?token=${token}&provider=google&needsPasswordSetup=${needsPasswordSetup}&userType=employer`;
        } else {
          // Check if this is a Gulf flow
          if (state === 'gulf') {
            console.log('✅ Redirecting Gulf jobseeker to oauth-callback with Gulf state');
            redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=google&needsPasswordSetup=${needsPasswordSetup}&userType=jobseeker&state=gulf`;
          } else {
            console.log('✅ Redirecting jobseeker to oauth-callback');
            redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=google&needsPasswordSetup=${needsPasswordSetup}&userType=jobseeker`;
          }
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
        
        // If state indicates employer, ensure user is set as employer
        if (state === 'employer') {
          console.log('🔄 Processing employer OAuth - State detected as employer');
          
          // Always ensure user is set as employer for employer OAuth flow
          if (user.user_type !== 'employer') {
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
              
              console.log('✅ User successfully updated to employer type');
            } catch (error) {
              // Rollback transaction on error
              await transaction.rollback();
              console.error('❌ Error creating company for OAuth employer:', error);
              throw error;
            }
          } else {
            console.log('✅ User is already an employer');
          }
        } else {
          console.log('📝 Processing jobseeker OAuth - No employer state detected');
          // Ensure jobseekers are set as jobseeker type
          if (user.user_type !== 'jobseeker') {
            console.log('🔄 Updating user type to jobseeker');
            await user.update({ user_type: 'jobseeker' });
            await user.reload();
          }
          
          // Double-check that user type is set correctly for jobseekers
          if (user.user_type !== 'jobseeker') {
            console.log('🔄 Force updating user type to jobseeker');
            await user.update({ user_type: 'jobseeker' });
            await user.reload();
          }
          
          // For jobseekers, ensure basic profile data is set
          if (!user.headline && user.first_name) {
            await user.update({ 
              headline: `Professional at ${user.first_name} ${user.last_name || ''}`.trim(),
              // Don't increase profile_completion here - let it remain 0 for first-time users
            });
            console.log('✅ Basic profile data set for jobseeker');
          }
        }
        
        // Only update last login time for returning users (users who have logged in before)
        // For first-time OAuth users, we'll update this after they complete setup
        if (user.last_login_at) {
          await user.update({ last_login_at: new Date() });
          console.log('✅ Updated last login time for returning user:', user.id);
        } else {
          console.log('📝 First-time OAuth user - not updating last_login_at yet');
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
        
        // Determine redirect URL based on user type and state
        let redirectUrl;
        if (user.user_type === 'employer') {
          redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer-oauth-callback?token=${token}&provider=facebook&needsPasswordSetup=${needsPasswordSetup}&userType=employer`;
        } else {
          // Check if this is a Gulf flow
          if (state === 'gulf') {
            console.log('✅ Redirecting Gulf jobseeker to oauth-callback with Gulf state');
            redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=facebook&needsPasswordSetup=${needsPasswordSetup}&userType=jobseeker&state=gulf`;
          } else {
            redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}&provider=facebook&needsPasswordSetup=${needsPasswordSetup}&userType=jobseeker`;
          }
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
    // Only block if a password already exists; allow setting password even if oauth_provider is 'local'
    if (user.password) {
      return res.status(409).json({
        success: false,
        code: 'PASSWORD_ALREADY_SET',
        requiresPasswordSetup: false,
        message: 'Password already set or user is not OAuth user'
      });
    }
    
    // Set password for OAuth user and mark as capable of local login
    // Also update last_login_at for first-time users completing setup
    await user.update({ 
      password, 
      oauth_provider: user.oauth_provider || 'google',
      last_login_at: new Date() // Mark as having completed first login
    });

    // Issue a fresh JWT so the client session is stable post-setup
    const newToken = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Password set successfully',
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          is_email_verified: user.is_email_verified,
          hasPassword: true,
          requiresPasswordSetup: false
        }
      }
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

    console.log('🔄 Starting Google profile sync for user:', user.id);

    // Check if token is expired and refresh if needed
    let accessToken = user.oauth_access_token;
    if (user.oauth_token_expires_at && new Date() > user.oauth_token_expires_at) {
      console.log('🔄 Google access token expired, attempting refresh...');
      const refreshedToken = await refreshGoogleToken(user.oauth_refresh_token);
      if (refreshedToken) {
        accessToken = refreshedToken.access_token;
        await user.update({
          oauth_access_token: refreshedToken.access_token,
          oauth_refresh_token: refreshedToken.refresh_token || user.oauth_refresh_token,
          oauth_token_expires_at: new Date(Date.now() + (refreshedToken.expires_in * 1000))
        });
        console.log('✅ Google token refreshed successfully');
      } else {
        console.error('❌ Failed to refresh Google token');
        return res.status(401).json({
          success: false,
          message: 'Google token expired and could not be refreshed. Please re-authenticate.'
        });
      }
    }

    // Fetch additional profile data from Google with retry logic
    const googleProfileData = await fetchGoogleProfileDataWithRetry(accessToken);
    
    if (googleProfileData) {
      console.log('📝 Fetched Google profile data:', {
        name: googleProfileData.name,
        email: googleProfileData.email,
        picture: googleProfileData.picture ? 'Available' : 'Not available',
        locale: googleProfileData.locale
      });

      // Update user with additional Google profile data
      const updateData = {
        first_name: googleProfileData.given_name || user.first_name,
        last_name: googleProfileData.family_name || user.last_name,
        avatar: googleProfileData.picture || user.avatar,
        headline: googleProfileData.name || user.headline,
        current_location: googleProfileData.locale || user.current_location,
        summary: googleProfileData.name ? `Profile synced from Google account - ${googleProfileData.name}` : user.summary,
        last_profile_update: new Date(),
        // Don't increase profile_completion here - let it remain 0 for first-time users
      };

      // For jobseekers, add more profile details
      if (user.user_type === 'jobseeker') {
        updateData.email = googleProfileData.email || user.email;
        updateData.is_email_verified = true;
        
        // Set a professional headline based on Google name
        if (googleProfileData.name && !user.headline) {
          updateData.headline = `Professional at ${googleProfileData.name}`;
        }
        
        // Set location if available
        if (googleProfileData.locale && !user.current_location) {
          updateData.current_location = googleProfileData.locale;
        }
        
        // Set summary if not already set
        if (!user.summary) {
          updateData.summary = `Professional profile synced from Google account. Welcome ${googleProfileData.given_name || 'User'}!`;
        }
      }

      // For employers, also update company information if available
      if (user.user_type === 'employer' && user.company_id) {
        try {
          const company = await Company.findByPk(user.company_id);
          if (company) {
            // Update company with Google profile data
            await company.update({
              contactPerson: `${googleProfileData.given_name || user.first_name} ${googleProfileData.family_name || user.last_name}`,
              contactEmail: googleProfileData.email || user.email,
              name: company.name === `${user.first_name} ${user.last_name}'s Company` ? 
                `${googleProfileData.given_name || user.first_name} ${googleProfileData.family_name || user.last_name}'s Company` : 
                company.name
            });
            console.log('✅ Company updated with Google profile data');
          }
        } catch (error) {
          console.error('❌ Error updating company with Google data:', error);
        }
      }

      await user.update(updateData);
      console.log('✅ Google profile data synced for user:', user.id);
    } else {
      console.warn('⚠️ No Google profile data fetched, but continuing with existing data');
    }

    // Get updated user data with company information for employers
    const includeCompany = user.user_type === 'employer' ? {
      model: Company,
      as: 'company',
      attributes: ['id', 'name', 'slug', 'industry', 'companySize', 'email', 'phone', 'contactPerson', 'contactEmail', 'contactPhone']
    } : null;

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password', 'oauth_access_token', 'oauth_refresh_token'] },
      include: includeCompany
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
      message: 'Failed to sync Google profile data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to fetch Google profile data with retry logic
async function fetchGoogleProfileDataWithRetry(accessToken, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Attempting to fetch Google profile data (attempt ${attempt}/${retries})`);
      
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JobPortal/1.0'
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully fetched Google profile data');
        return data;
      } else if (response.status === 401) {
        console.error('❌ Google API returned 401 - token may be invalid');
        return null;
      } else {
        console.error(`❌ Google API returned status ${response.status}`);
        if (attempt === retries) return null;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    } catch (error) {
      console.error(`❌ Error fetching Google profile data (attempt ${attempt}):`, error.message);
      if (attempt === retries) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  return null;
}

// Helper function to refresh Google token
async function refreshGoogleToken(refreshToken) {
  try {
    console.log('🔄 Refreshing Google access token...');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Google token refreshed successfully');
      return data;
    } else {
      console.error('❌ Failed to refresh Google token:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error refreshing Google token:', error);
    return null;
  }
}

module.exports = router;
