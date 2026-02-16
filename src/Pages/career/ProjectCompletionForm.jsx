// src/Pages/career/ProjectCompletionForm.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

// Email notification helper
const sendEmailNotification = async (endpoint, data) => {
  try {
    const response = await fetch(`/api/notifications/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.success ? { success: true, results: result.results } : { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const industryTracks = [
  { value: 'healthcare', label: 'Healthcare/Medical'},
  { value: 'finance', label: 'Finance/Fintech'},
  { value: 'education', label: 'Education'},
  { value: 'ecommerce', label: 'E-commerce'},
  { value: 'entertainment', label: 'Entertainment/Media'},
  { value: 'government', label: 'Government'},
  { value: 'technology', label: 'Technology/Software/SaaS'},
  { value: 'cybersecurity', label: 'Cybersecurity'},
  { value: 'transportation', label: 'Transportation/Logistics'},
  { value: 'realestate', label: 'Real Estate/PropTech'},
  { value: 'energy', label: 'Energy/Utilities'},
  { value: 'agriculture', label: 'Agriculture/AgTech'},
  { value: 'manufacturing', label: 'Manufacturing/Industrial'},
  { value: 'legal', label: 'Legal Tech'},
  { value: 'nonprofit', label: 'Non-Profit/Social Impact'},
  { value: 'travel', label: 'Travel/Hospitality'},
  { value: 'sports', label: 'Sports/Fitness'},
  { value: 'food', label: 'Food/Beverage'},
  { value: 'fashion', label: 'Fashion/Retail'},
  { value: 'construction', label: 'Construction/Infrastructure'},
  { value: 'marketing', label: 'Marketing/Advertising'}
];

const getIndustryLabel = (industryTrack) => {
  const track = industryTracks.find(t => t.value === industryTrack);
  return track ? track.label : industryTrack || 'Technology';
};

const ProjectCompletionForm = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [groupData, setGroupData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  
  const [projectReviewForm, setProjectReviewForm] = useState({
    projectUrl: '',
    demoUrl: '',
    repositoryUrl: '',
    projectSummary: '',
    keyFeatures: '',
    technologiesUsed: '',
    challengesFaced: '',
    projectStatus: 'completed',
    additionalNotes: ''
  });

  useEffect(() => {
    if (groupId && currentUser) {
      fetchGroupData();
      checkExistingSubmission();
    }
  }, [groupId, currentUser]);

  useEffect(() => {
    if (existingSubmission && existingSubmission.status === 'rejected' && existingSubmission.projectReview) {
      const prevData = existingSubmission.projectReview;
      setProjectReviewForm({
        projectUrl: prevData.projectUrl || '',
        demoUrl: prevData.demoUrl || '',
        repositoryUrl: prevData.repositoryUrl || '',
        projectSummary: prevData.projectSummary || '',
        keyFeatures: prevData.keyFeatures || '',
        technologiesUsed: prevData.technologiesUsed || '',
        challengesFaced: prevData.challengesFaced || '',
        projectStatus: prevData.projectStatus || 'completed',
        additionalNotes: prevData.additionalNotes || ''
      });
    }
  }, [existingSubmission]);

  const fetchGroupData = async () => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) throw new Error('Group not found');
      
      const data = groupDoc.data();
      const ownerEmail = data.adminEmail || data.createdBy;
      if (ownerEmail !== currentUser.email) {
        throw new Error('You must be the project owner to submit for completion');
      }
      
      setGroupData({ id: groupDoc.id, ...data });

      const membersQuery = query(
        collection(db, 'group_members'),
        where('groupId', '==', groupId),
        where('status', '==', 'active')
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      const membersList = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setTeamMembers(membersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const checkExistingSubmission = async () => {
    try {
      const submissionQuery = query(
        collection(db, 'project_completion_requests'),
        where('groupId', '==', groupId),
        where('status', 'in', ['pending_admin_approval', 'admin_approved', 'rejected'])
      );
      
      const submissionSnapshot = await getDocs(submissionQuery);
      if (!submissionSnapshot.empty) {
        const submission = { id: submissionSnapshot.docs[0].id, ...submissionSnapshot.docs[0].data() };
        setExistingSubmission(submission);
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
    }
  };

  const handleProjectReviewFormChange = (e) => {
    const { name, value } = e.target;
    setProjectReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const submitForAdminReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!projectReviewForm.projectUrl.trim()) throw new Error('Project URL is required');
      if (!projectReviewForm.repositoryUrl.trim()) throw new Error('GitHub Repository URL is required');
      if (!projectReviewForm.projectSummary.trim()) throw new Error('Project summary is required');

      const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
      if (!githubUrlPattern.test(projectReviewForm.repositoryUrl.trim())) {
        throw new Error('Please provide a valid GitHub repository URL');
      }

      const submissionData = {
        groupId: groupId,
        projectTitle: groupData.projectTitle,
        adminEmail: currentUser.email,
        adminName: currentUser.displayName || currentUser.email,
        adminId: currentUser.uid,
        projectReview: {
          projectUrl: projectReviewForm.projectUrl.trim(),
          demoUrl: projectReviewForm.demoUrl.trim() || null,
          repositoryUrl: projectReviewForm.repositoryUrl.trim(),
          projectSummary: projectReviewForm.projectSummary.trim(),
          keyFeatures: projectReviewForm.keyFeatures.trim() || null,
          technologiesUsed: projectReviewForm.technologiesUsed.trim() || null,
          challengesFaced: projectReviewForm.challengesFaced.trim() || null,
          projectStatus: projectReviewForm.projectStatus,
          additionalNotes: projectReviewForm.additionalNotes.trim() || null,
          githubRequirements: {
            repositoryIsPublic: true,
            favoredOnlineIncAdded: true,
            teamMembersIncluded: true,
            requirementsMet: true
          }
        },
        teamSize: teamMembers.length,
        teamMembers: teamMembers.map(member => ({
          memberName: member.userName,
          memberEmail: member.userEmail,
          role: member.projectRole || member.role,
          joinedAt: member.joinedAt
        })),
        status: 'pending_admin_approval',
        phase: 'admin_review',
        submittedForApprovalAt: serverTimestamp(),
        adminApproval: {
          approved: null,
          approvedAt: null,
          approvedBy: null,
          rejectedAt: null,
          rejectedBy: null,
          rejectionReason: null
        },
        badgeAssignmentStatus: 'pending',
        originalProjectId: groupData.originalProjectId || null
      };

      let docRef;
      const isResubmission = existingSubmission && existingSubmission.status === 'rejected';
      
      if (isResubmission) {
        await updateDoc(doc(db, 'project_completion_requests', existingSubmission.id), {
          ...submissionData,
          createdAt: existingSubmission.createdAt,
          'adminApproval.approved': null,
          'adminApproval.rejectedAt': null,
          'adminApproval.rejectedBy': null,
          'adminApproval.rejectionReason': null,
          resubmittedAt: serverTimestamp(),
          resubmissionCount: (existingSubmission.resubmissionCount || 0) + 1
        });
        docRef = { id: existingSubmission.id };
      } else {
        submissionData.createdAt = serverTimestamp();
        docRef = await addDoc(collection(db, 'project_completion_requests'), submissionData);
      }

      try {
        const emailData = {
          projectData: {
            projectTitle: groupData.projectTitle,
            contactName: currentUser.displayName || currentUser.email.split('@')[0] || 'Project Owner',
            contactEmail: currentUser.email,
            companyName: groupData.companyName || 'Team Project',
            industryTrack: getIndustryLabel(groupData.industryTrack),
            projectType: 'Completion Review',
            timeline: 'Review Required',
            experienceLevel: 'Team Project',
            budget: 'N/A',
            projectDescription: projectReviewForm.projectSummary,
            repositoryUrl: projectReviewForm.repositoryUrl,
            projectUrl: projectReviewForm.projectUrl,
            demoUrl: projectReviewForm.demoUrl || null,
            teamSize: teamMembers.length,
            isResubmission: isResubmission,
            completionRequestId: docRef.id,
            submissionType: 'project_completion_review'
          }
        };
        
        const emailResult = await sendEmailNotification('send-project-submitted-admin', emailData);
        
        if (emailResult.success) {
          toast.success(isResubmission ? '✅ Project resubmitted successfully!' : '✅ Project submitted for admin review!');
        } else {
          toast.success(isResubmission ? '✅ Project resubmitted!' : '✅ Project submitted!');
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        toast.success('✅ Project submitted successfully!');
      }

      await updateDoc(doc(db, 'groups', groupId), {
        'completionStatus.isReadyForCompletion': false,
        'completionStatus.submittedForReview': true,
        'completionStatus.submittedAt': serverTimestamp(),
        status: 'pending_completion_review'
      });

      await checkExistingSubmission();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl sm:text-6xl mb-6">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Group Not Found</h2>
          <p className="text-gray-600 mb-6">Could not load group information.</p>
          <Link to="/my-groups" className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            ← Back to My Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-5xl">
          
          {/* Hero Section */}
          <section className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
              Complete <span className="text-blue-600">Project</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-2">{groupData.projectTitle}</p>
            <p className="text-sm sm:text-base text-gray-600">Submit your completed project for admin review</p>
          </section>

          {/* Process Steps */}
          <section className="mb-8 sm:mb-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-blue-600 font-bold text-lg sm:text-xl mb-4 sm:mb-6">📋 Completion Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-sm sm:text-base">Submit for Review</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Share project URL and details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-sm sm:text-base">Admin Reviews</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Admin evaluates quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-sm sm:text-base">Project Approved</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Ready for badge assignment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="text-gray-900 font-semibold text-sm sm:text-base">Award Badges</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Recognize team contributions</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Existing Submission Status */}
          {existingSubmission && (
            <section className="mb-8 sm:mb-12">
              <div className={`border rounded-2xl p-6 sm:p-8 ${
                existingSubmission.status === 'admin_approved' 
                  ? 'bg-green-50 border-green-200' 
                  : existingSubmission.status === 'rejected'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <h3 className={`font-bold text-lg sm:text-xl ${
                    existingSubmission.status === 'admin_approved' ? 'text-green-800' : 
                    existingSubmission.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {existingSubmission.status === 'admin_approved' ? '✅ Project Approved!' : 
                     existingSubmission.status === 'rejected' ? '❌ Project Rejected' : '⏳ Under Review'}
                  </h3>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold self-start sm:self-auto ${
                    existingSubmission.status === 'admin_approved' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : existingSubmission.status === 'rejected'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}>
                    {existingSubmission.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-gray-700 text-sm mb-4 space-y-2">
                  <p><strong>Submitted:</strong> {existingSubmission.submittedForApprovalAt?.toDate?.()?.toLocaleDateString()}</p>
                  {existingSubmission.resubmittedAt && (
                    <p><strong>Resubmitted:</strong> {existingSubmission.resubmittedAt?.toDate?.()?.toLocaleDateString()}</p>
                  )}
                  <p><strong>Project URL:</strong></p>
                  <a href={existingSubmission.projectReview?.projectUrl} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:text-blue-700 underline break-all block">
                    {existingSubmission.projectReview?.projectUrl}
                  </a>
                </div>

                {existingSubmission.status === 'rejected' && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-red-800 mb-2">Rejection Reason:</p>
                    <p className="text-red-700 text-sm">{existingSubmission.adminApproval?.rejectionReason || 'No reason provided'}</p>
                    <p className="text-xs text-red-600 mt-2">Please address the issues and resubmit.</p>
                  </div>
                )}

                {existingSubmission.status === 'admin_approved' && (
                  <div>
                    <p className="text-green-700 mb-4">
                      🎉 Congratulations! You can now assign badges to your team.
                    </p>
                    <Link to={`/career/project-completion/${groupId}`}
                          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      🏅 Assign Team Badges
                    </Link>
                  </div>
                )}

                {existingSubmission.status === 'pending_admin_approval' && (
                  <p className="text-yellow-700">
                    ⏳ Your project is under review. You'll be notified when complete.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Submission Form */}
          {(!existingSubmission || existingSubmission.status === 'rejected') && (
            <section className="mb-12">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <form onSubmit={submitForAdminReview} className="space-y-6">
                  
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      {existingSubmission?.status === 'rejected' ? 'Resubmit' : 'Submit'} Project
                    </h2>
                    
                    <p className="text-gray-700 mb-6">
                      Share your completed project details for admin review before badge assignment.
                    </p>
                    
                    {/* Important Notices */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-6">
                      <h4 className="text-red-800 font-bold text-base sm:text-lg mb-3">⚠️ Important: One Submission Only</h4>
                      <div className="text-red-700 text-sm space-y-1">
                        <p>• Only quality projects will be approved</p>
                        <p>• No second submissions allowed - make it count!</p>
                        <p>• Ensure all requirements are met before submitting</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
                      <h4 className="text-blue-800 font-bold text-base sm:text-lg mb-3">📧 Auto-Notifications</h4>
                      <div className="text-blue-700 text-sm space-y-1">
                        <p>• Admins receive automatic email notification</p>
                        <p>• You'll get confirmation when reviewed</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6 mb-6">
                      <h4 className="text-orange-800 font-bold text-base sm:text-lg mb-3">⚠️ GitHub Requirements</h4>
                      <div className="text-orange-700 text-sm space-y-1">
                        <p>• GitHub repository URL is REQUIRED</p>
                        <p>• Repository must be PUBLIC</p>
                        <p>• Add "FavoredOnlineInc" as collaborator</p>
                        <p>• All team members must be credited</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Project URL * <span className="text-gray-500 font-normal text-sm">(Live demo or main project link)</span>
                    </label>
                    <input
                      type="url"
                      name="projectUrl"
                      value={projectReviewForm.projectUrl}
                      onChange={handleProjectReviewFormChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="https://your-project.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Live Demo URL (Optional) <span className="text-gray-500 font-normal text-sm">(If different from main URL)</span>
                    </label>
                    <input
                      type="url"
                      name="demoUrl"
                      value={projectReviewForm.demoUrl}
                      onChange={handleProjectReviewFormChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="https://your-app.vercel.app"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      GitHub Repository URL * <span className="text-red-600 font-normal text-sm">(Required)</span>
                    </label>
                    <input
                      type="url"
                      name="repositoryUrl"
                      value={projectReviewForm.repositoryUrl}
                      onChange={handleProjectReviewFormChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="https://github.com/username/repository"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Project Summary * <span className="text-gray-500 font-normal text-sm">(Brief overview)</span>
                    </label>
                    <textarea
                      name="projectSummary"
                      value={projectReviewForm.projectSummary}
                      onChange={handleProjectReviewFormChange}
                      required
                      rows={4}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                      placeholder="Describe what your team built..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Key Features (Optional)</label>
                    <textarea
                      name="keyFeatures"
                      value={projectReviewForm.keyFeatures}
                      onChange={handleProjectReviewFormChange}
                      rows={3}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y"
                      placeholder="• Feature 1&#10;• Feature 2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Technologies Used (Optional)</label>
                    <input
                      type="text"
                      name="technologiesUsed"
                      value={projectReviewForm.technologiesUsed}
                      onChange={handleProjectReviewFormChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="React, Node.js, MongoDB, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Project Status</label>
                    <select
                      name="projectStatus"
                      value={projectReviewForm.projectStatus}
                      onChange={handleProjectReviewFormChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="completed">✅ Completed</option>
                      <option value="mostly-completed">🔸 Mostly Completed</option>
                      <option value="mvp-completed">🚀 MVP Completed</option>
                    </select>
                  </div>

                  {/* Team Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                    <h4 className="text-blue-800 font-bold mb-3">👥 Team Summary</h4>
                    <div className="text-blue-700 text-sm">
                      <p><strong>Team Size:</strong> {teamMembers.length} members</p>
                      <p className="mt-2"><strong>Members:</strong></p>
                      <ul className="ml-4 mt-2 space-y-1">
                        {teamMembers.map((member, index) => (
                          <li key={index}>• {member.userName} - {member.projectRole || member.role}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Submitting...
                        </span>
                      ) : (
                        <span>
                          {existingSubmission?.status === 'rejected' ? '🔄 Resubmit' : '📤 Submit'} for Admin Review
                        </span>
                      )}
                    </button>
                    <p className="text-gray-600 text-sm mt-4">
                      📧 Admins will be automatically notified via email
                    </p>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* Back Button */}
          <section className="text-center">
            <Link to={`/groups/${groupId}`}
                  className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              ← Back to Group
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProjectCompletionForm;
