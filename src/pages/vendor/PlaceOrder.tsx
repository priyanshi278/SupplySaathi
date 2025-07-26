// src/pages/vendor/PlaceOrder.tsx

import React, { useState } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PlaceOrder = () => {
  const [items, setItems] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const handleOrderSubmit = async () => {
    if (!items || !totalAmount) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const orderRef = collection(db, 'orders');
      await addDoc(orderRef, {
        placedBy: auth.currentUser?.uid || 'Anonymous',
        items,
        totalAmount: Number(totalAmount),
        timestamp: serverTimestamp()
      });
      alert('✅ Order placed successfully!');
      setItems('');
      setTotalAmount('');
    } catch (error) {
      console.error('❌ Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">📦 Place an Order</h2>

      <input
        type="text"
        placeholder="Items (e.g., Burger, Fries)"
        value={items}
        onChange={(e) => setItems(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        type="number"
        placeholder="Total Amount (₹)"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />

    </div>
  );
};

export default PlaceOrder;