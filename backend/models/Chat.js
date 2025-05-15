import mongoose from "mongoose";

//Chat indicates communication between a user and service provider

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;