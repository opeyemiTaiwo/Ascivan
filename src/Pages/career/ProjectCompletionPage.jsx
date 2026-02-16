// src/Pages/career/ProjectCompletionPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

// EMAIL NOTIFICATION HELPER FUNCTION
const sendEmailNotification = async (endpoint, data) => {
  try {
    console.log(`Sending email notification via ${endpoint}...`);
    
    const response = await fetch(`/api/notifications/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`Email notification sent successfully:`, result.results);
      return { success: true, results: result.results };
    } else {
      console.error(`❌ Email notification failed:`, result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error(`Error sending email notification:`, error);
    return { success: false, error: error.message };
  }
};

// Industry tracks data
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

const ProjectCompletionPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [completionData, setCompletionData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationForm, setEvaluationForm] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [adminCertificate, setAdminCertificate] = useState(null);
  const [memberBadgeCounts, setMemberBadgeCounts] = useState({});

  // Badge categories mapping
  const badgeCategories = {
    'mentorship': { id: 'techmo', name: 'TechMO Badges', color: 'from-orange-500 to-orange-600', image: '/Images/TechMO.png' },
    'quality-assurance': { id: 'techqa', name: 'TechQA Badges', color: 'from-blue-500 to-blue-600', image: '/Images/TechQA.png' },
    'development': { id: 'techdev', name: 'TechDev Badges', color: 'from-orange-500 to-orange-600', image: '/Images/TechDev.png' },
    'leadership': { id: 'techleads', name: 'TechLeads Badges', color: 'from-blue-500 to-blue-600', image: '/Images/TechLeads.png' },
    'design': { id: 'techarchs', name: 'TechArchs Badges', color: 'from-orange-500 to-orange-600', image: '/Images/TechArchs.png' },
    'security': { id: 'techguard', name: 'TechGuard Badges', color: 'from-blue-500 to-blue-600', image: '/Images/TechGuard.png' }
  };

  const badgeLevels = ['novice', 'beginners', 'intermediate', 'expert'];
  const contributionLevels = ['poor', 'fair', 'good', 'excellent'];

  // FUNCTION TO DETERMINE BADGE LEVEL BASED ON PROJECT COUNT
  const determineBadgeLevel = (projectCount) => {
    if (projectCount === 0 || projectCount === 1) {
      return 'novice';
    } else if (projectCount >= 2 && projectCount <= 5) {
      return 'beginners';
    } else if (projectCount >= 6 && projectCount <= 10) {
      return 'intermediate';
    } else {
      return 'expert';
    }
  };

  // FUNCTION TO FETCH MEMBER'S BADGE COUNT BY CATEGORY
  const fetchMemberBadgeCount = async (memberEmail, badgeCategory) => {
    try {
      console.log(`Fetching badge count for ${memberEmail} in category ${badgeCategory}`);
      
      const badgeQuery = query(
        collection(db, 'member_badges'),
        where('memberEmail', '==', memberEmail),
        where('badgeCategory', '==', badgeCategory)
      );
      
      const badgeDocs = await getDocs(badgeQuery);
      const count = badgeDocs.docs.length;
      
      console.log(`Found ${count} badges for ${memberEmail} in ${badgeCategory}`);
      return count;
    } catch (error) {
      console.error('Error fetching badge count:', error);
      return 0;
    }
  };

  // FUNCTION TO FETCH ALL BADGE COUNTS FOR A MEMBER
  const fetchAllBadgeCountsForMember = async (memberEmail) => {
    try {
      const counts = {};
      
      for (const category of Object.keys(badgeCategories)) {
        const count = await fetchMemberBadgeCount(memberEmail, category);
        counts[category] = count;
      }
      
      return counts;
    } catch (error) {
      console.error('Error fetching all badge counts:', error);
      return {};
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      console.log('Fetching group data for:', groupId);
      
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        toast.error('Group not found');
        navigate('/my-groups');
        return;
      }

      const groupData = { id: groupDoc.id, ...groupDoc.data() };
      setGroup(groupData);

      const memberQuery = query(
        collection(db, 'group_members'),
        where('groupId', '==', groupId),
        where('userEmail', '==', currentUser.email)
      );
      const memberDocs = await getDocs(memberQuery);
      
      if (memberDocs.empty) {
        toast.error('You are not a member of this group');
        navigate(`/groups/${groupId}`);
        return;
      }

      const memberData = memberDocs.docs[0].data();
      const ownerEmail = groupData.adminEmail || groupData.createdBy;
      if (memberData.role !== 'admin' && ownerEmail !== currentUser.email) {
        toast.error('Only project admins can access completion page');
        navigate(`/groups/${groupId}`);
        return;
      }

      const allMembersQuery = query(
        collection(db, 'group_members'),
        where('groupId', '==', groupId),
        where('status', '==', 'active')
      );
      const allMemberDocs = await getDocs(allMembersQuery);
      const membersList = allMemberDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersList);

      const completionQuery = query(
        collection(db, 'project_completion_requests'),
        where('groupId', '==', groupId)
      );
      const completionDocs = await getDocs(completionQuery);
      
      if (!completionDocs.empty) {
        const completion = { id: completionDocs.docs[0].id, ...completionDocs.docs[0].data() };
        setCompletionData(completion);
        
        if (completion.finalCompletion?.completed === true) {
          setCurrentStep(3);
          
          const certificateQuery = query(
            collection(db, 'certificates'),
            where('recipientEmail', '==', currentUser.email),
            where('groupId', '==', groupId),
            where('type', '==', 'project_owner')
          );
          const certificateDocs = await getDocs(certificateQuery);
          if (!certificateDocs.empty) {
            setAdminCertificate({ id: certificateDocs.docs[0].id, ...certificateDocs.docs[0].data() });
          }
          setEvaluationForm(completion.evaluationForm?.memberEvaluations || []);
        } else if (completion.status === 'admin_rejected') {
          setCurrentStep(1);
        } else if (completion.adminApproval?.approved === true) {
          setCurrentStep(2);
          await initializeEvaluationForm(membersList);
        } else {
          setCurrentStep(1);
        }
      } else {
        if (groupData.completionStatus?.isReadyForCompletion || groupData.status === 'approved') {
          setCurrentStep(2);
          await initializeEvaluationForm(membersList);
        } else {
          setCurrentStep(1);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error('Error loading completion data: ' + error.message);
      setLoading(false);
    }
  };

  const initializeEvaluationForm = async (membersList) => {
    console.log('Initializing evaluation form with automatic badge level assignment...');
    
    const teamMembersToEvaluate = membersList.filter(member => {
      const memberEmail = member.userEmail || member.email || member.memberEmail;
      const currentUserEmail = currentUser.email;
      return memberEmail && memberEmail.toLowerCase() !== currentUserEmail.toLowerCase();
    });
    
    const badgeCounts = {};
    for (const member of teamMembersToEvaluate) {
      const memberEmail = member.userEmail || member.email || member.memberEmail;
      badgeCounts[memberEmail] = await fetchAllBadgeCountsForMember(memberEmail);
    }
    setMemberBadgeCounts(badgeCounts);
    
    const form = teamMembersToEvaluate.map(member => {
      const memberEmail = member.userEmail || member.email || member.memberEmail;
      const defaultCategory = 'development';
      const projectCount = badgeCounts[memberEmail]?.[defaultCategory] || 0;
      const autoLevel = determineBadgeLevel(projectCount);
      
      console.log(`${member.userName}: ${projectCount} ${defaultCategory} projects → ${autoLevel} level`);
      
      return {
        memberEmail: memberEmail,
        memberName: member.userName || member.displayName || memberEmail,
        role: member.projectRole || member.role || 'developer',
        badgeCategory: defaultCategory,
        badgeLevel: autoLevel,
        contribution: 'good',
        skillsDisplayed: [],
        adminNotes: '',
        projectCount: projectCount,
        autoAssignedLevel: autoLevel
      };
    });
    
    setEvaluationForm(form);
    toast.success('Badge levels automatically assigned based on member project history!');
  };

  const initiateCompletion = async () => {
    try {
      setSubmitting(true);
      
      await updateDoc(doc(db, 'groups', groupId), {
        'completionStatus.isReadyForCompletion': true,
        'completionStatus.completionInitiatedAt': serverTimestamp(),
        status: 'completing'
      });

      const completionDoc = await addDoc(collection(db, 'project_completion_requests'), {
        groupId,
        adminEmail: currentUser.email,
        adminName: currentUser.displayName || currentUser.email,
        adminId: currentUser.uid,
        projectTitle: group.projectTitle,
        originalProjectId: group.originalProjectId || null,
        createdAt: serverTimestamp(),
        status: 'evaluation_phase',
        phase: 'evaluation',
        
        evaluationForm: {
          submittedAt: null,
          memberEvaluations: []
        },
        
        adminApproval: {
          approved: false,
          approvedAt: null,
          approvedBy: null,
          rejectedAt: null,
          rejectedBy: null,
          rejectionReason: null
        },
        
        finalCompletion: {
          completed: false,
          completedAt: null,
          certificatesGenerated: false,
          badgesAwarded: false
        },
        
        teamSize: members.length,
        teamMembers: members.map(member => ({
          memberName: member.userName,
          memberEmail: member.userEmail,
          role: member.projectRole || member.role,
          joinedAt: member.joinedAt
        }))
      });

      setCompletionData({ id: completionDoc.id });
      setCurrentStep(2);
      await initializeEvaluationForm(members);
      
      toast.success('Project completion initiated! Badge levels auto-assigned based on experience.');
      
    } catch (error) {
      console.error('Error initiating completion:', error);
      toast.error('Error initiating project completion: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateEvaluation = async (index, field, value) => {
    const updated = [...evaluationForm];
    
    if (field === 'badgeLevel') {
      return;
    }
    
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'badgeCategory') {
      const memberEmail = updated[index].memberEmail;
      const newCategory = value;
      
      const projectCount = memberBadgeCounts[memberEmail]?.[newCategory] || 0;
      const newLevel = determineBadgeLevel(projectCount);
      
      updated[index].badgeLevel = newLevel;
      updated[index].projectCount = projectCount;
      updated[index].autoAssignedLevel = newLevel;
      
      console.log(`Category changed to ${newCategory}: ${projectCount} projects → ${newLevel} level`);
      toast.info(`Badge level auto-assigned to ${newLevel} (${projectCount} previous ${newCategory} projects)`);
    }
    
    setEvaluationForm(updated);
  };

  const addSkill = (index, skill) => {
    if (!skill.trim()) return;
    const updated = [...evaluationForm];
    if (!updated[index].skillsDisplayed.includes(skill)) {
      updated[index].skillsDisplayed.push(skill);
      setEvaluationForm(updated);
    }
  };

  const removeSkill = (index, skillToRemove) => {
    const updated = [...evaluationForm];
    updated[index].skillsDisplayed = updated[index].skillsDisplayed.filter(skill => skill !== skillToRemove);
    setEvaluationForm(updated);
  };

  const completeSoloProject = async () => {
    try {
      setSubmitting(true);
      
      const certificateDoc = await addDoc(collection(db, 'certificates'), {
        type: 'project_owner',
        recipientEmail: currentUser.email,
        recipientName: currentUser.displayName || currentUser.email,
        projectTitle: group.projectTitle,
        groupId: groupId,
        generatedAt: serverTimestamp(),
        certificateData: {
          projectDescription: group.description || '',
          completionDate: new Date().toISOString(),
          teamSize: 1,
          isSoloProject: true
        }
      });

      setAdminCertificate({
        id: certificateDoc.id,
        type: 'project_owner',
        recipientEmail: currentUser.email,
        recipientName: currentUser.displayName || currentUser.email,
        projectTitle: group.projectTitle,
        groupId: groupId,
        generatedAt: { toDate: () => new Date() },
        certificateData: {
          projectDescription: group.description || '',
          completionDate: new Date().toISOString(),
          teamSize: 1,
          isSoloProject: true
        }
      });

      if (completionData?.id) {
        await updateDoc(doc(db, 'project_completion_requests', completionData.id), {
          'evaluationForm.memberEvaluations': [],
          'finalCompletion.completed': true,
          'finalCompletion.completedAt': serverTimestamp(),
          'finalCompletion.certificatesGenerated': true,
          'finalCompletion.badgesAwarded': false,
          'finalCompletion.isSoloProject': true,
          status: 'completed'
        });
      } else {
        const newCompletionDoc = await addDoc(collection(db, 'project_completion_requests'), {
          groupId,
          adminEmail: currentUser.email,
          adminName: currentUser.displayName || currentUser.email,
          adminId: currentUser.uid,
          projectTitle: group.projectTitle,
          originalProjectId: group.originalProjectId || null,
          createdAt: serverTimestamp(),
          status: 'completed',
          
          evaluationForm: {
            submittedAt: serverTimestamp(),
            memberEvaluations: []
          },
          
          adminApproval: {
            approved: true,
            approvedAt: serverTimestamp(),
            approvedBy: 'project_submission_approved'
          },
          
          finalCompletion: {
            completed: true,
            completedAt: serverTimestamp(),
            certificatesGenerated: true,
            badgesAwarded: false,
            isSoloProject: true
          },
          
          teamSize: 1,
          teamMembers: []
        });
        
        setCompletionData({ id: newCompletionDoc.id });
      }

      await updateDoc(doc(db, 'groups', groupId), {
        'completionStatus.completionFormSubmittedAt': serverTimestamp(),
        'completionStatus.completedAt': serverTimestamp(),
        'completionStatus.certificatesGenerated': true,
        'completionStatus.isSoloProject': true,
        status: 'completed'
      });

      if (group.originalProjectId) {
        try {
          await updateDoc(doc(db, 'client_projects', group.originalProjectId), {
            status: 'completed',
            completedAt: serverTimestamp(),
            completedBy: currentUser.email,
            groupId: groupId,
            isActive: false,
            availableForApplications: false,
            projectClosed: true,
            isSoloProject: true
          });
          
          toast.success('Solo project completed and removed from public listing!');
        } catch (error) {
          console.error('Error updating original project:', error);
          toast.warning('Project completed but may still appear in listing');
        }
      } else {
        toast.success('Solo project completed successfully!');
      }

      setCurrentStep(3);
      
    } catch (error) {
      console.error('Error completing solo project:', error);
      toast.error('Error completing solo project: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitForAdminApproval = async () => {
    try {
      if (evaluationForm.length === 0) {
        toast.error('No team members to evaluate');
        return;
      }
      
      const incomplete = evaluationForm.some(member => 
        !member.badgeCategory || !member.badgeLevel || !member.contribution
      );
      
      if (incomplete) {
        toast.error('Please complete all member evaluations');
        return;
      }

      setSubmitting(true);

      if (!completionData?.id) {
        throw new Error('No completion request found. Please initiate completion first.');
      }

      const updateData = {
        'evaluationForm.submittedAt': serverTimestamp(),
        'evaluationForm.memberEvaluations': evaluationForm,
        status: 'pending_admin_approval',
        phase: 'admin_review',
        submittedForApprovalAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'project_completion_requests', completionData.id), updateData);

      await addDoc(collection(db, 'notifications'), {
        recipientType: 'admin',
        type: 'project_completion_review',
        title: 'New Project Completion for Review',
        message: `Project "${group.projectTitle}" has been submitted for completion approval by ${currentUser.displayName || currentUser.email}`,
        groupId: groupId,
        projectTitle: group.projectTitle,
        requestId: completionData.id,
        requestedBy: currentUser.email,
        teamSize: evaluationForm.length + 1,
        createdAt: serverTimestamp(),
        read: false,
        priority: 'normal'
      });

      setCompletionData(prev => ({
        ...prev,
        status: 'pending_admin_approval',
        evaluationForm: {
          submittedAt: new Date(),
          memberEvaluations: evaluationForm
        }
      }));

      setCurrentStep(3);
      
      toast.success('Evaluation submitted for admin approval! You will be notified when approved.');
      
    } catch (error) {
      console.error('Error submitting for admin approval:', error);
      toast.error('Error submitting evaluation: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resubmitForReview = async () => {
    try {
      setSubmitting(true);
      
      if (!completionData?.id) {
        toast.error('No completion request found');
        return;
      }

      await updateDoc(doc(db, 'project_completion_requests', completionData.id), {
        status: 'pending_admin_approval',
        phase: 'admin_review',
        resubmittedAt: serverTimestamp(),
        'adminApproval.approved': false,
        'adminApproval.rejectedAt': null,
        'adminApproval.rejectionReason': null
      });

      await updateDoc(doc(db, 'groups', groupId), {
        'completionStatus.isReadyForCompletion': true,
        status: 'completing'
      });

      await addDoc(collection(db, 'notifications'), {
        recipientType: 'admin',
        type: 'project_completion_resubmission',
        title: 'Project Resubmitted for Review',
        message: `Project "${group.projectTitle}" has been resubmitted for completion approval by ${currentUser.displayName || currentUser.email} after addressing feedback`,
        groupId: groupId,
        projectTitle: group.projectTitle,
        requestId: completionData.id,
        requestedBy: currentUser.email,
        teamSize: evaluationForm.length + 1,
        isResubmission: true,
        createdAt: serverTimestamp(),
        read: false,
        priority: 'high'
      });

      setCompletionData(prev => ({
        ...prev,
        status: 'pending_admin_approval',
        phase: 'admin_review'
      }));

      toast.success('Project resubmitted successfully! You will be notified when the admin reviews it.');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error resubmitting for review:', error);
      toast.error('Error resubmitting project: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const processBadgesAndCertificates = async () => {
    try {
      const emailResults = [];
      let badgesAwarded = 0;
      let emailsSuccessful = 0;
      let emailsFailed = 0;
      
      for (const member of evaluationForm) {
        try {
          const badgeDoc = await addDoc(collection(db, 'member_badges'), {
            memberEmail: member.memberEmail,
            memberName: member.memberName,
            badgeCategory: member.badgeCategory,
            badgeLevel: member.badgeLevel,
            projectTitle: group.projectTitle,
            groupId: groupId,
            awardedAt: serverTimestamp(),
            awardedBy: currentUser.email,
            awardedByName: currentUser.displayName || currentUser.email.split('@')[0],
            contribution: member.contribution,
            skillsDisplayed: member.skillsDisplayed || [],
            adminNotes: member.adminNotes || '',
            originalProjectId: group.originalProjectId || null,
            teamSize: evaluationForm.length + 1,
            projectCompletedAt: serverTimestamp(),
            autoAssignedLevel: member.autoAssignedLevel || member.badgeLevel,
            previousProjectCount: member.projectCount || 0
          });
          
          badgesAwarded++;
          
          try {
            const emailData = {
              badgeData: {
                badgeCategory: member.badgeCategory,
                badgeLevel: member.badgeLevel,
                contribution: member.contribution,
                skillsDisplayed: member.skillsDisplayed || [],
                adminNotes: member.adminNotes || '',
                badgeId: badgeDoc.id,
                awardedAt: new Date().toISOString()
              },
              memberData: {
                memberEmail: member.memberEmail,
                memberName: member.memberName,
                memberRole: member.role || 'Team Member',
                additionalEmails: []
              },
              projectData: {
                projectTitle: group.projectTitle,
                contactName: currentUser.displayName || currentUser.email.split('@')[0] || 'Project Owner',
                contactEmail: currentUser.email,
                companyName: group.companyName || 'Team Project',
                industryTrack: getIndustryLabel(group.industryTrack),
                teamSize: evaluationForm.length + 1,
                groupId: groupId,
                originalProjectId: group.originalProjectId || null,
                description: group.description || group.projectDescription || '',
                completionDate: new Date().toISOString()
              }
            };

            const emailResult = await sendEmailNotification('send-badge-awarded', emailData);
            
            if (emailResult.success) {
              emailsSuccessful++;
              emailResults.push({
                member: member.memberName,
                email: member.memberEmail,
                status: 'success',
                messageId: emailResult.results?.[0]?.messageId
              });
            } else {
              emailsFailed++;
              emailResults.push({
                member: member.memberName,
                email: member.memberEmail,
                status: 'failed',
                error: emailResult.error
              });
            }
            
          } catch (emailError) {
            emailsFailed++;
            emailResults.push({
              member: member.memberName,
              email: member.memberEmail,
              status: 'error',
              error: emailError.message
            });
          }
          
          await addDoc(collection(db, 'notifications'), {
            recipientEmail: member.memberEmail,
            recipientName: member.memberName,
            recipientId: member.memberId || null,
            type: 'badge_awarded',
            title: 'TechTalent Badge Awarded!',
            message: `You've been awarded a ${member.badgeCategory} badge (${member.badgeLevel} level) for your contribution to "${group.projectTitle}"`,
            groupId: groupId,
            badgeId: badgeDoc.id,
            badgeCategory: member.badgeCategory,
            badgeLevel: member.badgeLevel,
            projectTitle: group.projectTitle,
            awardedBy: currentUser.email,
            awardedByName: currentUser.displayName || currentUser.email.split('@')[0],
            createdAt: serverTimestamp(),
            read: false,
            priority: 'high'
          });
          
        } catch (memberError) {
          console.error(`Error processing badge for ${member.memberName}:`, memberError);
          emailResults.push({
            member: member.memberName,
            email: member.memberEmail,
            status: 'failed',
            error: `Badge creation failed: ${memberError.message}`
          });
        }
      }

      const certificateDoc = await addDoc(collection(db, 'certificates'), {
        type: 'project_owner',
        recipientEmail: currentUser.email,
        recipientName: currentUser.displayName || currentUser.email,
        recipientId: currentUser.uid,
        projectTitle: group.projectTitle,
        groupId: groupId,
        generatedAt: serverTimestamp(),
        certificateData: {
          projectDescription: group.description || group.projectDescription || '',
          completionDate: new Date().toISOString(),
          teamSize: evaluationForm.length + 1,
          badgesAwarded: badgesAwarded,
          originalProjectId: group.originalProjectId || null,
          industryTrack: getIndustryLabel(group.industryTrack)
        }
      });

      setAdminCertificate({
        id: certificateDoc.id,
        type: 'project_owner',
        recipientEmail: currentUser.email,
        recipientName: currentUser.displayName || currentUser.email,
        projectTitle: group.projectTitle,
        groupId: groupId,
        generatedAt: { toDate: () => new Date() },
        certificateData: {
          projectDescription: group.description || group.projectDescription || '',
          completionDate: new Date().toISOString(),
          teamSize: evaluationForm.length + 1,
          badgesAwarded: badgesAwarded
        }
      });

      if (emailsSuccessful === evaluationForm.length) {
        toast.success(`All ${badgesAwarded} badges awarded successfully! Email notifications sent to all team members.`);
      } else if (emailsSuccessful > 0) {
        toast.success(`${badgesAwarded} badges awarded! ${emailsSuccessful}/${evaluationForm.length} emails sent.`);
      } else {
        toast.success(`${badgesAwarded} badges awarded! Emails failed but badges are in profiles.`);
      }

    } catch (error) {
      console.error('Error processing badges and certificates:', error);
      toast.error('Error processing badges and certificates: ' + error.message);
      throw error;
    }
  };

  const finalizeProjectCompletion = async () => {
    try {
      setSubmitting(true);
      
      await processBadgesAndCertificates();

      await updateDoc(doc(db, 'project_completion_requests', completionData.id), {
        'finalCompletion.completed': true,
        'finalCompletion.completedAt': serverTimestamp(),
        'finalCompletion.certificatesGenerated': true,
        'finalCompletion.badgesAwarded': true,
        status: 'completed'
      });

      await updateDoc(doc(db, 'groups', groupId), {
        'completionStatus.completionFormSubmittedAt': serverTimestamp(),
        'completionStatus.completedAt': serverTimestamp(),
        'completionStatus.certificatesGenerated': true,
        status: 'completed'
      });

      if (group.originalProjectId) {
        try {
          await updateDoc(doc(db, 'client_projects', group.originalProjectId), {
            status: 'completed',
            completedAt: serverTimestamp(),
            completedBy: currentUser.email,
            groupId: groupId,
            isActive: false,
            availableForApplications: false,
            projectClosed: true
          });
          
          toast.success('Project completed and removed from public listing!');
        } catch (error) {
          console.error('Error updating original project:', error);
          toast.warning('Project completed but may still appear in listing');
        }
      }

      setCurrentStep(3);
      
    } catch (error) {
      console.error('Error finalizing project completion:', error);
      toast.error('Error completing project finalization: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-base sm:text-lg">Loading completion data...</p>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
          
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <button 
              onClick={() => navigate(`/groups/${groupId}`)}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="mr-2">←</span>
              Back to Group
            </button>
          </div>

          {/* Page Header */}
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl sm:text-7xl">🎯</span>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
                  Project <span className="text-blue-600">Completion</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-2">
                  {group?.projectTitle}
                </p>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Project Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-blue-600 text-sm font-semibold mb-1">Current Step</div>
                  <div className="text-2xl font-black text-gray-900">{currentStep}/3</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="text-orange-600 text-sm font-semibold mb-1">Status</div>
                  <div className="text-lg font-bold text-gray-900">{completionData?.status || 'Not Started'}</div>
                </div>
                {completionData?.adminApproval && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-green-600 text-sm font-semibold mb-1">Admin Review</div>
                    <div className="text-lg font-bold text-gray-900">
                      {completionData.adminApproval.approved ? 'APPROVED' : 
                       completionData.status === 'admin_rejected' ? 'NEEDS REVISION' : 'PENDING'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Progress Steps */}
          <section className="mb-8 sm:mb-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {/* Mobile Steps */}
              <div className="block sm:hidden space-y-4">
                {[
                  { step: 1, title: 'Project Approval', icon: '📋' },
                  { step: 2, title: 'Assign Badges', icon: '🏅' },
                  { step: 3, title: 'Complete', icon: '✅' }
                ].map((item) => (
                  <div key={item.step} className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 flex-shrink-0 ${
                      currentStep >= item.step 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                    }`}>
                      {currentStep > item.step ? '✓' : item.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">
                        Step {item.step}: {item.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentStep >= item.step ? 'Completed' : 
                         currentStep === item.step ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                    {currentStep >= item.step && (
                      <div className="text-blue-600 text-2xl flex-shrink-0">✓</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Steps */}
              <div className="hidden sm:flex items-center justify-center space-x-8">
                {[
                  { step: 1, title: 'Project Approval', icon: '📋' },
                  { step: 2, title: 'Assign Badges', icon: '🏅' },
                  { step: 3, title: 'Complete', icon: '✅' }
                ].map((item) => (
                  <div key={item.step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all duration-300 ${
                        currentStep >= item.step 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                          : 'bg-gray-200 border-gray-300 text-gray-500'
                      }`}>
                        {currentStep > item.step ? '✓' : item.icon}
                      </div>
                      <div className="mt-3 text-center">
                        <div className="font-semibold text-gray-900 text-sm">
                          {item.title}
                        </div>
                        <div className={`text-xs mt-1 ${
                          currentStep >= item.step ? 'text-blue-600' :
                          currentStep === item.step ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          {currentStep >= item.step ? 'Completed' : 
                           currentStep === item.step ? 'Current' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    
                    {item.step < 3 && (
                      <div className={`h-0.5 w-24 mx-6 transition-all duration-500 ${
                        currentStep > item.step ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Step 1 - Project Approval */}
          {currentStep === 1 && (
            <section className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                {completionData?.status === 'admin_rejected' ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-6xl mb-6">⚠️</div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-4">
                        Project Review Needs Revision
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your project completion request requires some changes before it can be approved.
                      </p>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                      <h4 className="text-red-700 font-bold text-lg mb-4">Admin Feedback</h4>
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {completionData.adminApproval?.rejectionReason || 'No specific reason provided'}
                        </p>
                      </div>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p><strong>Rejected by:</strong> {completionData.adminApproval?.rejectedBy || 'Admin'}</p>
                        <p><strong>Rejected at:</strong> {completionData.adminApproval?.rejectedAt?.toDate?.()?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                      <h4 className="text-blue-700 font-bold text-lg mb-3">Common Issues to Check</h4>
                      <div className="text-gray-700 space-y-2">
                        <p>✓ Repository must be public and accessible</p>
                        <p>✓ Loomiq must be added as a collaborator</p>
                        <p>✓ All team member names should be visible</p>
                        <p>✓ Repository URL should be valid and working</p>
                        <p>✓ Project should be complete and functional</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                      <h4 className="text-orange-700 font-bold mb-3">What to do next:</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>1. Review the admin feedback carefully</li>
                        <li>2. Make necessary changes to your project/repository</li>
                        <li>3. Verify all requirements are met</li>
                        <li>4. Click "Resubmit for Review" below</li>
                        <li>5. Admin will review and notify you of decision</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={resubmitForReview}
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline-block"></div>
                            Resubmitting...
                          </>
                        ) : (
                          '🔄 Resubmit for Review'
                        )}
                      </button>
                      
                      <Link 
                        to={`/groups/${groupId}`}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold transition-colors text-center"
                      >
                        ← Back to Group
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <div className="text-6xl mb-6">⏳</div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4">
                        Waiting for Project Approval
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Your project is currently under admin review. Once approved, you'll be able to assign badges to your team members.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                      <h4 className="text-blue-700 font-bold text-lg mb-3">Project Review Status</h4>
                      <div className="text-gray-700 space-y-2">
                        <p>• Project submitted for admin review</p>
                        <p>• Admin verifying repository and quality</p>
                        <p>• You will be notified when complete</p>
                        <p>• Once approved, assign badges to team</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                      <h4 className="text-orange-700 font-bold mb-3">What happens next:</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li>• Admin reviews submitted work and repository</li>
                        <li>• They verify requirements are met</li>
                        <li>• You receive email when approved</li>
                        <li>• Return here to assign badges</li>
                      </ul>
                    </div>

                    <div className="text-center">
                      <Link
                        to={`/groups/${groupId}`}
                        className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold transition-colors"
                      >
                        ← Back to Group Page
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Step 2 - Assign Badges */}
          {currentStep === 2 && (
            <section className="max-w-6xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="text-center mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-4">Project Approved!</h3>
                  <p className="text-gray-600 mb-2">
                    Your project has been approved. Badge levels are automatically assigned based on member project history and CANNOT be changed manually.
                  </p>
                  <p className="text-sm text-orange-600">
                    Badge levels update automatically when you change the badge category.
                  </p>
                </div>

                {evaluationForm.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 max-w-2xl mx-auto">
                      <div className="text-6xl mb-6">👤</div>
                      <h3 className="text-2xl font-bold text-orange-600 mb-4">No Team Members to Evaluate</h3>
                      <div className="text-gray-700 space-y-4 mb-8">
                        <p>It looks like you're the only member in this project group.</p>
                        
                        <div className="bg-white rounded-xl p-4 text-left">
                          <h4 className="text-gray-900 font-semibold mb-2 text-sm">Debug Information:</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Total Members: {members.length}</div>
                            <div>Your Email: {currentUser.email}</div>
                            <div>Team: {members.map(m => m.userName || m.userEmail).join(', ') || 'None'}</div>
                          </div>
                        </div>
                        
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 mb-2">Options:</p>
                          <ul className="space-y-1 text-sm">
                            <li>• Complete as solo project</li>
                            <li>• Go back and invite team members</li>
                            <li>• Check if members are still active</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={completeSoloProject}
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline-block"></div>
                              Completing...
                            </>
                          ) : (
                            'Complete Solo Project'
                          )}
                        </button>
                        
                        <Link 
                          to={`/groups/${groupId}`}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-bold transition-colors text-center"
                        >
                          ← Back to Group
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Assign Team Member Badges</h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
                      <p className="text-blue-700 text-sm">
                        Badge levels are automatically assigned and locked:
                        <span className="block mt-2 text-gray-900 font-semibold">
                          Novice (1st) • Beginner (2-5) • Intermediate (6-10) • Expert (11+)
                        </span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {evaluationForm.map((member, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                              {member.memberName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xl font-bold text-gray-900 truncate">{member.memberName}</h4>
                              <p className="text-gray-600 text-sm">{member.role}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-900 font-semibold mb-2">Badge Category</label>
                              <select
                                value={member.badgeCategory}
                                onChange={(e) => updateEvaluation(index, 'badgeCategory', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              >
                                {Object.entries(badgeCategories).map(([key, category]) => (
                                  <option key={key} value={key}>{category.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-gray-900 font-semibold mb-2">
                                Badge Level 
                                <span className="text-orange-600 text-xs ml-2">
                                  ({member.projectCount || 0} previous projects - Auto-Assigned & Locked)
                                </span>
                              </label>
                              <div className="relative">
                                <select
                                  value={member.badgeLevel}
                                  disabled
                                  className="w-full bg-gray-200 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 opacity-70 cursor-not-allowed"
                                >
                                  <option value={member.badgeLevel}>
                                    {member.badgeLevel.charAt(0).toUpperCase() + member.badgeLevel.slice(1)} (Auto-Assigned)
                                  </option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  🔒
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Level is automatically determined by project history
                              </p>
                            </div>

                            <div>
                              <label className="block text-gray-900 font-semibold mb-2">Contribution Quality</label>
                              <select
                                value={member.contribution}
                                onChange={(e) => updateEvaluation(index, 'contribution', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              >
                                {contributionLevels.map(level => (
                                  <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-gray-900 font-semibold mb-2">Skills Demonstrated</label>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Add a skill (press Enter)"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addSkill(index, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <div className="flex flex-wrap gap-2">
                                  {member.skillsDisplayed.map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center border border-orange-200"
                                    >
                                      {skill}
                                      <button
                                        onClick={() => removeSkill(index, skill)}
                                        className="ml-2 text-orange-600 hover:text-orange-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-gray-900 font-semibold mb-2">Notes (Optional)</label>
                              <textarea
                                value={member.adminNotes}
                                onChange={(e) => updateEvaluation(index, 'adminNotes', e.target.value)}
                                placeholder="Additional notes..."
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                                rows={2}
                              />
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center">
                                <img 
                                  src={badgeCategories[member.badgeCategory].image} 
                                  alt={badgeCategories[member.badgeCategory].name}
                                  className="w-8 h-8 mr-3 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-gray-900 font-semibold text-sm truncate">
                                    {badgeCategories[member.badgeCategory].name}
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {member.badgeLevel.charAt(0).toUpperCase() + member.badgeLevel.slice(1)} Level (Auto)
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <button
                        onClick={finalizeProjectCompletion}
                        disabled={submitting}
                        className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline-block"></div>
                            Awarding Badges & Sending Emails...
                          </>
                        ) : (
                          '🏆 Award Badges & Complete Project'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Step 3 - Completion */}
          {currentStep === 3 && (
            <section className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-6">🎉</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Project Completed Successfully!</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="text-blue-600 font-semibold">
                        {evaluationForm.length > 0 ? 'Badges Awarded' : 'Solo Project'}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {evaluationForm.length > 0 ? `${evaluationForm.length} badges` : 'Completed'}
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <h4 className="text-orange-600 font-semibold">Certificates</h4>
                      <p className="text-gray-700 text-sm">Generated</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="text-green-600 font-semibold">Emails Sent</h4>
                      <p className="text-gray-700 text-sm">
                        {evaluationForm.length > 0 ? 'Notifications' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {evaluationForm.length > 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                    <h4 className="text-gray-900 font-bold text-lg mb-4">Final Team Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {evaluationForm.map((member, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                          <h5 className="text-gray-900 font-semibold truncate">{member.memberName}</h5>
                          <p className="text-gray-600 text-sm">{member.role}</p>
                          <div className="mt-2 flex items-center">
                            <img 
                              src={badgeCategories[member.badgeCategory].image} 
                              alt={badgeCategories[member.badgeCategory].name}
                              className="w-6 h-6 mr-2 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs block mb-1 truncate border border-blue-200">
                                {badgeCategories[member.badgeCategory]?.name}
                              </span>
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs block truncate border border-orange-200">
                                {member.badgeLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                    <h4 className="text-gray-900 font-bold text-lg mb-4">Solo Project Summary</h4>
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">🎯</div>
                      <h5 className="text-gray-900 font-semibold text-lg mb-2">Congratulations!</h5>
                      <p className="text-gray-600">
                        You successfully completed this project as a solo developer.
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h4 className="text-gray-900 font-bold text-lg mb-4">What's Next?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Link 
                      to="/my-groups"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      View My Groups
                    </Link>
                    <Link 
                      to="/projects/owner-dashboard"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                      Projects Dashboard
                    </Link>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    {evaluationForm.length > 0 
                      ? 'Team members have received their badge award emails! Thank you for leading this project to completion!'
                      : 'Thank you for successfully completing this solo project! Your certificate is ready for download.'
                    }
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 text-gray-700 py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Loomiq. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectCompletionPage;
