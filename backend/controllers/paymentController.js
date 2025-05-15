import Payment from "../models/Payment.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Request from "../models/Request.js";
import { createNotification } from "./notificationController.js";
import Offering from "../models/Offering.js";

export const createPayment = async (req, res) => {
    try {
        const { bookingId, amount, paymentMethod, transactionId, userId } = req.body;
        console.log("📌 Payment Request:", { bookingId, amount, paymentMethod, transactionId, userId });

        // Validate required fields
        if (!bookingId) {
            return res.status(400).json({ error: "Booking ID is required." });
        }
        
        if (!paymentMethod) {
            return res.status(400).json({ error: "Payment method is required." });
        }

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }
        
        // Validate bookingId format
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID format." });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format." });
        }
        
        // Validate payment method
        const validPaymentMethods = ["credit_card", "debit_card", "paypal", "bank_transfer", "cash"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({ 
                error: "Invalid payment method.", 
                validMethods: validPaymentMethods 
            });
        }

        // Check if booking exists and belongs to the user
        const booking = await Booking.findOne({ _id: bookingId });
        console.log("📌 Found booking:", {
            _id: booking?._id,
            userId: booking?.userId,
            status: booking?.status,
            bookingType: booking?.bookingType
        });
        
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }
        
        // Verify that the user making the payment is either the booking creator or the service provider
        const isBookingCreator = booking.userId.toString() === userId;
        
        // For request bookings, the provider is the service creator
        let isServiceProvider = false;
        if (booking.bookingType === "request") {
            const service = await Request.findById(booking.serviceId);
            if (service) {
                isServiceProvider = service.userId.toString() === userId;
            }
        }
        // For offer bookings, the provider is the one who made the booking
        else if (booking.bookingType === "offer") {
            isServiceProvider = booking.userId.toString() === userId;
        }
        
        if (!isBookingCreator && !isServiceProvider) {
            console.log("📌 User is not authorized to make this payment:", {
                bookingUserId: booking.userId,
                providedUserId: userId,
                isBookingCreator,
                isServiceProvider
            });
            return res.status(403).json({ 
                error: "You are not authorized to make this payment.",
                bookingUserId: booking.userId,
                providedUserId: userId
            });
        }

        // Create payment record
        const payment = new Payment({
            bookingId,
            amount,
            paymentMethod,
            transactionId,
            userId
        });

        await payment.save();
        console.log("📌 Payment saved:", payment);

        // Update booking status to completed
        booking.status = "completed";
        const updatedBooking = await booking.save();
        console.log("📌 Updated booking status to completed:", {
            _id: updatedBooking._id,
            userId: updatedBooking.userId,
            status: updatedBooking.status,
            bookingType: updatedBooking.bookingType
        });

        // Create notifications
        try {
            // Get service title based on booking type
            let serviceTitle = '';
            if (booking.bookingType === 'request') {
                const request = await Request.findById(booking.serviceId);
                serviceTitle = request?.title || 'Unknown Service';
            } else {
                const offering = await Offering.findById(booking.serviceId);
                serviceTitle = offering?.title || 'Unknown Service';
            }

            // Notification for provider
            await createNotification(
                booking.providerId,
                'payment',
                bookingId,
                `Payment of SAR ${amount} has been confirmed for ${serviceTitle}`
            );

            // Notification for user to leave a review
            await createNotification(
                booking.userId,
                'review',
                bookingId,
                'Your service has been completed! Please leave a review for your experience.'
            );
        } catch (notificationError) {
            console.error("Error creating notifications:", notificationError);
            // Don't fail the payment if notification creation fails
        }

        res.status(201).json({ 
            message: "Payment created successfully and booking marked as completed", 
            payment,
            booking: updatedBooking
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        
        // Provide more specific error messages
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: "Validation error", 
                details: Object.values(error.errors).map(err => err.message) 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ error: "Duplicate transaction ID." });
        }
        
        res.status(500).json({ 
            error: "Failed to create payment",
            message: error.message
        });
    }
}