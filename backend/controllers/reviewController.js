import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationController.js';

// Create a new review
export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const userId = req.user.userId; // Changed from req.user._id to req.user.userId

        // Validate required fields
        if (!bookingId || !rating || !comment) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID format." });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        // Check if booking exists and is completed
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        if (booking.status !== "completed") {
            return res.status(400).json({ error: "Can only review completed bookings." });
        }

        // Check if user is the one who made the booking
        if (booking.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only review your own bookings." });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ bookingId });
        if (existingReview) {
            return res.status(400).json({ error: "You have already reviewed this booking." });
        }

        // Create review
        const review = new Review({
            bookingId,
            userId,
            providerId: booking.providerId || booking.serviceId, // Assuming serviceId is the provider's ID
            rating,
            comment
        });

        await review.save();

        // Create notification for provider about the new review
        try {
            await createNotification(
                booking.providerId || booking.serviceId,
                'review',
                bookingId,
                `You have received a new ${rating}-star review for booking #${bookingId}`
            );
        } catch (notificationError) {
            console.error("Error creating notification:", notificationError);
            // Don't fail the review if notification creation fails
        }

        res.status(201).json({ message: "Review created successfully", review });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Failed to create review", message: error.message });
    }
};

// Get reviews for a provider
export const getProviderReviews = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Validate providerId format
        if (!mongoose.Types.ObjectId.isValid(providerId)) {
            return res.status(400).json({ error: "Invalid provider ID format." });
        }

        const reviews = await Review.find({ providerId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching provider reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews", message: error.message });
    }
};

// Get reviews for a user
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format." });
        }

        const reviews = await Review.find({ userId })
            .populate('providerId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews", message: error.message });
    }
};

// Get reviews for a booking
export const getBookingReview = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID format." });
        }

        const review = await Review.findOne({ bookingId })
            .populate('userId', 'name')
            .populate('providerId', 'name');

        if (!review) {
            return res.status(404).json({ error: "Review not found." });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error("Error fetching booking review:", error);
        res.status(500).json({ error: "Failed to fetch review", message: error.message });
    }
}; 