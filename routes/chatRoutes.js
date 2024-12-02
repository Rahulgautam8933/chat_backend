import express from 'express';
import chatController from '../controllers/chatController.js';  // Add .js extension for local imports

const router = express.Router();

// For saving chat messages (if storing in DB)
router.post('/send', chatController.saveMessage);

export default router;  // Use export default to export the router
