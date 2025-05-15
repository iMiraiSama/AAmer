import express from 'express';
import { createBooking, getBookingByServiceId, confirmBookingRequest, getBookingById, deleteBooking, getAllBookings, getUserBookings, getAllCompletedBookings, confirmBookingOffering, getProviderBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/add-booking', createBooking);
router.get('/get-booking/:serviceId', getBookingByServiceId);
router.post('/confirm-booking', confirmBookingRequest);
router.get('/get-booking-id/:bookingId', getBookingById);
router.delete('/delete-booking/:bookingId', deleteBooking);
router.get('/get-all-bookings', getAllBookings);
router.get('/get-user-bookings/:userId', getUserBookings);
router.get('/get-provider-bookings/:providerId', getProviderBookings);
router.get('/all-completed-bookings', getAllCompletedBookings);
router.post('/confirm-booking-offering', confirmBookingOffering);

export default router;
