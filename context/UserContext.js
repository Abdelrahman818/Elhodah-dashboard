"use client";

import { endPoints } from "@/config";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { getFirebaseAuth } from "../firebaseConfig";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseToken, setFirebaseToken] = useState(null);

  const getUserData = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(endPoints.getCurrentUser, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const json = await res.json();
      if (res.status === 401) {
        setUser(null);
        setFirebaseToken(null);
        await signOut(getFirebaseAuth());
      } else if (!res.ok || !json.successful) {
        throw new Error(json.msg || "Unable to verify the signed-in account");
      } else {
        setUser(json.data);
      }
    } catch (err) {
      setError(err.message);
      setUser(null);
      console.error("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    let active = true;
    Promise.resolve()
      .then(() => {
        const auth = getFirebaseAuth();
        unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken();
              setFirebaseToken(token);
              await getUserData(token);
            } catch (err) {
              console.error("Token error:", err);
              setUser(null);
              setFirebaseToken(null);
              setError(err.message);
              setLoading(false);
            }
          } else {
            setUser(null);
            setFirebaseToken(null);
            setLoading(false);
          }
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(getFirebaseAuth());
      // Optional: Inform backend to clear any remaining cookies if needed
      await fetch(endPoints.logout, { method: "POST" });
      setUser(null);
      setFirebaseToken(null);
    } catch (error) {
      console.error("Logout error:", error);
      setError(error.message);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isLoggedIn: !!user,
    firebaseToken,
    refreshUser: async () => {
      return firebaseToken && getUserData(firebaseToken);
    },
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
