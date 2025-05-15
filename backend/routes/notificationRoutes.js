import express from 'express';
import { 
    getNotifications, 
    getLatestNotifications, 
    markNotificationRead, 
    markNotificationsRead, 
    clearNotifications 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/get-notifications/:userId', getNotifications);
router.get('/get-latest-notifications/:userId', getLatestNotifications);
router.put('/mark-notification-read/:notificationId', markNotificationRead);
router.put('/mark-notifications-read/:userId', markNotificationsRead);
router.delete('/clear-notifications/:userId', clearNotifications);

export default router; 