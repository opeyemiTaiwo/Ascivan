// src/Pages/PremiumSuccess.jsx — Post-payment success page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PremiumBadge } from '../components/PremiumBadge';

const PremiumSuccess = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, pending, error
  const [plan, setPlan] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    let attempts = 0;
    const maxAttempts = 10;

    const checkPremium = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.membershipPlan === 'Premium') {
            setStatus('success');
            setPlan(data.premiumBillingCycle === 'yearly' ? 'Yearly' : 'Monthly');
            return;
          }
        }
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkPremium, 3000); // retry every 3s
        } else {
          setStatus('pending');
        }
      } catch (e) {
        setStatus('error');
      }
    };

    // Wait a moment for webhook to process, then start checking
    setTimeout(checkPremium, 2000);
  }, [currentUser]);

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      {status === 'checking' && (
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Activating your Premium membership...</h2>
          <p className="text-gray-500 text-sm">This usually takes a few seconds.</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Premium!</h2>
            <PremiumBadge size="md" />
          </div>
          <p className="text-gray-500 text-sm mb-6">{plan} plan activated. You now have full access to all Premium features.</p>
          <div className="space-y-3">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-all">
              Go to Dashboard
            </button>
            <button onClick={() => navigate('/talent-board')} className="w-full bg-white border border-gray-300 text-gray-700 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-all">
              Explore Talent Board
            </button>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div>
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Payment received</h2>
          <p className="text-gray-500 text-sm mb-6">Your payment is being processed. Premium features will activate shortly. If not active within a few minutes, please contact <a href="mailto:premium@loomiqe.com" className="text-blue-600 hover:underline">premium@loomiqe.com</a>.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all">
            Go to Dashboard
          </button>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p className="text-red-600 font-semibold mb-4">Something went wrong. Please contact <a href="mailto:premium@loomiqe.com" className="underline">premium@loomiqe.com</a>.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg">Go to Dashboard</button>
        </div>
      )}
    </div>
  );
};

export default PremiumSuccess;
