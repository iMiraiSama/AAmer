import express from 'express';
import { createReview, getProviderReviews, getUserReviews, getBookingReview } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new review (requires authentication)
router.post('/', verifyToken, createReview);

// Get reviews for a provider
router.get('/provider/:providerId', getProviderReviews);

// Get reviews for a user
router.get('/user/:userId', getUserReviews);

// Get review for a specific booking
router.get('/booking/:bookingId', getBookingReview);

export default router; 