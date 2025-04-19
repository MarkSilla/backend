import userModel from "../models/userModel.js";
import validator from "validator";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Userlogin Route ito
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Create a token
            const token = createToken(user._id);

            // Return the token and userId
            res.json({ success: true, token, userId: user._id });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ito naman sa user registration
const registerUser = async (req, res) => {
    try {
        const { firstName,lastName,department, program, email, password } = req.body;
        //check kung user is nag eexist
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validation of email and password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email address" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        //password hashing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            firstName, lastName, email, department, program, password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }


}

// ITO NAMAN SA ADMIN LOGIN 
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Corrected the typo in the environment variable name
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Function to get user details
const getUserDetails = async (req, res) => {
    try {
        console.log('Fetching user details for:', req.user);

        // Use req.user if the user is already attached by the authUser middleware
        const user = req.user;

        if (!user) {
            console.error('User not found in request');
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                department: user.department,
                program: user.program,
            },
        });
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export { loginUser, registerUser, adminLogin, getUserDetails };
