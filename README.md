# 🍜 Street Food Raw Material Sourcing App

A modern web application that connects street food vendors with raw material suppliers, featuring voice-based multilingual ordering and real-time order tracking.

## 🎯 Features

### For Vendors
- **Browse Products**: View products from multiple suppliers organized by supplier
- **Smart Cart**: Add items to cart with quantity management
- **Voice Ordering**: Place orders using voice commands in Hindi, Tamil, Bengali, or English
- **COD Orders**: Cash on Delivery payment system
- **Live Tracking**: Real-time order status updates (Pending → Accepted → Delivered)
- **Order History**: View all past orders with detailed information

### For Suppliers
- **Product Management**: Add, edit, and manage product listings
- **Order Management**: View incoming orders and update status
- **Real-time Updates**: Instant notifications when orders are placed
- **Dashboard Analytics**: Overview of products and orders

### 🗣️ Voice Assistant
- **Multilingual Support**: Hindi, Tamil, Bengali, English
- **Natural Language**: "2 kilo aloo aur 1 litre tel chahiye"
- **Audio Confirmation**: Speaks back order confirmation
- **Smart Parsing**: Understands quantities and product names

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Voice**: Web Speech API
- **Routing**: React Router v6
- **State Management**: React Context
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/street-food-sourcing-app.git
   cd street-food-sourcing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config

4. **Configure Firebase**
   Update `src/firebase/config.ts` with your Firebase configuration:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Getting Started
1. **Sign Up**: Create an account as either a Vendor or Supplier
2. **Vendors**: Browse products, add to cart, place orders
3. **Suppliers**: Add products, manage incoming orders
4. **Voice Ordering**: Use the microphone button to place orders by voice

### Voice Commands Examples
- **Hindi**: "2 kilo aloo aur 1 litre tel chahiye"
- **English**: "I need 2 kg potatoes and 1 liter oil"
- **Tamil**: "2 kilo urulaikizhangu venum"

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Header, Layout components
│   ├── VoiceOrderAssistant.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── hooks/              # Custom React hooks
│   └── useVoiceRecognition.ts
├── pages/              # Page components
│   ├── vendor/         # Vendor-specific pages
│   ├── supplier/       # Supplier-specific pages
│   ├── Login.tsx
│   └── Profile.tsx
├── firebase/           # Firebase configuration
├── types/              # TypeScript type definitions
└── App.tsx            # Main app component
```

## 🔥 Firebase Collections

### Users Collection
```json
{
  "uid": "user123",
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "role": "vendor",
  "phone": "9876543210"
}
```

### Products Collection
```json
{
  "supplierId": "supplier123",
  "name": "Sunflower Oil",
  "price": 120,
  "unit": "1L",
  "createdAt": "timestamp"
}
```

### Orders Collection
```json
{
  "vendorId": "vendor123",
  "supplierId": "supplier123",
  "vendorName": "Ravi Kumar",
  "supplierName": "ABC Suppliers",
  "items": [
    {
      "name": "Oil",
      "qty": 2,
      "price": 120,
      "unit": "1L"
    }
  ],
  "totalPrice": 240,
  "paymentMode": "COD",
  "status": "Pending",
  "createdAt": "timestamp"
}
```

## 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products can be read by all authenticated users
    // Only suppliers can write their own products
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.supplierId;
    }
    
    // Orders can be read by vendor or supplier involved
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.vendorId || 
         request.auth.uid == resource.data.supplierId);
    }
  }
}
```

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Deploy automatically

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to [Netlify](https://netlify.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Web Speech API for voice recognition
- Tailwind CSS for styling
- Lucide React for icons

## 📞 Support

For support, email support@streetfoodhub.com or create an issue on GitHub.

---

Made with ❤️ for street food vendors and suppliers