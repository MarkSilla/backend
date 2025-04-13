import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const authUser = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        console.error('No token provided');
        return res.status(401).json({ success: false, message: 'Not Authorized. Please Login Again' });
    }

    try {
        // Verify the token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', token_decode);

        // Attach userId to req.body
        req.body.userId = token_decode.id;

        // Fetch the user and attach it to req.user
        const user = await User.findById(token_decode.id).select('-password');
        if (!user) {
            console.error('User not found for ID:', token_decode.id);
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        req.user = user;

        console.log('User authenticated:', user);
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error.message);
        res.status(401).json({ success: false, message: 'Invalid Token' });
    }
};

export default authUser;