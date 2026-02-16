// src/Pages/projects/ProjectEditView.jsx - Fully Responsive

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  doc, 
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

// Industry tracks data
const industryTracks = [
  { value: 'healthcare', label: 'Healthcare/Medical', icon: '🏥'},
  { value: 'finance', label: 'Finance/Fintech', icon: '💰'},
  { value: 'education', label: 'Education', icon: '📚'},
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒'},
  { value: 'entertainment', label: 'Entertainment/Media', icon: '🎮'},
  { value: 'government', label: 'Government', icon: '🏛️'},
  { value: 'technology', label: 'Technology/Software/SaaS', icon: '💻'},
  { value: 'cybersecurity', label: 'Cybersecurity', icon: '🔒'},
  { value: 'transportation', label: 'Transportation/Logistics', icon: '🚚'},
  { value: 'realestate', label: 'Real Estate/PropTech', icon: '🏠'},
  { value: 'energy', label: 'Energy/Utilities', icon: '⚡'},
  { value: 'agriculture', label: 'Agriculture/AgTech', icon: '🌾'},
  { value: 'manufacturing', label: 'Manufacturing/Industrial', icon: '🏭'},
  { value: 'legal', label: 'Legal Tech', icon: '⚖️'},
  { value: 'nonprofit', label: 'Non-Profit/Social Impact', icon: '🤝'},
  { value: 'travel', label: 'Travel/Hospitality', icon: '✈️'},
  { value: 'sports', label: 'Sports/Fitness', icon: '⚽'},
  { value: 'food', label: 'Food/Beverage', icon: '🍽️'},
  { value: 'fashion', label: 'Fashion/Retail', icon: '👗'},
  { value: 'construction', label: 'Construction/Infrastructure', icon: '🏗️'},
  { value: 'marketing', label: 'Marketing/Advertising', icon: '📢'}
];

