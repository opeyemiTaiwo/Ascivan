// src/Pages/Onboarding.jsx - Account-type-aware onboarding for tech professionals

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

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
    experienceLevel: '', // 'beginner' | 'intermediate' | 'advanced' | 'expert'
    primarySkillTrack: '', // TechMO, TechQA, TechDev, TechLeads, TechArchs, TechGuard
    specialization: '',
    yearsOfExperience: '',
    city: '',
    state: '',
    interests: [],
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    companyName: '',
    companyWebsite: '',
    companyEmail: '',
    companyLocation: '',
    companyDescription: '',
  });

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', desc: 'Just getting started in tech, learning fundamentals' },
    { id: 'intermediate', label: 'Intermediate', desc: '1-3 years of experience, building skills' },
    { id: 'advanced', label: 'Advanced', desc: '3-7 years of experience, strong contributor' },
    { id: 'expert', label: 'Expert', desc: '7+ years of experience, leading and mentoring' },
  ];

  const skillTracks = [
    { id: 'TechDev', label: 'Development', desc: 'Frontend, backend, mobile, full-stack' },
    { id: 'TechQA', label: 'Quality Assurance', desc: 'Testing, code reviews, quality control' },
    { id: 'TechMO', label: 'Project Management', desc: 'Timelines, deliverables, stakeholders' },
    { id: 'TechArchs', label: 'Architecture', desc: 'System design, scalability, infrastructure' },
    { id: 'TechLeads', label: 'Leadership', desc: 'Team management, mentoring, decisions' },
    { id: 'TechGuard', label: 'Cybersecurity', desc: 'Security, compliance, resilience' },
  ];

  const individualInterests = [
    { id: 'projects', label: 'Projects', desc: 'Join real-world collaborative projects' },
    { id: 'jobs', label: 'Jobs', desc: 'Full-time, freelance, and contract roles' },
    { id: 'community', label: 'Community', desc: 'Connect with tech professionals' },
    { id: 'badges', label: 'Badges', desc: 'Earn verified TechTalent credentials' },
  ];

  const companyInterests = [
    { id: 'jobs', label: 'Post Jobs', desc: 'Post opportunities for tech talent' },
    { id: 'projects', label: 'Post Projects', desc: 'Find collaborators for projects' },
    { id: 'community', label: 'Community', desc: 'Engage with the tech community' },
    { id: 'directory', label: 'Talent Board', desc: 'Discover and recruit verified talent' },
  ];

  const isCompany = accountType === 'company';
  const TOTAL_STEPS = isCompany ? 4 : 4;

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
      // Individual: step 1=experience level, 2=name/profile/links, 3=location, 4=interests
      if (step === 1 && !formData.experienceLevel) { toast.error('Please select your experience level'); return; }
      if (step === 2) {
        if (!formData.displayName.trim()) { toast.error('Please enter your name'); return; }
        if (!formData.linkedinUrl.trim()) { toast.error('Please enter your LinkedIn URL'); return; }
      }
      if (step === 4 && formData.interests.length === 0) { toast.error('Please select at least one interest'); return; }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  const handleSkip = async () => {
    try { await saveOnboarding(true); } catch (err) { console.error('Error skipping onboarding:', err); toast.error('Something went wrong. Please try again.'); }
  };

  const handleComplete = async () => {
    if (isCompany) {
      if (!formData.companyName.trim()) { toast.error('Please enter your company name'); return; }
      if (!formData.companyEmail.trim()) { toast.error('Please enter your business email'); return; }
      if (!isBusinessEmail(formData.companyEmail)) { toast.error('Please use a business email (not Gmail, Yahoo, Outlook, etc.)'); return; }
    }
    try { await saveOnboarding(false); } catch (err) { console.error('Error completing onboarding:', err); toast.error('Something went wrong. Please try again.'); }
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
        updateData.experienceLevel = formData.experienceLevel || null;
        updateData.primarySkillTrack = formData.primarySkillTrack || null;
        updateData.specialization = formData.specialization.trim() || null;
        updateData.yearsOfExperience = formData.yearsOfExperience || null;
        updateData.portfolioUrl = formData.portfolioUrl.trim() || null;
        updateData.linkedinUrl = formData.linkedinUrl.trim() || null;
        updateData.githubUrl = formData.githubUrl.trim() || null;
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progress = (step / TOTAL_STEPS) * 100;
  const inputClass = "w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 min-h-[44px] text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm transition-all";
  const labelClass = "block text-blue-600 font-semibold mb-2 text-sm";

  const renderIndividualStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">What is your experience level?</h2>
              <p className="text-gray-500 text-sm">This helps us match you with the right projects and resources.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {experienceLevels.map(option => (
                <button key={option.id} type="button" onClick={() => setFormData(p => ({ ...p, experienceLevel: option.id }))}
                  className={`p-5 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.97] ${
                    formData.experienceLevel === option.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}>
                  <div className={`text-base font-bold mb-1 ${formData.experienceLevel === option.id ? 'text-gray-900' : 'text-gray-700'}`}>{option.label}</div>
                  <div className="text-gray-500 text-xs">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Your Profile</h2>
              <p className="text-gray-500 text-sm">This takes less than a minute.</p>
            </div>
            <div>
              <label className={labelClass}>Your Name *</label>
              <input type="text" value={formData.displayName} onChange={e => setFormData(p => ({ ...p, displayName: e.target.value }))} className={inputClass} placeholder="Enter your full name" autoFocus />
            </div>
            <div>
              <label className={labelClass}>Primary Skill Track</label>
              <select value={formData.primarySkillTrack} onChange={e => setFormData(p => ({ ...p, primarySkillTrack: e.target.value }))} className={inputClass}>
                <option value="">Select a track (optional)</option>
                {skillTracks.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Specialization</label>
              <input type="text" value={formData.specialization} onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))} className={inputClass} placeholder="e.g., React, Python, AWS, DevOps" />
            </div>
            <div>
              <label className={labelClass}>LinkedIn URL *</label>
              <input type="url" value={formData.linkedinUrl} onChange={e => setFormData(p => ({ ...p, linkedinUrl: e.target.value }))} className={inputClass} placeholder="https://linkedin.com/in/your-profile" />
            </div>
            <div>
              <label className={labelClass}>GitHub URL</label>
              <input type="url" value={formData.githubUrl} onChange={e => setFormData(p => ({ ...p, githubUrl: e.target.value }))} className={inputClass} placeholder="https://github.com/your-username" />
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Where are you based?</h2>
              <p className="text-gray-500 text-sm">Helps us show you relevant local opportunities.</p>
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
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">What are you looking for?</h2>
              <p className="text-gray-500 text-sm">Select all that apply. You can always explore everything.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {individualInterests.map(option => {
                const sel = formData.interests.includes(option.id);
                return (
                  <button key={option.id} type="button" onClick={() => toggleInterest(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.97] ${
                      sel ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}>
                    <div className={`text-base font-bold mb-1 ${sel ? 'text-gray-900' : 'text-gray-700'}`}>{option.label}</div>
                    <div className="text-gray-500 text-xs">{option.desc}</div>
                  </button>
                );
              })}
            </div>
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Welcome!</h2>
              <p className="text-gray-500 text-sm">Let's set up your company profile. This takes less than a minute.</p>
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Company Details</h2>
              <p className="text-gray-500 text-sm">Tell us about your organization.</p>
            </div>
            <div>
              <label className={labelClass}>Company Name *</label>
              <input type="text" value={formData.companyName} onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))} className={inputClass} placeholder="e.g., TechStart Inc." autoFocus />
            </div>
            <div>
              <label className={labelClass}>Business Email *</label>
              <input type="email" value={formData.companyEmail} onChange={e => setFormData(p => ({ ...p, companyEmail: e.target.value }))}
                className={`${inputClass} ${formData.companyEmail && !isBusinessEmail(formData.companyEmail) ? 'border-red-400 focus:border-red-500' : ''}`}
                placeholder="you@company.com" />
              {formData.companyEmail && !isBusinessEmail(formData.companyEmail) && (
                <p className="text-red-500 text-xs mt-1.5 font-semibold">Please use a business email -- Gmail, Yahoo, Outlook, etc. are not accepted.</p>
              )}
              <p className="text-gray-400 text-xs mt-1">Must be a company domain (not Gmail, Yahoo, Outlook, etc.)</p>
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">Where is your company based?</h2>
              <p className="text-gray-500 text-sm">Helps professionals find opportunities near them.</p>
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">What will you use Loomiqe for?</h2>
              <p className="text-gray-500 text-sm">Select all that apply.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyInterests.map(option => {
                const sel = formData.interests.includes(option.id);
                return (
                  <button key={option.id} type="button" onClick={() => toggleInterest(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.97] ${
                      sel ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                    }`}>
                    <div className={`text-base font-bold mb-1 ${sel ? 'text-gray-900' : 'text-gray-700'}`}>{option.label}</div>
                    <div className="text-gray-500 text-xs">{option.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-white">
      <div className="flex items-center gap-2 mb-8">
        <img src="/Images/512X512.png" alt="Loomiqe" className="w-8 h-8" onError={e => e.target.style.display='none'} />
        <span className="text-gray-900 font-extrabold text-xl sm:text-2xl">Loomiqe</span>
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
          isCompany
            ? 'bg-blue-50 text-blue-600 border-blue-200'
            : 'bg-blue-50 text-blue-600 border-blue-200'
        }`}>
          {isCompany ? 'Company Account' : 'Individual Account'}
        </span>
      </div>

      <div className="w-full max-w-lg mx-4 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="w-full h-1 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</span>
            {step < TOTAL_STEPS && (
              <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600 text-xs font-semibold transition-colors">Complete Later</button>
            )}
          </div>

          {isCompany ? renderCompanyStep() : renderIndividualStep()}

          <div className={`flex mt-8 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <button onClick={handleBack} className="px-5 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all">Back</button>
            )}
            {step < TOTAL_STEPS ? (
              <button onClick={handleNext} className="px-8 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all">Next</button>
            ) : (
              <button onClick={handleComplete} disabled={saving}
                className="px-8 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? (<span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Setting up...</span>) : "Get Started"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 h-2 bg-blue-600' : i + 1 < step ? 'w-2 h-2 bg-blue-400' : 'w-2 h-2 bg-gray-200'}`} />
        ))}
      </div>

      <p className="text-gray-400 text-xs mt-4">{new Date().getFullYear()} Loomiqe. All rights reserved.</p>
    </div>
  );
};

export default Onboarding;
