import mongoose from 'mongoose';
import Provider from './models/Provider.js';
import dotenv from 'dotenv';

dotenv.config();

const userId = "67decaab0cad33a51d6171cb";

async function checkProvider() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const provider = await Provider.findOne({ userId });
        console.log("Provider found:", provider);

        if (!provider) {
            console.log("No provider found with userId:", userId);
        }

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
}

checkProvider(); 