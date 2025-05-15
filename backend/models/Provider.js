import mongoose from "mongoose";

//To store additional information of the provider which is not stored in User model

const providerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    location: { type: String, required: true },
    licenseNumber: { type: Number, required: true },
    companyName: {type: String, required: true},
    serviceType: { type: String, required: true },
});

const Provider = mongoose.model("Provider", providerSchema);

export default Provider;