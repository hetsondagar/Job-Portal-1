const express = require('express');
const router = express.Router();
const { Company } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/companies/check-claimable
 * @desc    Check if a company name is unclaimed and can be claimed
 * @access  Public (for registration flow)
 */
router.get('/check-claimable', async (req, res) => {
  try {
    const { companyName } = req.query;
    
    if (!companyName || companyName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required (minimum 2 characters)'
      });
    }
    
    // Search for exact or similar company names that are unclaimed
    const companies = await Company.findAll({
      where: {
        name: {
          [Op.iLike]: `%${companyName.trim()}%`
        },
        isClaimed: false, // Only unclaimed companies
        companyStatus: {
          [Op.notIn]: ['deleted', 'suspended']
        }
      },
      attributes: [
        'id',
        'name',
        'slug',
        'logo',
        'industry',
        'city',
        'website',
        'companySize',
        'createdByAgencyId',
        'isClaimed'
      ],
      include: [
        {
          model: Company,
          as: 'CreatedByAgency',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      limit: 10
    });
    
    if (companies.length === 0) {
      return res.json({
        success: true,
        claimable: false,
        message: 'No unclaimed companies found with this name'
      });
    }
    
    return res.json({
      success: true,
      claimable: true,
      companies: companies.map(c => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        city: c.city,
        website: c.website,
        logo: c.logo,
        createdByAgency: c.CreatedByAgency?.name || 'Unknown Agency',
        createdByAgencyId: c.createdByAgencyId
      }))
    });
  } catch (error) {
    console.error('Check claimable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check claimable companies',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/companies/claim
 * @desc    Claim an unclaimed company profile
 * @access  Public (during registration)
 */
router.post('/claim', async (req, res) => {
  try {
    const {
      companyId,
      userEmail,
      userName,
      userPhone,
      password,
      verificationCode // Optional: Send OTP to company email for verification
    } = req.body;
    
    if (!companyId || !userEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, email, and password are required'
      });
    }
    
    // Find the unclaimed company
    const company = await Company.findByPk(companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Verify company is unclaimed
    if (company.isClaimed) {
      return res.status(400).json({
        success: false,
        message: 'This company has already been claimed. Please use the join company option instead.'
      });
    }
    
    // Check if user with this email already exists
    const { User } = require('../models');
    const existingUser = await User.findOne({ where: { email: userEmail } });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists. Please login instead.'
      });
    }
    
    // Start transaction for claiming
    const { sequelize } = require('../config/sequelize');
    const transaction = await sequelize.transaction();
    
    try {
      // Split name
      const nameParts = userName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create user as company admin
      const user = await User.create({
        email: userEmail,
        password: password,
        first_name: firstName,
        last_name: lastName,
        phone: userPhone,
        user_type: 'admin', // First user becomes admin
        account_status: 'active',
        is_email_verified: false,
        company_id: company.id,
        oauth_provider: 'local'
      }, { transaction });
      
      // Update company as claimed
      company.isClaimed = true;
      company.claimedAt = new Date();
      company.claimedByUserId = user.id;
      company.contactPerson = userName;
      company.contactEmail = userEmail;
      company.contactPhone = userPhone;
      company.email = userEmail; // Update company email
      company.phone = userPhone;
      
      await company.save({ transaction });
      
      await transaction.commit();
      
      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          userType: user.user_type 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
        success: true,
        message: 'Company claimed successfully! You are now the owner of this company profile.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
            companyId: user.company_id
          },
          company: {
            id: company.id,
            name: company.name,
            industry: company.industry,
            city: company.city,
            website: company.website,
            isClaimed: company.isClaimed,
            claimedAt: company.claimedAt
          },
          token
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Claim company error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim company',
      error: error.message
    });
  }
});

module.exports = router;


