import express from 'express';
import { postRequest, getAllRequests, getUserRequests, updateRequestStatus, getRequestById } from '../controllers/requestController.js';
//Above our functions imported from the controller. In controller we have logic of how the data will be processed and returned.

const router = express.Router();

//Routes bascially define the address of the API, and how we will call them from frontend. 
router.post('/post-request', postRequest);
router.get('/get-requests', getAllRequests);
router.get('/get-user-requests/:userId', getUserRequests);
router.put('/update-request-status/:requestId', updateRequestStatus);
router.get('/get-request/:requestId', getRequestById);

export default router; 