// src/Pages/events/EventSubmission.jsx - FULLY RESPONSIVE WITH BLUE/ORANGE THEME

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const EventSubmission = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDescription: '',
    eventType: '',
    format: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    requirements: '',
    learningObjectives: '',
    organizerName: '',
    organizerEmail: '',
    organizerBio: '',
    meetingUrl: '',
    tags: '',
    additionalInfo: '',
    maxAttendees: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [urlError, setUrlError] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { 
        replace: true,
        state: { from: '/events/submit', message: 'Please sign in to submit an event' }
      });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (currentUser && !formData.organizerEmail) {
      setFormData(prev => ({
        ...prev,
        organizerEmail: currentUser.email || '',
        organizerName: currentUser.displayName || ''
      }));
    }
  }, [currentUser, formData.organizerEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name.includes('Date') || name.includes('Time')) {
      setDateError('');
    }
  };

  const validateDateRange = () => {
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      return true;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      setDateError('End date and time must be after start date and time');
      return false;
    }

    setDateError('');
    return true;
  };

  const getEventDuration = () => {
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      return '';
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      return '';
    }

    const durationMs = endDateTime - startDateTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      }
      return `${days} day${days > 1 ? 's' : ''}, ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      if (minutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  const validateUrl = (url) => {
    if (!url) {
      setUrlError('');
      return true;
    }
    
    try {
      const urlPattern = /^https?:\/\/(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
      if (!urlPattern.test(url)) {
        setUrlError('Please enter a valid URL (e.g., https://meet.google.com/abc-defg-hij)');
        return false;
      }
      setUrlError('');
      return true;
    } catch (error) {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleMeetingUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, meetingUrl: url }));
    validateUrl(url);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.eventTitle.trim()) errors.push('Event title is required');
    if (!formData.eventDescription.trim()) errors.push('Event description is required');
    if (!formData.eventType) errors.push('Event type is required');
    if (!formData.format) errors.push('Event format is required');
    if (!formData.startDate) errors.push('Start date is required');
    if (!formData.startTime) errors.push('Start time is required');
    if (!formData.endDate) errors.push('End date is required');
    if (!formData.endTime) errors.push('End time is required');
    if (!formData.organizerName.trim()) errors.push('Organizer name is required');
    if (!formData.organizerEmail.trim()) errors.push('Organizer email is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.organizerEmail && !emailRegex.test(formData.organizerEmail)) {
      errors.push('Please enter a valid email address');
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    if (startDateTime <= new Date()) {
      errors.push('Start date and time must be in the future');
    }

    if (!validateDateRange()) {
      errors.push(dateError);
    }

    if (formData.meetingUrl && !validateUrl(formData.meetingUrl)) {
      errors.push('Please enter a valid meeting URL');
    }

    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) < 1)) {
      errors.push('Max attendees must be a positive number');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    if (!currentUser) {
      toast.error('Please sign in to submit an event');
      navigate('/login');
      setIsSubmitting(false);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(`Please fix the following errors:\n• ${errors.join('\n• ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      const durationMs = endDateTime - startDateTime;
      const calculatedDuration = getEventDuration();

      const submissionData = {
        eventTitle: formData.eventTitle.trim(),
        eventDescription: formData.eventDescription.trim(),
        eventType: formData.eventType,
        format: formData.format,
        
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: formData.startTime,
        endTime: formData.endTime,
        
        eventDate: startDateTime,
        duration: calculatedDuration,
        durationMs: durationMs,
        
        requirements: formData.requirements.trim() || null,
        learningObjectives: formData.learningObjectives.trim() || null,
        additionalInfo: formData.additionalInfo.trim() || null,
        
        organizerName: formData.organizerName.trim(),
        organizerEmail: formData.organizerEmail.trim(),
        organizerBio: formData.organizerBio.trim() || null,
        
        meetingUrl: formData.meetingUrl.trim() || null,
        
        tags: formData.tags.trim() ? formData.tags.trim().split(',').map(tag => tag.trim()) : [],
        
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        attendees: [],
        attendeeCount: 0,
        
        submissionDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        
        status: 'approved',
        workflowStage: 'published',
        
        submitterId: currentUser.uid,
        submitterEmail: currentUser.email,
        submitterName: currentUser.displayName || currentUser.email,
        submitterPhoto: currentUser.photoURL || null,
        
        isActive: true,
        
        submissionSource: 'web_form',
        isMultiDay: formData.startDate !== formData.endDate
      };

      const docRef = await addDoc(collection(db, 'tech_events'), submissionData);

      setSubmitStatus('success');
      
      toast.success(
        'Event published successfully!\n\n' +
        'Your event is now live\n' +
        'Attendees can register immediately\n' +
        'Check the events page to see your event'
      );

      setFormData({
        eventTitle: '',
        eventDescription: '',
        eventType: '',
        format: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        requirements: '',
        learningObjectives: '',
        organizerName: currentUser?.displayName || '',
        organizerEmail: currentUser?.email || '',
        organizerBio: '',
        meetingUrl: '',
        tags: '',
        additionalInfo: '',
        maxAttendees: ''
      });

      setTimeout(() => {
        navigate('/events');
      }, 2000);

    } catch (error) {
      console.error('Firebase submission error:', error);
      toast.error('Error creating event: ' + error.message);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      setFormData(prev => ({
        ...prev,
        endDate: formData.startDate
      }));
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    if (formData.startTime && !formData.endTime && formData.startDate === formData.endDate) {
      const startTime = formData.startTime;
      const [hours, minutes] = startTime.split(':');
      const endHours = (parseInt(hours) + 1) % 24;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes}`;
      setFormData(prev => ({
        ...prev,
        endTime: endTime
      }));
    }
  }, [formData.startTime, formData.endTime, formData.startDate, formData.endDate]);

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-3 xs:px-4">
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-base xs:text-lg">Checking authentication...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        
        <main className="pt-16 xs:pt-18 sm:pt-20">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 md:py-16 max-w-6xl">
            
            <section className="relative mb-12 xs:mb-16 sm:mb-20 md:mb-24 pt-6 xs:pt-8 sm:pt-12 md:pt-16">
              <div className="max-w-4xl mx-auto text-center">
                
                <div className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg xs:rounded-xl border border-blue-500/20">
                  <p className="text-blue-300 font-semibold text-xs xs:text-sm sm:text-base">
                    Welcome, {currentUser.displayName || currentUser.email}! Create your event - it will be published instantly!
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6 md:mb-8 animate-pulse">
                  <div className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4 bg-blue-400 rounded-full animate-ping shadow-lg" 
                       style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'}}></div>
                  <span className="text-blue-300 uppercase tracking-widest text-[10px] xs:text-xs sm:text-sm md:text-base font-black" 
                        style={{
                          textShadow: '0 0 20px rgba(59, 130, 246, 0.8), 2px 2px 4px rgba(0,0,0,0.9)',
                          fontFamily: '"Inter", sans-serif',
                          letterSpacing: '0.1em'
                        }}>
                    Host Your Tech Event
                  </span>
                  <div className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4 bg-blue-400 rounded-full animate-ping shadow-lg" 
                       style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'}}></div>
                </div>
                
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-12 leading-[0.9] tracking-tight"
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #ffffff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(59, 130, 246, 0.2)',
                      filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.9))'
                    }}>
                  Submit Your{' '}
                  <span className="block mt-1 xs:mt-2 sm:mt-3 md:mt-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-cyan-500"
                        style={{
                          textShadow: 'none',
                          filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                          animation: 'glow 2s ease-in-out infinite alternate'
                        }}>
                    Tech Event
                  </span>
                </h1>

                <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed font-light mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 px-2" 
                   style={{
                     textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                     fontFamily: '"Inter", sans-serif'
                   }}>
                  Share your expertise through workshops, webinars, and talks. 
                  <span className="text-blue-300 font-semibold"> Your event will be published instantly</span> and visible to the community.
                </p>
                
                <div className="h-1 xs:h-1.5 sm:h-2 w-12 xs:w-16 sm:w-20 md:w-24 lg:w-32 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full shadow-2xl mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-16"
                     style={{boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'}}></div>
              </div>
            </section>

            <section className="mb-12 xs:mb-16 sm:mb-20 md:mb-24">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-12 border border-white/20 shadow-2xl">
                
                {submitStatus === 'success' && (
                  <div className="mb-6 xs:mb-7 sm:mb-8 p-4 xs:p-5 sm:p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg xs:rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-3 xs:gap-4">
                      <svg className="w-5 h-5 xs:w-6 xs:h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-green-400 font-bold text-base xs:text-lg mb-2">Event Published Successfully!</h3>
                        <p className="text-gray-200 mb-2 text-sm xs:text-base">Your event is now live and visible to everyone.</p>
                        <div className="text-xs xs:text-sm text-gray-300 space-y-1">
                          <p className="flex items-center gap-2">
                            <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <strong>Event is published</strong>
                          </p>
                          <p className="flex items-center gap-2">
                            <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Attendees can register immediately
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 xs:mb-7 sm:mb-8 p-4 xs:p-5 sm:p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg xs:rounded-xl backdrop-blur-sm">
                    <div className="flex items-start gap-3 xs:gap-4">
                      <svg className="w-5 h-5 xs:w-6 xs:h-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-red-400 font-bold text-base xs:text-lg mb-2">Submission Failed</h3>
                        <p className="text-gray-200 text-sm xs:text-base">There was an error creating your event. Please try again.</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 xs:space-y-7 sm:space-y-8">
                  
                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white mb-4 xs:mb-5 sm:mb-6" 
                        style={{
                          textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
                          fontFamily: '"Inter", sans-serif'
                        }}>
                      Event Details
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          name="eventTitle"
                          value={formData.eventTitle}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                          placeholder="Enter your event title (e.g., Modern React Development Workshop)"
                        />
                      </div>

                      <div>
                        <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                          Event Type *
                        </label>
                        <select
                          name="eventType"
                          value={formData.eventType}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                        >
                          <option value="">Select event type</option>
                          <option value="workshop">Workshop</option>
                          <option value="webinar">Webinar</option>
                          <option value="talk">Talk/Panel</option>
                          <option value="conference">Conference</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                          Format *
                        </label>
                        <select
                          name="format"
                          value={formData.format}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                        >
                          <option value="">Select format</option>
                          <option value="online">Online</option>
                          <option value="in-person">In-Person</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 xs:p-5 sm:p-6 rounded-lg xs:rounded-xl border border-white/10">
                      <h3 className="text-blue-300 font-semibold text-base xs:text-lg mb-3 xs:mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Event Start
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2 text-xs xs:text-sm">
                            Start Date *
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            required
                            min={getMinDate()}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-xs xs:text-sm">
                            Start Time *
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 p-4 xs:p-5 sm:p-6 rounded-lg xs:rounded-xl border border-white/10">
                      <h3 className="text-orange-300 font-semibold text-base xs:text-lg mb-3 xs:mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Event End
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4">
                        <div>
                          <label className="block text-white font-medium mb-2 text-xs xs:text-sm">
                            End Date *
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            required
                            min={formData.startDate || getMinDate()}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-white font-medium mb-2 text-xs xs:text-sm">
                            End Time *
                          </label>
                          <input
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-xs xs:text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {dateError && (
                        <div className="mt-3 xs:mt-4 p-2.5 xs:p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-xs xs:text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {dateError}
                          </p>
                        </div>
                      )}

                      {getEventDuration() && !dateError && (
                        <div className="mt-3 xs:mt-4 p-2.5 xs:p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                          <p className="text-cyan-300 text-xs xs:text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <strong>Duration:</strong> {getEventDuration()}
                            {formData.startDate !== formData.endDate && (
                              <span className="ml-1 text-orange-300 text-[10px] xs:text-xs">Multi-day event!</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Event Description *
                      </label>
                      <textarea
                        name="eventDescription"
                        value={formData.eventDescription}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-vertical text-sm xs:text-base"
                        placeholder="Provide a detailed description of your event..."
                      />
                    </div>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Learning Objectives
                      </label>
                      <textarea
                        name="learningObjectives"
                        value={formData.learningObjectives}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-vertical text-sm xs:text-base"
                        placeholder="What will attendees learn?"
                      />
                    </div>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Prerequisites & Requirements
                      </label>
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-vertical text-sm xs:text-base"
                        placeholder="Any prerequisites or materials needed..."
                      />
                    </div>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Topics & Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                        placeholder="React, JavaScript, Frontend, API (comma-separated)"
                      />
                    </div>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Maximum Attendees (Optional)
                      </label>
                      <input
                        type="number"
                        name="maxAttendees"
                        value={formData.maxAttendees}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                        placeholder="Leave empty for unlimited attendees"
                      />
                      <p className="text-gray-400 text-xs xs:text-sm mt-2">Set a maximum number of attendees or leave empty for unlimited</p>
                    </div>
                  </div>

                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white mb-4 xs:mb-5 sm:mb-6" 
                        style={{
                          textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
                          fontFamily: '"Inter", sans-serif'
                        }}>
                      Organizer Information
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                      <div>
                        <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="organizerName"
                          value={formData.organizerName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          name="organizerEmail"
                          value={formData.organizerEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Your Bio & Expertise
                      </label>
                      <textarea
                        name="organizerBio"
                        value={formData.organizerBio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-vertical text-sm xs:text-base"
                        placeholder="Tell attendees about your background and expertise..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                    <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-white mb-4 xs:mb-5 sm:mb-6" 
                        style={{
                          textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
                          fontFamily: '"Inter", sans-serif'
                        }}>
                      Meeting Details
                    </h2>

                    <div>
                      <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                        Meeting URL (Google Meet / Zoom)
                      </label>
                      <input
                        type="url"
                        name="meetingUrl"
                        value={formData.meetingUrl}
                        onChange={handleMeetingUrlChange}
                        className={`w-full bg-white/10 backdrop-blur-sm border ${urlError ? 'border-red-500' : 'border-white/20'} rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-sm xs:text-base`}
                        placeholder="https://meet.google.com/abc-defg-hij"
                      />
                      {urlError && (
                        <p className="text-red-400 text-xs xs:text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {urlError}
                        </p>
                      )}
                    </div>

                    <div className="p-4 xs:p-5 sm:p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg xs:rounded-xl">
                      <h4 className="text-cyan-400 font-bold mb-2 xs:mb-3 text-sm xs:text-base flex items-center gap-2">
                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Registration Process
                      </h4>
                      <div className="text-gray-300 text-xs xs:text-sm space-y-1 xs:space-y-2">
                        <p><strong>Instant Registration:</strong> Attendees can register immediately</p>
                        <p><strong>Calendar Integration:</strong> Attendees can add to their calendars</p>
                        <p><strong>Meeting Links:</strong> Automatically shared with registered attendees</p>
                        <p><strong>Attendee Tracking:</strong> You'll see who's registered</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-300 font-semibold mb-2 xs:mb-3 text-sm xs:text-base sm:text-lg">
                      Additional Information
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 resize-vertical text-sm xs:text-base"
                      placeholder="Any additional details or special notes..."
                    />
                  </div>

                  <div className="p-4 xs:p-5 sm:p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg xs:rounded-xl">
                    <h4 className="text-cyan-400 font-bold mb-2 xs:mb-3 text-sm xs:text-base flex items-center gap-2">
                      <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      What Happens After Submission:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 text-gray-300 text-xs xs:text-sm">
                      <div className="space-y-1 xs:space-y-2">
                        <p className="flex items-center gap-2">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <strong>Instant Publishing:</strong> Event goes live immediately
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <strong>Calendar Integration:</strong> Attendees can add to calendars
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <strong>Registration:</strong> Members can register instantly
                        </p>
                      </div>
                      <div className="space-y-1 xs:space-y-2">
                        <p className="flex items-center gap-2">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <strong>Meeting Link:</strong> Shared with registered attendees
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <strong>Track Attendees:</strong> View who's registered
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <strong>Multi-day Support:</strong> Events can span any duration
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-6 xs:pt-7 sm:pt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting || urlError || dateError}
                      className="group relative bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white px-8 xs:px-10 sm:px-12 py-4 xs:py-5 sm:py-6 rounded-full font-black text-base xs:text-lg sm:text-xl transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[56px]"
                      style={{
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 20px 40px rgba(0,0,0,0.3)',
                        fontFamily: '"Inter", sans-serif'
                      }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 border-b-2 border-white"></div>
                            Publishing Event...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Publish Event Instantly
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                    
                    <p className="text-gray-400 text-xs xs:text-sm mt-4 xs:mt-5 sm:mt-6" 
                       style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      * Required fields. Your event will be published immediately and visible to everyone.
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </main>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)); }
            50% { filter: drop-shadow(0 0 40px rgba(59, 130, 246, 0.8)); }
          }
          
          * { font-family: 'Inter', sans-serif; }
          
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); }
          ::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.5); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.7); }

          input:focus, textarea:focus, select:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          select option {
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
          }

          @media (min-width: 375px) {
            .xs\\:inline { display: inline; }
            .xs\\:hidden { display: none; }
          }
        `}</style>
      </div>
    </>
  );
};

export default EventSubmission;
