import React from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Title */}
      <div className="text-center text-2xl pt-10 border-t mb-12">
        <Title text1="CONTACT" text2="US" />
      </div>

      {/* Main Section */}
      <div className="my-10 flex flex-col md:flex-row items-center gap-12">
        {/* Image with shadow and improved styling */}
        <div className="w-full md:w-1/2">
          <img 
            className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 object-cover" 
            src={assets.contact_img} 
            alt="Gordon College Campus" 
          />
        </div>

        {/* Contact Information Card */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-8">
          <h2 className="font-bold text-2xl text-gray-800 mb-6 border-b pb-2">Get in Touch</h2>
          
          {/* Location */}
          <div className="flex items-start gap-4 mb-6">
            <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-gray-800">LOCATION</p>
              <p className="text-gray-600 mt-1">
                Olongapo City Sports Complex, <br /> 
                Gordon College, Philippine, <br /> 
                Lungsod ng Olongapo, Zambales
              </p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-4 mb-4">
            <Phone className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-gray-800">TELEPHONE</p>
              <p className="text-gray-600">+63 985 789 3109</p>
            </div>
          </div>
          
          {/* Email */}
          <div className="flex items-center gap-4 mb-4">
            <Mail className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-gray-800">EMAIL</p>
              <p className="text-gray-600">uniformxpress@gmail.com</p>
            </div>
          </div>
          
          {/* Hours - Added this as additional information */}
          <div className="flex items-center gap-4">
            <Clock className="text-blue-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-gray-800">BUSINESS HOURS</p>
              <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;