import express from 'express';
import { createOffering, getOfferings, getOfferingById, getOfferingsByStatus, getOfferingsByProviderId, updateOfferingStatus} from '../controllers/offeringController.js';

const router = express.Router();

router.post('/add-offer', createOffering);
router.get('/get-offers', getOfferings);
router.get('/get-offer/:offerId', getOfferingById);
router.get('/get-offers-by-status/:status', getOfferingsByStatus);
router.get('/get-offers-by-provider/:userId/:status', getOfferingsByProviderId);
router.patch('/update-status/:offerId', updateOfferingStatus)


export default router;
