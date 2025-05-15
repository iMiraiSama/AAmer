import Request from '../models/Request.js';
import Notification from '../models/Notification.js';

export const postRequest = async (req, res) => {
    const { userId, title, description, price, location, serviceType } = req.body;

    if (!userId || !title || !description || !price || !location || !serviceType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newRequest = new Request({ userId, title, description, price, location, serviceType });
        await newRequest.save();

        // const notification = new Notification({
        //     receiverId: "ADMIN_ID",
        //     message: `New service request: ${title}`,
        // });
        // await notification.save();

        res.status(201).json({ message: '✅ Request posted successfully', request: newRequest });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getAllRequests = async (req, res) => {
    try {
      const { status } = req.query;
  
      // Build query object
      const query = {};
      if (status) {
        query.status = status;
      }
  
      const requests = await Request.find(query).sort({ createdAt: -1 });
  
      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  

export const getUserRequests = async (req, res) => {
    const { userId } = req.params;

    try {
        const requests = await Request.find({ userId }).sort({ createdAt: -1 });
        
        // Ensure all requests have required fields
        const processedRequests = requests.map(request => ({
            ...request.toObject(),
            serviceType: request.serviceType || 'Other',
            title: request.title || 'Untitled Request',
            price: request.price || 0,
            location: request.location || 'Location not specified',
            description: request.description || 'No description provided'
        }));
        
        res.status(200).json(processedRequests);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        await Request.findByIdAndUpdate(requestId, { status });
        res.status(200).json({ message: "✅ Request status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRequestById = async (req, res) => {
    const { requestId } = req.params;

    try {
        const request = await Request.findById(requestId);
        res.status(200).json(request);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}