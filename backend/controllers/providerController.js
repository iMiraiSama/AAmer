import Provider from "../models/Provider.js";

// Create a new provider
export const createProvider = async (req, res) => {
    try {
        const { firstName, lastName, location, licenseNumber, companyName, serviceType, userId } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !location || !licenseNumber || !companyName || !serviceType || !userId) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Create new provider object
        const provider = new Provider({
            firstName,
            lastName,
            location,
            licenseNumber,
            companyName,
            serviceType,
            userId
        });

        // Save to database
        await provider.save();

        res.status(201).json({ message: "Provider created successfully", provider });
    } catch (error) {
        console.error("Error creating provider:", error);
        res.status(500).json({ error: "Failed to create provider" });
    }
};

export const getProviders = async (req, res) => {
    try {
        const providers = await Provider.find();
        res.status(200).json(providers);
    } catch (error) {
        console.error("Error getting providers:", error);
        res.status(500).json({ error: "Failed to get providers" });
    }
}