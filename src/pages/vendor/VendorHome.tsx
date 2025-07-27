import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const offers = [
  { title: '10% Off on First Order!', description: 'Get 10% off when you place your first order today.' },
  { title: 'Free Delivery', description: 'Enjoy free delivery on orders above ₹500.' },
  { title: 'Bulk Purchase Bonus', description: 'Get extra discounts on bulk orders above ₹2000!' }, // <-- Added third offer
];

const popularProducts = [
  { name: 'Fresh Tomatoes', description: 'Best quality tomatoes from local farms.' },
  { name: 'Paneer', description: 'Soft and fresh paneer for your recipes.' },
  { name: 'Masala Mix', description: 'Spicy masala mix for street food.' },
];

const VendorHome: React.FC = () => {
  const { userData } = useAuth();
  // Get username from email (before @)
  const username = userData?.email ? userData.email.split('@')[0] : null;
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 p-0">
      <div className="max-w-full mx-auto px-0 py-8">
        <h1 className="text-4xl font-extrabold text-indigo-800 mb-2 text-center drop-shadow-lg animate-fade-in">
          Welcome, {username || userData?.name || 'Vendor'}!
        </h1>
        <div className="text-lg text-gray-600 mb-8 text-center">to Street Food Hub</div>
        {/* Offers Section with Animation */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4 text-center animate-bounce">🔥 Offers for You</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer, idx) => (
              <li
                key={idx}
                className="bg-gradient-to-r from-yellow-100 via-white to-yellow-50 text-gray-900 rounded-xl p-6 shadow-lg border-2 border-yellow-400 flex flex-col items-center justify-center animate-fade-in"
                style={{ animation: `fadeIn 1s ease ${idx * 0.3}s both` }}
              >
                <div className="font-extrabold text-xl mb-2 drop-shadow-lg text-yellow-700">{offer.title}</div>
                <div className="text-gray-700 text-base font-medium text-center">{offer.description}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* Popular Products Section */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">🌟 Popular Products</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularProducts.map((product, idx) => (
              <li key={idx} className="bg-white border-2 border-indigo-200 rounded-xl p-6 shadow-md flex flex-col items-center justify-center hover:scale-105 transition-transform">
                <div className="font-bold text-lg text-indigo-800 mb-1">{product.name}</div>
                <div className="text-gray-600 text-base text-center">{product.description}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mt-8 w-full justify-center">
          <Link to="/vendor/dashboard" className="w-full sm:w-auto bg-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-800 text-xl font-bold text-center transition-all duration-300">
            Browse Products
          </Link>
          <Link to="/vendor/orders" className="w-full sm:w-auto bg-yellow-500 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-yellow-600 text-xl font-bold text-center transition-all duration-300">
            View Orders
          </Link>
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease both;
        }
        .animate-bounce {
          animation: bounce 1s infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default VendorHome;
