import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { User } from "../types";
import Swal from "sweetalert2";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signup: (email: string, password: string, userData: Omit<User, "uid">) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Signup with SweetAlert2
  const signup = async (email: string, password: string, userData: Omit<User, "uid">) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = { ...userData, uid: user.uid };
      await setDoc(doc(db, "users", user.uid), newUser);
      setUserData(newUser);

      Swal.fire({
        icon: "success",
        title: "🎉 Account Created!",
        text: "Your account has been registered successfully.",
        confirmButtonColor: "#22c55e",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message,
      });
    }
  };

  // ✅ Login with Firestore user check
  const login = async (email: string, password: string) => {
    try {
      // 🔹 Check if user exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Swal.fire({
          icon: "error",
          title: "User Not Registered",
          text: "Please sign up before logging in.",
        });
        return;
      }

      // 🔹 If user exists, try signing in
      await signInWithEmailAndPassword(auth, email, password);

      Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: "You have logged in successfully.",
        confirmButtonColor: "#3b82f6",
      });
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        Swal.fire({
          icon: "warning",
          title: "Invalid Credentials",
          text: "Your email or password is incorrect.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: error.message,
        });
      }
    }
  };

  // ✅ Logout with confirmation
  const logout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to log out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      await signOut(auth);
      setUserData(null);

      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully.",
      });
    }
  };

  // ✅ Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, userData, loading, signup, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
