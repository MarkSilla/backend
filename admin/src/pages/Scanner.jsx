import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(true); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [isProcessed, setIsProcessed] = useState(false); 

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }, // Slightly smaller for better top positioning
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        if (isProcessed) {
          return;
        }

        setIsProcessed(true);
        setIsScanning(false);
        setErrorMessage('');
        console.log('Scanned result:', decodedText);

        try {
          const data = JSON.parse(decodedText);
          const { orderId } = data;

          if (!orderId) {
            toast.error('Invalid QR code: Missing orderId');
            setIsProcessed(false);
            return;
          }

          const response = await axios.post(
            `${backendUrl}/api/orders/status`,
            { orderId, status: "Received" },
            { headers: { token: localStorage.getItem('token') } }
          );

          console.log('Backend response:', response.data);

          if (response.data.success) {
            if (response.data.status === "Received") {
              toast.error('Error: This order has already been marked as Received.');
            } else {
              toast.success('Order status updated to Order Received!');
            }
            setTimeout(() => {
              setIsProcessed(false);
              setIsScanning(true);
            }, 3000);
          } else {
            toast.error(response.data.message || 'Failed to update order status');
            setIsProcessed(false);
          }
        } catch (error) {
          console.error('Error details:', error);
          if (error.name === 'SyntaxError') {
            console.error('Invalid QR code format:', decodedText);
            toast.error('Invalid QR code format. Please scan a valid QR code.');
          } else {
            console.error('Error updating order status:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error updating order status');
          }
          setIsProcessed(false);
        }
      },
      (error) => {
        if (error.name === 'NotFoundException') {
          return;
        }
      }
    );

    return () => {
      scanner.clear();
    };
  }, [isProcessed]);

  return (
    <div className="flex flex-col items-center justify-start pt-4 md:pt-8 bg-gray-100 px-4 sm:px-6 md:px-8 min-h-screen">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-4">
        Scan QR Code
      </h3>
      
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4 mb-6">
        <div
          id="reader"
          className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[350px] mx-auto border border-gray-300 rounded-lg overflow-hidden"
          style={{ height: 'auto' }}
        ></div>
        
        {isScanning && (
          <div className="flex flex-col items-center mt-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-gray-500 mb-2"></div>
            <p className="text-center text-gray-500 text-sm">
              Waiting for QR code...
            </p>
          </div>
        )}
        
        {errorMessage && (
          <p className="text-center text-red-500 text-sm mt-2">
            {errorMessage}
          </p>
        )}
        
        <p className="text-center text-gray-500 text-xs mt-4">
          Ensure the QR code is within the scanning area
        </p>
      </div>
    </div>
  );
};

export default Scanner;