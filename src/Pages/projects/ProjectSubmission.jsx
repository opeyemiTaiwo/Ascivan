// src/Pages/projects/ProjectSubmission.jsx - Post a Project

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import usePosterName from '../../hooks/usePosterName';
import { checkPaidProjectLimit } from '../../utils/paidProjectLimits';

const industryTracks = [
  { value: 'healthcare', label: 'Healthcare / Medical' },
  { value: 'finance', label: 'Finance / Fintech' },
  { value: 'education', label: 'Education' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'entertainment', label: 'Entertainment / Media' },
  { value: 'government', label: 'Government' },
  { value: 'technology', label: 'Technology / Software / SaaS' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'transportation', label: 'Transportation / Logistics' },
  { value: 'realestate', label: 'Real Estate / PropTech' },
  { value: 'energy', label: 'Energy / Utilities' },
  { value: 'agriculture', label: 'Agriculture / AgTech' },
  { value: 'manufacturing', label: 'Manufacturing / Industrial' },
  { value: 'legal', label: 'Legal Tech' },
  { value: 'nonprofit', label: 'Non-Profit / Social Impact' },
  { value: 'travel', label: 'Travel / Hospitality' },
  { value: 'sports', label: 'Sports / Fitness' },
  { value: 'food', label: 'Food / Beverage' },
  { value: 'fashion', label: 'Fashion / Retail' },
  { value: 'construction', label: 'Construction / Infrastructure' },
  { value: 'marketing', label: 'Marketing / Advertising' },
];

const timelineOptions = [
  { value: '1-week', label: '1 Week' },
  { value: '2-weeks', label: '2 Weeks' },
  { value: '1-month', label: '1 Month' },
  { value: '2-3-months', label: '2-3 Months' },
  { value: '3-6-months', label: '3-6 Months' },
  { value: '6-months-plus', label: '6+ Months' },
  { value: 'flexible', label: 'Flexible' },
];

const experienceLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'any-level', label: 'Any Level' },
];

const roleTemplates = [
  'Developer', 'Designer', 'QA Tester', 'Project Lead', 'Mentor', 'Security Specialist', 'Data Analyst', 'Content Writer', 'Marketing', 'Other'
];

