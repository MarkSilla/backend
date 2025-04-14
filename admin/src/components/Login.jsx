import React, { useState } from "react";
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from "../App";
import { toast } from 'react-toastify';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);

            const response = await axios.post(backendUrl + '/api/user/admin', { email, password });
            if (response.data.success) {
                setToken(response.data.token);
                toast.success("Login successful!");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-blue-300 rounded-full opacity-50 animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-400 rounded-full opacity-50 animate-pulse" style={{ animationDuration: '6s' }}></div>
                <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-blue-200 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '8s' }}></div>

                {/* Additional Circles */}
                <div className="absolute top-5 right-5 w-10 h-10 bg-blue-300 rounded-full opacity-70"></div>
                <div className="absolute bottom-10 left-20 w-8 h-8 bg-blue-400 rounded-full opacity-60"></div>
                <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-blue-500 rounded-full opacity-40"></div>
                <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-blue-600 rounded-full opacity-50"></div>
            </div>

            {/* Main container with flex layout */}
            <div className="z-10 flex flex-col md:flex-row bg-white rounded-xl shadow-xl w-full max-w-4xl border border-gray-100 overflow-hidden">
                {/* Left side with logo */}
                <div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-blue-100">
                    <img
                        src={assets.UXlogo}
                        alt="UX Logo"
                        className="h-32 w-auto mb-6 transition-all duration-700 hover:scale-105"
                    />
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-3">
                        Admin Dashboard
                    </h2>
                    <p className="text-gray-600 text-center mb-4">
                        Access your administrative controls
                    </p>

                    {/* Additional text content */}
                    <div className="mt-2 mb-4 w-full border-t border-blue-200 "></div>

                    <div className="text-center w-full px-4">
                        <h3 className="text-lg font-medium text-blue-700 mb-2">Management Portal</h3>
                        </div>
                        <div>
                        <p className="text-gray-600 text-sm mb-4">
                            Streamline operations, track inventory, and manage students orders.
                        </p>

                        <div className="flex flex-col space-y-2 text-sm text-gray-600">
                            <div className="flex items-center text-justified w-full px-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span>Inventory Management</span>
                            </div>
                            <div className="flex items-center text-justified w-full px-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span>Order Management</span>
                            </div>
                            <div className="flex items-center text-justified w-full px-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span>QR Code Scanner</span>
                            </div>
                            <div className="flex items-center text-justified w-full px-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <span>Update Inventory</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-xs text-blue-600 text-center">
                        Secure login required to access dashboard
                    </div>
                </div>

                {/* Right side with login form */}
                <div className="w-full md:w-3/5 p-8">
                    {/* Title with decorative underline */}
                    <div className="mb-8 justify">
                        <h1 className="text-2xl font-bold text-gray-800 text-center">Admin Panel</h1>
                        <div className="mt-2 h-1 w-16 bg-blue-500 rounded-full mx-auto"></div>
                    </div>

                    <form onSubmit={onSubmitHandler} className="w-full space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Brand footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Admin access only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;