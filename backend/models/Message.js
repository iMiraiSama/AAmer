import mongoose from "mongoose";

//It contains all messages related to a spcific chat

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, default: false }, // ✅ إضافة حالة قراءة الرسالة
}, { timestamps: true }); // ✅ إضافة `timestamps` تلقائيًا

const Message = mongoose.model("Message", messageSchema);
export default Message;
