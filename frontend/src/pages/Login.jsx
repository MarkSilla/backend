import React, { useState } from 'react';

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign Up');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
  }

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-full max-w-[400px] mx-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 my-10">
        <p className="font-serif text-3xl font-semibold">{currentState}</p>
        <hr className="border-none h-[2px] w-8 bg-gray-800" />
      </div>
      {currentState === 'Login' ? '' : <input type="text" className="w-full px-3 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600" placeholder="Name" required />}
      <input type="email" className="w-full px-3 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600" placeholder="Email" required />
      <input type="password" className="w-full px-3 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600" placeholder="Password" required />
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
      <p className='cursor-pointer'>Forgot your password?</p>
      {
        currentState === 'Login'
        ? <p onClick= {()=>setCurrentState('Sign Up')}className='cursor-pointer'>Create account</p>
        : <p onClick= {()=>setCurrentState('Login')}className='cursor-pointer'>Login here</p>
      }    
      </div>
      <button className='bg-black text-white fonr-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>
    </form>
  );
};

export default Login;
