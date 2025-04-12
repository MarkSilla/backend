import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(true); // State to track scanning status
  const [errorMessage, setErrorMessage] = useState(''); // State to track error messages

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10, // Reduce frames per second for better accuracy
        qrbox: { width: 300, height: 300 }, // Adjusted for responsiveness
        aspectRatio: 1.0, // Maintain a square aspect ratio
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        setIsScanning(false); // Stop showing the loading message
        setErrorMessage(''); // Clear any previous error messages
        console.log('Scanned result:', decodedText);

        try {
          // Parse the decodedText as JSON
          const data = JSON.parse(decodedText); // Ensure the QR code contains valid JSON
          const { orderId } = data; // Extract the orderId from the JSON object

          if (!orderId) {
            toast.error('Invalid QR code: Missing orderId');
            return;
          }

          // Send the orderId to the backend
          const response = await axios.post(
            `${backendUrl}/api/orders/status`,
            { orderId, status: "Received" }, // Update status to "Received"
            { headers: { token: localStorage.getItem('token') } }
          );

          console.log('Backend response:', response.data); // Log the backend response

          if (response.data.success) {
            toast.success('Order status updated to Order Received!');
          } else {
            toast.error(response.data.message || 'Failed to update order status');
          }
        } catch (error) {
          console.error('Error details:', error); // Log the full error object
          if (error.name === 'SyntaxError') {
            console.error('Invalid QR code format:', decodedText);
            toast.error('Invalid QR code format. Please scan a valid QR code.');
          } else {
            console.error('Error updating order status:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error updating order status');
          }
        }
      },
      (error) => {
        if (error.name === 'NotFoundException') {
          // Suppress this error
          return;
        } else {
          console.error('Error scanning QR code:', error);
        }
      }
    );

    return () => {
      scanner.clear(); // Cleanup the scanner when the component unmounts
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-8">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-6">
        Scan QR Code
      </h3>
      {isScanning && (
        <div className="flex flex-col items-center">
          {/* Waiting Animation */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500 mb-4"></div>
          <p className="text-center text-gray-500 text-sm sm:text-base">
            Waiting for QR code...
          </p>
        </div>
      )}
      {errorMessage && (
        <p className="text-center text-red-500 text-sm sm:text-base mb-4">
          {errorMessage}
        </p>
      )}
      <div
        id="reader"
        className="w-full max-w-[300px] sm:max-w-[400px] mx-auto border-2 border-dashed border-gray-300 rounded-lg"
        style={{ height: 'auto' }}
      ></div>
      <p className="text-center text-gray-500 text-xs sm:text-sm mt-4">
        Ensure the QR code is within the scanning area.
      </p>
    </div>
  );
};

export default Scanner;