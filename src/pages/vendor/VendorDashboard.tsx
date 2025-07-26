import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { Plus, Search, Store } from 'lucide-react';
import VoiceOrderAssistant from '../../components/VoiceOrderAssistant';
import { Link } from 'react-router-dom';

const VendorDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<{ [key: string]: string }>({});
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartPopupMessage, setCartPopupMessage] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsData = await Promise.all(
        querySnapshot.docs.map(async (productDoc) => {
          const productData = productDoc.data();
          
          // Fetch supplier name
          const supplierDoc = await getDoc(doc(db, 'users', productData.supplierId));
          const supplierName = supplierDoc.exists() ? supplierDoc.data().name : 'Unknown Supplier';
          
          return {
            id: productDoc.id,
            ...productData,
            supplierName
          };
        })
      );
      setProducts(productsData as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      supplierId: product.supplierId,
      supplierName: product.supplierName
    });
    setCartPopupMessage('Added to cart');
    setShowCartPopup(true);
    setTimeout(() => {
      setShowCartPopup(false);
      setCartPopupMessage('');
    }, 1500);
  };

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.supplierId]) {
      acc[product.supplierId] = {
        supplierName: product.supplierName,
        products: []
      };
    }
    acc[product.supplierId].products.push(product);
    return acc;
  }, {} as { [key: string]: { supplierName: string; products: Product[] } });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
   <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-teal-100 p-0 m-0 relative">
  {/* Cart Popup Message */}
  {showCartPopup && (
    <div style={{position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, transition: 'opacity 0.3s', opacity: showCartPopup ? 1 : 0}} className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-8 py-4 rounded-xl shadow-2xl text-xl font-bold">
      {cartPopupMessage}
    </div>
  )}
  {/* Header with Search and Action */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full p-0 m-0">
    <div className="w-full bg-gradient-to-r from-white via-gray-100 to-gray-200 rounded-xl shadow-lg py-8 px-4 mb-8">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-2 text-center drop-shadow-lg animate-fade-in">Browse Raw Materials</h1>
      <div className="text-lg text-gray-600 mb-6 text-center">Find the best ingredients for your street food business</div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Search products or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-indigo-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-lg transition"
          />
        </div>
      </div>
    </div>
  </div>
  {/* Action Buttons & Voice Assistant */}
  <div className="flex flex-col sm:flex-row sm:items-start gap-6 mt-6 w-full p-0 m-0">
    <div className="flex flex-col items-end w-full sm:w-auto">
      <Link
        to="/vendor/orders"
        className="w-full sm:w-auto bg-gradient-to-r from-blue-400 via-purple-500 to-teal-500 text-white px-8 py-3 rounded-xl shadow-lg hover:from-blue-500 hover:to-teal-700 text-lg font-bold flex items-center justify-center mb-4 transition-all duration-300"
      >
        <span className="mr-2">🛒</span> View Orders
      </Link>
    </div>
    {/* Voice Assistant Component */}
    <div className="w-full sm:w-auto flex-1">
      <VoiceOrderAssistant
        onOrderProcessed={(items) => {
          console.log('Voice order processed:', items);
        }}
      />
    </div>
  </div>


      {Object.keys(groupedProducts).length === 0 ? (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No suppliers have added products yet, or your search didn't match any products.
          </p>
        </div>
      ) : (
        <div className="space-y-10 w-full">
          {Object.entries(groupedProducts).map(([supplierId, { supplierName, products }]) => (
            <div key={supplierId} className="bg-gradient-to-br from-white via-blue-100 to-teal-100 rounded-2xl shadow-xl overflow-hidden border-2 border-blue-300">
              <div className="bg-gradient-to-r from-blue-200 via-purple-100 to-white px-8 py-6 border-b-2 border-blue-200">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center">
                  <Store className="w-6 h-6 mr-2 text-teal-500" />
                  {supplierName}
                </h2>
                <p className="text-base text-blue-600 font-medium">{products.length} products available</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-blue-700 text-lg">{product.name}</h3>
                      <span className="text-xl font-bold text-teal-600">₹{product.price}</span>
                    </div>
                    <p className="text-base text-gray-700 mb-4">per {product.unit}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-gradient-to-r from-blue-400 via-purple-500 to-teal-500 hover:from-blue-500 hover:to-teal-700 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;