import mongoose from 'mongoose';

// Notification types:
// - payment: When payment is confirmed
// - review: When user needs to drop a review
// - booking: When booking is created/updated
// - message: When new message is received

const notificationSchema = new mongoose.Schema({
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { 
        type: String, 
        required: true,
        enum: ['payment', 'review', 'booking', 'message'],
        index: true 
    },
    entityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        index: true 
    },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: -1 },
    isRead: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; 