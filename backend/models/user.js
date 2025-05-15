import mongoose from "mongoose";


//To store user credntials and help in login

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, default: 'user' },
});

const User = mongoose.model("User", userSchema);

export default User;