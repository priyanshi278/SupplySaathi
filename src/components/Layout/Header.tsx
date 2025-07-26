import React from 'react';
import { User, ShoppingCart, LogOut } from 'lucide-react';
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
                <ShoppingCart className="w-6 h-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

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
