import mongoose from 'mongoose';
import Provider from './models/Provider.js';
import dotenv from 'dotenv';

dotenv.config();

const userId = "67decaab0cad33a51d6171cb";

async function createProvider() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check if provider already exists
        const existingProvider = await Provider.findOne({ userId });
        if (existingProvider) {
            console.log("Provider already exists:", existingProvider);
            await mongoose.disconnect();
            return;
        }

        // Create a new provider
        const provider = new Provider({
            userId,
            firstName: "Karim",
            lastName: "Provider",
            location: "New York",
            licenseNumber: 12345,
            companyName: "Karim's Services",
            serviceType: "General"
        });

        await provider.save();
        console.log("Provider created:", provider);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

createProvider(); 