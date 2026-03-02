// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration for Loomiqe
const firebaseConfig = {
  apiKey: "AIzaSyAWytpAg0Lb7nw5sndNu5t1YAij_uRqqXs",
  authDomain: "loomiq-8c3e9.firebaseapp.com",
  projectId: "loomiq-8c3e9",
  storageBucket: "loomiq-8c3e9.firebasestorage.app",
  messagingSenderId: "906774108626",
  appId: "1:906774108626:web:d207a2f9387bc32250500b",
  measurementId: "G-NMJPKGW72W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configure auth persistence to handle Safari storage issues
const configurePersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("Local persistence failed, falling back to session:", error);
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch (sessionError) {
      console.warn("Session persistence also failed:", sessionError);
    }
  }
};

// Call persistence configuration
configurePersistence();

// Safari and mobile detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);
const isChrome = /Chrome/i.test(navigator.userAgent);
const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isSafariMobile = isSafari && isMobile;
const isAndroidMobile = isAndroid && isMobile;
const isMobileWithStorageIssues = isSafariMobile || isAndroidMobile || isSamsungBrowser;

// Enhanced sign-in function that handles Safari issues
export const signInWithProvider = async (provider) => {
  try {
    if (isMobileWithStorageIssues) {
      console.log("Mobile browser with potential storage issues detected - using popup authentication");
      return await signInWithPopup(auth, provider);
    } else {
      console.log("Using redirect authentication");
      return await signInWithRedirect(auth, provider);
    }
  } catch (error) {
    console.error("Auth error:", error);
    
    switch (error.code) {
      case 'auth/missing-initial-state':
      case 'auth/web-storage-unsupported':
        try {
          console.log("Storage issue detected - falling back to popup authentication");
          return await signInWithPopup(auth, provider);
        } catch (popupError) {
          console.error("Popup fallback also failed:", popupError);
          throw new Error("Authentication failed due to browser storage restrictions. Please try refreshing the page or using a different browser.");
        }

      case 'auth/popup-blocked':
        throw new Error("Popup was blocked. Please allow popups for this site and try again.");
      
      case 'auth/popup-closed-by-user':
        throw new Error("Sign-in was cancelled. Please try again.");
      
      case 'auth/cancelled-popup-request':
        console.log("Multiple popup request cancelled");
        return null;
      
      case 'auth/network-request-failed':
        throw new Error("Network error. Please check your internet connection and try again.");
      
      case 'auth/too-many-requests':
        throw new Error("Too many failed attempts. Please try again later.");
      
      case 'auth/user-disabled':
        throw new Error("This account has been disabled. Please contact support.");
      
      case 'auth/operation-not-allowed':
        throw new Error("This sign-in method is not enabled. Please contact support.");
      
      case 'auth/invalid-credential':
        throw new Error("Invalid credentials. Please try again.");
      
      case 'auth/account-exists-with-different-credential':
        throw new Error("An account already exists with this email using a different sign-in method.");
      
      default:
        throw new Error(`Authentication failed: ${error.message || 'Unknown error'}`);
    }
  }
};

// Handle auth state recovery and redirect results
const handleAuthRecovery = () => {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log("Redirect authentication successful:", result.user.uid);
      }
    })
    .catch((error) => {
      console.error("Redirect result error:", error);
      
      switch (error.code) {
        case 'auth/missing-initial-state':
        case 'auth/web-storage-unsupported':
          auth.signOut().then(() => {
            console.log("Cleared stale auth state due to storage issues");
          }).catch(signOutError => {
            console.error("Failed to clear auth state:", signOutError);
          });
          break;
        
        case 'auth/network-request-failed':
          console.log("Network error during auth recovery - will retry on next page load");
          break;
        
        default:
          console.error("Unhandled auth recovery error:", error);
      }
    });
};

// Utility function to get user-friendly error messages
export const getAuthErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  switch (error?.code) {
    case 'auth/missing-initial-state':
    case 'auth/web-storage-unsupported':
      if (isAndroidMobile) {
        return "Android browser storage issue detected. Please try refreshing the page, clearing browser data, or using Chrome browser.";
      } else if (isSafariMobile) {
        return "Safari mobile storage issue detected. Please try refreshing the page or enabling cross-site tracking in Safari settings.";
      } else {
        return "Browser storage issue detected. Please try refreshing the page or using a different browser.";
      }
    
    case 'auth/popup-blocked':
      return "Popup was blocked by your browser. Please allow popups for this site and try again.";
    
    case 'auth/popup-closed-by-user':
      return "Sign-in was cancelled. Please try again.";
    
    case 'auth/network-request-failed':
      return "Network error. Please check your internet connection and try again.";
    
    case 'auth/too-many-requests':
      return "Too many failed attempts. Please wait a few minutes and try again.";
    
    case 'auth/user-disabled':
      return "This account has been disabled. Please contact support.";
    
    case 'auth/operation-not-allowed':
      return "This sign-in method is not enabled. Please contact support.";
    
    case 'auth/invalid-credential':
      return "Invalid credentials. Please try signing in again.";
    
    case 'auth/account-exists-with-different-credential':
      return "An account already exists with this email using a different sign-in method. Please try signing in with that method.";
    
    default:
      return error?.message || "An unexpected error occurred. Please try again.";
  }
};

// Initialize auth recovery on load
if (typeof window !== 'undefined') {
  handleAuthRecovery();
}

// Enhanced auth state listener
export const setupAuthListener = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User authenticated:", user.uid);
      callback(user);
    } else {
      console.log("User not authenticated");
      callback(null);
    }
  });
};

// Utility function to check if current browser is Safari mobile
export const isSafariMobileDevice = () => isSafariMobile;

// Utility function to check if current browser is Android mobile  
export const isAndroidMobileDevice = () => isAndroidMobile;

// Utility function to check if current browser has known storage issues
export const hasPotentialStorageIssues = () => isMobileWithStorageIssues;
