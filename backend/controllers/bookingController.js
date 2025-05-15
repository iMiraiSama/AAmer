import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Request from '../models/Request.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import Offering from '../models/Offering.js';
import mongoose from 'mongoose';
import { createNotification } from './notificationController.js';

export const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingType, userId, title, description, price, location, serviceType } = req.body;
        console.log("📌 Creating booking with data:", { serviceId, bookingType, userId, title, description, price, location, serviceType });

        if (!userId || !bookingType) {
            return res.status(400).json({ error: "User ID and booking type are required." });
        }

        let requestId = serviceId;
        let customerId = null;
        let providerId = null;

        // If this is a new request booking and we have all the required fields
        if (bookingType === "request" && title && description && price && location && serviceType) {
            console.log("📌 Creating new request");
            // Create a new request
            const newRequest = new Request({
                userId, // This is the provider's ID
                title,
                description,
                price,
                location,
                serviceType
            });
            const savedRequest = await newRequest.save();
            requestId = savedRequest._id;
            providerId = userId; // The provider's ID is the userId in this case
            console.log("📌 Created new request:", savedRequest._id);
        } else if (!serviceId) {
            return res.status(400).json({ error: "Service ID is required for existing requests." });
        }

        // For request bookings, we need to get both customer and provider IDs
        if (bookingType === "request") {
            // Get the request to find the provider's ID
            const request = await Request.findById(requestId);
            if (request) {
                // For request bookings:
                // - The request.userId is the user who created the request (customer)
                // - The userId passed in is the provider's ID
                providerId = userId; // This is the provider's ID (from localStorage)
                customerId = request.userId; // This is the customer's ID (who created the request)
                console.log("📌 Request booking - Customer ID:", customerId, "Provider ID:", providerId);
            }
        }
        else if (bookingType === "offer") {
            const offer = await Offering.findById(serviceId);
            if (!offer) {
                return res.status(404).json({ error: "Offer not found." });
            }
            providerId = offer.providerId;
            customerId = userId;
        }

        // Check for existing booking
        const existingBooking = await Booking.findOne({ 
            userId: customerId, 
            providerId: providerId,
            serviceId: requestId, 
            bookingType 
        });
        if (existingBooking) {
            return res.status(400).json({ error: "Booking already exists." });
        }

        // Create the booking with correct IDs
        const booking = new Booking({ 
            userId: customerId, // This is the customer's ID (who created the request)
            providerId: providerId, // This is the provider's ID (from localStorage)
            serviceId: requestId, 
            bookingType 
        });

        // Save booking
        const savedBooking = await booking.save();
        console.log("📌 Created booking:", savedBooking._id);

        // Create notification for the service provider
        if (bookingType === "request") {
            // Get request details for the notification message
            const request = await Request.findById(requestId);
            const provider = await Provider.findOne({ userId: providerId });
            
            // Notification for the customer (request creator)
            await createNotification(
                customerId,
                'booking',
                requestId,
                `${provider?.name || 'A provider'} has applied for your request: "${request?.title || 'Service Request'}"`
            );

            // // Notification for the provider
            // await createNotification(
            //     providerId,
            //     'booking',
            //     savedBooking._id,
            //     `You have applied for the request: "${request?.title || 'Service Request'}"`
            // );
        }
        if (bookingType === "offer") {
            const offer = await Offering.findById(serviceId);
            const user = await User.findById(customerId);
            
            // Notification for the provider
            await createNotification(
                providerId,
                'booking',
                serviceId,
                `${user?.name || 'A customer'} has booked your service: "${offer?.title || 'Service Offer'}"`
            );

            // Notification for the customer
            // await createNotification(
            //     customerId,
            //     'booking',
            //     savedBooking._id,
            //     `You have booked the service: "${offer?.title || 'Service Offer'}"`
            // );
        }
        

        res.status(201).json({ 
            message: "Booking created successfully", 
            booking: savedBooking,
            requestId: requestId
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
};
  

export const getBookingByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;


        if (!mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ error: "Invalid service ID format" });
        }
        console.log(serviceId);
        const bookings = await Booking.find({ serviceId });
        if (!bookings.length) {
            return res.status(404).json({ error: "No bookings found" });
        }

        const bookingType = bookings[0].bookingType;
        let title = null;

        if (bookingType === 'request') {
            const request = await Request.findById(serviceId);
            if (!request) {
                return res.status(404).json({ error: "Request not found" });
            }
            title = request.title;
        } else if (bookingType === 'offer') {
            const offering = await Offering.findById(serviceId);
            if (!offering) {
                return res.status(404).json({ error: "Offering not found" });
            }
            title = offering.title;
        }

        const enrichedBookings = await Promise.all(
            bookings.map(async (booking) => {
                if (bookingType === 'request') {
                    const provider = await Provider.findOne({ userId: booking.providerId });
                    return {
                        ...booking.toObject(),
                        provider: provider ? provider.toObject() : null
                    };
                } else if (bookingType === 'offer') {
                    const provider = await Provider.findOne({ userId: booking.providerId });
                    return {
                        ...booking.toObject(),
                        provider: provider ? provider.toObject() : null
                    };
                } else {
                    return booking.toObject();
                }
            })
        );

        return res.status(200).json({
            requestTitle: title,
            bookings: enrichedBookings
        });

    } catch (error) {
        console.error("Error getting booking by service ID:", error);
        return res.status(500).json({ error: "Failed to get booking" });
    }
};


