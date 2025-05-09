import express from 'express';
import { loginUser, registerUser, adminLogin, getUserDetails,} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/getuser', authUser, getUserDetails) 

export default userRouter;