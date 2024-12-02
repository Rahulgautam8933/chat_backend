import express from 'express';
import userController from '../controllers/userController.js';  // Add .js extension for local imports
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route to get all connected users
router.get('/', userController.getUsers);
router.post('/createUser', userController.createUser);
router.post('/loginUser', userController.loginUser);
router.get('/getUser', verifyJWT,userController.listUser);
router.patch('/updateUser/:id', userController.updateUser);

export default router;  // Export the router as default
