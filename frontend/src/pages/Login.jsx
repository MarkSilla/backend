import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');

  const [authError, setAuthError] = useState('');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    program: ''
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    department: false,
    program: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['CHAS', 'CBA', 'CCS', 'CEAS', 'CHTM'];
  const programs = ['BSIT', 'BSCS', 'BSEMC'];

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) error = `${field === 'firstName' ? 'First name' : 'Last name'} is required`;
        else if (value.trim().length < 2) error = `${field === 'firstName' ? 'First name' : 'Last name'} must be at least 2 characters`;
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email is invalid';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;
      case 'department':
        if (!value && currentState === 'Sign Up') error = 'Please select a department';
        break;
      case 'program':
        if (!value && currentState === 'Sign Up') error = 'Please select a program';
        break;
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'firstName' ? firstName :
                  field === 'lastName' ? lastName :
                  field === 'email' ? email :
                  field === 'password' ? password :
                  field === 'department' ? department : program;
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    if (authError && (field === 'email' || field === 'password')) setAuthError('');
    if (field === 'firstName') setFirstName(value);
    else if (field === 'lastName') setLastName(value);
    else if (field === 'email') setEmail(value);
    else if (field === 'password') setPassword(value);
    else if (field === 'department') setDepartment(value);
    else if (field === 'program') setProgram(value);
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: currentState === 'Sign Up' ? validateField('firstName', firstName) : '',
      lastName: currentState === 'Sign Up' ? validateField('lastName', lastName) : '',
      email: validateField('email', email),
      password: validateField('password', password),
      department: currentState === 'Sign Up' ? validateField('department', department) : '',
      program: currentState === 'Sign Up' ? validateField('program', program) : ''
    };
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      department: true,
      program: true
    });
    return !Object.values(newErrors).some(error => error);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          firstName,
          lastName,
          email,
          password,
          department,
          program
        });
        if (response.data.success) {
          toast.success('Account created successfully! Please log in.');
          setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setDepartment(''); setProgram('');
          setTouched({
            firstName: false,
            lastName: false,
            email: false,
            password: false,
            department: false,
            program: false
          });
          setCurrentState('Login');
        } else setAuthError(response.data.message || 'Registration failed');
      } else {
        const response = await axios.post(`${backendUrl}/api/user/login`, { email, password });
        console.log('Login response:', response.data);

        if (response.data && response.data.token) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          toast.success('Login successful!');
          navigate('/'); 
        } else setAuthError('Invalid login attempt. Please check your credentials.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (id, label, type, value, placeholder, required = true) => (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={id}
        onChange={(e) => handleChange(id, e.target.value)}
        onBlur={() => handleBlur(id)}
        value={value}
        type={type}
        className={`w-full px-3 py-2 border ${touched[id] && errors[id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${touched[id] && errors[id] ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent transition-colors`}
        placeholder={placeholder}
        required={required}
      />
      {touched[id] && errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
    </div>
  );

  const renderSelect = (id, label, value, options, placeholder) => (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        id={id}
        onChange={(e) => handleChange(id, e.target.value)}
        onBlur={() => handleBlur(id)}
        value={value}
        className={`w-full px-3 py-2 border ${touched[id] && errors[id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${touched[id] && errors[id] ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent transition-colors`}
        required
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {touched[id] && errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
    </div>
  );

  const switchFormState = (newState) => {
    setCurrentState(newState);
    setAuthError('');
    setErrors({ firstName: '', lastName: '', email: '', password: '', department: '', program: '' });
    setTouched({ firstName: false, lastName: false, email: false, password: false, department: false, program: false });
  };

  useEffect(() => {
    if (token) navigate('/');
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-gray-800">{currentState}</h1>
          <div className="mx-auto mt-2 h-1 w-16 bg-gray-800 rounded"></div>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={onSubmitHandler} className="space-y-4">
          {currentState === 'Sign Up' && (
            <>
              {/* Name fields in a 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('firstName', 'First Name', 'text', firstName, 'First name')}
                {renderInput('lastName', 'Last Name', 'text', lastName, 'Last name')}
              </div>
              
              {/* Academic information in a 2-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('department', 'Department', department, departments, 'Select Department')}
                {renderSelect('program', 'Program', program, programs, 'Select Program')}
              </div>
            </>
          )}

          {/* Login fields always visible */}
          <div className="space-y-4">
            {renderInput('email', 'Email Address', 'email', email, 'example@gordoncollege.edu.ph')}
            {renderInput('password', 'Password', 'password', password, '••••••••')}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                currentState === 'Login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {currentState === 'Login' ? 'Don\'t have an account?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => switchFormState(currentState === 'Login' ? 'Sign Up' : 'Login')}
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                {currentState === 'Login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;