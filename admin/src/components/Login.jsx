import React, { useState } from "react"; 
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from "../App";
import { toast } from 'react-toastify'; // Import toast from react-toastify

const Login = ({ setToken }) => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.post(backendUrl + '/api/user/admin', { email, password });
            if (response.data.success) {
                setToken(response.data.token);
                toast.success("Login successful!"); // Show success toast
            } else {
                toast.error(response.data.message); // Show error toast
            }
        } catch (error) {
            console.error(error); 
            toast.error("An error occurred. Please try again."); // Show error toast
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100 overflow-hidden">
            {/* Background Circles */}
            <div className="absolute top-10 left-10 w-40 h-40 bg-blue-300 rounded-full opacity-50"></div>
            <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-400 rounded-full opacity-50"></div>
            <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-blue-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"></div>

            {/* Additional Tiny Circles */}
            <div className="absolute top-5 right-5 w-10 h-10 bg-blue-300 rounded-full opacity-70"></div>
            <div className="absolute bottom-10 left-20 w-8 h-8 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-blue-500 rounded-full opacity-40"></div>
            <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-blue-600 rounded-full opacity-50"></div>

            {/* Logo Outside the Login Box */}
            <img src={assets.UXlogo} alt="UX Logo" className="h-64 w-auto mb-12 mx-auto block z-10" />

            {/* Login Box */}
            <div className="bg-white p-8 rounded-lg shadow-lg w-96 z-10">
                {/* Title */}
                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                    Admin Panel
                </h1>

                <form onSubmit={onSubmitHandler} className="w-full">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-1">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;