// src/Pages/projects/ProjectCompletion.jsx - Complete Project + Assign Badges + Update Payments

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';
import { notifyBadgeAwarded } from '../../utils/emailNotifications';
import { logActivity as logProofEvent } from '../../utils/activityFeed';
import { logActivity } from '../../utils/activityLog';
import { REVIEW_STATUS, submitProjectForReview, getProjectMemberEmails } from '../../utils/projectReview';

const badgeCategories = {
  'mentorship': { id: 'techmo', name: 'TechMO (Mentor)', color: 'from-blue-500 to-blue-600' },
  'quality-assurance': { id: 'techqa', name: 'TechQA (QA Tester)', color: 'from-blue-500 to-blue-600' },
  'development': { id: 'techdev', name: 'TechDev (Developer)', color: 'from-blue-500 to-blue-600' },
  'leadership': { id: 'techleads', name: 'TechLeads (Leader)', color: 'from-blue-500 to-blue-600' },
  'design': { id: 'techarchs', name: 'TechArchs (Designer)', color: 'from-orange-500 to-orange-600' },
  'security': { id: 'techguard', name: 'TechGuard (Security)', color: 'from-red-500 to-red-600' },
};

const badgeLevels = ['Novice', 'Associate', 'Advanced', 'Expert'];
const contributionLevels = ['poor', 'fair', 'good', 'excellent'];

const determineBadgeLevel = (projectCount) => {
  if (projectCount <= 1) return 'Novice';
  if (projectCount <= 5) return 'Associate';
  if (projectCount <= 10) return 'Advanced';
  return 'Expert';
};

const fetchBadgeCount = async (email, category) => {
  try {
    const q = query(collection(db, 'member_badges'), where('memberEmail', '==', email), where('badgeCategory', '==', category));
    const snap = await getDocs(q);
    return snap.docs.length;
  } catch { return 0; }
};

