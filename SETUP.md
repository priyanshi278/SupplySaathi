# 🔧 Setup Instructions

Follow these steps to set up the Street Food Raw Material Sourcing App on your local machine and deploy it.

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Firebase account (free)
- Git

## 🚀 Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/street-food-sourcing-app.git
cd street-food-sourcing-app

# Install dependencies
npm install
```

### Step 2: Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Enter project name: `street-food-hub`
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password"
   - Save

3. **Enable Firestore Database**
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode"
   - Select location (closest to your users)
   - Click "Done"

4. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web" icon (</>) to add web app
   - Enter app name: `street-food-app`
   - Click "Register app"
   - Copy the Firebase configuration object

### Step 3: Configure Environment

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Update Firebase Config**
   Open `src/firebase/config.ts` and replace with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

### Step 4: Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, replace the default rules with:

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

### Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Testing the App

### Create Test Accounts

1. **Supplier Account**
   - Sign up with email: `supplier@test.com`
   - Password: `test123`
   - Role: Supplier
   - Add some products (Oil, Rice, Vegetables)

2. **Vendor Account**
   - Sign up with email: `vendor@test.com`
   - Password: `test123`
   - Role: Vendor
   - Browse products and place orders

### Test Voice Ordering

1. Login as vendor
2. Click the microphone button
3. Say: "2 kilo aloo aur 1 litre tel chahiye"
4. Check if items are added to cart

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or connect your GitHub repository

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Config Error**
   - Make sure you've replaced the placeholder config
   - Check that all Firebase services are enabled

2. **Voice Recognition Not Working**
   - Use HTTPS (required for microphone access)
   - Test in Chrome/Edge (better support)
   - Check microphone permissions

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be 16+)

4. **Firestore Permission Denied**
   - Check security rules are properly set
   - Ensure user is authenticated
   - Verify user roles match the rules

### Getting Help

- Check the browser console for errors
- Review Firebase Console for authentication/database issues
- Create an issue on GitHub with error details

## 📱 Mobile Testing

- Test on actual mobile devices
- Check voice recognition on mobile browsers
- Verify responsive design on different screen sizes
- Test offline functionality

## 🔒 Security Checklist

- ✅ Firebase security rules implemented
- ✅ Environment variables not committed
- ✅ User authentication required for all operations
- ✅ Role-based access control
- ✅ Input validation on forms
- ✅ HTTPS required for voice features

## 📊 Performance Tips

- Images are loaded from external URLs (Pexels)
- Firestore queries are optimized with indexes
- Real-time listeners are properly cleaned up
- Components are lazy-loaded where possible

---

Need help? Create an issue on GitHub or contact support!