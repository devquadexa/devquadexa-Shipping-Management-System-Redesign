import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userData = await login(username, password);
      
      if (userData.isTemporaryPassword || userData.passwordResetRequired) {
        navigate('/reset-password');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Invalid username or password');
      } else if (err.request) {
        setError('Cannot connect to server. Please ensure the backend is running on port 5000.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Content with enhanced styling */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-md text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome Back</h1>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Manage your cargo shipments with ease and efficiency
          </p>
          
          <div className="space-y-6 mt-16">
            <div className="flex items-start bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-200 mr-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-50 text-sm font-medium">Real-time shipment tracking</p>
            </div>
            
            <div className="flex items-start bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-200 mr-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-50 text-sm font-medium">Secure and reliable service</p>
            </div>
            
            <div className="flex items-start bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transition">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-200 mr-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-50 text-sm font-medium">24/7 customer support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with enhanced styling */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <div className="p-3 bg-blue-50 rounded-full border-2 border-blue-200">
                <img 
                  src={`${process.env.PUBLIC_URL}/logo.png?v=${Date.now()}`} 
                  alt="Super Shine Cargo" 
                  className="h-12 w-12"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Super Shine Cargo</h1>
            <p className="text-gray-600 text-sm font-medium">Sri Lanka's Premier Cargo Solutions</p>
          </div>

          {/* Form Container with border and shadow */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 hover:border-blue-300 transition duration-300">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600 text-sm mt-1">Enter your credentials to access your account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded-r-lg flex items-start animate-pulse">
                <svg className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-gray-400 hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 placeholder-gray-400 hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    title={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg border border-blue-800"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>

          {/* Footer text */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Super Shine Cargo © 2024. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
