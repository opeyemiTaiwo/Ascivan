// src/Pages/Settings.jsx — Edit profile, reset password, delete account, membership
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { deleteUserAccount } from '../utils/deleteUserContent';
import { toast } from 'react-toastify';

const skillTrackOpts = [
  { id: 'TechDev', label: 'Development' }, { id: 'TechQA', label: 'Quality Assurance' }, { id: 'TechMO', label: 'Project Management' },
  { id: 'TechArchs', label: 'Architecture' }, { id: 'TechLeads', label: 'Leadership' }, { id: 'TechGuard', label: 'Cybersecurity' },
];

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [form, setForm] = useState({
    displayName: '', specialization: '', experienceLevel: '', primarySkillTrack: '',
    city: '', state: '', portfolioUrl: '', linkedinUrl: '', githubUrl: '', emailPublic: false,
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
          setForm({
            displayName: data.displayName || '',
            specialization: data.specialization || '',
            experienceLevel: data.experienceLevel || '',
            primarySkillTrack: data.primarySkillTrack || '',
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
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: form.displayName.trim(),
        specialization: form.specialization.trim() || null,
        experienceLevel: form.experienceLevel || null,
        primarySkillTrack: form.primarySkillTrack || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        portfolioUrl: form.portfolioUrl.trim() || null,
        linkedinUrl: form.linkedinUrl.trim() || null,
        githubUrl: form.githubUrl.trim() || null,
        emailPublic: form.emailPublic,
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
    
      <div className="max-w-3xl mx-auto">
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
              <label className={labelCls}>Specialization</label>
              <input type="text" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className={inputCls} placeholder="e.g., React, Python, AWS" />
            </div>
            <div>
              <label className={labelCls}>Experience Level</label>
              <select value={form.experienceLevel} onChange={e => setForm(p => ({ ...p, experienceLevel: e.target.value }))} className={inputCls}>
                <option value="">Select</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className={inputCls} placeholder="e.g., Baltimore" />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className={inputCls} placeholder="e.g., MD" />
              </div>
            </div>
            <div>
              <label className={labelCls}>LinkedIn URL</label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Basic */}
            <div className={`bg-white border-2 rounded-xl p-6 ${profileData?.membershipPlan !== 'Premium' ? 'border-blue-500' : 'border-gray-200'}`}>
              <h3 className="text-blue-600 font-bold text-lg mb-1">Basic Membership</h3>
              <p className="text-gray-900 font-bold text-2xl mb-4">Free</p>
              <p className="text-gray-500 text-sm mb-4">Everything you need to start building your tech career through real project experience.</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Unlimited free projects</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Up to 3 completed paid projects per year</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> All 6 TechTalent Badge tracks</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Community, messaging, and workspace access</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Certificates on project completion</li>
              </ul>
              {profileData?.membershipPlan !== 'Premium' && (
                <p className="text-blue-600 font-semibold text-sm">Current Plan</p>
              )}
            </div>

            {/* Premium */}
            <div className={`bg-white border-2 rounded-xl p-6 relative ${profileData?.membershipPlan === 'Premium' ? 'border-orange-400' : 'border-gray-200'}`}>
              {/* Coming Soon tag */}
              <div className="absolute -top-3 right-4">
                <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">COMING SOON</span>
              </div>
              <div className="flex items-center gap-2 mb-1 mt-1">
                <h3 className="text-blue-600 font-bold text-lg">Premium Membership</h3>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">RECOMMENDED</span>
              </div>
              <p className="text-gray-900 font-bold text-2xl mb-0.5">$200<span className="text-gray-400 text-sm font-normal">/year</span></p>
              <p className="text-gray-500 text-sm mb-4">or $20/month</p>
              <p className="text-gray-500 text-sm mb-4">Build trust before you even start. Premium members are verified through their subscription — so teammates trust you'll pay, recruiters trust your commitment, and project owners trust your professionalism.</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-4">
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> Everything in Basic</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> <strong>Unlimited paid projects</strong> — post and apply with no yearly cap</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> <strong>Verified Premium Badge</strong> — an orange PRO badge displayed on your profile, directory listing, and across the platform so others know you're a verified, committed professional</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> <strong>Talent Board visibility</strong> — get discovered by recruiters and companies actively looking to hire</li>
                <li className="flex items-start gap-2"><svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> <strong>Priority support</strong> — direct access to our team at premium@loomiqe.com</li>
              </ul>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">Your Premium badge tells everyone on Loomiqe — project owners, team members, and recruiters — that you're invested, accountable, and serious about your work. It's the fastest way to build credibility on the platform.</p>
              <button disabled className="w-full bg-gray-300 text-gray-500 font-semibold text-sm py-2.5 rounded-lg cursor-not-allowed">
                Coming Soon
              </button>
              {profileData?.membershipPlan === 'Premium' && (
                <p className="text-orange-600 font-semibold text-sm mt-3 text-center">Active Premium Member</p>
              )}
            </div>

            {/* Plan Comparison */}
            <div className="sm:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-gray-900 text-sm font-bold mb-3">Plan Comparison</p>
              <div className="grid grid-cols-3 gap-y-3 gap-x-2 text-xs">
                <div className="text-gray-500 font-semibold pb-2 border-b border-gray-200">Feature</div>
                <div className="text-gray-500 font-semibold text-center pb-2 border-b border-gray-200">Basic</div>
                <div className="text-gray-500 font-semibold text-center pb-2 border-b border-gray-200">Premium</div>
                
                <div className="text-gray-700">Free projects</div>
                <div className="text-center text-gray-900">Unlimited</div>
                <div className="text-center text-gray-900">Unlimited</div>
                
                <div className="text-gray-700">Paid projects (per year)</div>
                <div className="text-center text-gray-900">3</div>
                <div className="text-center text-orange-600 font-semibold">Unlimited</div>
                
                <div className="text-gray-700">TechTalent Badges</div>
                <div className="text-center text-gray-900">All 6 tracks</div>
                <div className="text-center text-gray-900">All 6 tracks</div>
                
                <div className="text-gray-700">Verified Premium Badge</div>
                <div className="text-center text-gray-400">—</div>
                <div className="text-center text-orange-600 font-semibold">Yes</div>
                
                <div className="text-gray-700">Talent Board</div>
                <div className="text-center text-gray-400">—</div>
                <div className="text-center text-orange-600 font-semibold">Yes</div>
                
                <div className="text-gray-700">Messaging</div>
                <div className="text-center text-gray-900">Yes</div>
                <div className="text-center text-gray-900">Yes</div>
                
                <div className="text-gray-700">Priority support</div>
                <div className="text-center text-gray-400">—</div>
                <div className="text-center text-orange-600 font-semibold">Yes</div>
              </div>
            </div>
          </div>
        )}

        {/* Account */}
        {activeTab === 'account' && (
          <div className="space-y-6">
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
                    <input type="text" value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="DELETE" className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
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
