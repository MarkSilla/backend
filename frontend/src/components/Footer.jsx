import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-10 text-sm'>
            <div> <img src={assets.UXlogo} className='mb-5 w-32' alt= "Logo"/>
            <p className='w-full d:w-2/3 text-gray-600'>sample text here
            </p>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>COLLEGE</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy policy</li>
                </ul>
            </div>
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-1 text-gray-600'>
                    <li>+63 985 789 3109</li>
                    <li>uniformexpress@gmail.com</li>
                </ul>
            </div>
        </div>
        <div>
                <hr />
                <p className='py-5 fonnt-medium text-sm text-center'>Copyright 2025@ UniformExpress.com - All Right Reserved.</p>
            </div>
    </div>
  )
}

export default Footer
