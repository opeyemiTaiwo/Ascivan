// src/Pages/projects/ProjectCompletion.jsx - Complete Project + Assign Badges + Update Payments

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { doc, getDoc, updateDoc, addDoc, collection, query, where, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const badgeCategories = {
  'mentorship': { id: 'techmo', name: 'TechMO (Mentor)', color: 'from-orange-500 to-orange-600' },
  'quality-assurance': { id: 'techqa', name: 'TechQA (QA Tester)', color: 'from-green-500 to-green-600' },
  'development': { id: 'techdev', name: 'TechDev (Developer)', color: 'from-blue-500 to-blue-600' },
  'leadership': { id: 'techleads', name: 'TechLeads (Leader)', color: 'from-purple-500 to-purple-600' },
  'design': { id: 'techarchs', name: 'TechArchs (Designer)', color: 'from-pink-500 to-pink-600' },
  'security': { id: 'techguard', name: 'TechGuard (Security)', color: 'from-red-500 to-red-600' },
};

const badgeLevels = ['novice', 'beginners', 'intermediate', 'expert'];
const contributionLevels = ['poor', 'fair', 'good', 'excellent'];

const determineBadgeLevel = (projectCount) => {
  if (projectCount <= 1) return 'novice';
  if (projectCount <= 5) return 'beginners';
  if (projectCount <= 10) return 'intermediate';
  return 'expert';
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
  const [step, setStep] = useState(1); // 1=review, 2=evaluate, 3=done

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

      if (data.status === 'completed') { setStep(3); }
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

  const handleComplete = async () => {
    if (members.length > 0) {
      const hasEvals = evaluations.every(e => e.contribution);
      if (!hasEvals) { toast.error('Please rate contribution for all members'); return; }
    }

    setSubmitting(true);
    try {
      const isPaid = project.pricingType === 'paid';
      const perPersonPayment = project.perPersonPayment || 0;

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
        }

        // Update payment tracking for paid projects
        if (isPaid && perPersonPayment > 0 && ev.contribution !== 'poor') {
          // Update member earnings
          const userQ = query(collection(db, 'users'), where('email', '==', ev.memberEmail));
          const userSnap = await getDocs(userQ);
          if (!userSnap.empty) {
            const userDoc = userSnap.docs[0];
            await updateDoc(doc(db, 'users', userDoc.id), {
              totalEarnings: increment(perPersonPayment),
              completedPaidProjects: increment(1),
            });
          }
        }
      }

      // Update project owner's disbursement tracking for paid projects
      if (isPaid && project.totalBudget > 0) {
        const earnedMembers = evaluations.filter(e => e.contribution !== 'poor').length;
        const totalDisbursed = earnedMembers * perPersonPayment;
        const ownerQ = query(collection(db, 'users'), where('email', '==', currentUser.email));
        const ownerSnap = await getDocs(ownerQ);
        if (!ownerSnap.empty) {
          const ownerDoc = ownerSnap.docs[0];
          await updateDoc(doc(db, 'users', ownerDoc.id), {
            totalDisbursed: increment(totalDisbursed),
            completedPostedProjects: increment(1),
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

      // Update removed/poor performers
      for (const ev of evaluations) {
        if (!ev.awardBadge || ev.contribution === 'poor') {
          await updateDoc(doc(db, 'project_applications', ev.memberId), {
            completionStatus: ev.awardBadge ? 'completed_no_badge' : 'no_badge_assigned',
            completionNotes: ev.notes || 'No badge awarded',
          });
        }
      }

      setStep(3);
      toast.success('Project completed successfully!');
    } catch (err) {
      console.error('Error completing project:', err);
      toast.error('Error completing project: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[44px] text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm transition-all";

  if (loading) {
    return (
      <><Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <><Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000' }}>
          <p className="text-white">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-x-hidden pt-20 sm:pt-24" style={{ backgroundColor: '#000' }}>
        <main className="pb-16 sm:pb-20">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">

            <Link to="/projects/owner-dashboard" className="inline-flex items-center text-gray-400 hover:text-white text-sm font-semibold mb-6 transition-colors">
              Back to My Projects
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Project</span>
              </h1>
              <p className="text-gray-400 text-sm">{project.projectTitle}</p>
            </div>

            {/* Step 3: Done */}
            {step === 3 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold text-green-300 mb-2">Project Completed</h2>
                <p className="text-gray-400 text-sm mb-6">Badges have been awarded and payments updated for all qualifying members.</p>
                <div className="flex justify-center gap-3">
                  <Link to="/projects/owner-dashboard" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all">
                    Back to Dashboard
                  </Link>
                  <Link to="/projects" className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl text-sm transition-all">
                    Browse Projects
                  </Link>
                </div>
              </div>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/20 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Project Summary</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-gray-500 text-[10px] uppercase font-semibold">Team Size</p>
                      <p className="text-white text-lg font-bold mt-0.5">{members.length}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <p className="text-gray-500 text-[10px] uppercase font-semibold">Type</p>
                      <p className="text-white text-lg font-bold mt-0.5">{project.pricingType === 'paid' ? 'Paid' : 'Free'}</p>
                    </div>
                    {project.pricingType === 'paid' && (
                      <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                        <p className="text-gray-500 text-[10px] uppercase font-semibold">Budget</p>
                        <p className="text-orange-300 text-lg font-bold mt-0.5">${project.totalBudget?.toLocaleString()}</p>
                      </div>
                    )}
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
                          <div key={m.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
                            <div>
                              <p className="text-white text-sm font-semibold">{m.applicantName}</p>
                              <p className="text-gray-500 text-xs">{m.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setStep(2)}
                  className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black rounded-xl text-sm transition-all shadow-lg">
                  {members.length > 0 ? 'Proceed to Evaluation' : 'Complete Solo Project'}
                </button>
              </div>
            )}

            {/* Step 2: Evaluate */}
            {step === 2 && (
              <div className="space-y-6">
                {members.length === 0 ? (
                  <div className="bg-white/5 border border-white/20 rounded-2xl p-6 text-center">
                    <p className="text-gray-300 text-sm mb-4">Solo project - no members to evaluate.</p>
                    <button onClick={handleComplete} disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50">
                      {submitting ? 'Completing...' : 'Complete Project'}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm text-center">Evaluate each team member. You can choose to award or skip a badge.</p>

                    {evaluations.map((ev, index) => (
                      <div key={ev.memberId} className="bg-white/5 border border-white/20 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold text-sm">{ev.memberName}</p>
                            <p className="text-gray-500 text-xs">{ev.memberRole} - {ev.memberEmail}</p>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={ev.awardBadge} onChange={e => updateEval(index, 'awardBadge', e.target.checked)}
                              className="w-4 h-4 rounded border-white/30 text-orange-500 focus:ring-orange-400" />
                            <span className="text-gray-300 text-xs font-semibold">Award Badge</span>
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
                              <input type="text" value={ev.badgeLevel} readOnly className={inputClass + " bg-white/5 cursor-not-allowed"} />
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
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                            <p className="text-yellow-300 text-xs">Poor contribution - badge will not be awarded even if selected.</p>
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
                      <button onClick={() => setStep(1)} className="px-5 py-2.5 min-h-[44px] bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all">
                        Back
                      </button>
                      <button onClick={handleComplete} disabled={submitting}
                        className="flex-1 py-3.5 min-h-[48px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black rounded-xl text-sm transition-all shadow-lg disabled:opacity-50">
                        {submitting ? 'Completing Project...' : 'Complete Project and Award Badges'}
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
