// src/Pages/projects/ProjectOwnerDashboard.jsx - Manage Your Projects

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDocs, deleteDoc, increment, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendPush } from '../../utils/pushNotifications';
import { toast } from 'react-toastify';
import { notifyApplicationApproved, notifyApplicationRejected } from '../../utils/emailNotifications';

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
const formatTimeline = (t) => ({ '1-week': '1 Week', '2-weeks': '2 Weeks', '1-month': '1 Month', '2-3-months': '2-3 Months', '3-6-months': '3-6 Months', '6-months-plus': '6+ Months', 'flexible': 'Flexible' }[t] || t);

const ProjectOwnerDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    const q = query(collection(db, 'projects'), where('submitterEmail', '==', currentUser.email));
    const unsub = onSnapshot(q, async (snap) => {
      const list = [];
      for (const d of snap.docs) {
        const project = { id: d.id, ...d.data() };
        // Fetch applications
        try {
          const appQ = query(collection(db, 'project_applications'), where('projectId', '==', d.id));
          const appSnap = await getDocs(appQ);
          project.applications = appSnap.docs.map(a => ({ id: a.id, ...a.data() }));
          project.pendingCount = project.applications.filter(a => a.status === 'submitted').length;
          project.approvedMembers = project.applications.filter(a => a.status === 'approved');
        } catch (e) { project.applications = []; project.pendingCount = 0; project.approvedMembers = []; }
        list.push(project);
      }
      list.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setMyProjects(list);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const approveApplication = async (project, app) => {
    try {
      // Soft cap: how many are already approved for this same role vs the role's target count.
      const roleName = app.role;
      const roleDef = (project.teamRoles || []).find(r => r.role === roleName);
      const cap = roleDef ? (parseInt(roleDef.count, 10) || 0) : 0;
      const approvedForRole = (project.applications || [])
        .filter(a => a.status === 'approved' && a.role === roleName).length;
      if (cap > 0 && approvedForRole >= cap) {
        const ok = window.confirm(
          `The "${roleName}" role is already full (${approvedForRole} of ${cap} filled). Approve this person anyway and grow the team beyond the planned size?`
        );
        if (!ok) return;
      }

      await updateDoc(doc(db, 'project_applications', app.id), {
        status: 'approved', approvedAt: serverTimestamp(), approvedBy: currentUser.email,
      });
      // Add member to project members array
      await updateDoc(doc(db, 'projects', project.id), { 
        applicationCount: increment(0),
        members: arrayUnion(app.applicantUid || app.applicantId || app.applicantEmail),
      });
      toast.success(`${app.applicantName} approved!`);

      // Immediately reflect the approval in local state so the UI updates
      // (the projects listener may not refire just from an application status change).
      setMyProjects(prev => prev.map(p => {
        if (p.id !== project.id) return p;
        const applications = (p.applications || []).map(a => a.id === app.id ? { ...a, status: 'approved' } : a);
        return {
          ...p,
          applications,
          pendingCount: applications.filter(a => a.status === 'submitted').length,
          approvedMembers: applications.filter(a => a.status === 'approved'),
        };
      }));

      // Send notification to applicant
      try {
        const userQ = query(collection(db, 'users'), where('email', '==', app.applicantEmail));
        const userSnap = await getDocs(userQ);
        if (!userSnap.empty) {
          await addDoc(collection(db, 'notifications'), {
            userId: userSnap.docs[0].id,
            type: 'application_approved',
            message: `Your application for "${project.projectTitle}" has been approved! You can now access the workspace.`,
            projectId: project.id,
            projectTitle: project.projectTitle,
            mentionedByName: currentUser.displayName || currentUser.email,
            mentionedByPhoto: currentUser.photoURL || null,
            isRead: false,
            createdAt: serverTimestamp(),
          });
          // Push to the approved member (non-blocking)
          sendPush({
            recipientUid: userSnap.docs[0].id,
            title: 'Application approved',
            body: `Your application for "${project.projectTitle}" was approved! You can now access the workspace.`,
            link: `/projects/${project.id}`,
          });
        }
      } catch (notifErr) { console.error('Approval notification error:', notifErr); }

      // Send approval email to applicant
      try {
        await notifyApplicationApproved({
          applicantEmail: app.applicantEmail,
          applicantName: app.applicantName,
          projectTitle: project.projectTitle,
          roleAppliedFor: app.role,
          projectOwner: project.contactName || currentUser.displayName,
        });
      } catch (emailErr) {
        console.error('Approval email failed (non-blocking):', emailErr);
      }
    } catch (e) { toast.error('Error approving: ' + e.message); }
  };

  const rejectApplication = async (app) => {
    try {
      await updateDoc(doc(db, 'project_applications', app.id), {
        status: 'rejected', rejectedAt: serverTimestamp(), rejectedBy: currentUser.email,
      });
      toast.success(`Application rejected`);

      // Reflect immediately in local state.
      setMyProjects(prev => prev.map(p => {
        const applications = (p.applications || []).map(a => a.id === app.id ? { ...a, status: 'rejected' } : a);
        return {
          ...p,
          applications,
          pendingCount: applications.filter(a => a.status === 'submitted').length,
          approvedMembers: applications.filter(a => a.status === 'approved'),
        };
      }));

      // Send rejection email to applicant
      try {
        await notifyApplicationRejected(
          { applicantEmail: app.applicantEmail, applicantName: app.applicantName },
          { projectTitle: app.projectTitle },
          ''
        );
      } catch (emailErr) {
        console.error('Rejection email failed (non-blocking):', emailErr);
      }
    } catch (e) { toast.error('Error rejecting: ' + e.message); }
  };

  const removeMember = async (project, app) => {
    if (!window.confirm(`Remove ${app.applicantName} from this project? This cannot be undone.`)) return;
    try {
      await updateDoc(doc(db, 'project_applications', app.id), {
        status: 'removed', removedAt: serverTimestamp(), removedBy: currentUser.email,
      });
      toast.success(`${app.applicantName} removed from project`);
    } catch (e) { toast.error('Error removing member: ' + e.message); }
  };

  const toggleApplications = async (project) => {
    try {
      const newState = project.applicationsOpen === false ? true : false;
      await updateDoc(doc(db, 'projects', project.id), { applicationsOpen: newState });
      toast.success(newState ? 'Applications opened' : 'Applications closed');
    } catch (e) { toast.error('Error updating applications status'); }
  };

  // Owners can't delete directly - they request deletion (admin approves).
  // Only allowed while no members have joined; otherwise they must close/dispute.
  const requestDeletion = async (project) => {
    if ((project.approvedMembers?.length || 0) > 0) {
      toast.error('This project has members. Close or dispute it instead of deleting.');
      return;
    }
    const reason = window.prompt('Why do you want to delete this project? An admin will review your request.');
    if (reason === null) return;
    if (!reason.trim()) { toast.error('Please add a reason for the request.'); return; }
    try {
      await addDoc(collection(db, 'deletionRequests'), {
        projectId: project.id,
        projectTitle: project.projectTitle || project.title || '',
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        reason: reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'projects', project.id), { deletionRequested: true });
      setMyProjects(prev => prev.map(p => p.id === project.id ? { ...p, deletionRequested: true } : p));
      toast.success('Deletion request sent. An admin will review it.');
    } catch (e) { console.error('deletion request failed', e); toast.error('Could not send the request.'); }
  };

  if (loading) {
    return (
      <>
        
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <div className="min-h-screen overflow-x-hidden " style={{ backgroundColor: '#ffffff' }}>
        <main className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">Projects</span></h1>
                <p className="text-gray-400 text-sm mt-1">{myProjects.length} project{myProjects.length !== 1 ? 's' : ''} posted</p>
              </div>
              <Link to="/projects/submit" className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg">
                Post New Project
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                ['Total Projects', myProjects.length, 'from-blue-500 to-blue-600'],
                ['Pending Apps', myProjects.reduce((s, p) => s + (p.pendingCount || 0), 0), 'from-orange-500 to-orange-600'],
                ['Team Members', myProjects.reduce((s, p) => s + (p.approvedMembers?.length || 0), 0), 'from-blue-500 to-blue-600'],
                ['Completed', myProjects.filter(p => p.status === 'completed' || p.reviewStatus === 'rejected').length, 'from-blue-500 to-blue-600'],
              ].map(([label, val, grad]) => (
                <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
                  <p className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${grad} mt-1`}>{val}</p>
                </div>
              ))}
            </div>

            {myProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-semibold mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm mb-6">Post your first project to get started</p>
                <Link to="/projects/submit" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-gray-900 font-bold rounded-xl text-sm">Post a Project</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {myProjects.map(project => (
                  <ProjectCard key={project.id} project={project} currentUser={currentUser}
                    onApprove={(app) => approveApplication(project, app)}
                    onReject={rejectApplication}
                    onRemove={(app) => removeMember(project, app)}
                    onToggleApplications={toggleApplications}
                    onRequestDeletion={() => requestDeletion(project)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

const ProjectCard = ({ project, currentUser, onApprove, onReject, onRemove, onToggleApplications, onRequestDeletion }) => {
  const [showApps, setShowApps] = useState(false);
  const isRejected = project.reviewStatus === 'rejected';
  const isCompleted = project.status === 'completed' || isRejected;
  const pendingApps = (project.applications || []).filter(a => a.status === 'submitted');
  const approvedApps = (project.applications || []).filter(a => a.status === 'approved');

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-gray-900 font-bold text-base sm:text-lg">{project.projectTitle}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600 text-[10px] font-medium">{getIndustryLabel(project.industryTrack)}</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600 text-[10px] font-medium">{formatTimeline(project.timeline)}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/20 text-blue-500">
              Collaborative
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isRejected ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-600/20 text-blue-500 border-blue-600/30'}`}>
            {isRejected ? 'Rejected' : isCompleted ? 'Completed' : 'Active'}
          </span>
        </div>
      </div>

      {/* Approved Members */}
      {approvedApps.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs font-semibold mb-2">Team Members ({approvedApps.length})</p>
          <div className="space-y-2">
            {approvedApps.map(app => (
              <div key={app.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div>
                  <Link to={`/profile/${encodeURIComponent(app.applicantEmail)}`} className="text-gray-900 text-sm font-semibold hover:text-blue-600 hover:underline">{app.applicantName}</Link>
                  <p className="text-gray-500 text-xs">{app.role}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {app.portfolioUrl && <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px] hover:underline">Portfolio</a>}
                    {app.linkedinUrl && <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px] hover:underline">LinkedIn</a>}
                  </div>
                </div>
                {!isCompleted && (
                  <button onClick={() => onRemove(app)} className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors px-2 py-1">
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link to={`/projects/${project.id}`} className="px-4 py-2 min-h-[40px] bg-gray-100 hover:bg-gray-100 text-gray-900 font-semibold rounded-lg text-xs transition-all flex items-center">
          View Details
        </Link>
        <Link to={`/projects/${project.id}/workspace`} className="px-4 py-2 min-h-[40px] bg-gray-100 hover:bg-gray-100 text-gray-900 font-semibold rounded-lg text-xs transition-all flex items-center">
          Workspace
        </Link>
        {!isCompleted && (
          <Link to={`/projects/${project.id}/setup`} className="px-4 py-2 min-h-[40px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg text-xs transition-all flex items-center">
            Edit Project
          </Link>
        )}
        {!isCompleted && (
          <Link to={`/projects/${project.id}/complete`} className="px-4 py-2 min-h-[40px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center">
            {project.reviewStatus === 'approved' ? 'Assign Badges'
              : project.reviewStatus === 'submitted' ? 'Review Pending'
              : project.reviewStatus === 'needs_changes' ? 'Changes Requested'
              : project.reviewStatus === 'rejected' ? 'Not Approved'
              : 'Submit for Review'}
          </Link>
        )}
        {!isCompleted && (
          <button onClick={() => onToggleApplications(project)} className={`px-4 py-2 min-h-[40px] font-semibold rounded-lg text-xs transition-all ${project.applicationsOpen === false ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100'}`}>
            {project.applicationsOpen === false ? 'Open Applications' : 'Close Applications'}
          </button>
        )}
        {!isCompleted && (project.approvedMembers?.length || 0) === 0 && (
          project.deletionRequested ? (
            <span className="px-4 py-2 min-h-[40px] text-amber-600 text-xs font-semibold flex items-center">Deletion requested</span>
          ) : (
            <button onClick={onRequestDeletion} className="px-4 py-2 min-h-[40px] bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg text-xs transition-all flex items-center">
              Request deletion
            </button>
          )
        )}
        {!isCompleted && pendingApps.length > 0 && (
          <button onClick={() => setShowApps(!showApps)} className="px-4 py-2 min-h-[40px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all">
            Applications ({pendingApps.length})
          </button>
        )}
      </div>

      {/* Pending Applications */}
      {showApps && pendingApps.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <p className="text-blue-600 text-xs font-semibold">Pending Applications</p>
          {pendingApps.map(app => (
            <div key={app.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <Link to={`/profile/${encodeURIComponent(app.applicantEmail)}`} className="text-gray-900 font-semibold text-sm hover:text-blue-600 hover:underline">{app.applicantName}</Link>
                  <p className="text-gray-400 text-xs mt-1">Role: <span className="text-gray-900">{app.role}</span></p>
                  <p className="text-gray-400 text-xs">Skills: <span className="text-gray-900">{app.skills}</span></p>
                  {app.message && <p className="text-gray-600 text-xs mt-2 italic">"{app.message}"</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {app.portfolioUrl && <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">Portfolio / Resume</a>}
                    {app.linkedinUrl && <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">LinkedIn</a>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => onApprove(app)} className="px-3 py-1.5 min-h-[36px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all">
                    Approve
                  </button>
                  <button onClick={() => onReject(app)} className="px-3 py-1.5 min-h-[36px] bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition-all border border-red-200">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectOwnerDashboard;
