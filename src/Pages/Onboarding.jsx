// src/Pages/Onboarding.jsx - Account-type-aware onboarding after Google login

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import IdVerification from '../components/IdVerification';

const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'zoho.com', 'yandex.com',
  'mail.com', 'gmx.com', 'fastmail.com', 'tutanota.com',
];

const isBusinessEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return !BLOCKED_EMAIL_DOMAINS.includes(domain);
};

const Onboarding = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    university: '',
    major: '',
    visaStatus: '',
    city: '',
    state: '',
    interests: [],
    studentType: '', // 'international' | 'domestic'
    portfolioUrl: '',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
    companyLocation: '',
    companyDescription: '',
    idVerification: null, // will hold ID data if submitted
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

  const individualInterests = [
    { id: 'jobs', label: 'Jobs', desc: 'Full-time, freelance & internships' },
    { id: 'housing', label: 'Housing', desc: 'Apartments, rooms & studios' },
    { id: 'banking', label: 'Finance', desc: 'Scholarships, loans, aid & banking' },
    { id: 'community', label: 'Community', desc: 'Connect with other students' },
  ];

  const companyInterests = [
    { id: 'jobs', label: 'Post Jobs', desc: 'Post opportunities for students' },
    { id: 'housing', label: 'Post Listings', desc: 'List housing for students' },
    { id: 'community', label: 'Community', desc: 'Engage with student community' },
    { id: 'directory', label: 'Directory', desc: 'Connect with student talent' },
  ];

  const isCompany = accountType === 'company';
  const TOTAL_STEPS = isCompany ? 5 : 6; // Last step is optional ID verification

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, displayName: currentUser.displayName || '' }));
    }
  }, [currentUser]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.onboardingComplete) {
            navigate('/dashboard', { replace: true });
            return;
          }
          if (!data.accountType) {
            navigate('/account-type', { replace: true });
            return;
          }
          setAccountType(data.accountType);
        } else {
          navigate('/account-type', { replace: true });
          return;
        }
      } catch (e) {
        console.error('Error checking onboarding:', e);
      }
      setLoading(false);
    };
    checkStatus();
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
    if (isCompany) {
      if (step === 1 && !formData.displayName.trim()) { toast.error('Please enter your name'); return; }
      if (step === 2) {
        if (!formData.companyName.trim()) { toast.error('Please enter your company name'); return; }
        if (!formData.companyEmail.trim()) { toast.error('Please enter your business email'); return; }
        if (!isBusinessEmail(formData.companyEmail)) { toast.error('Please use a business email (not Gmail, Yahoo, Outlook, etc.)'); return; }
      }
      if (step === 4 && formData.interests.length === 0) { toast.error('Please select at least one interest'); return; }
    } else {
      // Individual: step 1=studentType, 2=name/uni/major/portfolio, 3=location, 4=visa(intl only), 5=interests
      if (step === 1 && !formData.studentType) { toast.error('Please select your student type'); return; }
      if (step === 2 && !formData.displayName.trim()) { toast.error('Please enter your name'); return; }
      if (step === 4 && formData.studentType === 'international' && !formData.visaStatus) { toast.error('Please select your visa status'); return; }
      if (step === 5 && formData.interests.length === 0) { toast.error('Please select at least one interest'); return; }
      // Domestic students skip visa step (step 4) — jump from 3 to 5
      if (step === 3 && formData.studentType === 'domestic') {
        setStep(5); return;
      }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    // Domestic students skip step 4 (visa), go from 5 back to 3
    if (!isCompany && step === 5 && formData.studentType === 'domestic') {
      setStep(3); return;
    }
    setStep(s => s - 1);
  };

  const handleSkip = async () => { await saveOnboarding(true); };

  const handleComplete = async () => {
    if (isCompany) {
      if (!formData.companyName.trim()) { toast.error('Please enter your company name'); return; }
      if (!formData.companyEmail.trim()) { toast.error('Please enter your business email'); return; }
      if (!isBusinessEmail(formData.companyEmail)) { toast.error('Please use a business email (not Gmail, Yahoo, Outlook, etc.)'); return; }
    }
    await saveOnboarding(false);
  };

  const saveOnboarding = async (skipped = false) => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const updateData = {
        displayName: formData.displayName.trim() || currentUser.displayName || '',
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        interests: formData.interests,
        isCompany: isCompany,
        onboardingComplete: true,
        onboardingSkipped: skipped,
        onboardingCompletedAt: new Date(),
        profileComplete: !skipped,
      };
      if (isCompany) {
        updateData.companyProfile = {
          companyName: formData.companyName.trim(),
          companyWebsite: formData.companyWebsite.trim() || null,
          companyEmail: formData.companyEmail.trim(),
          companyLocation: formData.companyLocation.trim() || null,
          companyDescription: formData.companyDescription.trim() || null,
          verifiedAt: null,
          createdAt: new Date(),
        };
      } else {
        updateData.university = formData.university.trim() || null;
        updateData.major = formData.major.trim() || null;
        updateData.visaStatus = formData.visaStatus || null;
        updateData.studentType = formData.studentType || 'international';
        updateData.portfolioUrl = formData.portfolioUrl.trim() || null;
      }
      // Save ID verification if provided
      if (formData.idVerification) {
        updateData.idVerification = formData.idVerification;
      }
      await updateDoc(doc(db, 'users', currentUser.uid), updateData);
      toast.success(skipped ? 'Welcome to Loomiqe! You can complete your profile later.' : 'Welcome to Loomiqe!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  const progress = (step / TOTAL_STEPS) * 100;
  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[44px] text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm transition-all";
  const labelClass = "block text-orange-400 font-semibold mb-2 text-sm";

  const renderIndividualStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Are you an international or domestic student?</h2>
              <p className="text-gray-400 text-sm">This helps us personalize your dashboard experience.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData(p => ({ ...p, studentType: 'international' }))}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  formData.studentType === 'international' ? 'border-orange-400 bg-orange-500/20 shadow-lg' : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                }`}>
                <div className={`text-base font-bold mb-1 ${formData.studentType === 'international' ? 'text-white' : 'text-gray-200'}`}>International Student</div>
                <div className="text-gray-400 text-xs">Studying abroad, away from my home country</div>
                {formData.studentType === 'international' && <div className="mt-2 text-orange-400 text-xs font-semibold">Selected</div>}
              </button>
              <button type="button" onClick={() => setFormData(p => ({ ...p, studentType: 'domestic' }))}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                  formData.studentType === 'domestic' ? 'border-orange-400 bg-orange-500/20 shadow-lg' : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                }`}>
                <div className={`text-base font-bold mb-1 ${formData.studentType === 'domestic' ? 'text-white' : 'text-gray-200'}`}>Domestic Student</div>
                <div className="text-gray-400 text-xs">Studying in my home country</div>
                {formData.studentType === 'domestic' && <div className="mt-2 text-orange-400 text-xs font-semibold">Selected</div>}
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Welcome!</h2>
              <p className="text-gray-400 text-sm">Let's set up your profile. This takes less than a minute.</p>
            </div>
            <div>
              <label className={labelClass}>Your Name *</label>
              <input type="text" value={formData.displayName} onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))} className={inputClass} placeholder="Enter your full name" autoFocus />
            </div>
            <div>
              <label className={labelClass}>University / Institution</label>
              <input type="text" value={formData.university} onChange={e => setFormData(p => ({ ...p, university: e.target.value }))} className={inputClass} placeholder="e.g., Morgan State University" />
            </div>
            <div>
              <label className={labelClass}>Field of Study / Major</label>
              <input type="text" value={formData.major} onChange={e => setFormData(p => ({ ...p, major: e.target.value }))} className={inputClass} placeholder="e.g., Computer Science" />
            </div>
            <div>
              <label className={labelClass}>Portfolio URL</label>
              <input type="url" value={formData.portfolioUrl} onChange={e => setFormData(p => ({ ...p, portfolioUrl: e.target.value }))} className={inputClass} placeholder="https://your-portfolio.com" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Where are you based?</h2>
              <p className="text-gray-400 text-sm">We'll use this to show you relevant local opportunities.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>City</label>
                <input type="text" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} className={inputClass} placeholder="e.g., Baltimore" autoFocus />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelClass}>State / Region</label>
                <input type="text" value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} className={inputClass} placeholder="e.g., MD" />
              </div>
            </div>
          </div>
        );
      case 4:
        // Visa step — only for international students
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Visa Status</h2>
              <p className="text-gray-400 text-sm">Helps us show only jobs and services that apply to you.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visaOptions.map(option => (
                <button key={option.id} type="button" onClick={() => setFormData(p => ({ ...p, visaStatus: option.id }))}
                  className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    formData.visaStatus === option.id ? 'border-orange-400 bg-orange-500/20 text-white shadow-lg' : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30'
                  }`}>{option.label}</button>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400">
              <span className="text-orange-400 font-semibold">Privacy:</span> Your visa status is only used to personalize your experience. It's never shared publicly.
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">What are you looking for?</h2>
              <p className="text-gray-400 text-sm">Select all that apply. You can always explore everything.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {individualInterests.map(option => {
                const sel = formData.interests.includes(option.id);
                return (
                  <button key={option.id} type="button" onClick={() => toggleInterest(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                      sel ? 'border-orange-400 bg-orange-500/20 shadow-lg scale-105' : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                    }`}>
                    <div className={`text-base font-bold mb-1 ${sel ? 'text-white' : 'text-gray-200'}`}>{option.label}</div>
                    <div className="text-gray-400 text-xs">{option.desc}</div>
                    {sel && <div className="mt-2 text-orange-400 text-xs font-semibold">Selected</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">ID Verification (Optional)</h2>
              <p className="text-gray-400 text-sm">Upload a valid government-issued ID. You can skip this and do it later from your profile.</p>
            </div>
            {formData.idVerification ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <p className="text-green-300 font-semibold text-sm">ID information saved</p>
                <p className="text-gray-400 text-xs mt-1">You can update this from your profile settings</p>
              </div>
            ) : (
              <IdVerification
                onSave={(data) => setFormData(p => ({ ...p, idVerification: data }))}
                inputClass={inputClass}
                labelClass={labelClass}
              />
            )}
          </div>
        );
      default: return null;
    }
  };

  const renderCompanyStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Welcome!</h2>
              <p className="text-gray-400 text-sm">Let's set up your company profile. This takes less than a minute.</p>
            </div>
            <div>
              <label className={labelClass}>Your Name *</label>
              <input type="text" value={formData.displayName} onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))} className={inputClass} placeholder="Enter your full name" autoFocus />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Company Details</h2>
              <p className="text-gray-400 text-sm">Tell us about your organization.</p>
            </div>
            <div>
              <label className={labelClass}>Company Name *</label>
              <input type="text" value={formData.companyName} onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))} className={inputClass} placeholder="e.g., TechStart Inc." autoFocus />
            </div>
            <div>
              <label className={labelClass}>Business Email *</label>
              <input type="email" value={formData.companyEmail} onChange={e => setFormData(p => ({ ...p, companyEmail: e.target.value }))}
                className={`${inputClass} ${formData.companyEmail && !isBusinessEmail(formData.companyEmail) ? 'border-red-500/50 focus:border-red-400' : ''}`}
                placeholder="you@company.com" />
              {formData.companyEmail && !isBusinessEmail(formData.companyEmail) && (
                <p className="text-red-400 text-xs mt-1.5 font-semibold">Please use a business email — Gmail, Yahoo, Outlook, etc. are not accepted.</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Must be a company domain (not Gmail, Yahoo, Outlook, etc.)</p>
            </div>
            <div>
              <label className={labelClass}>Company Website</label>
              <input type="url" value={formData.companyWebsite} onChange={e => setFormData(p => ({ ...p, companyWebsite: e.target.value }))} className={inputClass} placeholder="https://company.com" />
            </div>
            <div>
              <label className={labelClass}>Brief Description</label>
              <textarea value={formData.companyDescription} onChange={e => setFormData(p => ({ ...p, companyDescription: e.target.value }))} className={inputClass + " resize-none"} rows="3" placeholder="What does your company do? (optional)" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">Where is your company based?</h2>
              <p className="text-gray-400 text-sm">Helps students find opportunities near them.</p>
            </div>
            <div>
              <label className={labelClass}>Company Location</label>
              <input type="text" value={formData.companyLocation} onChange={e => setFormData(p => ({ ...p, companyLocation: e.target.value }))} className={inputClass} placeholder="e.g., Baltimore, MD or Remote" autoFocus />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} className={inputClass} placeholder="e.g., Baltimore" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input type="text" value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} className={inputClass} placeholder="e.g., MD" maxLength={2} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">What will you use Loomiqe for?</h2>
              <p className="text-gray-400 text-sm">Select all that apply.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyInterests.map(option => {
                const sel = formData.interests.includes(option.id);
                return (
                  <button key={option.id} type="button" onClick={() => toggleInterest(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                      sel ? 'border-orange-400 bg-orange-500/20 shadow-lg scale-105' : 'border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                    }`}>
                    <div className={`text-base font-bold mb-1 ${sel ? 'text-white' : 'text-gray-200'}`}>{option.label}</div>
                    <div className="text-gray-400 text-xs">{option.desc}</div>
                    {sel && <div className="mt-2 text-orange-400 text-xs font-semibold">Selected</div>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1">ID Verification (Optional)</h2>
              <p className="text-gray-400 text-sm">Upload a valid government-issued ID. You can skip this and do it later from your profile.</p>
            </div>
            {formData.idVerification ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <p className="text-green-300 font-semibold text-sm">ID information saved</p>
                <p className="text-gray-400 text-xs mt-1">You can update this from your profile settings</p>
              </div>
            ) : (
              <IdVerification
                onSave={(data) => setFormData(p => ({ ...p, idVerification: data }))}
                inputClass={inputClass}
                labelClass={labelClass}
              />
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col items-center justify-center px-4 py-8 sm:py-12" style={{ backgroundColor: '#000000' }}>
      <div className="flex items-center gap-2 mb-8">
        <img src="/Images/512X512.png" alt="Loomiqe" className="w-8 h-8" onError={e => e.target.style.display='none'} />
        <span className="text-white font-black text-xl sm:text-2xl">Loomiqe</span>
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
          isCompany
            ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
            : 'bg-green-500/20 text-green-300 border-green-500/30'
        }`}>
          {isCompany ? 'Company Account' : 'Individual Account'}
        </span>
      </div>

      <div className="w-full max-w-lg mx-4 bg-white/5 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full h-1 bg-white/10">
          <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</span>
            {step < TOTAL_STEPS && (
              <button onClick={handleSkip} className="text-gray-400 hover:text-gray-200 text-xs font-semibold transition-colors">Complete Later →</button>
            )}
          </div>

          {isCompany ? renderCompanyStep() : renderIndividualStep()}

          <div className={`flex mt-8 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <button onClick={handleBack} className="px-5 py-2.5 min-h-[44px] bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all">← Back</button>
            )}
            {step < TOTAL_STEPS ? (
              <button onClick={handleNext} className="px-8 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-orange-500/30">Next →</button>
            ) : (
              <button onClick={handleComplete} disabled={saving}
                className="px-8 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (<span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Setting up...</span>) : "Let's Go!"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 h-2 bg-orange-500' : i + 1 < step ? 'w-2 h-2 bg-orange-400/60' : 'w-2 h-2 bg-white/20'}`} />
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} Loomiqe. All rights reserved.</p>
    </div>
  );
};

export default Onboarding;
