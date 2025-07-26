import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorHome from './pages/vendor/VendorHome';
import Cart from './pages/vendor/Cart';
import Orders from './pages/vendor/Orders';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierOrders from './pages/supplier/SupplierOrders';
// Removed SupplierHome import
import Profile from './pages/Profile';



const AppContent: React.FC = () => {
  const { currentUser, userData } = useAuth();

  if (!currentUser || !userData) {
    return <Login />;
  }

  return (
    <CartProvider>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={
              <Navigate 
                to={userData.role === 'vendor' ? '/vendor' : '/supplier'} 
                replace 
              />
            } 
          />
          
          {/* Vendor Routes */}
          <Route 
            path="/vendor" 
            element={
              <ProtectedRoute role="vendor">
                <VendorHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendor/dashboard" 
            element={
              <ProtectedRoute role="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendor/cart" 
            element={
              <ProtectedRoute role="vendor">
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendor/orders" 
            element={
              <ProtectedRoute role="vendor">
                <Orders />
              </ProtectedRoute>
            } 
          />
          
          {/* Supplier Routes */}
          <Route 
            path="/supplier" 
            element={
              <ProtectedRoute role="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supplier/dashboard" 
            element={
              <ProtectedRoute role="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/supplier/orders" 
            element={
              <ProtectedRoute role="supplier">
                <SupplierOrders />
              </ProtectedRoute>
            } 
          />
          
          {/* Common Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </CartProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;