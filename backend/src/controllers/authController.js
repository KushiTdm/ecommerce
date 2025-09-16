// backend/src/controllers/authController.js
const { createClient } = require('@supabase/supabase-js');
const supabaseService = require('../services/supabaseService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { createResponse, sanitizeUser } = require('../utils/helpers');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || ''
      }
    });

    if (error) {
      return res.status(400).json(
        createResponse(false, null, error.message)
      );
    }

    // Create user profile
    const profile = await supabaseService.supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: full_name || ''
      })
      .select()
      .single();

    if (profile.error) {
      logger.error('Error creating profile:', profile.error);
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail({
        email: data.user.email,
        full_name: full_name || ''
      });
    } catch (emailError) {
      logger.error('Error sending welcome email:', emailError);
    }

    // Generate session for immediate login
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: data.user.email
    });

    logger.info(`User registered: ${data.user.email}`);

    res.status(201).json(
      createResponse(true, {
        user: sanitizeUser({
          id: data.user.id,
          email: data.user.email,
          full_name: full_name || '',
          created_at: data.user.created_at
        }),
        message: 'Registration successful'
      })
    );

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json(
      createResponse(false, null, 'Registration failed')
    );
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json(
        createResponse(false, null, 'Invalid credentials')
      );
    }

    // Get user profile
    const profile = await supabaseService.getUserProfile(data.user.id);

    logger.info(`User logged in: ${data.user.email}`);

    res.json(
      createResponse(true, {
        user: sanitizeUser({
          id: data.user.id,
          email: data.user.email,
          full_name: profile?.full_name || '',
          avatar_url: profile?.avatar_url || ''
        }),
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      })
    );

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(
      createResponse(false, null, 'Login failed')
    );
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await supabase.auth.admin.signOut(token);
    }

    res.json(
      createResponse(true, { message: 'Logged out successfully' })
    );

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json(
      createResponse(false, null, 'Logout failed')
    );
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await supabaseService.getUserProfile(req.user.id);

    if (!profile) {
      return res.status(404).json(
        createResponse(false, null, 'Profile not found')
      );
    }

    res.json(
      createResponse(true, sanitizeUser(profile))
    );

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to fetch profile')
    );
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    const profile = await supabaseService.updateUserProfile(req.user.id, updates);

    res.json(
      createResponse(true, sanitizeUser(profile))
    );

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to update profile')
    );
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json(
        createResponse(false, null, 'Refresh token required')
      );
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json(
        createResponse(false, null, 'Invalid refresh token')
      );
    }

    res.json(
      createResponse(true, {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      })
    );

  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json(
      createResponse(false, null, 'Token refresh failed')
    );
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      return res.status(400).json(
        createResponse(false, null, error.message)
      );
    }

    res.json(
      createResponse(true, { message: 'Password reset email sent' })
    );

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json(
      createResponse(false, null, 'Failed to send reset email')
    );
  }
};

const resetPassword = async (req, res) => {
  try {
    const { access_token, refresh_token, new_password } = req.body;

    // Set session
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (sessionError) {
      return res.status(400).json(
        createResponse(false, null, 'Invalid session')
      );
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      return res.status(400).json(
        createResponse(false, null, error.message)
      );
    }

    res.json(
      createResponse(true, { message: 'Password updated successfully' })
    );

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json(
      createResponse(false, null, 'Password reset failed')
    );
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  refreshToken,
  forgotPassword,
  resetPassword
};