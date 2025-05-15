import express from 'express';
import { getMessages, getRecentMessages, cleanupOldMessages, initiateChat, getChats } from '../controllers/chatController.js';

const router = express.Router();

router.get('/get-messages/:userId/:assistantId', getMessages);
router.get('/get-recent-messages/:userId/:assistantId', getRecentMessages);
router.delete('/cleanup-old-messages', cleanupOldMessages);
router.post('/initiate-chat', initiateChat);
router.get('/get-chats/:userId/:userType', getChats);
export default router; 