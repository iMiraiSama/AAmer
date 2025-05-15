import Offering from '../models/Offering.js';
import Provider from '../models/Provider.js'

// Create new offering
export const createOffering = async (req, res) => {
    try {
        const { providerId, title, description, price, location, serviceType } = req.body;

        // Validate required fields
        if (!providerId || !title || !description || !price || !location || !serviceType) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const offering = new Offering({
            providerId,
            title,
            description,
            price,
            location,
            serviceType
        });

        // Save to database
        await offering.save();

        res.status(201).json({ message: "Offering created successfully", offering });
    } catch (error) {
        console.error("Error creating offering:", error);
        res.status(500).json({ error: "Failed to create offering" });
    }
};

export const getOfferings = async (req, res) => {
    try {
        const offerings = await Offering.find();
        res.status(200).json(offerings);
    } catch (error) {
        console.error("Error fetching offerings:", error);
        res.status(500).json({ error: "Failed to fetch offerings" });
    }
}

export const getOfferingById = async (req, res) => {
    try {
        const offering = await Offering.findById(req.params.offerId);
        if (!offering) {
            return res.status(404).json({ error: "Offering not found" });
        }
        res.status(200).json(offering);
    } catch (error) {
        console.error("Error fetching offering:", error);
        res.status(500).json({ error: "Failed to fetch offering" });
    }
}

export const getOfferingsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const offerings = await Offering.find({ status });
        res.status(200).json(offerings);
    } catch (error) {
        console.error("Error fetching offerings by status:", error);
        res.status(500).json({ error: "Failed to fetch offerings" });
    }
}

export const getOfferingsByProviderId = async (req,res) => {
    try{
        const {userId, status} = req.params;
        // const provider = await Provider.findOne({userId})
        // console.log(provider)
        // const providerId = provider._id;
        const offerings = await Offering.find({providerId:userId, status});
        res.status(200).json(offerings);
    }catch (error) {
        console.error("Error fetching offerings by status:", error);
        res.status(500).json({ error: "Failed to fetch offerings" });
    }
}
export const updateOfferingStatus = async (req, res) => {
    try {
        const { offerId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ["pending", "accepted", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        const offering = await Offering.findById(offerId);
        if (!offering) {
            return res.status(404).json({ error: "Offering not found" });
        }

        offering.status = status;
        await offering.save();

        res.status(200).json(offering);
    } catch (error) {
        console.error("Error updating offering status:", error);
        res.status(500).json({ error: "Failed to update offering status" });
    }
}
