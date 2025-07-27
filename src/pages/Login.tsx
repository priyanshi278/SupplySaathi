import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Store, Truck } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'vendor' | 'supplier'>('vendor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, { name, email, role, phone });
      }
      navigate(role === 'vendor' ? '/vendor' : '/supplier');
    } catch (error: any) {
      setError(error.message);
    }
    setLoading(false);
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/login.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>
      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 border border-gray-100 z-10 relative">
        <div className="text-center">
          <div className="bg-gradient-to-tr from-orange-500 to-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-orange-500 font-bold text-lg">SS</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <p className="text-gray-600">{isLogin ? 'Welcome back! Login to your account.' : 'Create your account to get started.'}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              {error}
            </div>
          )}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white bg-opacity-80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white bg-opacity-80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="vendor"
                      checked={role === 'vendor'}
                      onChange={(e) => setRole(e.target.value as 'vendor')}
                      className="focus:ring-orange-400 h-4 w-4 text-orange-600 border-gray-300"
                    />
                    <Store className="ml-2 w-4 h-4 text-orange-500" />
                    <span className="ml-2 text-sm text-gray-700">Street Food Vendor</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="supplier"
                      checked={role === 'supplier'}
                      onChange={(e) => setRole(e.target.value as 'supplier')}
                      className="focus:ring-yellow-400 h-4 w-4 text-yellow-500 border-gray-300"
                    />
                    <Truck className="ml-2 w-4 h-4 text-yellow-500" />
                    <span className="ml-2 text-sm text-gray-700">Raw Material Supplier</span>
                  </label>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white bg-opacity-80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition bg-white bg-opacity-80"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md transition duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">{isLogin ? 'Logging in...' : 'Signing up...'}</span>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-orange-500 hover:underline font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;