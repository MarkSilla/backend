import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px] rounded-lg ' src={assets.about_img} alt="aboutUsImage" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>about the developers to</p>
        <p>kahit ano ilagay natin dito about satin ganon</p>
         <b className='text-gray-800'>Our Mission</b>
         <p>UniformXpress is committed to providing Gordon College students with uniforms that embody professionalism, discipline, and school pride. We strive to ensure accessibility and comfort while upholding the institution’s standards and identity.</p>
        </div>
      </div>
      <div className='text-4xl py-4'>
      <Title text1={'WHY'} text2={'CHOOSE US?'} />
      </div>
      <div className='flex glex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 sm:py-20 flex flex col gap-5'>
          <b>Accessibility: </b>
          <p className='text-gray-600'> Gordon College students can easily obtain their required uniforms through convenient locations and inclusive sizing options for all.</p>
        </div>
        <div className='border px-10 md:px-16 sm:py-20 flex flex col gap-5'>
          <b>Convenience: </b>
          <p className='text-gray-600'>Ensuring a hassle-free experience for Gordon College students by offering easily accessible uniforms, efficient service, and a smooth ordering process.</p>
        </div>
        <div className='border px-10 md:px-16 sm:py-20 flex flex col gap-5'>
          <b>Efficiency: </b>
          <p className='text-gray-600'> Provides Gordon College students with a streamlined process for acquiring uniforms, ensuring quick service, organized distribution, and minimal wait times.</p>
        </div>
      </div>
      <NewsletterBox />
    </div>
  )
}

export default About
