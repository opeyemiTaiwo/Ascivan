// src/Pages/projects/ProjectDetail.jsx - View Single Project

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { notifyNewApplicationToOwner } from '../../utils/emailNotifications';
import { logActivity } from '../../utils/activityLog';
import { sanitizeEmailKey } from '../../utils/firestoreHelpers';

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

const getIndustryLabel = (val) => industryTracks.find(t => t.value === val)?.label || val;

// Payment confirmation card for members
const PaymentConfirmationCard = ({ project, projectId, currentUser }) => {
  const [status, setStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [satisfied, setSatisfied] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  useEffect(() => {
    const confirmations = project.paymentConfirmations || {};
    const emailKey = sanitizeEmailKey(currentUser.email);
    const myStatus = confirmations[emailKey]?.status;
    if (myStatus) setStatus(myStatus);
  }, [project, currentUser]);

  const handleConfirm = async (newStatus) => {
    setSubmitting(true);
    try {
      const emailKey = sanitizeEmailKey(currentUser.email);
      await updateDoc(doc(db, 'projects', projectId), {
        [`paymentConfirmations.${emailKey}.status`]: newStatus,
        [`paymentConfirmations.${emailKey}.confirmedAt`]: new Date().toISOString(),
        disputeHistory: arrayUnion({
          memberEmail: currentUser.email,
          memberName: currentUser.displayName || currentUser.email,
          action: newStatus,
          timestamp: new Date().toISOString(),
        }),
      });

      if (project.submitterId) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: project.submitterId,
            type: newStatus === 'confirmed' ? 'payment_confirmed' : 'payment_disputed',
            message: newStatus === 'confirmed'
              ? `${currentUser.displayName || currentUser.email} confirmed payment for "${project.projectTitle || project.title}"`
              : `⚠️ ${currentUser.displayName || currentUser.email} disputed payment for "${project.projectTitle || project.title}"`,
            projectId, projectTitle: project.projectTitle || project.title,
            mentionedByName: currentUser.displayName || currentUser.email,
            mentionedByPhoto: currentUser.photoURL || null,
            isRead: false, createdAt: serverTimestamp(),
          });
        } catch (e) { console.error('Notification error:', e); }
      }

      if (newStatus === 'disputed') {
        try {
          const adminQ = query(collection(db, 'users'), where('role', '==', 'admin'));
          const adminSnap = await getDocs(adminQ);
          for (const ad of adminSnap.docs) {
            await addDoc(collection(db, 'notifications'), {
              userId: ad.id, type: 'payment_disputed',
              message: `🚨 Payment Dispute: ${currentUser.displayName || currentUser.email} disputed payment for "${project.projectTitle || project.title}"`,
              projectId, projectTitle: project.projectTitle || project.title,
              isRead: false, createdAt: serverTimestamp(),
            });
          }
        } catch (e) { console.error('Admin notification error:', e); }
      }

      setStatus(newStatus);
      toast.success(newStatus === 'confirmed' ? 'Payment confirmed!' : 'Dispute submitted.');
      logActivity(projectId, { type: newStatus === 'confirmed' ? 'payment_confirmed' : 'payment_disputed', actor: currentUser.email, actorName: currentUser.displayName || currentUser.email, description: `${currentUser.displayName || currentUser.email} ${newStatus} payment` });
    } catch (e) { console.error('Error:', e); toast.error('Error updating status'); }
    setSubmitting(false);
  };

  const handleResolve = async () => {
    if (!resolveNote.trim()) { toast.error('Please add a note before resolving'); return; }
    setSubmitting(true);
    try {
      const emailKey = sanitizeEmailKey(currentUser.email);
      await updateDoc(doc(db, 'projects', projectId), {
        [`paymentConfirmations.${emailKey}.status`]: 'resolved',
        [`paymentConfirmations.${emailKey}.resolvedAt`]: new Date().toISOString(),
        [`paymentConfirmations.${emailKey}.resolveNote`]: resolveNote.trim(),
        [`paymentConfirmations.${emailKey}.satisfied`]: satisfied,
        disputeHistory: arrayUnion({
          memberEmail: currentUser.email, memberName: currentUser.displayName || currentUser.email,
          action: 'resolved', satisfied, note: resolveNote.trim(), timestamp: new Date().toISOString(),
        }),
      });
      if (project.submitterId) {
        await addDoc(collection(db, 'notifications'), {
          userId: project.submitterId, type: 'dispute_resolved',
          message: `${currentUser.displayName || currentUser.email} resolved their dispute for "${project.projectTitle || project.title}"${satisfied ? ' (satisfied)' : ''}`,
          projectId, projectTitle: project.projectTitle || project.title,
          mentionedByName: currentUser.displayName || currentUser.email, isRead: false, createdAt: serverTimestamp(),
        });
      }
      setStatus('resolved'); setShowResolveForm(false);
      toast.success('Dispute resolved!');
      logActivity(projectId, { type: 'dispute_resolved', actor: currentUser.email, actorName: currentUser.displayName || currentUser.email, description: `Dispute resolved — ${satisfied ? 'satisfied' : 'not fully satisfied'}` });
    } catch (e) { console.error('Error:', e); toast.error('Error resolving dispute'); }
    setSubmitting(false);
  };

  if (status === 'confirmed' || status === 'resolved') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <p className="text-blue-700 font-semibold text-sm">{status === 'confirmed' ? 'Payment confirmed' : 'Dispute resolved'}</p>
        <p className="text-gray-500 text-xs mt-1">Badges will be awarded once all members confirm or resolve.</p>
      </div>
    );
  }

  if (status === 'disputed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <p className="text-red-700 font-semibold text-sm mb-1">Payment disputed</p>
        <p className="text-gray-500 text-xs mb-3">Your dispute has been flagged to the project owner and admins.</p>
        {!showResolveForm ? (
          <button onClick={() => setShowResolveForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all">
            Resolve Dispute
          </button>
        ) : (
          <div className="space-y-3 mt-3 p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-900 text-sm font-semibold">Resolve your dispute</p>
            <textarea value={resolveNote} onChange={e => setResolveNote(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none" rows={3} placeholder="Describe how the dispute was resolved..." />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={satisfied} onChange={e => setSatisfied(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
              <span className="text-gray-700 text-sm">I am satisfied with the resolution</span>
            </label>
            <div className="flex gap-2">
              <button onClick={handleResolve} disabled={submitting || !resolveNote.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Resolution'}
              </button>
              <button onClick={() => setShowResolveForm(false)} className="text-gray-500 text-sm px-3 py-2">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
      <p className="text-orange-700 font-semibold text-sm mb-1">Payment Confirmation Required</p>
      <p className="text-gray-600 text-xs mb-4">The project owner has marked this project for completion. Please confirm you've been paid before badges are awarded.</p>
      <div className="flex gap-2">
        <button onClick={() => handleConfirm('confirmed')} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Confirm Payment Received'}
        </button>
        <button onClick={() => handleConfirm('disputed')} disabled={submitting} className="bg-white border border-red-300 text-red-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
          Dispute
        </button>
      </div>
    </div>
  );
};

const formatTimeline = (t) => ({
  '1-week': '1 Week', '2-weeks': '2 Weeks', '1-month': '1 Month',
  '2-3-months': '2-3 Months', '3-6-months': '3-6 Months',
  '6-months-plus': '6+ Months', 'flexible': 'Flexible'
}[t] || t);

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Application form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({ role: '', skills: '', message: '', portfolioUrl: '', linkedinUrl: '' });
  const [submittingApp, setSubmittingApp] = useState(false);
  const [paidLimit, setPaidLimit] = useState({ allowed: true, remaining: 3, used: 0, limit: 3, plan: 'Free' });

  useEffect(() => {
    if (currentUser) {
      import('../../utils/paidProjectLimits').then(({ checkPaidProjectLimit }) => {
        checkPaidProjectLimit(currentUser).then(setPaidLimit);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snap = await getDoc(doc(db, 'projects', projectId));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProject(data);
          if (currentUser) {
            setIsOwner(data.submitterId === currentUser.uid || data.submitterEmail === currentUser.email);
            const membersList = data.members || [];
            setIsMember(membersList.includes(currentUser.uid) || data.submitterId === currentUser.uid || data.submitterEmail === currentUser.email);
            // Check if already applied
            const appQuery = query(
              collection(db, 'project_applications'),
              where('projectId', '==', projectId),
              where('applicantEmail', '==', currentUser.email)
            );
            const appSnap = await getDocs(appQuery);
            setHasApplied(!appSnap.empty);
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId, currentUser]);

  const handleApply = async () => {
    if (!currentUser) { navigate('/login'); return; }
    if (!applyForm.role) { toast.error('Please select a role'); return; }
    if (!applyForm.skills.trim()) { toast.error('Please list your relevant skills'); return; }

    setSubmittingApp(true);
    try {
      await addDoc(collection(db, 'project_applications'), {
        projectId,
        projectTitle: project.projectTitle,
        applicantUid: currentUser.uid,
        applicantEmail: currentUser.email,
        applicantName: currentUser.displayName || currentUser.email,
        applicantPhoto: currentUser.photoURL || null,
        role: applyForm.role,
        skills: applyForm.skills.trim(),
        message: applyForm.message.trim() || null,
        portfolioUrl: applyForm.portfolioUrl.trim() || null,
        linkedinUrl: applyForm.linkedinUrl.trim() || null,
        status: 'submitted',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'projects', projectId), { applicationCount: increment(1) });
      setHasApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted!');

      // Notify project owner about new application
      try {
        // In-app notification
        if (project.submitterId) {
          await addDoc(collection(db, 'notifications'), {
            userId: project.submitterId,
            type: 'project_application',
            message: `${currentUser.displayName || currentUser.email} applied to "${project.projectTitle}" as ${applyForm.role}`,
            projectId,
            projectTitle: project.projectTitle,
            mentionedByName: currentUser.displayName || currentUser.email,
            mentionedByPhoto: currentUser.photoURL || null,
            isRead: false,
            createdAt: serverTimestamp(),
          });
        }
        // Email notification
        await notifyNewApplicationToOwner({
          projectOwnerEmail: project.submitterEmail || project.contactEmail,
          projectOwnerName: project.contactName || project.submitterName,
          applicantName: currentUser.displayName || currentUser.email,
          applicantEmail: currentUser.email,
          projectTitle: project.projectTitle,
          role: applyForm.role,
          skills: applyForm.skills.trim(),
          message: applyForm.message.trim() || '',
        });
      } catch (emailErr) {
        console.error('Notification failed (non-blocking):', emailErr);
      }
    } catch (err) {
      console.error('Error applying:', err);
      toast.error('Failed to submit application');
    }
    setSubmittingApp(false);
  };

  const inputClass = "w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[44px] text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none text-sm transition-all";

  if (loading) {
    return (
      <>
        
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
          <div className="text-center">
            <p className="text-gray-900 text-lg font-bold mb-4">Project not found</p>
            <Link to="/projects" className="text-blue-600 hover:text-blue-500 font-semibold text-sm">Back to Projects</Link>
          </div>
        </div>
      </>
    );
  }

  const isPaid = project.pricingType === 'paid';

  return (
    <>
      
      <div className="min-h-screen overflow-x-hidden " style={{ backgroundColor: '#ffffff' }}>
        <main className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">

            {/* Back */}
            <Link to="/projects" className="inline-flex items-center text-gray-400 hover:text-gray-900 text-sm font-semibold mb-6 transition-colors">
              ← Back to Projects
            </Link>

            {/* Header */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">{project.projectTitle}</h1>
                <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-blue-600/20 text-blue-500 border border-blue-600/30' : 'bg-blue-600/20 text-blue-500 border border-blue-600/30'}`}>
                  {isPaid ? `$${project.totalBudget?.toLocaleString()} Budget` : 'Free Project'}
                </span>
              </div>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">{project.projectDescription}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  ['Industry', getIndustryLabel(project.industryTrack)],
                  ['Timeline', formatTimeline(project.timeline)],
                  ['Team Size', `${project.maxTeamSize || 0} people`],
                  ['Level', project.experienceLevel === 'any-level' ? 'Any Level' : project.experienceLevel || 'Any'],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-gray-900 text-sm font-medium mt-0.5">{val}</p>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Start Date</p>
                  <p className="text-gray-900 text-sm font-medium mt-0.5">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">End Date</p>
                  <p className="text-gray-900 text-sm font-medium mt-0.5">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}</p>
                </div>
              </div>

              {/* Goals */}
              {project.projectGoals && (
                <div className="mb-6">
                  <h3 className="text-blue-600 font-semibold text-sm mb-2">Project Goals</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{project.projectGoals}</p>
                </div>
              )}

              {/* Posted by */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {project.submitterPhoto && (
                  <img src={project.submitterPhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-gray-900 text-sm font-semibold">{project.contactName || 'Project Owner'}</p>
                  <p className="text-gray-500 text-xs">{project.companyName || project.submitterEmail}</p>
                </div>
              </div>
            </div>

            {/* Team Roles */}
            {project.teamRoles && project.teamRoles.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Team Roles Needed</h2>
                <div className="space-y-3">
                  {project.teamRoles.map((role, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">{role.role}</p>
                        <p className="text-gray-400 text-xs mt-0.5">Skills: {role.skills}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {isPaid && role.paymentPerPerson > 0 && (
                          <span className="text-blue-500 text-xs font-bold">${role.paymentPerPerson.toLocaleString()} / person</span>
                        )}
                        <span className="text-gray-400 text-xs font-bold">{role.count} {role.count === 1 ? 'person' : 'people'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            {isPaid && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-8 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Total Project Budget</p>
                  <p className="text-blue-500 text-xl font-black mt-1">${project.totalBudget?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-1">Payment is distributed per role upon project completion</p>
                </div>
              </div>
            )}

            {/* Apply Section */}
            {!isOwner && currentUser && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-8">
                {/* Paid project limit check */}
                {project.pricingType === 'paid' && !paidLimit.allowed && paidLimit.plan !== 'Premium' ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 font-semibold text-sm mb-1">Paid project limit reached</p>
                    <p className="text-gray-500 text-xs mb-3">Basic members can complete up to {paidLimit.limit} paid projects per year. You've used {paidLimit.used} of {paidLimit.limit}.</p>
                    <button onClick={() => navigate('/settings?tab=membership')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all">
                      Upgrade to Premium
                    </button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center py-4">
                    <p className="text-blue-600 font-bold text-sm">You have already applied to this project</p>
                    <p className="text-gray-500 text-xs mt-1">The project owner will review your application</p>
                  </div>
                ) : isMember ? (
                  <div className="text-center py-4">
                    <p className="text-blue-600 font-bold text-sm mb-2">You are a member of this project</p>
                    <button onClick={() => navigate(`/projects/${projectId}/workspace`)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded-lg transition-all">
                      Open Workspace
                    </button>
                  </div>
                ) : project.applicationsOpen === false ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 font-semibold text-sm mb-1">Applications are closed</p>
                    <p className="text-gray-400 text-xs">The project owner has closed applications for this project.</p>
                  </div>
                ) : !showApplyForm ? (
                  <div className="text-center">
                    <button onClick={() => setShowApplyForm(true)}
                      className="px-8 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg">
                      Apply to This Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-gray-900 font-bold text-base">Apply to this project</h3>
                    <div>
                      <label className="block text-blue-600 font-semibold mb-2 text-sm">Role you are applying for *</label>
                      <select value={applyForm.role} onChange={e => setApplyForm(p => ({ ...p, role: e.target.value }))}
                        className={inputClass + " appearance-none"}>
                        <option value="">Select a role</option>
                        {(project.teamRoles || []).map((r, i) => (
                          <option key={i} value={r.role}>{r.role} ({r.count} {r.count === 1 ? 'spot' : 'spots'})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-blue-600 font-semibold mb-2 text-sm">Your Relevant Skills *</label>
                      <input type="text" value={applyForm.skills} onChange={e => setApplyForm(p => ({ ...p, skills: e.target.value }))}
                        className={inputClass} placeholder="e.g., React, Python, UI/UX Design" />
                    </div>
                    <div>
                      <label className="block text-blue-600 font-semibold mb-2 text-sm">Message to Project Owner</label>
                      <textarea value={applyForm.message} onChange={e => setApplyForm(p => ({ ...p, message: e.target.value }))}
                        className={inputClass + " resize-none"} rows="3" placeholder="Why are you interested in this project?" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-blue-600 font-semibold mb-2 text-sm">Portfolio / Resume URL</label>
                        <input type="url" value={applyForm.portfolioUrl} onChange={e => setApplyForm(p => ({ ...p, portfolioUrl: e.target.value }))}
                          className={inputClass} placeholder="https://your-portfolio.com or resume link" />
                      </div>
                      <div>
                        <label className="block text-blue-600 font-semibold mb-2 text-sm">LinkedIn URL</label>
                        <input type="url" value={applyForm.linkedinUrl} onChange={e => setApplyForm(p => ({ ...p, linkedinUrl: e.target.value }))}
                          className={inputClass} placeholder="https://linkedin.com/in/..." />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowApplyForm(false)}
                        className="px-5 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-100 text-gray-900 font-semibold rounded-xl text-sm transition-all">
                        Cancel
                      </button>
                      <button onClick={handleApply} disabled={submittingApp}
                        className="px-8 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg disabled:opacity-50">
                        {submittingApp ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Owner notice */}
            {isOwner && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-blue-700 font-semibold text-sm mb-1">You are the owner of this project</p>
                <p className="text-gray-500 text-xs mb-3">Manage applications from your dashboard</p>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/projects/${projectId}/workspace`)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all">
                    Open Workspace
                  </button>
                  <button onClick={() => navigate('/projects/owner-dashboard')} className="bg-white border border-gray-300 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                    Manage Applications
                  </button>
                  {project.status === 'active' && (
                    <button onClick={() => navigate(`/projects/${projectId}/complete`)} className="bg-white border border-gray-300 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
                      Complete Project
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Member workspace access */}
            {isMember && !isOwner && project.status !== 'awaiting_payment_confirmation' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <p className="text-blue-700 font-semibold text-sm mb-1">You are a member of this project</p>
                <p className="text-gray-500 text-xs mb-3">Access the workspace to collaborate with your team.</p>
                <button onClick={() => navigate(`/projects/${projectId}/workspace`)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-all">
                  Open Workspace
                </button>
              </div>
            )}

            {/* Payment Confirmation for members */}
            {isMember && !isOwner && project.status === 'awaiting_payment_confirmation' && (
              <PaymentConfirmationCard project={project} projectId={projectId} currentUser={currentUser} />
            )}

            {/* Not logged in */}
            {!currentUser && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
                <p className="text-gray-600 text-sm mb-3">Sign in to apply for this project</p>
                <Link to="/login" className="inline-flex px-6 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all items-center">
                  Sign In
                </Link>
              </div>
            )}

          </div>
        </main>
        <style jsx>{`select option { background-color: white; color: #111; }`}</style>
      </div>
    </>
  );
};

export default ProjectDetail;
