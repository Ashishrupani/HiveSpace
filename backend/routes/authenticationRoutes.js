import express from 'express';
//importing controllers
import { signUpController, signInController, forgotPasswordController, verifyEmailController } from '../controllers/authenticationControllers.js';

//importing express router
const router = express.Router();

// defining authentication routes
router.post('/sign-up', signUpController);
router.post('/sign-in', signInController);
router.post('/forgot-password', forgotPasswordController);
router.post('/verify', verifyEmailController);

//define authorization routes here


export default router;