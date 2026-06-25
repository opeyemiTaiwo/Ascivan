// src/components/DirectoryAccessControl.jsx - Responsive Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import MembersDirectory from '../Pages/MembersDirectory';

const DirectoryAccessControl = () => {
  const { currentUser } = useAuth();
  const [accessStatus, setAccessStatus] = useState('loading');
  const [userAccess, setUserAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check user access permissions
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        setAccessStatus('unauthorized');
        setLoading(false);
        return;
      }

      try {
        // Check if user has directory access
        const accessDoc = await getDoc(doc(db, 'directory_access', currentUser.email));
        
        if (accessDoc.exists()) {
          const accessData = accessDoc.data();
          const now = new Date();
          
          // Check if access is still valid
          if (accessData.accessType === 'manual_approval' && accessData.approved) {
            setAccessStatus('granted');
            setUserAccess(accessData);
          } else if (accessData.accessType === 'paid' && accessData.expiryDate?.toDate() > now) {
            setAccessStatus('granted');
            setUserAccess(accessData);
          } else if (accessData.accessType === 'paid' && accessData.expiryDate?.toDate() <= now) {
            setAccessStatus('expired');
            setUserAccess(accessData);
          } else if (accessData.accessType === 'manual_approval' && !accessData.approved) {
            setAccessStatus('pending');
            setUserAccess(accessData);
          } else {
            setAccessStatus('denied');
            setUserAccess(accessData);
          }
        } else {
          // No access record exists
          setAccessStatus('no_access');
        }
      } catch (error) {
        console.error('Error checking directory access:', error);
        setAccessStatus('error');
      }
      
      setLoading(false);
    };

    checkAccess();
  }, [currentUser]);

  // Request manual approval
  const requestManualApproval = async () => {
    try {
      // Create access request
      await setDoc(doc(db, 'directory_access', currentUser.email), {
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Unknown',
        userPhoto: currentUser.photoURL || null,
        accessType: 'manual_approval',
        approved: false,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });

      // Create admin notification
      await addDoc(collection(db, 'admin_notifications'), {
        type: 'directory_access_request',
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Unknown',
        message: `${currentUser.displayName || currentUser.email} has requested access to the Members Directory`,
        createdAt: serverTimestamp(),
        read: false
      });

      setAccessStatus('pending');
      toast.success('Access request submitted! We\'ll review your request within 24 hours.');
    } catch (error) {
      console.error('Error requesting access:', error);
      toast.error('Failed to submit access request. Please try again.');
    }
  };

  // Initialize payment process
  const initializePayment = async () => {
    try {
      // Create pending payment record
      await setDoc(doc(db, 'directory_access', currentUser.email), {
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Unknown',
        userPhoto: currentUser.photoURL || null,
        accessType: 'paid',
        approved: false,
        paymentStatus: 'pending',
        requestedAt: serverTimestamp(),
        status: 'payment_pending'
      });

      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  // Simulate payment completion (integrate with Stripe)
  const completePayment = async () => {
    try {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

      // Update access record with payment completion
      await setDoc(doc(db, 'directory_access', currentUser.email), {
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Unknown',
        userPhoto: currentUser.photoURL || null,
        accessType: 'paid',
        approved: true,
        paymentStatus: 'completed',
        purchasedAt: serverTimestamp(),
        expiryDate: expiryDate,
        status: 'active'
      });

      // Create payment record
      await addDoc(collection(db, 'payments'), {
        userEmail: currentUser.email,
        amount: 29.99, // Monthly fee
        currency: 'USD',
        purpose: 'directory_access',
        paymentMethod: 'stripe', // Replace with actual payment method
        status: 'completed',
        createdAt: serverTimestamp()
      });

      setAccessStatus('granted');
      setShowPaymentModal(false);
      toast.success('Payment successful! You now have access to the Members Directory.');
    } catch (error) {
      console.error('Error completing payment:', error);
      toast.error('Payment processing failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{}}
      >
        <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-orange-400 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-white text-base sm:text-lg">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // If user has access, show the Members Directory
  if (accessStatus === 'granted') {
    return <MembersDirectory />;
  }

  // Show access control UI for all other cases
  return (
    <div 
      className="min-h-screen overflow-hidden flex flex-col relative"
      style={{}}
    >

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" 
              style={{background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)'}}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center group cursor-pointer" onClick={() => window.location.href = '/'}>
              <img 
                src="/Images/512X512.png" 
                alt="Loomiqe Logo" 
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 transform flex-shrink-0"
              />
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <button 
                onClick={() => window.location.href = '/tech-badges'}
                className="text-white/90 hover:text-orange-400 font-semibold transition-colors text-xs sm:text-sm md:text-base"
              >
                Badges
              </button>
              <button 
                onClick={() => window.location.href = '/projects'}
                className="text-white/90 hover:text-orange-400 font-semibold transition-colors text-xs sm:text-sm md:text-base hidden xs:block"
              >
                Projects
              </button>
              {currentUser && (
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-white/90 hover:text-orange-400 font-semibold transition-colors text-xs sm:text-sm md:text-base hidden sm:block"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-4xl">
          
          {/* Access Control Content */}
          <div className="text-center">
            
            {/* Hero Section */}
            <div className="mb-8 sm:mb-10 md:mb-12">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">🔐</div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 px-2"
                  style={{
                    textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Premium Members Directory
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8 px-4"
                 style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
                Access our curated directory of verified tech professionals with proven project experience.
              </p>
            </div>

            {/* Status-specific Content */}
            {accessStatus === 'unauthorized' && (
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Login Required</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Please log in to access the Members Directory.</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:from-orange-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
                >
                  Login to Continue
                </button>
              </div>
            )}

            {accessStatus === 'no_access' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                
                {/* Request Manual Approval */}
                <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📋</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Request Access</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    Submit a request for manual approval. Perfect for verified recruiters and hiring managers.
                  </p>
                  <div className="mb-4 sm:mb-6">
                    <div className="text-orange-400 text-lg sm:text-xl font-semibold">Free</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Subject to approval</div>
                  </div>
                  <button 
                    onClick={requestManualApproval}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
                  >
                    Request Access
                  </button>
                </div>

                {/* Purchase Monthly Access */}
                <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 relative">
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                      POPULAR
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💳</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Monthly Access</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                    Get instant access to the complete directory with contact information and advanced filtering.
                  </p>
                  <div className="mb-4 sm:mb-6">
                    <div className="text-orange-400 text-2xl sm:text-3xl font-black">$29.99</div>
                    <div className="text-gray-400 text-xs sm:text-sm">per month</div>
                  </div>
                  <button 
                    onClick={initializePayment}
                    className="w-full bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold hover:from-orange-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
                  >
                    Get Instant Access
                  </button>
                </div>
              </div>
            )}

            {accessStatus === 'pending' && (
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">⏳</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Request Under Review</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Your access request is being reviewed by our team. You'll receive an email notification once approved.
                </p>
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-orange-500 text-xs sm:text-sm">
                    <strong>Need immediate access?</strong> Purchase monthly access below for instant activation.
                  </p>
                </div>
                <button 
                  onClick={initializePayment}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:from-orange-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Get Instant Access - $29.99/month</span>
                  <span className="sm:hidden">Get Access - $29.99/mo</span>
                </button>
              </div>
            )}

            {accessStatus === 'expired' && (
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔄</div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Access Expired</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Your monthly access has expired. Renew now to continue accessing the Members Directory.
                </p>
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-red-300 text-xs sm:text-sm">
                    <strong>Expired:</strong> {userAccess?.expiryDate?.toDate()?.toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={initializePayment}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:from-orange-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Renew Access - $29.99/month</span>
                  <span className="sm:hidden">Renew - $29.99/mo</span>
                </button>
              </div>
            )}

            {/* Features Section */}
            <div className="mt-12 sm:mt-14 md:mt-16 bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📧</div>
                  <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Direct Contact</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Email addresses of all verified members</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔍</div>
                  <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Advanced Search</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Filter by skills, badges, and experience</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
                  <h4 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Verified Profiles</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Badge-verified professionals with proven experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💳</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Complete Payment</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                Monthly access to the Members Directory
              </p>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="text-orange-400 text-xl sm:text-2xl font-bold">$29.99</div>
                <div className="text-gray-400 text-xs sm:text-sm">per month</div>
              </div>
              
              {/* Payment Form Placeholder */}
              <div className="bg-white/5 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/10">
                <p className="text-orange-500 text-xs sm:text-sm mb-3 sm:mb-4">
                  🔧 <strong>Integration Note:</strong> Replace this with Stripe payment form
                </p>
                <button 
                  onClick={completePayment}
                  className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:from-orange-600 hover:to-blue-600 transition-all duration-300 text-sm sm:text-base"
                >
                  Complete Payment (Demo)
                </button>
              </div>
              
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default DirectoryAccessControl;
