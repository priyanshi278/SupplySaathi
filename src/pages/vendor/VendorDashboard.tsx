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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Browse Raw Materials</h1>
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 w-full sm:w-auto">
  <div className="relative flex-1 sm:flex-none sm:w-64">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Search products or suppliers..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
  </div>
</div>

{/* ✅ Add these buttons below the search input */}
<div className="flex flex-wrap gap-4 mt-2">
  {/* <Link
  to="/vendor/cart"
  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
>
  📤 Place Order
</Link> */}

<Link
  to="/vendor/orders"
  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
>
  🛒 View Orders
</Link>

</div>


      <VoiceOrderAssistant onOrderProcessed={(items) => {
        console.log('Voice order processed:', items);
      }} />

      {Object.keys(groupedProducts).length === 0 ? (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No suppliers have added products yet, or your search didn't match any products.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedProducts).map(([supplierId, { supplierName, products }]) => (
            <div key={supplierId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Store className="w-5 h-5 mr-2 text-green-500" />
                  {supplierName}
                </h2>
                <p className="text-sm text-gray-600">{products.length} products available</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <span className="text-lg font-bold text-orange-600">₹{product.price}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">per {product.unit}</p>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
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
};

export default VendorDashboard;