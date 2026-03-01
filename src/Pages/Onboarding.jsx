// src/Pages/Onboarding.jsx - One-time onboarding after Google login

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const TOTAL_STEPS = 4;

const Onboarding = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    university: '',
    major: '',
    visaStatus: '',
    city: '',
    state: '',
    interests: [],
  });

  const visaOptions = [
    { id: 'F-1', label: 'F-1 Student Visa' },
    { id: 'OPT', label: 'OPT (Optional Practical Training)' },
    { id: 'CPT', label: 'CPT (Curricular Practical Training)' },
    { id: 'H-1B', label: 'H-1B Work Visa' },
    { id: 'J-1', label: 'J-1 Exchange Visitor' },
    { id: 'PR', label: 'Permanent Resident (Green Card)' },
    { id: 'Citizen', label: 'US Citizen' },
    { id: 'Other', label: 'Other / Prefer not to say' },
  ];

  const interestOptions = [
    { id: 'jobs', label: '💼 Jobs', desc: 'Full-time, freelance & internships' },
    { id: 'housing', label: '🏠 Housing', desc: 'Apartments, rooms & studios' },
    { id: 'banking', label: '💳 Banking', desc: 'Accounts, insurance & finance' },
    { id: 'community', label: '🤝 Community', desc: 'Connect with other students' },
  ];

  // Pre-fill name from Google
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
      }));
    }
  }, [currentUser]);

  // If already onboarded, skip
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists() && snap.data().onboardingComplete) {
        navigate('/dashboard', { replace: true });
      }
    };
    checkOnboarding();
  }, [currentUser, navigate]);

  const toggleInterest = (id) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (step === 3 && !formData.visaStatus) {
      toast.error('Please select your visa status');
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSkip = async () => {
    await saveOnboarding(true);
  };

  const handleComplete = async () => {
    if (formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }
    await saveOnboarding(false);
  };

  const saveOnboarding = async (skipped = false) => {
    if (!currentUser) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: formData.displayName.trim() || currentUser.displayName || '',
        university: formData.university.trim() || null,
        major: formData.major.trim() || null,
        visaStatus: formData.visaStatus || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        interests: formData.interests,
        onboardingComplete: true,
        onboardingSkipped: skipped,
        onboardingCompletedAt: new Date(),
        profileComplete: !skipped,
      });

      toast.success(skipped ? 'Welcome to Loomiq! You can complete your profile later.' : 'Welcome to Loomiq! 🎉');

      // Redirect to the most relevant section based on interests
      const firstInterest = formData.interests[0];
      const redirectMap = {
        'jobs': '/hub',
        'housing': '/housing',
        'banking': '/banking',
        'community': '/community',
      };
      const destination = firstInterest ? (redirectMap[firstInterest] || '/dashboard') : '/dashboard';
      navigate(destination, { replace: true });

    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[44px] text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm transition-all";
  const labelClass = "block text-orange-400 font-semibold mb-2 text-sm";

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col items-center justify-center px-4 py-8 sm:py-12"
      style={{ backgroundColor: '#000000' }}>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/Images/512X512.png" alt="Loomiq" className="w-8 h-8" onError={e => e.target.style.display='none'} />
        <span className="text-white font-black text-xl sm:text-2xl">Loomiq</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden" style={{maxWidth: "min(512px, calc(100vw - 2rem))"}}>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 sm:p-6 md:p-8">

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
              Step {step} of {TOTAL_STEPS}
            </span>
            {step < TOTAL_STEPS && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-200 text-xs font-semibold transition-colors"
              >
                Complete Later →
              </button>
            )}
          </div>

          {/* ─── STEP 1: Name & University ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">
                  Welcome! 👋
                </h2>
                <p className="text-gray-400 text-sm">Let's set up your profile. This takes less than a minute.</p>
              </div>

              <div>
                <label className={labelClass}>Your Name *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))}
                  className={inputClass}
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>

              <div>
                <label className={labelClass}>University / Institution</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={e => setFormData(p => ({ ...p, university: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g., Morgan State University"
                />
              </div>

              <div>
                <label className={labelClass}>Field of Study / Major</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={e => setFormData(p => ({ ...p, major: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>
          )}

          {/* ─── STEP 2: Location ─── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">
                  Where are you based? 📍
                </h2>
                <p className="text-gray-400 text-sm">We'll use this to show you relevant local jobs and housing.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g., Baltimore"
                    autoFocus
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g., MD"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400">
                <span className="text-orange-400 font-semibold">💡 Why we ask:</span> Your location pre-fills job and housing filters automatically so you only see relevant results near you.
              </div>
            </div>
          )}

          {/* ─── STEP 3: Visa Status ─── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">
                  Visa Status 🛂
                </h2>
                <p className="text-gray-400 text-sm">Helps us show only jobs and services that apply to you.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visaOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, visaStatus: option.id }))}
                    className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      formData.visaStatus === option.id
                        ? 'border-orange-400 bg-orange-500/20 text-white shadow-lg'
                        : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400">
                <span className="text-orange-400 font-semibold">🔒 Privacy:</span> Your visa status is only used to personalize your experience. It's never shared publicly.
              </div>
            </div>
          )}

          {/* ─── STEP 4: Interests ─── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">
                  What are you looking for? ✨
                </h2>
                <p className="text-gray-400 text-sm">Select all that apply. You can always explore everything.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map(option => {
                  const selected = formData.interests.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleInterest(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                        selected
                          ? 'border-orange-400 bg-orange-500/20 shadow-lg scale-105'
                          : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className={`text-base font-bold mb-1 ${selected ? 'text-white' : 'text-gray-200'}`}>
                        {option.label}
                      </div>
                      <div className="text-gray-400 text-xs">{option.desc}</div>
                      {selected && (
                        <div className="mt-2 text-orange-400 text-xs font-semibold">✓ Selected</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`flex mt-8 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 min-h-[44px] bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all"
              >
                ← Back
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="px-8 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-orange-500/30"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-8 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 30px rgba(249,115,22,0.3)' }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Setting up...
                  </span>
                ) : "Let's Go! 🚀"}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i + 1 === step
                ? 'w-6 h-2 bg-orange-500'
                : i + 1 < step
                ? 'w-2 h-2 bg-orange-400/60'
                : 'w-2 h-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-4">
        © {new Date().getFullYear()} Loomiq. All rights reserved.
      </p>
    </div>
  );
};

export default Onboarding;
