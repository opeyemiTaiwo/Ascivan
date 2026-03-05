// src/Pages/auth/AccountTypeSelection.jsx
// Shown after Google login — user picks Individual or Company/Organisation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Navbar from '../../components/Navbar';

const AccountTypeSelection = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const checkStatus = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          // If they already chose an account type, skip this page
          if (data.accountType) {
            // If profile not complete, send to onboarding
            if (!data.onboardingComplete) {
              navigate('/onboarding', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
            return;
          }
        }
      } catch (e) {
        console.error('Error checking account type:', e);
      }
      setChecking(false);
    };

    checkStatus();
  }, [currentUser, navigate]);

  const handleContinue = async () => {
    if (!selected || !currentUser) return;
    setSaving(true);

    try {
      const isCompany = selected === 'company';
      await updateDoc(doc(db, 'users', currentUser.uid), {
        accountType: selected,
        isCompany: isCompany,
      });

      // Send to onboarding to complete profile
      navigate('/onboarding', { replace: true });
    } catch (error) {
      console.error('Error saving account type:', error);
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col relative" style={{ backgroundColor: '#000' }}>
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-3 sm:px-4 relative z-10 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1.5 mb-3 animate-pulse">
              <div className="h-2 w-2 bg-orange-400 rounded-full"></div>
              <span className="text-orange-300 uppercase tracking-widest text-xs font-black"
                    style={{ textShadow: '0 0 20px rgba(251, 146, 60, 0.8)', fontFamily: '"Inter", sans-serif' }}>
                Getting Started
              </span>
              <div className="h-2 w-2 bg-orange-400 rounded-full"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3"
                style={{ fontFamily: '"Inter", sans-serif', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
              How will you use{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-green-400 to-orange-500">
                Loomiqe
              </span>
              ?
            </h1>
            <p className="text-gray-400 text-sm sm:text-base px-4">
              Choose your account type. This helps us personalize your experience.
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Individual */}
            <button
              type="button"
              onClick={() => setSelected('individual')}
              className={`relative p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-300 active:scale-[0.97] group ${
                selected === 'individual'
                  ? 'border-orange-400 bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent shadow-lg shadow-orange-500/10'
                  : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {selected === 'individual' && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="text-3xl sm:text-4xl mb-3">👤</div>
              <div className={`text-base sm:text-lg font-bold mb-1.5 ${selected === 'individual' ? 'text-white' : 'text-gray-200'}`}>
                Individual
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                I'm a student or job seeker looking for jobs, housing, finance resources, and community.
              </p>
            </button>

            {/* Company */}
            <button
              type="button"
              onClick={() => setSelected('company')}
              className={`relative p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-300 active:scale-[0.97] group ${
                selected === 'company'
                  ? 'border-orange-400 bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent shadow-lg shadow-orange-500/10'
                  : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {selected === 'company' && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="text-3xl sm:text-4xl mb-3">🏢</div>
              <div className={`text-base sm:text-lg font-bold mb-1.5 ${selected === 'company' ? 'text-white' : 'text-gray-200'}`}>
                Company / Organisation
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                I'm hiring, posting jobs, or representing an organization that supports international students.
              </p>
            </button>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selected || saving}
              className="w-full sm:w-auto px-10 py-3.5 min-h-[48px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : (
                'Continue →'
              )}
            </button>
          </div>

          <p className="text-gray-600 text-xs text-center mt-6">
            You can change this later from your profile settings.
          </p>
        </div>
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default AccountTypeSelection;
