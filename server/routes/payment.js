/**
 * Payment Routes
 * 
 * Handles payment order creation, verification, and management
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticateToken } = require('../middlewares/auth');
const { User, Company } = require('../models');

// Razorpay Configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_NtAc3GFJLI6NbG';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YKGgIMm1Uyh2KBXkfRDbmUUF';

/**
 * @route   POST /api/payment/create-order
 * @desc    Create a payment order
 * @access  Private
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { planType, quantity, amount, metadata } = req.body;

    // Validate required fields
    if (!planType || !quantity || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Plan type, quantity, and amount are required'
      });
    }

    // Validate amount (basic validation)
    if (amount <= 0 || amount > 10000000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // In a real implementation, you would:
    // 1. Create order in Razorpay using their API
    // 2. Store order details in database
    // 3. Return order ID and amount

    // For now, we'll return a mock order
    const orderData = {
      orderId: orderId,
      amount: amount,
      currency: 'INR',
      planType: planType,
      quantity: quantity,
      userId: req.user.id,
      status: 'created',
      createdAt: new Date(),
      metadata: metadata || {}
    };

    // TODO: Save order to database
    // await Order.create(orderData);

    res.json({
      success: true,
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payment/verify
 * @desc    Verify payment signature
 * @access  Private
 */
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    // Validate required fields
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID, order ID, and signature are required'
      });
    }

    // Verify signature using Razorpay's algorithm
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Signature is valid
    // TODO: Update order status in database
    // TODO: Activate purchased plan/credits
    // TODO: Send confirmation email

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: paymentId,
      orderId: orderId
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/payment/history
 * @desc    Get payment history for current user
 * @access  Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // TODO: Fetch payment history from database
    const paymentHistory = [];

    res.json({
      success: true,
      payments: paymentHistory
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle payment webhook from Razorpay
 * @access  Public (but verified)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature'
        });
      }
    }

    // Process webhook event
    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.captured':
        // Handle successful payment
        console.log('Payment captured:', payload.payment.entity);
        // TODO: Update order status, activate plan
        break;

      case 'payment.failed':
        // Handle failed payment
        console.log('Payment failed:', payload.payment.entity);
        // TODO: Update order status, notify user
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

module.exports = router;

