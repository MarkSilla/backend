import React, { useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

const QRCodeComponent = ({ qrCodeData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const svg = document.getElementById('qrCodeSvg');
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (svg && canvas && context) {
      const data = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        canvas.width = svg.clientWidth;
        canvas.height = svg.clientHeight;
        context.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  }, [qrCodeData]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="text-center">
      <div className="bg-white p-6 inline-block shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Your QR Code</h3>
        <QRCode id="qrCodeSvg" value={JSON.stringify(qrCodeData)} size={180} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <button
          onClick={downloadQR}
          className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeComponent;