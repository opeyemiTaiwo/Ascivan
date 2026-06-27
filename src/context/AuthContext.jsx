// src/context/AuthContext.jsx - UPDATED with Auto-Subscribe to Both Digests
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced sign in with Google - includes auto email preferences setup
  const signInWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    
    try {
      // Use popup method (works across all browsers and privacy modes)
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🎯 CHECK IF USER IS NEW AND AUTO-SETUP EMAIL PREFERENCES
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        // If user document doesn't exist, create it with email preferences
        if (!userDoc.exists()) {
          console.log('🆕 New user detected - setting up email preferences');
          
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            
            // ✅ AUTO-SETUP EMAIL PREFERENCES FOR NEW USERS (BOTH DIGESTS ON)
            emailPreferences: {
              dailyDigest: true,       // 🔥 AUTO-SUBSCRIBE TO DAILY DIGEST
              weeklyDigest: true,      // 🔥 AUTO-SUBSCRIBE TO WEEKLY DIGEST  
              notifications: true,     // Platform notifications
              projectUpdates: true,    // Project-related updates
              communityUpdates: true,  // Community post updates
              marketing: false,        // Promotional emails OFF (respect privacy)
              announcements: true,     // Important updates ON
              lastUpdated: new Date()
            },
            
            // Additional user setup
            profileComplete: false,
            onboardingComplete: false,
            role: 'user',
            preferences: {
              theme: 'dark',
              language: 'en'
            }
          });
          
          console.log('✅ New user created with automatic email preferences (BOTH digests enabled)');
          console.log('📧 Auto-subscribed to: Daily Digest ✅ | Weekly Digest ✅');
        } else {
          // Existing user - update last login and check email preferences
          const userData = userDoc.data();
          
          await updateDoc(userDocRef, {
            lastLogin: serverTimestamp(),
            photoURL: user.photoURL || userData.photoURL // Update photo if changed
          });

          // 🔧 MIGRATION: Add or update email preferences for existing users
          if (!userData.emailPreferences) {
            console.log('🔄 Adding email preferences to existing user (BOTH digests enabled)');
            await updateDoc(userDocRef, {
              emailPreferences: {
                dailyDigest: true,       // 🔥 AUTO-SUBSCRIBE EXISTING USERS TO DAILY
                weeklyDigest: true,      // 🔥 AUTO-SUBSCRIBE EXISTING USERS TO WEEKLY
                notifications: true,
                projectUpdates: true,
                communityUpdates: true,
                marketing: false,
                announcements: true,
                lastUpdated: new Date()
              }
            });
            console.log('✅ Existing user auto-subscribed to both digests');
          } else {
            // 🔥 OPTIONAL: Auto-subscribe existing users who have dailyDigest = false
            const currentPrefs = userData.emailPreferences;
            if (currentPrefs.dailyDigest === false) {
              console.log('🔄 Enabling daily digest for existing user');
              await updateDoc(userDocRef, {
                'emailPreferences.dailyDigest': true,
                'emailPreferences.lastUpdated': new Date()
              });
              console.log('✅ Existing user auto-subscribed to daily digest');
            }
            
            // Ensure weekly digest is also enabled
            if (currentPrefs.weeklyDigest === false) {
              console.log('🔄 Enabling weekly digest for existing user');
              await updateDoc(userDocRef, {
                'emailPreferences.weeklyDigest': true,
                'emailPreferences.lastUpdated': new Date()
              });
              console.log('✅ Existing user auto-subscribed to weekly digest');
            }
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  // Helper function to get user data from Firestore
  const getUserData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Helper function to update user email preferences
  const updateEmailPreferences = async (uid, newPreferences) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        emailPreferences: {
          ...newPreferences,
          lastUpdated: new Date()
        }
      });
      console.log('✅ Email preferences updated successfully');
      return true;
    } catch (error) {
      console.error("Error updating email preferences:", error);
      throw error;
    }
  };

  // 🔥 NEW: Helper function to auto-subscribe a user to both digests
  const autoSubscribeToDigests = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        'emailPreferences.dailyDigest': true,
        'emailPreferences.weeklyDigest': true,
        'emailPreferences.lastUpdated': new Date()
      });
      console.log('✅ User auto-subscribed to both daily and weekly digests');
      return true;
    } catch (error) {
      console.error("Error auto-subscribing user:", error);
      throw error;
    }
  };

  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      // Push: if the user already granted notification permission, silently
      // (re)register this device's token and start listening for foreground pushes.
      if (user && typeof window !== 'undefined' && 'Notification' in window) {
        import('../utils/pushNotifications').then(({ enablePushForCurrentUser, listenForForegroundPush }) => {
          listenForForegroundPush();
          if (Notification.permission === 'granted') {
            enablePushForCurrentUser({ interactive: false });
          }
        }).catch(() => {});
      }
    });

    return unsubscribe;
  }, []);

  // Context value with all auth functions
  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    getUserData,
    updateEmailPreferences,
    autoSubscribeToDigests // 🔥 NEW: Add auto-subscribe function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
