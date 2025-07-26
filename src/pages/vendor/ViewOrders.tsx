import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ViewOrders = () => {
  const [orders, setOrders] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔔 onAuthStateChanged triggered. User:', user);
      if (user) {
        try {
          const q = query(
            collection(db, 'orders'),
            where('placedBy', '==', user.uid)
          );
          console.log('📦 Querying orders for UID:', user.uid);
          const querySnapshot = await getDocs(q);
          console.log('📃 Orders fetched:', querySnapshot.docs.length);
          const orderList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(orderList);
        } catch (err) {
          console.error('❌ Error fetching orders:', err);
          setError('Error fetching orders. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('⚠️ User not logged in');
        setError('You must be logged in to view your orders.');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4">Loading orders...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">📋 Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border-b py-2">
            <p>
              <strong>Items:</strong> {order.items}
            </p>
            <p>
              <strong>Total:</strong> ₹{order.totalAmount}
            </p>
            <p className="text-sm text-gray-500">
              {order.timestamp?.toDate().toLocaleString() || 'No timestamp'}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewOrders;
