// src/Pages/PostHub.jsx - FULLY RESPONSIVE WITH UNIVERSAL NAVBAR

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const PostHub = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    externalLink: '',
    companyName: '',
    posterName: '',
    posterEmail: '',
    posterPhone: '',
    tags: '',
    requirements: '',
    expirationOption: '30',
    customExpirationDate: '',
    jobType: '',
    salaryRange: '',
    location: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventType: '',
    coursePrice: '',
    courseDuration: '',
    courseStartDate: '',
    courseType: '',
    scholarshipAmount: '',
    eligibility: '',
    applicationDeadline: '',
    internshipDuration: '',
    stipend: '',
    projectBudget: '',
    projectDuration: '',
    skillsRequired: '',
    programDuration: '',
    programCost: '',
    programDeadline: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const categories = [
    { id: 'job', label: 'Job', description: 'Full-time, part-time, or contract positions' },
    { id: 'project', label: 'Project', description: 'Freelance or paid project work' },
    { id: 'event', label: 'Event', description: 'Workshops, conferences, meetups' },
    { id: 'course', label: 'Course', description: 'Online courses and training' },
    { id: 'internship', label: 'Internship', description: 'Internship opportunities' },
    { id: 'program', label: 'Program', description: 'Training programs and bootcamps' },
    { id: 'scholarship', label: 'Scholarship', description: 'Educational funding and grants' }
  ];

  const expirationOptions = [
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days' },
    { value: 'custom', label: 'Custom date' },
    { value: 'never', label: 'Never expires' }
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { 
        replace: true,
        state: { from: '/hub/post', message: 'Please sign in to post an opportunity' }
      });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (currentUser && !formData.posterEmail) {
      setFormData(prev => ({
        ...prev,
        posterEmail: currentUser.email || '',
        posterName: currentUser.displayName || ''
      }));
    }
  }, [currentUser, formData.posterEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateUrl = (url) => {
    if (!url) {
      setUrlError('External link is required');
      return false;
    }
    
    try {
      const urlPattern = /^https?:\/\/(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
      if (!urlPattern.test(url)) {
        setUrlError('Please enter a valid URL (e.g., https://example.com)');
        return false;
      }
      setUrlError('');
      return true;
    } catch (error) {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError('');
      return true;
    }
    
    const phonePattern = /^[\d\s\-\+\(\)]+$/;
    if (!phonePattern.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    setFormData(prev => ({ ...prev, posterPhone: phone }));
    validatePhone(phone);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, externalLink: url }));
    validateUrl(url);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.category) errors.push('Category is required');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!validateUrl(formData.externalLink)) errors.push('Valid external link is required');
    if (!formData.posterName.trim()) errors.push('Your name is required');
    if (!formData.posterEmail.trim()) errors.push('Your email is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.posterEmail && !emailRegex.test(formData.posterEmail)) {
      errors.push('Please enter a valid email address');
    }

    if (formData.posterPhone && !validatePhone(formData.posterPhone)) {
      errors.push('Please enter a valid phone number');
    }

    if (formData.expirationOption === 'custom' && !formData.customExpirationDate) {
      errors.push('Please select a custom expiration date');
    }

    if (formData.category === 'event') {
      if (!formData.eventDate) errors.push('Event date is required');
      if (!formData.eventTime) errors.push('Event time is required');
    }

    if (formData.category === 'scholarship' && formData.applicationDeadline) {
      const deadline = new Date(formData.applicationDeadline);
      if (deadline <= new Date()) {
        errors.push('Application deadline must be in the future');
      }
    }
    
    return errors;
  };

  const calculateExpirationDate = () => {
    if (formData.expirationOption === 'never') {
      return null;
    }

    if (formData.expirationOption === 'custom') {
      return new Date(formData.customExpirationDate);
    }

    const days = parseInt(formData.expirationOption);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser) {
      toast.error('Please sign in to post an opportunity');
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
      const expirationDate = calculateExpirationDate();

      const submissionData = {
        category: formData.category,
        title: formData.title.trim(),
        description: formData.description.trim(),
        externalLink: formData.externalLink.trim(),
        companyName: formData.companyName.trim() || null,
        posterName: formData.posterName.trim(),
        posterEmail: formData.posterEmail.trim(),
        posterPhone: formData.posterPhone.trim() || null,
        posterId: currentUser.uid,
        tags: formData.tags.trim() ? formData.tags.trim().split(',').map(tag => tag.trim()) : [],
        requirements: formData.requirements.trim() || null,
        status: 'active',
        isActive: true,
        isFeatured: false,
        expiresAt: expirationDate,
        expirationOption: formData.expirationOption,
        viewCount: 0,
        clickCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submissionSource: 'web_form'
      };

      switch (formData.category) {
        case 'job':
          submissionData.jobType = formData.jobType || null;
          submissionData.salaryRange = formData.salaryRange.trim() || null;
          submissionData.location = formData.location.trim() || null;
          break;

        case 'event':
          submissionData.eventDate = formData.eventDate ? new Date(formData.eventDate) : null;
          submissionData.eventTime = formData.eventTime || null;
          submissionData.eventLocation = formData.eventLocation.trim() || null;
          submissionData.eventType = formData.eventType || null;
          break;

        case 'course':
          submissionData.coursePrice = formData.coursePrice || null;
          submissionData.courseDuration = formData.courseDuration.trim() || null;
          submissionData.courseStartDate = formData.courseStartDate ? new Date(formData.courseStartDate) : null;
          submissionData.courseType = formData.courseType || null;
          submissionData.isPaid = !!formData.coursePrice;
          break;

        case 'scholarship':
          submissionData.scholarshipAmount = formData.scholarshipAmount.trim() || null;
          submissionData.eligibility = formData.eligibility.trim() || null;
          submissionData.applicationDeadline = formData.applicationDeadline ? new Date(formData.applicationDeadline) : null;
          break;

        case 'internship':
          submissionData.internshipDuration = formData.internshipDuration.trim() || null;
          submissionData.stipend = formData.stipend.trim() || null;
          break;

        case 'project':
          submissionData.projectBudget = formData.projectBudget.trim() || null;
          submissionData.projectDuration = formData.projectDuration.trim() || null;
          submissionData.skillsRequired = formData.skillsRequired.trim() ? formData.skillsRequired.trim().split(',').map(s => s.trim()) : [];
          submissionData.isPaid = !!formData.projectBudget;
          break;

        case 'program':
          submissionData.programDuration = formData.programDuration.trim() || null;
          submissionData.programCost = formData.programCost.trim() || null;
          submissionData.applicationDeadline = formData.programDeadline ? new Date(formData.programDeadline) : null;
          break;
      }

      await addDoc(collection(db, 'hub_posts'), submissionData);
      toast.success('Opportunity posted successfully!');

      setFormData({
        category: '',
        title: '',
        description: '',
        externalLink: '',
        companyName: '',
        posterName: currentUser?.displayName || '',
        posterEmail: currentUser?.email || '',
        posterPhone: '',
        tags: '',
        requirements: '',
        expirationOption: '30',
        customExpirationDate: '',
        jobType: '',
        salaryRange: '',
        location: '',
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        eventType: '',
        coursePrice: '',
        courseDuration: '',
        courseStartDate: '',
        courseType: '',
        scholarshipAmount: '',
        eligibility: '',
        applicationDeadline: '',
        internshipDuration: '',
        stipend: '',
        projectBudget: '',
        projectDuration: '',
        skillsRequired: '',
        programDuration: '',
        programCost: '',
        programDeadline: ''
      });

      setTimeout(() => {
        navigate('/hub');
      }, 1500);

    } catch (error) {
      console.error('Error creating hub post:', error);
      toast.error('Error creating post: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const renderCategoryFields = () => {
    const inputClass = "w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base";
    const labelClass = "block text-blue-400 font-semibold mb-2 text-sm xs:text-base";

    switch (formData.category) {
      case 'job':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Job Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Job Type</label>
                <select name="jobType" value={formData.jobType} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Salary Range</label>
                <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} className={inputClass} placeholder="e.g., $50k-$70k" />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className={inputClass} placeholder="e.g., Remote, New York, NY" />
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Event Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Event Date *</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required min={getMinDate()} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Event Time *</label>
                <input type="time" name="eventTime" value={formData.eventTime} onChange={handleInputChange} required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Location/Platform</label>
                <input type="text" name="eventLocation" value={formData.eventLocation} onChange={handleInputChange} className={inputClass} placeholder="e.g., Online, Zoom, NYC" />
              </div>

              <div>
                <label className={labelClass}>Event Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select type</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'course':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Course Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Course Price</label>
                <input type="text" name="coursePrice" value={formData.coursePrice} onChange={handleInputChange} className={inputClass} placeholder="e.g., $99 or Free" />
              </div>

              <div>
                <label className={labelClass}>Duration</label>
                <input type="text" name="courseDuration" value={formData.courseDuration} onChange={handleInputChange} className={inputClass} placeholder="e.g., 6 weeks, Self-paced" />
              </div>

              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" name="courseStartDate" value={formData.courseStartDate} onChange={handleInputChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Course Type</label>
                <select name="courseType" value={formData.courseType} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select type</option>
                  <option value="live">Live</option>
                  <option value="recorded">Recorded</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'scholarship':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Scholarship Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Award Amount</label>
                <input type="text" name="scholarshipAmount" value={formData.scholarshipAmount} onChange={handleInputChange} className={inputClass} placeholder="e.g., $5,000, Full tuition" />
              </div>

              <div>
                <label className={labelClass}>Application Deadline</label>
                <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleInputChange} min={getMinDate()} className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Eligibility Criteria</label>
                <textarea name="eligibility" value={formData.eligibility} onChange={handleInputChange} rows="3" className={inputClass + " resize-none"} placeholder="Who is eligible to apply?" />
              </div>
            </div>
          </div>
        );

      case 'internship':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Internship Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Duration</label>
                <input type="text" name="internshipDuration" value={formData.internshipDuration} onChange={handleInputChange} className={inputClass} placeholder="e.g., 3 months, Summer 2026" />
              </div>

              <div>
                <label className={labelClass}>Stipend</label>
                <input type="text" name="stipend" value={formData.stipend} onChange={handleInputChange} className={inputClass} placeholder="e.g., $2000/month, Unpaid" />
              </div>
            </div>
          </div>
        );

      case 'project':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Project Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Budget</label>
                <input type="text" name="projectBudget" value={formData.projectBudget} onChange={handleInputChange} className={inputClass} placeholder="e.g., $500-$2000" />
              </div>

              <div>
                <label className={labelClass}>Duration</label>
                <input type="text" name="projectDuration" value={formData.projectDuration} onChange={handleInputChange} className={inputClass} placeholder="e.g., 2 weeks, 1 month" />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Skills Required</label>
                <input type="text" name="skillsRequired" value={formData.skillsRequired} onChange={handleInputChange} className={inputClass} placeholder="e.g., React, Node.js, UI/UX (comma-separated)" />
              </div>
            </div>
          </div>
        );

      case 'program':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <h3 className="text-lg xs:text-xl font-bold text-white">Program Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
              <div>
                <label className={labelClass}>Duration</label>
                <input type="text" name="programDuration" value={formData.programDuration} onChange={handleInputChange} className={inputClass} placeholder="e.g., 12 weeks, 6 months" />
              </div>

              <div>
                <label className={labelClass}>Cost</label>
                <input type="text" name="programCost" value={formData.programCost} onChange={handleInputChange} className={inputClass} placeholder="e.g., $1500, Free" />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Application Deadline</label>
                <input type="date" name="programDeadline" value={formData.programDeadline} onChange={handleInputChange} min={getMinDate()} className={inputClass} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (authLoading || !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
          <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-6 xs:p-7 sm:p-8 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-base xs:text-lg">{authLoading ? 'Checking authentication...' : 'Loading...'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
        
        <main className="pt-16 xs:pt-18 sm:pt-20 pb-12 xs:pb-14 sm:pb-16">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-12 max-w-4xl">
            
            {/* Hero Section */}
            <section className="relative mb-8 xs:mb-10 sm:mb-12 pt-6 xs:pt-8 sm:pt-12">
              <div className="max-w-3xl mx-auto text-center">
                <div className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-4 bg-gradient-to-r from-lime-500/10 to-green-500/10 rounded-lg xs:rounded-xl border border-blue-500/20">
                  <p className="text-blue-400 font-semibold text-xs xs:text-sm sm:text-base">
                    Welcome, {currentUser.displayName || currentUser.email}! Share an opportunity with the community.
                  </p>
                </div>
                
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 xs:mb-5 sm:mb-6 leading-tight"
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #ffffff 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 40px rgba(255,255,255,0.3)',
                      filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.9))'
                    }}>
                  Post an{' '}
                  <span className="block mt-1 xs:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-orange-500">
                    Opportunity
                  </span>
                </h1>

                <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed px-2" 
                   style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
                  Share jobs, projects, events, courses, internships, programs, or scholarships
                </p>
              </div>
            </section>

            {/* Form */}
            <section className="mb-12 xs:mb-14 sm:mb-16">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                
                <form onSubmit={handleSubmit} className="space-y-6 xs:space-y-7 sm:space-y-8">
                  
                  {/* Category Selection */}
                  <div>
                    <h2 className="text-xl xs:text-2xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">Select Category *</h2>
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                          className={`p-3 xs:p-4 rounded-lg xs:rounded-xl border-2 transition-all duration-300 text-left min-h-[44px] active:scale-95 ${
                            formData.category === cat.id
                              ? 'border-blue-400 bg-lime-400/20 shadow-lg scale-105'
                              : 'border-white/20 bg-white/5 hover:bg-white/10 active:bg-white/15'
                          }`}
                        >
                          <div className="text-white font-bold mb-1 text-sm xs:text-base">{cat.label}</div>
                          <div className="text-gray-400 text-[10px] xs:text-xs">{cat.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.category && (
                    <>
                      {/* Basic Information */}
                      <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                        <h2 className="text-xl xs:text-2xl font-bold text-white">Basic Information</h2>
                        
                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Title *</label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                            placeholder="Enter opportunity title"
                          />
                        </div>

                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Description *</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows="5"
                            className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none text-sm xs:text-base"
                            placeholder="Provide a detailed description..."
                          />
                        </div>

                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">External Link (Where to Apply) *</label>
                          <input
                            type="url"
                            name="externalLink"
                            value={formData.externalLink}
                            onChange={handleUrlChange}
                            required
                            className={`w-full bg-white/10 border ${urlError ? 'border-red-500' : 'border-white/20'} rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base`}
                            placeholder="https://example.com/apply"
                          />
                          {urlError && (
                            <p className="text-red-400 text-xs xs:text-sm mt-2 flex items-center gap-1">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {urlError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Company/Organization (Optional)</label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                            placeholder="Enter company or organization name"
                          />
                        </div>

                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Tags</label>
                          <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                            placeholder="React, JavaScript, Remote (comma-separated)"
                          />
                        </div>

                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Requirements</label>
                          <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none text-sm xs:text-base"
                            placeholder="Any specific requirements or qualifications..."
                          />
                        </div>
                      </div>

                      {/* Category-Specific Fields */}
                      {renderCategoryFields()}

                      {/* Your Information */}
                      <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                        <h2 className="text-xl xs:text-2xl font-bold text-white">Your Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                          <div>
                            <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Your Name *</label>
                            <input
                              type="text"
                              name="posterName"
                              value={formData.posterName}
                              onChange={handleInputChange}
                              required
                              className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                              placeholder="Enter your name"
                            />
                          </div>

                          <div>
                            <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Your Email *</label>
                            <input
                              type="email"
                              name="posterEmail"
                              value={formData.posterEmail}
                              onChange={handleInputChange}
                              required
                              className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                              placeholder="your.email@example.com"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Your Phone (Optional)</label>
                            <input
                              type="tel"
                              name="posterPhone"
                              value={formData.posterPhone}
                              onChange={handlePhoneChange}
                              className={`w-full bg-white/10 border ${phoneError ? 'border-red-500' : 'border-white/20'} rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none text-sm xs:text-base`}
                              placeholder="+1 (555) 123-4567"
                            />
                            {phoneError && (
                              <p className="text-red-400 text-xs xs:text-sm mt-2 flex items-center gap-1">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {phoneError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expiration Settings */}
                      <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                        <h2 className="text-xl xs:text-2xl font-bold text-white">Post Expiration</h2>
                        
                        <div>
                          <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">When should this post expire?</label>
                          <select
                            name="expirationOption"
                            value={formData.expirationOption}
                            onChange={handleInputChange}
                            className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                          >
                            {expirationOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {formData.expirationOption === 'custom' && (
                          <div>
                            <label className="block text-blue-400 font-semibold mb-2 text-sm xs:text-base">Select Expiration Date *</label>
                            <input
                              type="date"
                              name="customExpirationDate"
                              value={formData.customExpirationDate}
                              onChange={handleInputChange}
                              required
                              min={getMinDate()}
                              className="w-full bg-white/10 border border-white/20 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-white focus:border-blue-400 focus:outline-none text-sm xs:text-base"
                            />
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="text-center pt-4 xs:pt-5 sm:pt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting || urlError || phoneError}
                          className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-8 xs:px-10 sm:px-12 py-3 xs:py-3.5 sm:py-4 rounded-full font-black text-base xs:text-lg sm:text-xl transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[44px]"
                          style={{
                            boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)',
                            fontFamily: '"Inter", sans-serif'
                          }}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2 xs:gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 border-b-2 border-white"></div>
                              <span>Posting...</span>
                            </div>
                          ) : (
                            'Post Opportunity'
                          )}
                        </button>
                        
                        <p className="text-gray-400 text-xs xs:text-sm mt-3 xs:mt-4">
                          * Required fields. Your post will be visible immediately.
                        </p>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </section>
          </div>
        </main>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          
          * {
            font-family: 'Inter', sans-serif;
          }

          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.5);
            border-radius: 4px;
          }

          select option {
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
          }
        `}</style>
      </div>
    </>
  );
};

export default PostHub;
