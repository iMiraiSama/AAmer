import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const getMessages = async (req, res) => {
    const { userId, assistantId } = req.params;

    try {
        const messages = await Chat.find({
            $or: [
                { senderId: userId, receiverId: assistantId },
                { senderId: assistantId, receiverId: userId },
            ],
        }).sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRecentMessages = async (req, res) => {
    const { userId, assistantId } = req.params;

    try {
        const messages = await Chat.find({
            $or: [
                { senderId: userId, receiverId: assistantId },
                { senderId: assistantId, receiverId: userId },
            ],
        })
        .sort({ timestamp: -1 })
        .limit(20);

        res.status(200).json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const cleanupOldMessages = async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        await Chat.deleteMany({ timestamp: { $lt: thirtyDaysAgo } });
        res.status(200).json({ message: "✅ Old messages deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}; 



export const initiateChat = async (req, res) => {
    const { userId, providerUserId } = req.body;
    try {
        // Await the result of findOne
        const existingChat = await Chat.findOne({ userId, providerUserId });
        if (existingChat) {
            return res.status(200).json(existingChat);
        }
        
        // Create a new chat if it doesn't exist
        const chat = await Chat.create({ userId, providerUserId });
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getChats = async (req, res) => {
    const { userId, userType } = req.params;

    try {
        if (userType === "user") {
            const chats = await Chat.find({ userId: userId }).populate({
                path: 'providerUserId',
                select: 'email'
            });
            res.status(200).json(chats);
        }
        if (userType === "provider") {
            const chats = await Chat.find({ providerUserId: userId }).populate({
                path: 'userId',
                select: 'email'
            });
            res.status(200).json(chats);
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};