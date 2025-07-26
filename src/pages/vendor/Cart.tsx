import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { userData } = useAuth();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.supplierId]) {
      acc[item.supplierId] = {
        supplierName: item.supplierName,
        items: [],
        total: 0,
      };
    }
    acc[item.supplierId].items.push(item);
    acc[item.supplierId].total += item.price * item.quantity;
    return acc;
  }, {} as { [key: string]: { supplierName: string; items: typeof cartItems; total: number } });

  // ✅ Save Order to Firebase with SweetAlert2
  const saveOrderToFirebase = async (
    supplierId: string,
    supplierName: string,
    items: typeof cartItems,
    paymentMode: string,
    paymentId: string
  ) => {
    const orderItems = items.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: item.price,
      unit: item.unit,
    }));

    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    await addDoc(collection(db, "orders"), {
      vendorId: userData?.uid,
      vendorName: userData?.name,
      supplierId,
      supplierName,
      items: orderItems,
      totalPrice,
      paymentMode,
      paymentId,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    items.forEach((item) => removeFromCart(item.id));

    // ✅ Success Popup
    Swal.fire({
      icon: "success",
      title: "✅ Order Placed!",
      html: `<b>Your order with ${supplierName}</b> has been placed successfully.`,
      confirmButtonText: "Go to My Orders",
      confirmButtonColor: "#16a34a",
    }).then(() => {
      navigate("/vendor/orders");
    });
  };

  // ✅ Place Order with Loading Popup
  const placeOrder = async (
    supplierId: string,
    supplierName: string,
    items: typeof cartItems,
    paymentMode: string = "COD",
    paymentId: string = ""
  ) => {
    if (!userData) return;

    setPlacing(true);

    // Show Loading Popup
    Swal.fire({
      title: "Placing Order...",
      text: "Please wait while we process your order.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await saveOrderToFirebase(supplierId, supplierName, items, paymentMode, paymentId);
    } catch (error) {
      console.error("Error placing order:", error);
      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setPlacing(false);
    }
  };

  // ✅ Razorpay Payment
  const handleRazorpayPayment = async (
    supplierId: string,
    supplierName: string,
    items: typeof cartItems,
    total: number
  ) => {
    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag",
      amount: total * 100,
      currency: "INR",
      name: "StreetServe",
      description: "Payment for order",
      handler: function (response: any) {
        const paymentId = response.razorpay_payment_id;
        placeOrder(supplierId, supplierName, items, "Online", paymentId);
      },
      prefill: {
        name: userData?.name,
        email: userData?.email,
      },
      theme: {
        color: "#F97316",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-gray-500">Start adding some products to your cart.</p>
        <button
          onClick={() => navigate("/vendor")}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      {Object.entries(groupedItems).map(([supplierId, { supplierName, items, total }]) => (
        <div key={supplierId} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{supplierName}</h2>
          </div>

          <div className="p-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    ₹{item.price} per {item.unit}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-medium text-gray-900 w-20 text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4 gap-4 flex-wrap">
              <span className="text-lg font-semibold">Total: ₹{total}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => placeOrder(supplierId, supplierName, items)}
                  disabled={placing}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {placing ? "Placing..." : "Place Order (COD)"}
                </button>
                <button
                  onClick={() => handleRazorpayPayment(supplierId, supplierName, items, total)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Pay Online
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Grand Total: ₹{getTotalPrice()}</h3>
            <p className="text-sm text-gray-600">
              Choose your preferred payment mode per supplier.
            </p>
          </div>
          <button onClick={clearCart} className="text-red-500 hover:text-red-600 font-medium">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
