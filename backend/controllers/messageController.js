import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

export const sendMessage = async (req, res) => {
    const { chatId, message, senderId, receiverId } = req.body;

    try {
        const newMessage = new Message({ chatId, message, senderId, receiverId });
        await newMessage.save();

        const notification = new Notification({
            'receiverId': receiverId,
            'type' :'message',
            'entityId' : chatId,
            'message': `Your have a new message`,
        });
        const newNotifcation = await notification.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}