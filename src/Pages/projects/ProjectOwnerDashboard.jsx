// src/Pages/projects/ProjectOwnerDashboard.jsx - Manage Your Projects

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDocs, deleteDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
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
      await updateDoc(doc(db, 'project_applications', app.id), {
        status: 'approved', approvedAt: serverTimestamp(), approvedBy: currentUser.email,
      });
      await updateDoc(doc(db, 'projects', project.id), { applicationCount: increment(0) });
      toast.success(`${app.applicantName} approved!`);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden pt-20 sm:pt-24" style={{ backgroundColor: '#000' }}>
        <main className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Projects</span></h1>
                <p className="text-gray-400 text-sm mt-1">{myProjects.length} project{myProjects.length !== 1 ? 's' : ''} posted</p>
              </div>
              <Link to="/projects/submit" className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg">
                Post New Project
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                ['Total Projects', myProjects.length, 'from-orange-500 to-orange-600'],
                ['Pending Apps', myProjects.reduce((s, p) => s + (p.pendingCount || 0), 0), 'from-yellow-500 to-yellow-600'],
                ['Team Members', myProjects.reduce((s, p) => s + (p.approvedMembers?.length || 0), 0), 'from-green-500 to-green-600'],
                ['Completed', myProjects.filter(p => p.status === 'completed').length, 'from-purple-500 to-purple-600'],
              ].map(([label, val, grad]) => (
                <div key={label} className="bg-white/5 border border-white/20 rounded-xl p-4">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
                  <p className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${grad} mt-1`}>{val}</p>
                </div>
              ))}
            </div>

            {myProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-semibold mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm mb-6">Post your first project to get started</p>
                <Link to="/projects/submit" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl text-sm">Post a Project</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {myProjects.map(project => (
                  <ProjectCard key={project.id} project={project} currentUser={currentUser}
                    onApprove={(app) => approveApplication(project, app)}
                    onReject={rejectApplication}
                    onRemove={(app) => removeMember(project, app)}
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

const ProjectCard = ({ project, currentUser, onApprove, onReject, onRemove }) => {
  const [showApps, setShowApps] = useState(false);
  const isCompleted = project.status === 'completed';
  const pendingApps = (project.applications || []).filter(a => a.status === 'submitted');
  const approvedApps = (project.applications || []).filter(a => a.status === 'approved');
  const isPaid = project.pricingType === 'paid';

  return (
    <div className="bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white font-bold text-base sm:text-lg">{project.projectTitle}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-gray-300 text-[10px] font-medium">{getIndustryLabel(project.industryTrack)}</span>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-gray-300 text-[10px] font-medium">{formatTimeline(project.timeline)}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isPaid ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}`}>
              {isPaid ? `$${project.totalBudget?.toLocaleString()}` : 'Free'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCompleted ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}`}>
            {isCompleted ? 'Completed' : 'Active'}
          </span>
        </div>
      </div>

      {/* Approved Members */}
      {approvedApps.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs font-semibold mb-2">Team Members ({approvedApps.length})</p>
          <div className="space-y-2">
            {approvedApps.map(app => (
              <div key={app.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
                <div>
                  <p className="text-white text-sm font-semibold">{app.applicantName}</p>
                  <p className="text-gray-500 text-xs">{app.role} -- {app.applicantEmail}</p>
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
        <Link to={`/projects/${project.id}`} className="px-4 py-2 min-h-[40px] bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-xs transition-all flex items-center">
          View Details
        </Link>
        {!isCompleted && (
          <Link to={`/projects/${project.id}/complete`} className="px-4 py-2 min-h-[40px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center">
            Complete Project
          </Link>
        )}
        {!isCompleted && pendingApps.length > 0 && (
          <button onClick={() => setShowApps(!showApps)} className="px-4 py-2 min-h-[40px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg text-xs transition-all">
            Applications ({pendingApps.length})
          </button>
        )}
      </div>

      {/* Pending Applications */}
      {showApps && pendingApps.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <p className="text-orange-400 text-xs font-semibold">Pending Applications</p>
          {pendingApps.map(app => (
            <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <p className="text-white font-semibold text-sm">{app.applicantName}</p>
                  <p className="text-gray-400 text-xs">{app.applicantEmail}</p>
                  <p className="text-gray-400 text-xs mt-1">Role: <span className="text-white">{app.role}</span></p>
                  <p className="text-gray-400 text-xs">Skills: <span className="text-white">{app.skills}</span></p>
                  {app.message && <p className="text-gray-300 text-xs mt-2 italic">"{app.message}"</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => onApprove(app)} className="px-3 py-1.5 min-h-[36px] bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-xs transition-all">
                    Approve
                  </button>
                  <button onClick={() => onReject(app)} className="px-3 py-1.5 min-h-[36px] bg-red-500/20 hover:bg-red-500/40 text-red-300 font-bold rounded-lg text-xs transition-all border border-red-500/30">
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
