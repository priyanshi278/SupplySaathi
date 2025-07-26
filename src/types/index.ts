export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'vendor' | 'supplier';
  phone: string;
}

export interface Product {
  id: string;
  supplierId: string;
  supplierName: string;
  name: string;
  price: number;
  unit: string;
  createdAt: any;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  supplierId: string;
  supplierName: string;
}

export interface Order {
  id: string;
  vendorId: string;
  supplierId: string;
  supplierName: string;
  vendorName: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMode: 'COD';
  status: 'Pending' | 'Accepted' | 'Delivered';
  createdAt: any;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export interface VoiceCommand {
  text: string;
  language: string;
  confidence: number;
}