export const getOfferBookings = async (req, res) => {
    
}

export const confirmBookingOffering = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ error: "Invalid booking format" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        booking.status = "accepted";

        const offer = await Offering.findById(booking.serviceId);
        offer.status = "accepted";


        const notification = new Notification({
            'receiverId':booking.userId,
            'type' :'booking',
            'entityId' : booking.serviceId,
            'message': `Your request to service has been accepted`,
        });
        await booking.save();
        await offer.save();
        await notification.save();

        return res.status(200).json({ message: "Booking confirmed successfully" ,confirmedBooking: booking });
    } catch (error) {
        console.error("Error confirming booking:", error);
        return res.status(500).json({ error: "Failed to confirm booking" });
    }
}


export const confirmBookingRequest = async (req, res) => {
    try {
        const { bookingId, providerId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(providerId)) {
            return res.status(400).json({ error: "Invalid booking or provider ID format" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const provider = await Provider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ error: "Provider not found" });
        }

        booking.status = "accepted";
        await booking.save();

        const request = await Request.findById(booking.serviceId);
        request.status = "accepted";
        await request.save();

        const notification = new Notification({
            'receiverId':provider.userId,
            'type' :'booking',
            'entityId' : bookingId,
            'message': `Your offer has been accepted`,
        });

        await notification.save();

        return res.status(200).json({ message: "Booking confirmed successfully" ,confirmedBooking: booking });
    } catch (error) {
        console.error("Error confirming booking:", error);
        return res.status(500).json({ error: "Failed to confirm booking" });
    }
}



export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID format" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Error getting booking by ID:", error);
        return res.status(500).json({ error: "Failed to get booking" });
    }
}

export const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID format" });
        }
        console.log(bookingId);
        const booking = await Booking.findByIdAndDelete(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        return res.status(500).json({ error: "Failed to delete booking" });
    }
}

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error getting all bookings:", error);
        return res.status(500).json({ error: "Failed to get bookings" });
    }
}

export const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        // Find all bookings for the user (either as customer or provider)
        const bookings = await Booking.find({
            $or: [
                { userId: userId },
                { providerId: userId }
            ]
        }).sort({ createdAt: -1 });

        if (!bookings.length) {
            return res.status(200).json([]);
        }
        // Get detailed booking information including offer/request details
        const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
            let serviceDetails;
            
            if (booking.bookingType === "offer") {
                // Get offer details if booking is for an offer
                serviceDetails = await Offering.findById(booking.serviceId);
            } else {
                // Get request details if booking is for a request
                serviceDetails = await Request.findById(booking.serviceId); 
            }

            return {
                ...booking.toObject(),
                serviceDetails: serviceDetails || null
            };
        }));

        // Return the enhanced bookings with service details
        return res.status(200).json(bookingsWithDetails);

        res.status(200).json(bookings);

    } catch (error) {
        console.error("Error getting user bookings:", error);
        return res.status(500).json({ error: "Failed to get user bookings" });
    }
}


