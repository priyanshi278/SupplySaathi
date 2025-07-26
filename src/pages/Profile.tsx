import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Store, Truck } from 'lucide-react';

const Profile: React.FC = () => {
  const { userData } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            userData?.role === 'vendor' ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            {userData?.role === 'vendor' ? (
              <Store className={`w-10 h-10 text-orange-500`} />
            ) : (
              <Truck className={`w-10 h-10 text-green-500`} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{userData?.name}</h1>
          <p className={`text-sm font-medium capitalize ${
            userData?.role === 'vendor' ? 'text-orange-600' : 'text-green-600'
          }`}>
            {userData?.role === 'vendor' ? 'Street Food Vendor' : 'Raw Material Supplier'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-gray-900">{userData?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{userData?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-gray-900">{userData?.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {userData?.role === 'vendor' ? (
              <Store className="w-5 h-5 text-gray-500" />
            ) : (
              <Truck className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="text-gray-900 capitalize">
                {userData?.role === 'vendor' ? 'Street Food Vendor' : 'Raw Material Supplier'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;