import Notification from '../models/Notification.js';

// Helper function to create notifications
export const createNotification = async (receiverId, type, entityId, message) => {
    try {
        const notification = new Notification({
            receiverId,
            type,
            entityId,
            message
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

export const getNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const notifications = await Notification.find({ receiverId: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getLatestNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const notifications = await Notification.find({ receiverId: userId, isRead: false })
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const markNotificationRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        res.status(200).json({ message: "✅ Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const markNotificationsRead = async (req, res) => {
    const { userId } = req.params;

    try {
        await Notification.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
        res.status(200).json({ message: "✅ Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const clearNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        await Notification.deleteMany({ receiverId: userId });
        res.status(200).json({ message: "✅ All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}; 