import mongoose from 'mongoose';


//It contains booking data, which is recroded when a user books a offer by provider or a provider accepts a request by user. 

const bookingSchema = new mongoose.Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    bookingType: { type: String, enum: ["request", "offer"], required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;