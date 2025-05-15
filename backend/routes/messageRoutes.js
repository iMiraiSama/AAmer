import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

router.post('/send-message', sendMessage);
router.get('/get-messages/:chatId', getMessages);

export default router;
