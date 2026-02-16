// components/JoinEventGroupButton.jsx
// 🔥 Component for requesting to join an event group with email notifications - Responsive Version

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  requestToJoinEventGroup, 
  getUserEventGroupStatus 
} from '../utils/eventGroupNotifications';

const JoinEventGroupButton = ({ eventGroup, onStatusChange }) => {
  const { currentUser } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('Attendee');

  const availableRoles = [
    'Attendee',
    'Speaker',
    'Volunteer',
    'Organizer Assistant',
    'Technical Support',
    'Content Creator'
  ];

  // Check user's current status with this event group
  useEffect(() => {
    const checkMembershipStatus = async () => {
      if (!currentUser || !eventGroup.id) return;
      
      try {
        const status = await getUserEventGroupStatus(eventGroup.id, currentUser.email);
        setMembershipStatus(status);
      } catch (error) {
        console.error('Error checking membership status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMembershipStatus();
  }, [currentUser, eventGroup.id]);

  const handleJoinRequest = async () => {
    if (!currentUser) {
      toast.error('Please login to join this event group');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestToJoinEventGroup(
        eventGroup.id,
        currentUser,
        selectedRole,
        applicationMessage
      );

      if (result.success) {
        setMembershipStatus('pending');
        setShowApplicationModal(false);
        setApplicationMessage('');
        
        // Notify parent component of status change
        if (onStatusChange) {
          onStatusChange('pending');
        }
        
        toast.success('🎉 Join request submitted! Group admins will review your application.');
      } else {
        if (result.reason === 'already_member') {
          setMembershipStatus('active');
        } else if (result.reason === 'already_pending') {
          setMembershipStatus('pending');
        }
      }
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('Failed to submit join request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusButton = () => {
    if (loading) {
      return (
        <button 
          disabled 
          className="bg-gray-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold flex items-center space-x-1.5 sm:space-x-2 opacity-50 cursor-not-allowed text-xs sm:text-sm md:text-base"
        >
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
          <span>Checking...</span>
        </button>
      );
    }

    switch (membershipStatus) {
      case 'active':
        return (
          <button 
            disabled 
            className="bg-green-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold flex items-center space-x-1.5 sm:space-x-2 cursor-not-allowed text-xs sm:text-sm md:text-base"
          >
            <span className="text-sm sm:text-base">✅</span>
            <span className="hidden xs:inline">Group Member</span>
            <span className="xs:hidden">Member</span>
          </button>
        );

      case 'pending':
        return (
          <button 
            disabled 
            className="bg-yellow-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold flex items-center space-x-1.5 sm:space-x-2 cursor-not-allowed text-xs sm:text-sm md:text-base"
          >
            <span className="text-sm sm:text-base">⏳</span>
            <span className="hidden xs:inline">Request Pending</span>
            <span className="xs:hidden">Pending</span>
          </button>
        );

      case 'rejected':
        return (
          <button 
            onClick={() => setShowApplicationModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm md:text-base"
          >
            <span className="text-sm sm:text-base">🔄</span>
            <span className="hidden xs:inline">Reapply to Join</span>
            <span className="xs:hidden">Reapply</span>
          </button>
        );

      default:
        return (
          <button 
            onClick={() => setShowApplicationModal(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm md:text-base"
          >
            <span className="text-sm sm:text-base">🎪</span>
            <span className="hidden sm:inline">Request to Join Group</span>
            <span className="sm:hidden">Join Group</span>
          </button>
        );
    }
  };

  return (
    <>
      {getStatusButton()}

      {/* Application Modal - Responsive */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl max-w-full sm:max-w-lg md:max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-5 md:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  Join Event Group
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {/* Event Group Info */}
                <div>
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-cyan-300 mb-1.5 sm:mb-2 break-words">
                    🎪 {eventGroup.eventTitle || eventGroup.title}
                  </h4>
                  <p className="text-gray-300 text-xs sm:text-sm md:text-base break-words">
                    {eventGroup.description}
                  </p>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Preferred Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full p-2 sm:p-2.5 md:p-3 bg-black/30 border border-white/20 rounded-lg text-white text-xs sm:text-sm md:text-base focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role} className="bg-gray-800">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Application Message */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                    Application Message (Optional)
                  </label>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Tell the group admins why you'd like to join and what you hope to contribute..."
                    rows="3"
                    className="w-full p-2 sm:p-2.5 md:p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 text-xs sm:text-sm md:text-base focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    This helps group admins understand your interest and goals.
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 sm:p-4">
                  <h5 className="text-cyan-300 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm md:text-base">
                    📧 What happens next?
                  </h5>
                  <ul className="text-gray-300 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                    <li>• Group admins will receive an email notification</li>
                    <li>• They'll review your application and message</li>
                    <li>• You'll get notified once they make a decision</li>
                    <li className="hidden sm:list-item">• If approved, you'll gain access to group features</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinRequest}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden xs:inline">Submitting...</span>
                        <span className="xs:hidden">Sending...</span>
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinEventGroupButton;
