import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-4xl py-4 text-center">
        <Title text1="ABOUT" text2="US" />
      </div>
      
      {/* About Us Section */}
      <div className="my-10 flex flex-col md:flex-row gap-8 md:gap-16">
        <img 
          className="w-full md:max-w-md rounded-lg shadow-md" 
          src={assets.about_img} 
          alt="aboutUsImage" 
        />
        
        <div className="flex flex-col justify-center gap-6 md:w-1/2 text-gray-600">
          <p className="leading-relaxed">
            We are a team of passionate developers dedicated to creating user-friendly and efficient web applications. Our mission is to build software that not only meets the needs of our users but also makes their experience seamless and enjoyable. We value collaboration, creativity, and continuous learning as we work towards delivering high-quality solutions.
          </p>
          <p className="leading-relaxed">
          Our development process is centered around understanding the unique needs of each project and crafting solutions that are tailored to specific goals. We prioritize performance, scalability, and security, ensuring that every product we deliver is built to last and perform at its best. With an emphasis on innovation and teamwork, we continuously push the boundaries of what's possible in web development.
          </p>  
          
          <h3 className="font-bold text-xl text-gray-800">Our Mission</h3>
          <p className="leading-relaxed">
            UniformXpress is committed to providing Gordon College students with uniforms that embody professionalism, discipline, and school pride. We strive to ensure accessibility and comfort while upholding the institution's standards and identity.
          </p>
        </div>
      </div>
      
      {/* Why Choose Us Section */}
      <div className="text-4xl py-4 text-center">
        <Title text1="WHY" text2="CHOOSE US?" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <h3 className="font-bold text-lg mb-2">Accessibility</h3>
          <p className="text-gray-600">
          At Gordon College, students can effortlessly access their required uniforms at convenient on-site locations, with inclusive sizing options available for everyone.
          </p>
        </div>
        
        <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <h3 className="font-bold text-lg mb-2">Convenience</h3>
          <p className="text-gray-600">
            Ensuring a hassle-free experience for Gordon College students by offering easily accessible uniforms, efficient service, and a smooth ordering process.
          </p>
        </div>
        
        <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
          <h3 className="font-bold text-lg mb-2">Efficiency</h3>
          <p className="text-gray-600">
            Provides Gordon College students with a streamlined process for acquiring uniforms, ensuring quick service, organized distribution, and minimal wait times.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;