const ProjectCompletion = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=review, 2=evaluate, 4=done
  const [submittingReview, setSubmittingReview] = useState(false);

  const reviewStatus = project?.reviewStatus || REVIEW_STATUS.NONE;
  const isApproved = reviewStatus === REVIEW_STATUS.APPROVED;
  const isRejected = reviewStatus === REVIEW_STATUS.REJECTED;
  const isUnderReview = reviewStatus === REVIEW_STATUS.SUBMITTED;
  const needsChanges = reviewStatus === REVIEW_STATUS.NEEDS_CHANGES;

  const handleSubmitForReview = async () => {
    const submissionUrl = project?.resources?.submissionUrl;
    if (!submissionUrl || !submissionUrl.trim()) {
      toast.error('Add a project submission link on the workspace Resources tab before submitting for review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const memberEmails = await getProjectMemberEmails(projectId);
      await submitProjectForReview({ ...project, id: projectId }, currentUser, submissionUrl);
      toast.success('Submitted to Loomiqe for review. You will be notified once it is reviewed.');
      await fetchData();
    } catch (e) {
      toast.error(e.message || 'Could not submit for review.');
    }
    setSubmittingReview(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectId, currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (!snap.exists()) { toast.error('Project not found'); navigate('/projects/owner-dashboard'); return; }
      const data = { id: snap.id, ...snap.data() };

      // Verify ownership
      if (data.submitterEmail !== currentUser.email && data.submitterId !== currentUser.uid) {
        toast.error('Only the project owner can complete this project');
        navigate('/projects'); return;
      }

      if (data.status === 'completed') { setStep(4); }
      setProject(data);

      // Fetch approved members
      const appQ = query(collection(db, 'project_applications'), where('projectId', '==', projectId), where('status', '==', 'approved'));
      const appSnap = await getDocs(appQ);
      const membersList = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(membersList);

      // Initialize evaluations
      if (data.status !== 'completed') {
        const evals = [];
        for (const member of membersList) {
          const defaultCategory = mapRoleToCategory(member.role);
          const count = await fetchBadgeCount(member.applicantEmail, defaultCategory);
          evals.push({
            memberId: member.id,
            memberEmail: member.applicantEmail,
            memberName: member.applicantName,
            memberRole: member.role,
            badgeCategory: defaultCategory,
            badgeLevel: determineBadgeLevel(count),
            contribution: 'good',
            notes: '',
            awardBadge: true, // can be set to false
            projectCount: count,
          });
        }
        setEvaluations(evals);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching project:', err);
      toast.error('Error loading project');
      setLoading(false);
    }
  };

  const mapRoleToCategory = (role) => {
    const r = (role || '').toLowerCase();
    if (r.includes('mentor')) return 'mentorship';
    if (r.includes('qa') || r.includes('test')) return 'quality-assurance';
    if (r.includes('lead') || r.includes('project')) return 'leadership';
    if (r.includes('design')) return 'design';
    if (r.includes('security')) return 'security';
    return 'development';
  };

  const updateEval = (index, field, value) => {
    setEvaluations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Auto-update badge level when category changes
      if (field === 'badgeCategory') {
        const count = updated[index].projectCount || 0;
        updated[index].badgeLevel = determineBadgeLevel(count);
      }
      return updated;
    });
  };

  // Finalize completion: evaluate contributions, award badges, mark complete
  const handleComplete = async () => {
    if (members.length > 0) {
      const hasEvals = evaluations.every(e => e.contribution);
      if (!hasEvals) { toast.error('Please rate contribution for all members'); return; }
    }

    setSubmitting(true);
    try {
      // Award badges for members who earned them
      for (const ev of evaluations) {
        if (ev.awardBadge && ev.contribution !== 'poor') {
          await addDoc(collection(db, 'member_badges'), {
            memberEmail: ev.memberEmail,
            memberName: ev.memberName,
            badgeCategory: ev.badgeCategory,
            badgeLevel: ev.badgeLevel,
            badgeName: badgeCategories[ev.badgeCategory]?.name || ev.badgeCategory,
            projectId: projectId,
            projectTitle: project.projectTitle,
            contribution: ev.contribution,
            notes: ev.notes || null,
            awardedBy: currentUser.email,
            awardedByName: currentUser.displayName || currentUser.email,
            awardedAt: serverTimestamp(),
          });

          // Update the member's user profile with badge count AND badges array
          try {
            const userQ = query(collection(db, 'users'), where('email', '==', ev.memberEmail));
            const userSnap = await getDocs(userQ);
            if (!userSnap.empty) {
              const userDoc = userSnap.docs[0];
              const badgeFieldKey = `badgeCounts.${ev.badgeCategory}`;
              const badgeEntry = {
                id: badgeCategories[ev.badgeCategory]?.id || ev.badgeCategory,
                title: badgeCategories[ev.badgeCategory]?.name || ev.badgeCategory,
                level: ev.badgeLevel,
                category: ev.badgeCategory,
                contribution: ev.contribution,
                role: ev.memberRole || null,
                projectId: projectId,
                projectTitle: project.projectTitle || project.title || null,
                awardedAt: new Date().toISOString(),
              };
              await updateDoc(doc(db, 'users', userDoc.id), {
                totalBadges: increment(1),
                [badgeFieldKey]: increment(1),
                badges: arrayUnion(badgeEntry),
              });
            }
          } catch (badgeUpdateErr) {
            console.error('Error updating user badge count:', badgeUpdateErr);
          }

          // Send badge awarded email to member
          try {
            await notifyBadgeAwarded(
              { badgeCategory: ev.badgeCategory, badgeLevel: ev.badgeLevel, contribution: ev.contribution, skillsDisplayed: ev.skills ? ev.skills.split(',').map(s => s.trim()) : [], adminNotes: ev.notes || '' },
              { projectTitle: project.projectTitle, projectId },
              { memberEmail: ev.memberEmail, memberName: ev.memberName, memberRole: ev.memberRole }
            );
          } catch (emailErr) {
            console.error('Badge email failed (non-blocking):', emailErr);
          }

          // Proof Wall: log a badge proof event (non-blocking).
          logProofEvent({
            type: 'badge',
            actorName: ev.memberName || ev.memberEmail,
            badgeName: `${badgeCategories[ev.badgeCategory]?.name || ev.badgeCategory} · ${ev.badgeLevel}`,
            projectTitle: project.projectTitle || project.title || null,
            meta: `Earned on ${project.projectTitle || 'a project'}`,
          });
        }
      }

      // Mark project as completed
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'completed',
        isActive: false,
        completedAt: serverTimestamp(),
        completedBy: currentUser.email,
        completionData: {
          evaluations: evaluations.map(e => ({
            memberEmail: e.memberEmail, memberName: e.memberName, role: e.memberRole,
            badgeCategory: e.badgeCategory, badgeLevel: e.badgeLevel, contribution: e.contribution,
            awardBadge: e.awardBadge, notes: e.notes,
          })),
          completedAt: new Date().toISOString(),
          completedBy: currentUser.email,
          teamSize: members.length,
          badgesAwarded: evaluations.filter(e => e.awardBadge && e.contribution !== 'poor').length,
        },
      });

      // Proof Wall: log a project-shipped proof event (non-blocking).
      logProofEvent({
        type: 'ship',
        actorName: members.length > 0 ? `A team of ${members.length}` : (currentUser.displayName || 'A member'),
        projectTitle: project.projectTitle || project.title || 'a project',
        meta: 'Project completed and archived',
      });

      // Award owner a TechLeads badge + certificate automatically
      try {
        const ownerBadgeCount = await fetchBadgeCount(currentUser.email, 'leadership');
        const ownerBadgeLevel = determineBadgeLevel(ownerBadgeCount);

        // Save to member_badges collection
        await addDoc(collection(db, 'member_badges'), {
          memberEmail: currentUser.email,
          memberName: currentUser.displayName || currentUser.email,
          badgeCategory: 'leadership',
          badgeLevel: ownerBadgeLevel,
          badgeName: 'TechLeads (Leader)',
          projectId: projectId,
          projectTitle: project.projectTitle || project.title,
          contribution: 'excellent',
          notes: 'Project owner — completed project successfully',
          awardedBy: 'system',
          awardedByName: 'Loomiqe System',
          awardedAt: serverTimestamp(),
          isOwnerBadge: true,
        });

        // Update owner's user profile with badge
        const ownerQ = query(collection(db, 'users'), where('email', '==', currentUser.email));
        const ownerSnap = await getDocs(ownerQ);
        if (!ownerSnap.empty) {
          const ownerDoc = ownerSnap.docs[0];
          await updateDoc(doc(db, 'users', ownerDoc.id), {
            totalBadges: increment(1),
            'badgeCounts.leadership': increment(1),
            badges: arrayUnion({
              id: 'techleads',
              title: 'TechLeads (Leader)',
              level: ownerBadgeLevel,
              category: 'leadership',
              projectId: projectId,
              awardedAt: new Date().toISOString(),
            }),
            // Certificate for owner
            certificates: arrayUnion({
              projectId: projectId,
              projectTitle: project.projectTitle || project.title,
              role: 'Project Owner',
              teamSize: members.length,
              completedAt: new Date().toISOString(),
              badgesAwarded: evaluations.filter(e => e.awardBadge && e.contribution !== 'poor').length,
            }),
          });
        }
      } catch (ownerBadgeErr) {
        console.error('Error awarding owner badge/certificate:', ownerBadgeErr);
      }

      // Update removed/poor performers
      for (const ev of evaluations) {
        if (!ev.awardBadge || ev.contribution === 'poor') {
          await updateDoc(doc(db, 'project_applications', ev.memberId), {
            completionStatus: ev.awardBadge ? 'completed_no_badge' : 'no_badge_assigned',
            completionNotes: ev.notes || 'No badge awarded',
          });
        }
      }

      // Notify all members that the project is completed
      for (const ev of evaluations) {
        try {
          const userQ = query(collection(db, 'users'), where('email', '==', ev.memberEmail));
          const userSnap = await getDocs(userQ);
          if (!userSnap.empty) {
            const badgeAwarded = ev.awardBadge && ev.contribution !== 'poor';
            await addDoc(collection(db, 'notifications'), {
              userId: userSnap.docs[0].id,
              type: 'project_completed',
              message: badgeAwarded
                ? `🎉 "${project.projectTitle || project.title}" is complete! You earned a ${badgeCategories[ev.badgeCategory]?.name || ev.badgeCategory} badge (${ev.badgeLevel}).`
                : `"${project.projectTitle || project.title}" has been completed.`,
              projectId: projectId,
              projectTitle: project.projectTitle || project.title,
              mentionedByName: currentUser.displayName || currentUser.email,
              mentionedByPhoto: currentUser.photoURL || null,
              isRead: false,
              createdAt: serverTimestamp(),
            });
          }
        } catch (notifErr) { console.error('Member completion notification error:', notifErr); }
      }

      setStep(4);
      toast.success('Project completed successfully!');

      // Log completion
      await logActivity(projectId, {
        type: 'project_completed',
        actor: currentUser.email,
        actorName: currentUser.displayName || currentUser.email,
        description: `Project completed. ${evaluations.filter(e => e.awardBadge && e.contribution !== 'poor').length} badges awarded to ${members.length} members.`,
        metadata: {
          teamSize: members.length,
          badgesAwarded: evaluations.filter(e => e.awardBadge && e.contribution !== 'poor').length,
        },
      });
    } catch (err) {
      console.error('Error completing project:', err);
      toast.error('Error completing project: ' + err.message);
    } finally {
      setSubmitting(false);
    }
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
          <p className="text-gray-900">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      
      <div className="min-h-screen overflow-x-hidden " style={{ backgroundColor: '#ffffff' }}>
        <main className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">

            <Link to="/projects/owner-dashboard" className="inline-flex items-center text-gray-400 hover:text-gray-900 text-sm font-semibold mb-6 transition-colors">
              Back to My Projects
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">Project</span>
              </h1>
              <p className="text-gray-400 text-sm">{project.projectTitle}</p>
            </div>

            {/* ===== Admin review gate ===== */}
            {!isApproved && step !== 4 && (
              <div className="mb-8">
                {isRejected ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <h2 className="text-lg font-bold text-red-700 mb-1">Project not approved</h2>
                    <p className="text-gray-600 text-sm mb-2">{project.reviewFeedback || 'This project did not meet the requirements for approval.'}</p>
                    <p className="text-gray-500 text-xs">No badges can be assigned, and this project cannot be re-submitted.</p>
                  </div>
                ) : isUnderReview ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                    <h2 className="text-lg font-bold text-blue-700 mb-1">Submitted for review</h2>
                    <p className="text-gray-600 text-sm">Your project is with the Loomiqe team. You will be notified once it is reviewed. Badges can be assigned only after approval.</p>
                    <p className="text-gray-400 text-xs mt-3">Submission link: <a href={project.reviewSubmissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{project.reviewSubmissionUrl}</a></p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{needsChanges ? 'Changes requested' : 'Submit for review'}</h2>
                    {needsChanges && (
                      <div className="bg-white border border-amber-200 rounded-lg p-3 mb-3">
                        <p className="text-amber-800 text-sm font-medium">Reviewer note:</p>
                        <p className="text-gray-700 text-sm">{project.reviewFeedback || 'Please review your submission and re-submit.'}</p>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mb-3">
                      Before badges can be assigned, your project must be reviewed and approved by Loomiqe. We review the <strong>submission link</strong> from your Resources tab (a folder containing all your team's work, the team members, and your final solutions) along with your <strong>workspace</strong>, which is included automatically.
                    </p>
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <p>Submission link: {project?.resources?.submissionUrl
                        ? <a href={project.resources.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{project.resources.submissionUrl}</a>
                        : <span className="text-red-500">Not set — add it on the workspace Resources tab.</span>}</p>
                      <p>You can update the link on the Resources tab and re-submit at any time.</p>
                    </div>
                    <button onClick={handleSubmitForReview} disabled={submittingReview}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                      {submittingReview ? 'Submitting...' : needsChanges ? 'Re-submit for review' : 'Submit for review'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {isApproved && step !== 4 && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-bold text-sm">Approved by Loomiqe — you can now assign badges to your team.</p>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <div className="bg-blue-600/10 border border-gray-200 rounded-2xl p-8 text-center">
                <svg className="w-16 h-16 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-blue-500 mb-2">Project Completed</h2>
                <p className="text-gray-400 text-sm mb-6">Badges and certificates have been awarded to all qualifying members.</p>
                <div className="flex justify-center gap-3">
                  <Link to="/projects/owner-dashboard" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-100 text-gray-900 font-semibold rounded-xl text-sm transition-all">
                    Back to Dashboard
                  </Link>
                  <Link to="/projects" className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-gray-900 font-bold rounded-xl text-sm transition-all">
                    Browse Projects
                  </Link>
                </div>
              </div>
            )}

            {/* Step 1: Review (only after admin approval) */}
            {isApproved && step === 1 && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Project Summary</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-gray-500 text-[10px] uppercase font-semibold">Team Size</p>
                      <p className="text-gray-900 text-lg font-bold mt-0.5">{members.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <p className="text-gray-500 text-[10px] uppercase font-semibold">Type</p>
                      <p className="text-gray-900 text-lg font-bold mt-0.5">Collaborative</p>
                    </div>
                  </div>

                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-sm mb-4">No team members. This will be completed as a solo project.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-3">Team Members</p>
                      <div className="space-y-2">
                        {members.map(m => (
                          <div key={m.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div>
                              <p className="text-gray-900 text-sm font-semibold">{m.applicantName}</p>
                              <p className="text-gray-500 text-xs">{m.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setStep(2)}
                  className="w-full py-3.5 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all shadow-lg">
                  {members.length > 0 ? 'Proceed to Evaluation' : 'Complete Solo Project'}
                </button>
              </div>
            )}

            {/* Step 2: Evaluate */}
            {isApproved && step === 2 && (
              <div className="space-y-6">
                {members.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 text-sm mb-4">Solo project - no members to evaluate.</p>
                    <button onClick={handleComplete} disabled={submitting}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                      {submitting ? 'Completing...' : 'Complete Project'}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm text-center">Evaluate each team member. You can choose to award or skip a badge.</p>

                    {evaluations.map((ev, index) => (
                      <div key={ev.memberId} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 font-bold text-sm">{ev.memberName}</p>
                            <p className="text-gray-500 text-xs">{ev.memberRole} - {ev.memberEmail}</p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={ev.awardBadge} onChange={e => updateEval(index, 'awardBadge', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
                            <span className="text-gray-600 text-xs font-semibold">Award Badge</span>
                          </label>
                        </div>

                        {ev.awardBadge && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Badge Category</label>
                              <select value={ev.badgeCategory} onChange={e => updateEval(index, 'badgeCategory', e.target.value)}
                                className={inputClass + " appearance-none"}>
                                {Object.entries(badgeCategories).map(([key, val]) => (
                                  <option key={key} value={key}>{val.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Badge Level (auto)</label>
                              <input type="text" value={ev.badgeLevel} readOnly className={inputClass + " bg-gray-50 cursor-not-allowed"} />
                              <p className="text-gray-600 text-[10px] mt-0.5">{ev.projectCount} previous project{ev.projectCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-xs mb-1">Contribution</label>
                              <select value={ev.contribution} onChange={e => updateEval(index, 'contribution', e.target.value)}
                                className={inputClass + " appearance-none"}>
                                {contributionLevels.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                              </select>
                            </div>
                          </div>
                        )}

                        {!ev.awardBadge && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <p className="text-red-300 text-xs">No badge will be awarded to this member.</p>
                          </div>
                        )}

                        {ev.contribution === 'poor' && ev.awardBadge && (
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                            <p className="text-orange-500 text-xs">Poor contribution - badge will not be awarded even if selected.</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Notes (optional)</label>
                          <input type="text" value={ev.notes} onChange={e => updateEval(index, 'notes', e.target.value)}
                            className={inputClass} placeholder="Performance notes..." />
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="px-5 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-100 text-gray-900 font-semibold rounded-xl text-sm transition-all">
                        Back
                      </button>
                      <button onClick={handleComplete} disabled={submitting}
                        className="flex-1 py-3.5 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm transition-all shadow-lg disabled:opacity-50">
                        {submitting ? 'Completing Project...' : 'Complete Project & Award Badges'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </main>
        <style jsx>{`select option { background-color: #111; color: white; }`}</style>
      </div>
    </>
  );
};

export default ProjectCompletion;