const ProjectSubmission = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { posterName: profilePosterName, isCompany: profileIsCompany } = usePosterName(currentUser);

  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    industryTrack: '',
    timeline: '',
    startDate: '',
    endDate: '',
    projectGoals: '',
    experienceLevel: '',
    contactEmail: '',
    contactName: '',
    companyName: '',
    // Pricing
    pricingType: 'free', // 'free' | 'paid'
  });

  // Team roles — dynamic list, payment per role when paid
  const [teamRoles, setTeamRoles] = useState([
    { role: '', skills: '', count: 1, experienceLevel: 'any-level', paymentPerPerson: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paidLimit, setPaidLimit] = useState({ allowed: true, remaining: 3, used: 0, limit: 3, plan: 'Free' });

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true, state: { from: '/projects/submit', message: 'Please sign in to post a project' } });
    }
  }, [currentUser, authLoading, navigate]);

  // Check paid project limit
  useEffect(() => {
    if (currentUser) {
      checkPaidProjectLimit(currentUser).then(setPaidLimit);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && !formData.contactEmail) {
      setFormData(prev => ({
        ...prev,
        contactEmail: currentUser.email || '',
        contactName: profilePosterName || currentUser.displayName || '',
        companyName: profileIsCompany ? profilePosterName : prev.companyName,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, profilePosterName, profileIsCompany]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (index, field, value) => {
    setTeamRoles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addRole = () => {
    if (teamRoles.length < 10) {
      setTeamRoles(prev => [...prev, { role: '', skills: '', count: 1, experienceLevel: 'any-level', paymentPerPerson: '' }]);
    }
  };

  const removeRole = (index) => {
    if (teamRoles.length > 1) {
      setTeamRoles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalTeamSize = teamRoles.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);
  const totalBudget = formData.pricingType === 'paid' 
    ? teamRoles.reduce((sum, r) => sum + ((parseFloat(r.paymentPerPerson) || 0) * (parseInt(r.count) || 0)), 0) 
    : 0;

  const validateForm = () => {
    const errors = [];
    if (!formData.projectTitle.trim()) errors.push('Project title is required');
    if (!formData.projectDescription.trim()) errors.push('Project description is required');
    if (!formData.industryTrack) errors.push('Industry track is required');
    if (!formData.timeline) errors.push('Timeline is required');
    if (!formData.startDate) errors.push('Start date is required');
    if (!formData.endDate) errors.push('End date is required');
    if (!formData.contactEmail.trim()) errors.push('Contact email is required');

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (start < today) errors.push('Start date cannot be in the past');
      if (end <= start) errors.push('End date must be after the start date');
    }

    const validRoles = teamRoles.filter(r => r.role.trim());
    if (validRoles.length === 0) errors.push('At least one team role is required');
    for (const r of validRoles) {
      if (!r.skills.trim()) errors.push(`Skills required for "${r.role}" role`);
      if (!r.count || r.count < 1) errors.push(`Number of people for "${r.role}" must be at least 1`);
    }

    if (formData.pricingType === 'paid') {
      for (const r of validRoles) {
        if (!r.paymentPerPerson || parseFloat(r.paymentPerPerson) <= 0) {
          errors.push(`Payment amount required for "${r.role}" role`);
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      toast.error('Please sign in to post a project');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors[0]);
      setIsSubmitting(false);
      return;
    }

    // Check paid project limit for basic members
    if (formData.pricingType === 'paid' && !paidLimit.allowed) {
      toast.error(`Basic members can only complete ${paidLimit.limit} paid projects per year. Upgrade to Premium for unlimited.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const isPaid = formData.pricingType === 'paid';

      const validRoles = teamRoles.filter(r => r.role.trim()).map(r => ({
        role: r.role.trim(),
        skills: r.skills.trim(),
        count: parseInt(r.count) || 1,
        experienceLevel: r.experienceLevel || 'any-level',
        paymentPerPerson: isPaid ? (parseFloat(r.paymentPerPerson) || 0) : 0,
      }));

      const computedTotalBudget = isPaid 
        ? validRoles.reduce((sum, r) => sum + (r.paymentPerPerson * r.count), 0) 
        : 0;

      const submissionData = {
        projectTitle: formData.projectTitle.trim(),
        projectDescription: formData.projectDescription.trim(),
        industryTrack: formData.industryTrack,
        timeline: formData.timeline,
        startDate: formData.startDate,
        endDate: formData.endDate,
        projectGoals: formData.projectGoals.trim() || null,
        experienceLevel: formData.experienceLevel || 'any-level',
        contactEmail: formData.contactEmail.trim(),
        contactName: formData.contactName.trim() || 'Project Owner',
        companyName: formData.companyName.trim() || null,
        // Pricing
        pricingType: formData.pricingType,
        totalBudget: computedTotalBudget,
        // Team
        teamRoles: validRoles,
        maxTeamSize: totalTeamSize,
        // Meta
        status: 'active',
        isActive: true,
        submitterId: currentUser.uid,
        submitterEmail: currentUser.email,
        submitterName: currentUser.displayName || currentUser.email,
        submitterPhoto: currentUser.photoURL || null,
        isCompanyPost: profileIsCompany,
        viewCount: 0,
        applicationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'projects'), submissionData);

      // Log project creation
      try {
        const { logActivity } = await import('../../utils/activityLog');
        await logActivity(docRef.id, {
          type: 'project_created',
          actor: currentUser.email,
          actorName: currentUser.displayName || currentUser.email,
          description: `Project "${formData.projectTitle}" created (${formData.pricingType})`,
          metadata: { pricingType: formData.pricingType, teamSize: teamRoles.reduce((s, r) => s + (parseInt(r.count) || 1), 0) },
        });
      } catch (e) { console.log('Activity log skipped:', e.message); }

      toast.success('Project posted successfully!');
      setTimeout(() => navigate('/projects'), 1500);

    } catch (error) {
      console.error('Error posting project:', error);
      toast.error('Error posting project: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const inputClass = "w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[44px] text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm transition-all";
  const labelClass = "block text-blue-600 font-semibold mb-2 text-sm";
  const selectClass = inputClass + " appearance-none";

  if (authLoading || !currentUser) {
    return (
      <>
        
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <div className="min-h-screen overflow-x-hidden " style={{ backgroundColor: '#ffffff' }}>
        <main className="pb-16 sm:pb-20 md:pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-3xl">

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: '"Inter", sans-serif' }}>
                Post a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">Project</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">Create a project and build your team</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-5">

                {/* Project Title */}
                <div>
                  <label className={labelClass}>Project Title *</label>
                  <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} className={inputClass} placeholder="e.g., Student Housing Finder App" maxLength={120} />
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Project Description *</label>
                  <textarea name="projectDescription" value={formData.projectDescription} onChange={handleInputChange} className={inputClass + " resize-none"} rows="4" placeholder="Describe the project, its purpose, and what the team will build..." maxLength={2000} />
                </div>

                {/* Industry + Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Industry Track *</label>
                    <select name="industryTrack" value={formData.industryTrack} onChange={handleInputChange} className={selectClass}>
                      <option value="">Select industry</option>
                      {industryTracks.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Experience Level</label>
                    <select name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} className={selectClass}>
                      <option value="">Select level</option>
                      {experienceLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Timeline + Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Timeline *</label>
                    <select name="timeline" value={formData.timeline} onChange={handleInputChange} className={selectClass}>
                      <option value="">Select</option>
                      {timelineOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Start Date *</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputClass} min={getMinDate()} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date *</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={inputClass} min={formData.startDate || getMinDate()} />
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className={labelClass}>Project Goals</label>
                  <textarea name="projectGoals" value={formData.projectGoals} onChange={handleInputChange} className={inputClass + " resize-none"} rows="2" placeholder="What should the team achieve by the end?" maxLength={1000} />
                </div>
              </div>

              {/* ── PRICING ── */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">Project Pricing</h2>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData(p => ({ ...p, pricingType: 'free' }))}
                    className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${formData.pricingType === 'free' ? 'border-blue-500 bg-blue-600/20 text-gray-900' : 'border-white/15 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <div className="text-sm font-bold">Free</div>
                    <div className="text-gray-400 text-xs mt-1">Volunteer / learning project</div>
                  </button>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, pricingType: 'paid' }))}
                    className={`p-4 rounded-xl border-2 text-center transition-all active:scale-95 ${formData.pricingType === 'paid' ? 'border-blue-500 bg-blue-600/20 text-gray-900' : 'border-white/15 bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    <div className="text-sm font-bold">Paid</div>
                    <div className="text-gray-400 text-xs mt-1">Compensated project</div>
                  </button>
                </div>

                {formData.pricingType === 'free' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-blue-700 text-sm">This is a free project. Team members will contribute on a volunteer or learning basis.</p>
                  </div>
                )}

                {formData.pricingType === 'paid' && !paidLimit.allowed && paidLimit.plan !== 'Premium' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm font-semibold mb-1">Paid project limit reached</p>
                    <p className="text-gray-600 text-xs mb-3">Basic members can complete up to {paidLimit.limit} paid projects per year. You've used {paidLimit.used} of {paidLimit.limit}.</p>
                    <button type="button" onClick={() => navigate('/settings?tab=membership')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-all">
                      Upgrade to Premium
                    </button>
                  </div>
                )}

                {formData.pricingType === 'paid' && paidLimit.allowed && paidLimit.plan !== 'Premium' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <p className="text-orange-700 text-sm">Paid project — {paidLimit.remaining} of {paidLimit.limit} paid projects remaining this year.</p>
                  </div>
                )}
              </div>

              {/* ── TEAM ROLES ── */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Team Roles</h2>
                  <span className="text-gray-400 text-xs">Total team: {totalTeamSize} {totalTeamSize === 1 ? 'person' : 'people'}</span>
                </div>

                {teamRoles.map((role, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 text-sm font-semibold">Role {index + 1}</span>
                      {teamRoles.length > 1 && (
                        <button type="button" onClick={() => removeRole(index)} className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors">Remove</button>
                      )}
                    </div>
                    <div className={`grid grid-cols-1 gap-3 ${formData.pricingType === 'paid' ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Role Title *</label>
                        <select value={role.role} onChange={e => handleRoleChange(index, 'role', e.target.value)} className={selectClass}>
                          <option value="">Select role</option>
                          {roleTemplates.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">People Needed *</label>
                        <input type="number" min="1" max="20" value={role.count} onChange={e => handleRoleChange(index, 'count', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Skills Required *</label>
                        <input type="text" value={role.skills} onChange={e => handleRoleChange(index, 'skills', e.target.value)} className={inputClass} placeholder="e.g., React, Node.js" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Experience Level</label>
                        <select value={role.experienceLevel || 'any-level'} onChange={e => handleRoleChange(index, 'experienceLevel', e.target.value)} className={selectClass}>
                          <option value="any-level">Any Level</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      {formData.pricingType === 'paid' && (
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Payment / Person (USD) *</label>
                          <input type="number" min="0" step="0.01" value={role.paymentPerPerson} onChange={e => handleRoleChange(index, 'paymentPerPerson', e.target.value)} className={inputClass} placeholder="0.00" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {teamRoles.length < 10 && (
                  <button type="button" onClick={addRole} className="w-full py-2.5 border border-dashed border-gray-200 rounded-xl text-blue-600 text-sm font-semibold hover:bg-gray-50 transition-all min-h-[44px]">
                    + Add Another Role
                  </button>
                )}

                {formData.pricingType === 'paid' && totalBudget > 0 && (
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3">
                    <p className="text-blue-500 text-sm font-semibold">
                      Total project budget: ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({totalTeamSize} team members)
                    </p>
                  </div>
                )}
              </div>

              {/* ── CONTACT INFO ── */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Your Name</label>
                    <input type="text" name="contactName" value={formData.contactName} onChange={handleInputChange} className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={inputClass} placeholder="you@email.com" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Company / Organisation</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className={inputClass} placeholder="Optional" />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3.5 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm sm:text-base transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Posting Project...
                  </span>
                ) : 'Post Project'}
              </button>
            </form>

            <style jsx>{`select option { background-color: #111; color: white; }`}</style>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProjectSubmission;
