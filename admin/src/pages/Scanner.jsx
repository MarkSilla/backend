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
        qrbox: { width: 400, height: 400 }, // Larger QR code scanning box
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

          if (response.data.success) {
            toast.success('Order status updated to Order Received!');
          } else {
            toast.error(response.data.message || 'Failed to update order status');
          }
        } catch (error) {
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
        // Suppress "NotFoundException" errors when no QR code is detected
        if (error.name === 'NotFoundException') {
          setErrorMessage('No QR code detected. Please ensure the QR code is visible and try again.');
        } else {
          console.error('Error scanning QR code:', error);
          toast.error('An error occurred while scanning the QR code.');
        }
      }
    );

    return () => {
      scanner.clear(); // Cleanup the scanner when the component unmounts
    };
  }, []);

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
      {isScanning && <p>Waiting for QR code...</p>} {/* Show loading message */}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Show error message */}
      <div id="reader" style={{ width: '500px', margin: '0 auto' }}></div>
    </div>
  );
};

export default Scanner;