export const getAllCompletedBookings = async (req, res) => {
    try {
        console.log("📌 Getting all completed bookings");
        
        // Find all completed bookings
        const query = { status: "completed" };
        console.log("📌 Query:", query);

        // Find bookings
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 });
        console.log("📌 Found bookings:", bookings.map(b => ({ 
            _id: b._id, 
            userId: b.userId, 
            status: b.status, 
            bookingType: b.bookingType 
        })));

        // If no bookings found, return empty array
        if (!bookings.length) {
            console.log("No bookings found");
            return res.status(200).json([]);
        }

        // Get provider details for each booking
        const bookingsWithProviders = await Promise.all(
            bookings.map(async (booking) => {
                console.log("📌 Processing booking:", booking._id);
                
                // Get the service details
                const service = await Request.findById(booking.serviceId);
                console.log("📌 Found service:", service?._id);
                
                let provider = null;
                
                if (service) {
                    // For request bookings, provider is the service creator
                    if (booking.bookingType === "request") {
                        // First try to find provider by service creator's userId
                        provider = await Provider.findOne({ userId: service.userId });
                        console.log("📌 Found provider (request) by service creator:", provider?._id, "with userId:", provider?.userId);
                        
                        // If not found, try to find provider by service ID
                        if (!provider) {
                            console.log("📌 Provider not found by service creator, trying to find by service ID");
                            provider = await Provider.findOne({ serviceId: service._id });
                            console.log("📌 Found provider by service ID:", provider?._id, "with userId:", provider?.userId);
                        }
                        
                        // If still not found, try to find provider by booking userId
                        if (!provider) {
                            console.log("📌 Provider not found by service ID, trying to find by booking userId");
                            provider = await Provider.findOne({ userId: booking.userId });
                            console.log("📌 Found provider by booking userId:", provider?._id, "with userId:", provider?.userId);
                        }
                    }
                    // For offer bookings, provider is the one who made the booking
                    else if (booking.bookingType === "offer") {
                        // First try to find provider by booking userId
                        provider = await Provider.findOne({ userId: booking.userId });
                        console.log("📌 Found provider (offer) by booking userId:", provider?._id, "with userId:", provider?.userId);
                        
                        // If not found, try to find provider by service ID
                        if (!provider) {
                            console.log("📌 Provider not found by booking userId, trying to find by service ID");
                            provider = await Provider.findOne({ serviceId: service._id });
                            console.log("📌 Found provider by service ID:", provider?._id, "with userId:", provider?.userId);
                        }
                        
                        // If still not found, try to find provider by service creator
                        if (!provider) {
                            console.log("📌 Provider not found by service ID, trying to find by service creator");
                            provider = await Provider.findOne({ userId: service.userId });
                            console.log("📌 Found provider by service creator:", provider?._id, "with userId:", provider?.userId);
                        }
                    }
                }

                // Get service type and other details from the request
                const serviceDetails = service ? {
                    serviceType: service.title || 'Service Request',
                    location: service.location,
                    price: service.price
                } : {};

                const result = {
                    ...booking.toObject(),
                    ...serviceDetails,
                    provider: provider ? provider.toObject() : null
                };
                console.log("📌 Processed booking result:", result._id, "with provider:", result.provider?._id, "and userId:", result.provider?.userId);
                return result;
            })
        );

        console.log("📌 Final response length:", bookingsWithProviders.length);
        return res.status(200).json(bookingsWithProviders);

    } catch (error) {
        console.error("Error getting completed bookings:", error);
        return res.status(500).json({ error: "Failed to get completed bookings" });
    }
};

export const getProviderBookings = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        // Find all bookings where the provider is involved
        const bookings = await Booking.find({
            $or: [
                { providerId: providerId },
                { 'serviceDetails.providerId': providerId }
            ]
        })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

        // Get detailed booking information including offer/request details
        const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
            let serviceDetails;
            
            if (booking.bookingType === "offer") {
                // Get offer details if booking is for an offer
                serviceDetails = await Offering.findById(booking.serviceId);
            } else {
                // Get request details if booking is for a request
                serviceDetails = await Request.findById(booking.serviceId); 
            }

            return {
                ...booking.toObject(),
                serviceDetails: serviceDetails || null
            };
        }));

        res.status(200).json(bookingsWithDetails);
    } catch (error) {
        console.error('Error fetching provider bookings:', error);
        res.status(500).json({ message: 'Error fetching provider bookings', error: error.message });
    }
};