const ProjectEditView = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    industryTrack: '',
    timeline: '',
    startDate: '',
    endDate: '',
    requiredSkills: '',
    projectGoals: '',
    additionalInfo: '',
    experienceLevel: '',
    contactEmail: '',
    contactName: '',
    companyName: '',
    budget: '',
    maxTeamSize: 5
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const projectDoc = await getDoc(doc(db, 'client_projects', projectId));
      
      if (projectDoc.exists()) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() };
        
        // Check ownership
        if (currentUser?.email !== projectData.contactEmail && 
            currentUser?.uid !== projectData.submitterId) {
          setError('You do not have permission to edit this project');
          setLoading(false);
          return;
        }
        
        setProject(projectData);
        
        // Pre-populate form
        setFormData({
          projectTitle: projectData.projectTitle || '',
          projectDescription: projectData.projectDescription || '',
          industryTrack: projectData.industryTrack || '',
          timeline: projectData.timeline || '',
          startDate: projectData.startDate || '',
          endDate: projectData.endDate || '',
          requiredSkills: projectData.requiredSkills || '',
          projectGoals: projectData.projectGoals || '',
          additionalInfo: projectData.additionalInfo || '',
          experienceLevel: projectData.experienceLevel || '',
          contactEmail: projectData.contactEmail || '',
          contactName: projectData.contactName || '',
          companyName: projectData.companyName || '',
          budget: projectData.budget || '',
          maxTeamSize: projectData.maxTeamSize || 5
        });
      } else {
        setError('Project not found');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getProjectDuration = () => {
    if (!formData.startDate || !formData.endDate) return '';
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (durationDays <= 0) return '';
    if (durationDays === 1) return '1 day';
    if (durationDays < 7) return `${durationDays} days`;
    if (durationDays < 30) return `${Math.round(durationDays / 7)} weeks`;
    if (durationDays < 365) return `${Math.round(durationDays / 30)} months`;
    return `${Math.round(durationDays / 365)} years`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to edit projects');
      return;
    }

    if (!formData.projectTitle.trim() || !formData.projectDescription.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.industryTrack) {
      toast.error('Please select an industry track');
      return;
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        toast.error('End date must be after start date');
        return;
      }
    }

    setSaving(true);

    try {
      const updateData = {
        projectTitle: formData.projectTitle.trim(),
        projectDescription: formData.projectDescription.trim(),
        industryTrack: formData.industryTrack,
        timeline: formData.timeline,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        requiredSkills: formData.requiredSkills.trim(),
        projectGoals: formData.projectGoals.trim() || null,
        additionalInfo: formData.additionalInfo.trim() || null,
        experienceLevel: formData.experienceLevel || 'any-level',
        contactEmail: formData.contactEmail.trim(),
        contactName: formData.contactName.trim() || 'Project Owner',
        companyName: formData.companyName.trim() || null,
        budget: formData.budget || 'free',
        maxTeamSize: parseInt(formData.maxTeamSize) || 5,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.email
      };

      await updateDoc(doc(db, 'client_projects', projectId), updateData);

      toast.success('Project updated successfully!');
      navigate(`/projects/${projectId}`);
      
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl sm:text-6xl mb-6">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Cannot Edit Project</h2>
          <p className="text-gray-600 mb-6">{error || 'Project not found or access denied.'}</p>
          <Link 
            to="/projects/owner-dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to My Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Global Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            <Link to="/" className="flex items-center">
              <img 
                src="/Images/loomiq-logo.svg" 
                alt="Loomiq" 
                className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
              />
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 font-semibold text-sm lg:text-base transition-colors"
              >
                Dashboard
              </Link>
              
              <span className="text-orange-600 font-bold text-sm lg:text-base px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                Edit Project
              </span>
              
              {currentUser && (
                <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
                  {currentUser.photoURL && (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 max-w-5xl">
          
          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <Link 
              to={`/projects/${projectId}`}
              className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm sm:text-base"
            >
              <span className="mr-2">←</span>
              Back to Project Details
            </Link>
          </div>

          {/* Hero Section */}
          <section className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
              Edit <span className="text-blue-600">Project</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Update your project details
            </p>
          </section>

          {/* Form Section */}
          <section>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 lg:p-12 shadow-sm">
              
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Project Details
                  </h2>

                  <div className="space-y-4 sm:space-y-6">
                    
                    {/* Title */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        name="projectTitle"
                        value={formData.projectTitle}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        placeholder="Enter your project title"
                      />
                    </div>

                    {/* Industry & Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Industry Track *
                        </label>
                        <select
                          name="industryTrack"
                          value={formData.industryTrack}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        >
                          <option value="">Select industry</option>
                          {industryTracks.map(track => (
                            <option key={track.value} value={track.value}>
                              {track.icon} {track.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Timeline *
                        </label>
                        <select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        >
                          <option value="">Select timeline</option>
                          <option value="1-week">1 Week</option>
                          <option value="2-weeks">2 Weeks</option>
                          <option value="1-month">1 Month</option>
                          <option value="2-3-months">2-3 Months</option>
                          <option value="3-6-months">3-6 Months</option>
                          <option value="6-months-plus">6+ Months</option>
                        </select>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          min={getTodayDateString()}
                          required
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        />
                        {formData.startDate && (
                          <p className="text-blue-600 text-xs sm:text-sm mt-1">
                            {formatDateForDisplay(formData.startDate)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          End Date *
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          min={formData.startDate || getTodayDateString()}
                          required
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        />
                        {formData.endDate && (
                          <p className="text-orange-600 text-xs sm:text-sm mt-1">
                            {formatDateForDisplay(formData.endDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Duration Display */}
                    {formData.startDate && formData.endDate && getProjectDuration() && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 font-semibold text-sm sm:text-base">
                          Duration: {getProjectDuration()}
                        </p>
                      </div>
                    )}

                    {/* Experience & Team Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Experience Level
                        </label>
                        <select
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        >
                          <option value="">Select level</option>
                          <option value="junior-level">Junior</option>
                          <option value="mid-level">Mid</option>
                          <option value="senior-level">Senior</option>
                          <option value="any-level">Any Level</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Team Size
                        </label>
                        <select
                          name="maxTeamSize"
                          value={formData.maxTeamSize}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        >
                          <option value="2">2 members</option>
                          <option value="3">3 members</option>
                          <option value="4">4 members</option>
                          <option value="5">5 members</option>
                          <option value="6">6 members</option>
                          <option value="8">8 members</option>
                          <option value="10">10 members</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Project Description *
                      </label>
                      <textarea
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y text-sm sm:text-base"
                        placeholder="Describe your project in detail..."
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Required Skills *
                      </label>
                      <textarea
                        name="requiredSkills"
                        value={formData.requiredSkills}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y text-sm sm:text-base"
                        placeholder="List required skills"
                      />
                    </div>

                    {/* Goals */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Project Goals (Optional)
                      </label>
                      <textarea
                        name="projectGoals"
                        value={formData.projectGoals}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y text-sm sm:text-base"
                        placeholder="What are your project goals?"
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Company/Organization (Optional)
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
                        placeholder="Company or organization name"
                      />
                    </div>

                    {/* Additional Info */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                        Additional Information (Optional)
                      </label>
                      <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-y text-sm sm:text-base"
                        placeholder="Any additional details..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Updating...
                      </span>
                    ) : (
                      'Update Project'
                    )}
                  </button>
                  
                  <Link 
                    to={`/projects/${projectId}`}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-colors text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        select option {
          background-color: white;
          color: #111827;
        }

        input[type="date"] {
          color-scheme: light;
        }
      `}</style>
    </div>
  );
};

export default ProjectEditView;
