// src/Pages/Settings.jsx - Edit profile, reset password, delete account, membership
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PAYMENT_CONFIG } from '../config/payment';
import { deleteUserAccount } from '../utils/deleteUserContent';
import { enablePushForCurrentUser } from '../utils/pushNotifications';
import { toast } from 'react-toastify';

const skillTrackOpts = [
  { id: 'TechDev', label: 'Development' }, { id: 'TechQA', label: 'Quality Assurance' }, { id: 'TechPO', label: 'Product / Project Owner' },
  { id: 'TechArchs', label: 'Low/No-Code Developer' }, { id: 'TechLeads', label: 'Non-Technical Roles' }, { id: 'TechGuard', label: 'Cybersecurity' },
];

// Browser/OS detection so the "notifications blocked" help matches the device.
const _UA = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_IOS = /iPhone|iPad|iPod/i.test(_UA);
const IS_SAFARI = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(_UA);

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [form, setForm] = useState({
    displayName: '', specialization: '', experienceLevel: '', primarySkillTrack: '',
    highestEducation: '', skills: '',
    country: '', city: '', state: '', portfolioUrl: '', linkedinUrl: '', githubUrl: '', emailPublic: false,
  });

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfileData(data);
          setWeeklyDigest(data.emailPreferences?.weeklyDigest === true);
          setReminders(data.emailPreferences?.reminders !== false);
          setForm({
            displayName: data.displayName || '',
            specialization: data.specialization || '',
            highestEducation: data.highestEducation || '',
            skills: data.skillsText || (Array.isArray(data.skills) ? data.skills.join(', ') : ''),
            experienceLevel: data.experienceLevel || '',
            primarySkillTrack: data.primarySkillTrack || '',
            country: data.country || '',
            city: data.city || '',
            state: data.state || '',
            portfolioUrl: data.portfolioUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            githubUrl: data.githubUrl || '',
            emailPublic: data.emailPublic || false,
          });
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!form.displayName.trim()) { toast.error('Name is required'); return; }
    if (!form.country.trim()) { toast.error('Current country is required'); return; }
    // Individuals must provide the fields required to create/join projects
    if (!profileData?.isCompany) {
      if (!form.experienceLevel) { toast.error('Experience level is required'); return; }
      if (!form.linkedinUrl.trim()) { toast.error('LinkedIn URL is required'); return; }
    }
    setSaving(true);
    try {
      const hasInterests = Array.isArray(profileData?.interests) && profileData.interests.length > 0;
      const requiredCommon = !!form.displayName.trim() && !!form.country.trim() && hasInterests;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: form.displayName.trim(),
        specialization: form.specialization.trim() || null,
        highestEducation: form.highestEducation || null,
        skillsText: form.skills.trim() || null,
        skills: form.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        experienceLevel: form.experienceLevel || null,
        primarySkillTrack: form.primarySkillTrack || null,
        country: form.country.trim(),
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        portfolioUrl: form.portfolioUrl.trim() || null,
        linkedinUrl: form.linkedinUrl.trim() || null,
        githubUrl: form.githubUrl.trim() || null,
        emailPublic: form.emailPublic,
        // Mark complete when the required set is satisfied
        profileComplete: profileData?.isCompany
          ? requiredCommon
          : (requiredCommon && !!form.experienceLevel && !!form.linkedinUrl.trim()),
      });
      toast.success('Profile updated');
    } catch (e) {
      toast.error('Failed to save profile');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteUserAccount(currentUser);
      navigate('/');
    } catch (e) {
      toast.error('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const inputCls = "w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all";
  const labelCls = "block text-gray-700 font-medium mb-1.5 text-sm";

  const tabs = [
    { id: 'profile', label: 'Edit Profile' },
    { id: 'membership', label: 'Membership' },
    { id: 'account', label: 'Account' },
  ];

  if (loading) {
    return (
      
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Edit Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input type="text" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} className={inputCls} placeholder="Your full name" />
            </div>
            <div>
              <label className={labelCls}>Primary Skill Track</label>
              <select value={form.primarySkillTrack} onChange={e => setForm(p => ({ ...p, primarySkillTrack: e.target.value }))} className={inputCls}>
                <option value="">Select a track</option>
                {skillTrackOpts.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Highest Level of Education</label>
              <select value={form.highestEducation} onChange={e => setForm(p => ({ ...p, highestEducation: e.target.value }))} className={inputCls}>
                <option value="">Select your education level</option>
                <option value="high_school">High School</option>
                <option value="undergrad">Undergraduate</option>
                <option value="masters">Master's</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Course of Study</label>
              <input type="text" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className={inputCls} placeholder="e.g., Computer Science, Chemistry, Business" />
              <p className="text-xs text-gray-500 mt-1">Your field of study, or area of concentration if in high school.</p>
            </div>
            <div>
              <label className={labelCls}>Courses, Certifications & Skills</label>
              <input type="text" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} className={inputCls} placeholder="e.g., Python, AWS Certified, CS50, React" />
            </div>
            <div>
              <label className={labelCls}>Experience Level{!profileData?.isCompany ? ' *' : ''}</label>
              <select value={form.experienceLevel} onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))} className={inputCls}>
                <option value="">Select</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Current Country *</label>
              <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className={inputCls} placeholder="e.g., Nigeria, India, United States" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="e.g., Lagos" />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className={inputCls} placeholder="e.g., Lagos State" />
              </div>
            </div>
            <div>
              <label className={labelCls}>LinkedIn URL{!profileData?.isCompany ? ' *' : ''}</label>
              <input type="url" value={form.linkedinUrl} onChange={e => setForm(p => ({ ...p, linkedinUrl: e.target.value }))} className={inputCls} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input type="url" value={form.githubUrl} onChange={e => setForm(p => ({ ...p, githubUrl: e.target.value }))} className={inputCls} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className={labelCls}>Portfolio URL</label>
              <input type="url" value={form.portfolioUrl} onChange={e => setForm(p => ({ ...p, portfolioUrl: e.target.value }))} className={inputCls} placeholder="https://your-site.com" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-gray-900 text-sm font-medium">Email Visibility</p>
                <p className="text-gray-500 text-xs mt-0.5">{form.emailPublic ? 'Your email is visible to other members' : 'Your email is hidden from other members'}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, emailPublic: !p.emailPublic }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.emailPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.emailPublic ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Membership */}
        {activeTab === 'membership' && (
          <MembershipTab profileData={profileData} navigate={navigate} />
        )}

        {/* Account */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-gray-900 font-bold text-base mb-2">Push Notifications</h3>
              <p className="text-gray-500 text-sm mb-4">Get notified on this device about new messages, project applications, and approvals, even when Ascivan isn't open. On iPhone, add Ascivan to your Home Screen first (Share, then Add to Home Screen).</p>
              <button
                onClick={async () => { await enablePushForCurrentUser({ interactive: true }); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all"
              >
                Enable notifications on this device
              </button>

              <details className="mt-4 group">
                <summary className="text-sm text-blue-600 font-medium cursor-pointer select-none list-none">
                  Notifications not working? Here's how to turn them on
                </summary>
                {IS_IOS ? (
                  <ol className="mt-3 ml-1 space-y-1.5 text-sm text-gray-700 list-decimal list-inside">
                    <li>In Safari, tap the <span className="font-medium text-gray-900">Share</span> button (the square with an arrow).</li>
                    <li>Choose <span className="font-medium text-gray-900">Add to Home Screen</span>, then tap Add.</li>
                    <li>Close Safari and open <span className="font-medium text-gray-900">Ascivan from the new Home Screen icon</span> (this step is required - notifications don't work in the Safari tab).</li>
                    <li>Go to Settings here and tap <span className="font-medium text-gray-900">Enable notifications on this device</span>, then tap Allow.</li>
                  </ol>
                ) : IS_SAFARI ? (
                  <ol className="mt-3 ml-1 space-y-1.5 text-sm text-gray-700 list-decimal list-inside">
                    <li>Open the <span className="font-medium text-gray-900">Safari</span> menu and choose <span className="font-medium text-gray-900">Settings</span>.</li>
                    <li>Go to the <span className="font-medium text-gray-900">Websites</span> tab, then select <span className="font-medium text-gray-900">Notifications</span> in the sidebar.</li>
                    <li>Find <span className="font-medium text-gray-900">ascivan.com</span> in the list and set it to <span className="font-medium text-gray-900">Allow</span>.</li>
                    <li>Come back here and click <span className="font-medium text-gray-900">Enable notifications on this device</span> again.</li>
                  </ol>
                ) : (
                  <ol className="mt-3 ml-1 space-y-1.5 text-sm text-gray-700 list-decimal list-inside">
                    <li>Click the padlock (or site-settings) icon next to the address bar.</li>
                    <li>Find <span className="font-medium text-gray-900">Notifications</span> and set it to <span className="font-medium text-gray-900">Allow</span>.</li>
                    <li>Come back here and click <span className="font-medium text-gray-900">Enable notifications on this device</span> again.</li>
                  </ol>
                )}
                <p className="mt-2 ml-1 text-xs text-gray-500">Push notifications need a secure connection and, on iPhone/iPad, the app added to your Home Screen (iOS 16.4 or later).</p>
              </details>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-gray-900 font-bold text-base mb-2">Email Updates</h3>
              <p className="text-gray-500 text-sm mb-4">Get a weekly email recap of your activity and what's new on Ascivan: new projects, jobs, your badges, and unread messages. Sent every Sunday.</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={async (e) => {
                    const next = e.target.checked;
                    setWeeklyDigest(next);
                    try {
                      await updateDoc(doc(db, 'users', currentUser.uid), { 'emailPreferences.weeklyDigest': next });
                      toast.success(next ? 'Weekly digest turned on.' : 'Weekly digest turned off.');
                    } catch (err) {
                      setWeeklyDigest(!next);
                      toast.error('Could not update preference.');
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Send me the weekly digest email</span>
              </label>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <p className="text-gray-500 text-sm mb-3">Get a personalized reminder only when you have something to pick up: a project you're leading, a team waiting for you, or work you paused. You'll only hear from us when there's something to continue, never just noise.</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders}
                    onChange={async (e) => {
                      const next = e.target.checked;
                      setReminders(next);
                      try {
                        await updateDoc(doc(db, 'users', currentUser.uid), { 'emailPreferences.reminders': next });
                        toast.success(next ? 'Reminders turned on.' : 'Reminders turned off.');
                      } catch (err) {
                        setReminders(!next);
                        toast.error('Could not update preference.');
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Remind me to pick up where I left off</span>
                </label>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-gray-900 font-bold text-base mb-3">Reset Password</h3>
              <p className="text-gray-500 text-sm mb-4">Since you signed in with Google, password management is handled through your Google account.</p>
              <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-medium hover:underline">
                Manage Google Account Security
              </a>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6">
              <h3 className="text-red-600 font-bold text-base mb-2">Delete Account</h3>
              <p className="text-gray-500 text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-all">
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">This will permanently delete all your posts, badges, projects, and profile data.</p>
                  <div>
                    <label className="block text-red-600 text-xs font-semibold mb-1">Type DELETE to confirm:</label>
                    <input type="text" value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="DELETE" className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={deleteText !== 'DELETE' || deleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-40 transition-all">
                      {deleting ? 'Deleting...' : 'Delete My Account'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    
  );
};

export default Settings;

// Membership Tab with toggle dropdowns
const FeatureItem = ({ icon, label, detail, color = 'blue' }) => {
  const [open, setOpen] = useState(false);
  const iconColor = color === 'orange' ? 'text-orange-500' : 'text-blue-500';
  return (
    <li>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left py-1 group">
        <svg className={`w-4 h-4 ${iconColor} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm text-gray-700 font-medium flex-1">{label}</span>
        {detail && (
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {open && detail && (
        <p className="text-gray-500 text-xs leading-relaxed ml-6 pb-2">{detail}</p>
      )}
    </li>
  );
};

const MembershipTab = ({ profileData, navigate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* Basic */}
      <div className={`bg-white border-2 rounded-xl p-6 ${(profileData?.membershipPlan !== 'Premium' && profileData?.role !== 'admin' && profileData?.role !== 'editor') ? 'border-blue-500' : 'border-gray-200'}`}>
        <h3 className="text-blue-600 font-bold text-lg mb-1">Basic Membership</h3>
        <p className="text-gray-900 font-bold text-2xl mb-4">Free</p>
        <p className="text-gray-500 text-sm mb-4">Everything you need to start building your tech career through real project experience.</p>
        <ul className="space-y-1 mb-6">
          <FeatureItem label="Unlimited collaborative projects" detail="Create or join as many real product-build projects as you want, in any tech field, work with real teams and earn verified badges. No caps, no fees, ever." />
          <FeatureItem label="Access to Foundation courses" detail="Free on-platform Foundations courses in every track - learn the basics with real examples and hands-on exercises, at no cost." />
          <FeatureItem label="All 6 TechTalent Badge tracks" detail="Earn badges across all tracks: TechDev, TechQA, TechPO, TechLeads, TechArchs, and TechGuard." />
          <FeatureItem label="Community, messaging, and workspace" detail="Share work on the Proof Wall, message other members, and collaborate in project workspaces. Messaging is limited within talent only - free accounts can't message company accounts." />
          <FeatureItem label="Certificates on project completion" detail="Receive a certificate for every project you complete, documenting your role and contributions." />
        </ul>
        {(profileData?.membershipPlan !== 'Premium' && profileData?.role !== 'admin' && profileData?.role !== 'editor') && (
          <p className="text-blue-600 font-semibold text-sm">Current Plan</p>
        )}
      </div>

      {/* Premium */}
      <div className={`bg-white border-2 rounded-xl p-6 relative ${(profileData?.membershipPlan === 'Premium' || profileData?.role === 'admin' || profileData?.role === 'editor') ? 'border-orange-400' : 'border-gray-200'}`}>
        <div className="absolute -top-3 right-4">
          <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">COMING SOON</span>
        </div>
        <div className="flex items-center gap-2 mb-1 mt-1">
          <h3 className="text-blue-600 font-bold text-lg">Premium Membership</h3>
        </div>
        <p className="text-gray-900 font-bold text-2xl mb-0.5">$200<span className="text-gray-400 text-sm font-normal">/year</span></p>
        <p className="text-gray-500 text-sm mb-4">or $20/month</p>
        <p className="text-gray-500 text-sm mb-4">Get seen first, connect without limits, and stand out, for talent and companies alike.</p>
        <ul className="space-y-1 mb-4">
          <FeatureItem label="Everything in Basic" />
          <FeatureItem color="orange" label="Access to the Talent Board" detail="Browse and search the full directory of verified tech professionals. Unlimited talent messages - contact unlimited new talents, with no monthly cap." />
          <FeatureItem color="orange" label="Priority Talent Board ranking" detail="Premium members appear first when hiring companies search the Talent Board, so your work gets seen before others." />
          <FeatureItem color="orange" label="Verified Company Badge" detail="A verified badge shown on your company profile and listings." />
          <FeatureItem color="orange" label="Post paid projects" detail="Post paid projects and hire real teams: you set the pay per person for every role, it's visible to applicants before they join, and the project closes only when the work is verified done and every member confirms they were paid." />
          <FeatureItem color="orange" label="Priority support" detail="Get faster responses and dedicated assistance from the Ascivan team." />
        </ul>
        <p className="text-gray-400 text-xs mb-4 leading-relaxed">Premium helps talent get discovered faster, and lets companies hire with confidence as verified, traceable organizations.</p>
        {(profileData?.membershipPlan === 'Premium' || profileData?.role === 'admin' || profileData?.role === 'editor') ? (
          <div>
            <div className="w-full bg-orange-500 text-white font-semibold text-sm py-2.5 rounded-lg text-center">Active Premium Member</div>
            <p className="text-gray-500 text-xs mt-2 text-center">
              {profileData?.premiumBillingCycle === 'yearly' ? 'Yearly plan' : profileData?.premiumBillingCycle === 'monthly' ? 'Monthly plan' : 'Premium access'}
              {profileData?.premiumExpiresAt && ` · Renews ${profileData.premiumExpiresAt.toDate?.().toLocaleDateString() || ''}`}
            </p>
          </div>
        ) : PAYMENT_CONFIG.enabled ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a href={PAYMENT_CONFIG.stripe.yearly} target="_blank" rel="noopener noreferrer" className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg text-center transition-all">
                $200/year
              </a>
              <a href={PAYMENT_CONFIG.stripe.monthly} target="_blank" rel="noopener noreferrer" className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-lg text-center transition-all">
                $20/month
              </a>
            </div>
            {(PAYMENT_CONFIG.paypal.yearly && !PAYMENT_CONFIG.paypal.yearly.includes('YOUR_')) && (
              <div className="grid grid-cols-2 gap-2">
                <a href={PAYMENT_CONFIG.paypal.yearly} target="_blank" rel="noopener noreferrer" className="block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-sm py-2.5 rounded-lg text-center transition-all">
                  PayPal Yearly
                </a>
                <a href={PAYMENT_CONFIG.paypal.monthly} target="_blank" rel="noopener noreferrer" className="block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-sm py-2.5 rounded-lg text-center transition-all">
                  PayPal Monthly
                </a>
              </div>
            )}
            <p className="text-gray-400 text-xs text-center">Secure payment via Stripe or PayPal</p>
          </div>
        ) : (
          <button disabled className="w-full bg-gray-300 text-gray-500 font-semibold text-sm py-2.5 rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-gray-900 text-sm font-bold mb-3">Plan Comparison</p>
        <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-xs">
          <div className="text-gray-500 font-semibold pb-2 border-b border-gray-200">Feature</div>
          <div className="text-gray-500 font-semibold text-center pb-2 border-b border-gray-200">Basic</div>
          <div className="text-gray-500 font-semibold text-center pb-2 border-b border-gray-200">Premium</div>
          <div className="text-gray-700">Collaborative projects</div><div className="text-center text-gray-900">Unlimited</div><div className="text-center text-gray-900">Unlimited</div>
          <div className="text-gray-700">Foundation courses</div><div className="text-center text-gray-900">Free</div><div className="text-center text-gray-900">Free</div>
          <div className="text-gray-700">TechTalent Badges</div><div className="text-center text-gray-900">All 6</div><div className="text-center text-gray-900">All 6</div>
          <div className="text-gray-700">Premium Badge</div><div className="text-center text-gray-400">No</div><div className="text-center text-orange-600 font-semibold">Yes</div>
          <div className="text-gray-700">Talent Board access</div><div className="text-center text-gray-400">No</div><div className="text-center text-orange-600 font-semibold">Full + Priority</div>
          <div className="text-gray-700">Messaging</div><div className="text-center text-gray-400">Limited</div><div className="text-center text-orange-600 font-semibold">Unlimited</div>
          <div className="text-gray-700">Contact new talents</div><div className="text-center text-gray-400">No</div><div className="text-center text-orange-600 font-semibold">Unlimited</div>
          <div className="text-gray-700">Paid projects</div><div className="text-center text-gray-400">Join only</div><div className="text-center text-orange-600 font-semibold">Post unlimited</div>
          <div className="text-gray-700">Priority support</div><div className="text-center text-gray-400">No</div><div className="text-center text-orange-600 font-semibold">Yes</div>
        </div>
      </div>
    </div>
  );
};
