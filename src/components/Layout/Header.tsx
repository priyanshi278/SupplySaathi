import React from 'react';
import { User, ShoppingCart, LogOut, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const { userData, logout } = useAuth();
  const { getCartCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-indigo-100 via-white to-yellow-50 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<<<<<<< HEAD
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <Link to={userData?.role === 'vendor' ? '/vendor' : '/supplier'} className="flex items-center">
              <div className="bg-indigo-700 p-2 rounded-lg mr-3">
                <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-indigo-700 font-bold text-lg">SF</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-indigo-800 leading-tight">Street Food Hub</h1>
                <span className="text-xs text-gray-500 font-medium">Your one-stop vendor platform</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-700">{userData?.email ? userData.email.split('@')[0] : 'Vendor'}</span>
              <span className="text-xs text-gray-500">{userData?.role?.toUpperCase()}</span>
            </span>
            <span className="hidden sm:block h-8 w-px bg-gray-300 mx-2"></span>
            <button className="p-2 text-gray-600 hover:text-indigo-600 transition-colors relative">
              <Bell className="w-6 h-6" />
              {/* Future: notification badge */}
            </button>
            {userData?.role === 'vendor' && (
              <Link to="/vendor/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
=======
        <div className="flex justify-between items-center h-16">
          <Link
            to={userData?.role === 'vendor' ? '/vendor' : '/supplier'}
            className="flex items-center"
          >
            <div className="bg-orange-500 p-2 rounded-lg mr-3">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-orange-500 font-bold text-sm">SF</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Street Food Hub</h1>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Vendor Cart Icon */}
            {userData?.role === 'vendor' && (
              <Link
                to="/vendor/cart"
                className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors"
              >
>>>>>>> 27de63a226d4179cc441a0216cd4923972cfdab1
                <ShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}
<<<<<<< HEAD
            <Link to="/profile" className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <User className="w-6 h-6" />
            </Link>
=======

            {/* Supplier Links */}
            {userData?.role === 'supplier' && (
              <>
                <Link
                  to="/supplier"
                  className="p-2 text-gray-600 hover:text-orange-500 transition-colors font-medium"
                >
                  🛒 Products
                </Link>
                <Link
                  to="/supplier/orders"
                  className="p-2 text-gray-600 hover:text-orange-500 transition-colors font-medium"
                >
                  📦 Orders
                </Link>
              </>
            )}

            {/* Profile */}
            <Link
              to="/profile"
              className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>

            {/* Logout */}
>>>>>>> 27de63a226d4179cc441a0216cd4923972cfdab1
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
