import React from 'react'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
    <div className="px-6 md:px-12 lg:px-20">
      {/* Title */}
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      {/* Main Section */}
      <div className="my-10 flex flex-col md:flex-row items-center gap-12">
        {/* Image */}
        <img className='w-full md:max-w-[400px] rounded-lg' src={assets.contact_img} alt="contactImage" />

        {/* Text Section */}
        <div className="max-w-lg">
          <p className="font-semibold text-xl text-gray-800">LOCATION</p>
          <br/>
          <p className="text-gray-600">
            Olongapo City Sports Complex, <br /> Gordon College, Philippine, <br /> Lungsod ng Olongapo, Zambales
          </p>

          <p className="text-gray-600 mt-4">
            Tel: +63 985 789 3109 <br />
            Email: uniformxpress@gmail.com
          </p>
        </div>
      </div>
      <NewsletterBox />
    </div>
  )
}

export default Contact
