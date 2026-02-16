// src/Pages/career/CareerTest.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormSection from '../../components/FormSection';
import claudeApiService from '../../services/claudeApiService';
import storageService from '../../services/storageService';
import googleFormService from '../../services/googleFormService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

// Option 1: Remove the icon since it's not being used
const EnhancedFormSection = React.memo(({ title, children }) => (
  <div className="bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-8 sm:mb-12 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-500 group">
    <div className="flex items-center mb-6 sm:mb-8">
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl mr-3 sm:mr-4 md:mr-6 shadow-2xl transform group-hover:rotate-12 transition-transform duration-500">
        {/* Icon removed - or add a default icon here */}
        ✓
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white group-hover:text-blue-300 transition-colors duration-500" 
          style={{
            textShadow: '0 0 20px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.9)',
            fontFamily: '"Inter", sans-serif'
          }}>
        {title}
      </h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
));

const CareerTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Personal information
    fullName: '',
    email: '',
    educationLevel: '', 
    
    // Career background
    studyField: '', 
    yearsExperience: '',
    currentRole: '',
    
    // Job Experience
    jobResponsibilities: '',
    jobProjects: '',
    jobTechnologies: '',
    internships: '',
    publications: '', 
    
    // Transition information
    transitionReason: '',
    transferableSkills: '',
    anticipatedChallenges: '',
    
    // Personal motivation and strengths
    techMotivation: '',
    techPassion: '',
    
    // Tech preferences and interests
    workPreference: '',
    techInterests: '',
    learningComfort: '',
    toolsUsed: [],
    
    // Tech aspirations
    careerPathsInterest: [],
    industryPreference: [],
    leverageDomainExpertise: '',
    
    // Experience
    experienceLevel: '',
    certifications: '',
    certificationsDetail: '',
    
    // Goals and timeline
    timeCommitment: '',
    targetSalary: '',
    transitionTimeline: '',
    continueCurrent: '',
    futureGoal: '',
    guidanceNeeded: ''
  });

  const [careerAnalysis, setCareerAnalysis] = useState(null);

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Add mobile debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Log viewport info for debugging
      console.log('Mobile Debug - Viewport:', {
        width: window.innerWidth,
        height: window.innerHeight,
        userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
      });

      // Add touch event debugging
      const debugTouch = (e) => {
        if (e.target.closest('button[type="submit"]')) {
          console.log('Touch event on submit button:', e.type);
        }
      };

      window.addEventListener('touchstart', debugTouch);
      window.addEventListener('touchend', debugTouch);
      
      return () => {
        window.removeEventListener('touchstart', debugTouch);
        window.removeEventListener('touchend', debugTouch);
      };
    }
  }, []);

  // Helper function to show a user-friendly message for API errors
  const getErrorMessage = useCallback((error) => {
    if (!error) return "An unknown error occurred";
    
    // Check if it's an overload error (529)
    if (error.message && (
      error.message.includes("529") ||
      error.message.toLowerCase().includes("overloaded")
    )) {
      return "The AI service is currently experiencing high traffic. Please try again in a few minutes or fill out the form manually.";
    }
    
    // Check for timeout
    if (error.message && (
      error.message.toLowerCase().includes("timeout") ||
      error.message.toLowerCase().includes("timed out")
    )) {
      return "The request to the AI service timed out. Please try again or fill out the form manually.";
    }
    
    // Check for network errors
    if (error.message && (
      error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("internet") ||
      error.message.toLowerCase().includes("offline")
    )) {
      return "There seems to be a network issue. Please check your internet connection and try again.";
    }
    
    // Return the actual error message as fallback
    return error.message;
  }, []);

  // Form validation function
  const validateForm = useCallback(() => {
    const requiredFields = [
      'fullName', 'email', 'educationLevel', 'studyField', 'currentRole', 
      'yearsExperience', 'jobResponsibilities', 'jobProjects', 'jobTechnologies',
      'techMotivation', 'techPassion', 'transitionReason', 'transferableSkills',
      'anticipatedChallenges', 'techInterests', 'learningComfort', 'workPreference',
      'experienceLevel', 'certifications', 'certificationsDetail', 'timeCommitment',
      'targetSalary', 'transitionTimeline', 'continueCurrent', 'guidanceNeeded',
      'futureGoal'
    ];

    const arrayFields = ['toolsUsed', 'careerPathsInterest', 'industryPreference'];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`Please fill in: ${fieldName}`);
        
        // Scroll to the field and focus it
        setTimeout(() => {
          const element = document.querySelector(`[name="${field}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 100);
        return false;
      }
    }

    for (const field of arrayFields) {
      if (!formData[field] || formData[field].length === 0) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`Please select at least one option for: ${fieldName}`);
        
        // Scroll to the field
        setTimeout(() => {
          const element = document.querySelector(`[name="${field}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return false;
      }
    }

    return true;
  }, [formData]);

  useEffect(() => {
    // Check for messages passed via location state (e.g., from results page)
    if (location.state?.message) {
      toast.info(location.state.message);
    }
  }, [location]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  // Handler for checkboxes - using useCallback to prevent re-creation
  const handleCheckboxChange = useCallback((fieldName, value) => {
    setFormData(prevState => {
      // If value is already in array, remove it (unchecked)
      // Otherwise, add it (checked)
      const updatedArray = prevState[fieldName].includes(value)
        ? prevState[fieldName].filter(item => item !== value)
        : [...prevState[fieldName], value];
      
      return {
        ...prevState,
        [fieldName]: updatedArray
      };
    });
  }, []);

  const toggleAiAssistant = useCallback(() => {
    setShowAiAssistant(!showAiAssistant);
  }, [showAiAssistant]);

  const handleAiFillForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Display a message to the user that AI is working
      toast.info("AI is generating suggestions. This may take a moment...");
      
      console.log('Requesting AI form suggestions...');
      
      // Call the Claude API service to get form suggestions
      const suggestions = await claudeApiService.getFormSuggestions();
      
      console.log('Received suggestions, processing...');
      console.log('Suggestions preview:', suggestions.substring(0, 100) + '...');
      
      if (!suggestions || typeof suggestions !== 'string') {
        throw new Error('Invalid response format from AI service');
      }
      
      // Parse suggestions and update form
      const suggestionLines = suggestions.split('\n');
      const newFormData = { ...formData };
      
      // Process each line of Claude's response to extract relevant information
      suggestionLines.forEach(line => {
        // Process previous career fields
        if (line.toLowerCase().includes('course of study') || line.toLowerCase().includes('study field')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.studyField = match[1].trim();
        }
        if (line.toLowerCase().includes('education level') || line.toLowerCase().includes('highest education')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.educationLevel = match[1].trim();
        }
        if (line.toLowerCase().includes('years of experience')) {
          if (line.toLowerCase().includes('less than 1')) newFormData.yearsExperience = 'Less than 1 year';
          else if (line.toLowerCase().includes('1-3')) newFormData.yearsExperience = '1-3 years';
          else if (line.toLowerCase().includes('3-5')) newFormData.yearsExperience = '3-5 years';
          else if (line.toLowerCase().includes('5-10')) newFormData.yearsExperience = '5-10 years';
          else if (line.toLowerCase().includes('10+')) newFormData.yearsExperience = '10+ years';
        }
        if (line.toLowerCase().includes('current role') || line.toLowerCase().includes('job title')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.currentRole = match[1].trim();
        }
        
        // Process job experience fields
        if (line.toLowerCase().includes('job responsibilities') || 
            line.toLowerCase().includes('key responsibilities') || 
            line.toLowerCase().includes('main duties')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.jobResponsibilities = match[1].trim();
        }
        if (line.toLowerCase().includes('projects') || 
            line.toLowerCase().includes('achievements') || 
            line.toLowerCase().includes('accomplishments')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.jobProjects = match[1].trim();
        }
        if (line.toLowerCase().includes('software used') || 
            line.toLowerCase().includes('technologies used') || 
            line.toLowerCase().includes('tools used in job')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.jobTechnologies = match[1].trim();
        }
        if (line.toLowerCase().includes('internship') || 
            line.toLowerCase().includes('relevant experience')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.internships = match[1].trim();
        }
        if (line.toLowerCase().includes('publications') || 
            line.toLowerCase().includes('papers') || 
            line.toLowerCase().includes('articles') ||
            line.toLowerCase().includes('blogs')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.publications = match[1].trim();
        }
        
        // Process motivation fields
        if (line.toLowerCase().includes('motivation') || line.toLowerCase().includes('motivated by')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.techMotivation = match[1].trim();
        }
        if (line.toLowerCase().includes('passion') || line.toLowerCase().includes('passionate about')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.techPassion = match[1].trim();
        }
        
        // Process transition information
        if (line.toLowerCase().includes('transition reason')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.transitionReason = match[1].trim();
        }
        if (line.toLowerCase().includes('transferable skills') || line.toLowerCase().includes('strength')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.transferableSkills = match[1].trim();
        }
        if (line.toLowerCase().includes('challenges')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.anticipatedChallenges = match[1].trim();
        }
        
        // Process existing fields
        if (line.toLowerCase().includes('work preference') || line.toLowerCase().includes('prefer to work')) {
          if (line.toLowerCase().includes('remote')) newFormData.workPreference = 'Remote work';
          else if (line.toLowerCase().includes('office')) newFormData.workPreference = 'Office work';
          else if (line.toLowerCase().includes('hybrid')) newFormData.workPreference = 'Hybrid';
          else newFormData.workPreference = 'Flexible';
        }
        if (line.toLowerCase().includes('learning comfort') || line.toLowerCase().includes('comfortable with')) {
          if (line.toLowerCase().includes('very comfortable')) newFormData.learningComfort = 'Very comfortable';
          else if (line.toLowerCase().includes('comfortable')) newFormData.learningComfort = 'Comfortable';
          else if (line.toLowerCase().includes('somewhat')) newFormData.learningComfort = 'Somewhat comfortable';
          else newFormData.learningComfort = 'Not very comfortable';
        }
        if (line.toLowerCase().includes('tech interests') || line.toLowerCase().includes('interested in learning')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.techInterests = match[1].trim();
        }
        
        // Process career aspirations
        if (line.toLowerCase().includes('career paths')) {
          const careerPaths = [];
          if (line.toLowerCase().includes('software')) careerPaths.push('Software Development');
          if (line.toLowerCase().includes('data')) careerPaths.push('Data Analysis/Science');
          if (line.toLowerCase().includes('design')) careerPaths.push('UX/UI Design');
          if (line.toLowerCase().includes('product')) careerPaths.push('Product Management');
          if (line.toLowerCase().includes('cyber')) careerPaths.push('Cybersecurity');
          if (line.toLowerCase().includes('cloud')) careerPaths.push('Cloud Engineering');
          if (line.toLowerCase().includes('devops')) careerPaths.push('DevOps');
          if (line.toLowerCase().includes('ai') || line.toLowerCase().includes('machine learning')) careerPaths.push('AI/Machine Learning');
          
          if (careerPaths.length > 0) {
            newFormData.careerPathsInterest = careerPaths;
          }
        }
        if (line.toLowerCase().includes('industry preference')) {
          const industries = [];
          if (line.toLowerCase().includes('healthcare')) industries.push('Healthcare/Medical');
          if (line.toLowerCase().includes('finance')) industries.push('Finance/Fintech');
          if (line.toLowerCase().includes('education')) industries.push('Education');
          if (line.toLowerCase().includes('commerce')) industries.push('E-commerce');
          if (line.toLowerCase().includes('media')) industries.push('Entertainment/Media');
          
          if (industries.length > 0) {
            newFormData.industryPreference = industries;
          } else {
            newFormData.industryPreference = ['No preference'];
          }
        }
        if (line.toLowerCase().includes('leverage domain') || line.toLowerCase().includes('current expertise')) {
          if (line.toLowerCase().includes('definitely')) newFormData.leverageDomainExpertise = 'Yes, definitely';
          else if (line.toLowerCase().includes('somewhat')) newFormData.leverageDomainExpertise = 'Yes, somewhat';
          else if (line.toLowerCase().includes('not sure')) newFormData.leverageDomainExpertise = 'Not sure';
          else if (line.toLowerCase().includes('change')) newFormData.leverageDomainExpertise = 'No, I want a complete change';
        }
        
        // Process existing experience fields
        if (line.toLowerCase().includes('experience level')) {
          if (line.toLowerCase().includes('beginner')) {
            if (line.toLowerCase().includes('complete')) newFormData.experienceLevel = 'Complete beginner';
            else newFormData.experienceLevel = 'Beginner';
          }
          else if (line.toLowerCase().includes('intermediate')) newFormData.experienceLevel = 'Intermediate';
          else if (line.toLowerCase().includes('advanced')) newFormData.experienceLevel = 'Advanced';
          else newFormData.experienceLevel = 'Some exposure';
        }
        if (line.toLowerCase().includes('certifications') && !line.includes('?')) {
          if (line.toLowerCase().includes('yes')) newFormData.certifications = 'Yes';
          else if (line.toLowerCase().includes('no')) newFormData.certifications = 'No';
          else if (line.toLowerCase().includes('pursuing')) newFormData.certifications = 'Currently pursuing';
          
          // Extract any specific certifications mentioned
          const certMatch = line.match(/:\s*(.+)/);
          if (certMatch && certMatch[1].trim().length > 2) {
            newFormData.certificationsDetail = certMatch[1].trim();
          } else {
            newFormData.certificationsDetail = 'None';
          }
        }
        if (line.toLowerCase().includes('tools used')) {
          const toolsList = [];
          if (line.toLowerCase().includes('vs code')) toolsList.push('VS Code');
          if (line.toLowerCase().includes('github')) toolsList.push('GitHub');
          if (line.toLowerCase().includes('javascript')) toolsList.push('JavaScript');
          if (line.toLowerCase().includes('python')) toolsList.push('Python');
          if (line.toLowerCase().includes('react')) toolsList.push('React');
          if (line.toLowerCase().includes('node')) toolsList.push('Node.js');
          if (line.toLowerCase().includes('sql')) toolsList.push('SQL');
          if (line.toLowerCase().includes('aws')) toolsList.push('AWS');
          if (line.toLowerCase().includes('docker')) toolsList.push('Docker');
          
          if (toolsList.length > 0) {
            newFormData.toolsUsed = toolsList;
          } else {
            newFormData.toolsUsed = ['None'];
          }
        }
        
        // Process timeline and goals
        if (line.toLowerCase().includes('time commitment') || line.toLowerCase().includes('hours per week')) {
          if (line.toLowerCase().includes('5 hours or less')) newFormData.timeCommitment = '5 hours or less';
          else if (line.toLowerCase().includes('5-10')) newFormData.timeCommitment = '5-10 hours';
          else if (line.toLowerCase().includes('10-15')) newFormData.timeCommitment = '10-15 hours';
          else if (line.toLowerCase().includes('15-20')) newFormData.timeCommitment = '15-20 hours';
          else if (line.toLowerCase().includes('20+')) newFormData.timeCommitment = '20+ hours';
          else newFormData.timeCommitment = '10-15 hours';
        }
        if (line.toLowerCase().includes('salary') || line.toLowerCase().includes('compensation')) {
          if (line.toLowerCase().includes('40,000-60,000')) newFormData.targetSalary = '$40,000-$60,000';
          else if (line.toLowerCase().includes('60,000-80,000')) newFormData.targetSalary = '$60,000-$80,000';
          else if (line.toLowerCase().includes('80,000-100,000')) newFormData.targetSalary = '$80,000-$100,000';
          else if (line.toLowerCase().includes('100,000-120,000')) newFormData.targetSalary = '$100,000-$120,000';
          else if (line.toLowerCase().includes('120,000')) newFormData.targetSalary = '$120,000+';
          else newFormData.targetSalary = 'Not sure';
        }
        if (line.toLowerCase().includes('transition timeline') || line.toLowerCase().includes('how long')) {
          if (line.toLowerCase().includes('less than 6')) newFormData.transitionTimeline = 'Less than 6 months';
          else if (line.toLowerCase().includes('6-12')) newFormData.transitionTimeline = '6-12 months';
          else if (line.toLowerCase().includes('1-2 years')) newFormData.transitionTimeline = '1-2 years';
          else if (line.toLowerCase().includes('2+')) newFormData.transitionTimeline = '2+ years';
          else newFormData.transitionTimeline = '6-12 months';
        }
        if (line.toLowerCase().includes('continue in current role') || line.toLowerCase().includes('current job')) {
          if (line.toLowerCase().includes('full-time')) newFormData.continueCurrent = 'Yes, continuing full-time';
          else if (line.toLowerCase().includes('part-time')) newFormData.continueCurrent = 'Yes, but reducing to part-time';
          else if (line.toLowerCase().includes('no')) newFormData.continueCurrent = 'No, focusing exclusively on the transition';
          else if (line.toLowerCase().includes('unemployed')) newFormData.continueCurrent = 'Currently unemployed/between roles';
        }
        if (line.toLowerCase().includes('guidance needed') || line.toLowerCase().includes('help needed')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.guidanceNeeded = match[1].trim();
        }
        if (line.toLowerCase().includes('future goal') || line.toLowerCase().includes('12-month')) {
          const match = line.match(/:\s*(.+)/);
          if (match) newFormData.futureGoal = match[1].trim();
        }
      });
      
      setFormData(newFormData);
      setLoading(false);
      toast.success('Form filled with AI suggestions! Please review and edit as needed.');
      
    } catch (error) {
      console.error('Error with AI form fill:', error);
      setLoading(false);
      
      // Use the helper function to get a user-friendly error message
      const userMessage = getErrorMessage(error);
      setError(userMessage);
      toast.error(userMessage);
    }
  };

  // Enhanced handleSubmit function with mobile fixes
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('Form submission started - Mobile Debug'); // Debug log
    
    // Prevent double submission
    if (loading || aiAnalyzing) {
      console.log('Already processing, ignoring duplicate submission');
      return;
    }
    
    // Validate form before proceeding
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    try {
      setAiAnalyzing(true);
      setError(null);
      
      // Show immediate feedback with persistent toast
      const processingToastId = toast.info('Processing your career assessment...', { 
        autoClose: false,
        toastId: 'processing'
      });
      
      console.log('Starting form submission process...');
      
      // 1. Save form data to local storage for the app's use
      const savedSubmission = storageService.saveCareerTest(formData);
      console.log('Form data saved to local storage');
      
      // 2. Submit only name and email to Google Form with timeout
      const googleFormData = {
        fullName: formData.fullName,
        email: formData.email
      };
      
      console.log('Submitting minimal data to Google Form...');
      try {
        // Submit the minimal data to Google Form with timeout
        const formSubmissionPromise = googleFormService.submitToGoogleForm(googleFormData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Google Form submission timeout')), 10000)
        );
        
        const formSubmissionResult = await Promise.race([formSubmissionPromise, timeoutPromise]);
        
        if (!formSubmissionResult.success) {
          console.warn('Google Form submission may have failed, but continuing analysis');
        } else {
          console.log('Google Form submission successful');
        }
      } catch (googleFormError) {
        console.warn('Google Form submission error, but continuing analysis:', googleFormError);
      }
      
      // 3. Use the Claude API service to analyze the complete form data
      console.log('Sending data to Claude API for analysis...');
      
      try {
        // Update toast to show progress
        toast.update('processing', { 
          render: 'AI is analyzing your responses... This may take up to 30 seconds.'
        });
        
        // Add timeout to Claude API call
        const analysisPromise = claudeApiService.analyzeCareerPath(formData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analysis timeout - please try again')), 90000)
        );
        
        const analysis = await Promise.race([analysisPromise, timeoutPromise]);
        
        // Verify we got a valid string response
        if (!analysis || typeof analysis !== 'string') {
          throw new Error('Invalid response from career analysis. Please try again.');
        }
        
        console.log('Analysis successfully received from API');
        console.log('Analysis length:', analysis.length);
        
        setCareerAnalysis(analysis);
        
        // Dismiss processing toast
        toast.dismiss('processing');
        toast.success('Analysis complete! Redirecting to your results...');
        
        setAiAnalyzing(false);
        
        // 4. Navigate to dashboard page with analysis and form data
        navigate('/career/dashboard', { 
          state: { 
            analysis,
            formData 
          } 
        });
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        throw new Error('Failed to analyze your career data: ' + claudeError.message);
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setAiAnalyzing(false);
      
      // Dismiss any existing toasts
      toast.dismiss('processing');
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 8000 });
    }
  };

  // Button click handler for debugging
  const handleButtonClick = (e) => {
    console.log('Submit button clicked/touched - Mobile Debug');
    // This will be called before form submission
  };

  // Helper function to render a checkbox group - memoized to prevent re-creation
  const renderCheckboxGroup = useCallback((fieldName, options, required = false) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map(option => (
          <div key={option.value} className="flex items-center p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-blue-400/50 transition-all duration-300 group backdrop-blur-sm">
            <input
              type="checkbox"
              id={`${fieldName}-${option.value}`}
              name={fieldName}
              value={option.value}
              checked={formData[fieldName].includes(option.value)}
              onChange={() => handleCheckboxChange(fieldName, option.value)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white/80"
              required={required && formData[fieldName].length === 0}
            />
            <label 
              htmlFor={`${fieldName}-${option.value}`}
              className="text-sm font-medium text-white cursor-pointer flex-1 group-hover:text-blue-300 transition-colors duration-300"
              style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    );
  }, [formData, handleCheckboxChange]);

  // Enhanced input styling
  const inputClassName = "w-full p-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-white/40 text-white placeholder-gray-300 font-medium";
  const textareaClassName = "w-full p-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-white/40 text-white placeholder-gray-300 font-medium resize-none";
  const selectClassName = "w-full p-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 hover:border-white/40 text-white font-medium";

  // Memoize options arrays to prevent re-creation on every render
const toolsOptions = useMemo(() => [
    // IDEs & Editors
    { value: 'VS Code', label: 'VS Code' },
    { value: 'IntelliJ IDEA', label: 'IntelliJ IDEA' },
    { value: 'PyCharm', label: 'PyCharm' },
    { value: 'Android Studio', label: 'Android Studio' },
    { value: 'Xcode', label: 'Xcode' },
    { value: 'Vim', label: 'Vim/Neovim' },
    
    // Version Control & Collaboration
    { value: 'Git', label: 'Git' },
    { value: 'GitHub', label: 'GitHub' },
    { value: 'GitLab', label: 'GitLab' },
    { value: 'Bitbucket', label: 'Bitbucket' },
    { value: 'Jira', label: 'Jira' },
    { value: 'Confluence', label: 'Confluence' },
    { value: 'Linear', label: 'Linear' },
    { value: 'Notion', label: 'Notion' },
    
    // Programming Languages
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'Python', label: 'Python' },
    { value: 'Java', label: 'Java' },
    { value: 'C/C++', label: 'C/C++' },
    { value: 'C#', label: 'C#' },
    { value: 'Go', label: 'Go' },
    { value: 'Rust', label: 'Rust' },
    { value: 'Swift', label: 'Swift' },
    { value: 'Kotlin', label: 'Kotlin' },
    { value: 'PHP', label: 'PHP' },
    { value: 'Ruby', label: 'Ruby' },
    { value: 'SQL', label: 'SQL' },
    
    // Frameworks & Libraries
    { value: 'React', label: 'React' },
    { value: 'Angular', label: 'Angular' },
    { value: 'Vue.js', label: 'Vue.js' },
    { value: 'Next.js', label: 'Next.js' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Express.js', label: 'Express.js' },
    { value: 'Django', label: 'Django' },
    { value: 'Flask', label: 'Flask' },
    { value: 'Spring Boot', label: 'Spring Boot' },
    { value: '.NET', label: '.NET' },
    { value: 'Laravel', label: 'Laravel' },
    
    // Databases
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'MySQL', label: 'MySQL' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'Redis', label: 'Redis' },
    { value: 'Firebase', label: 'Firebase' },
    
    // Cloud Platforms
    { value: 'AWS', label: 'AWS' },
    { value: 'Azure', label: 'Azure' },
    { value: 'Google Cloud', label: 'Google Cloud (GCP)' },
    { value: 'Heroku', label: 'Heroku' },
    { value: 'Vercel', label: 'Vercel' },
    { value: 'Netlify', label: 'Netlify' },
    
    // DevOps & Containerization
    { value: 'Docker', label: 'Docker' },
    { value: 'Kubernetes', label: 'Kubernetes' },
    { value: 'Jenkins', label: 'Jenkins' },
    { value: 'GitHub Actions', label: 'GitHub Actions' },
    { value: 'Terraform', label: 'Terraform' },
    { value: 'Ansible', label: 'Ansible' },
    
    // Design & Prototyping
    { value: 'Figma', label: 'Figma' },
    { value: 'Adobe XD', label: 'Adobe XD' },
    { value: 'Sketch', label: 'Sketch' },
    
    // Testing
    { value: 'Jest', label: 'Jest' },
    { value: 'Pytest', label: 'Pytest' },
    { value: 'Selenium', label: 'Selenium' },
    { value: 'Postman', label: 'Postman' },
    { value: 'Cypress', label: 'Cypress' },
    
    // Analytics & Monitoring
    { value: 'Datadog', label: 'Datadog' },
    { value: 'Tableau', label: 'Tableau' },
    { value: 'Power BI', label: 'Power BI' },
    
    // Communication
    { value: 'Slack', label: 'Slack' },
    { value: 'Microsoft Teams', label: 'Microsoft Teams' },
    
    { value: 'None', label: 'None' }
  ], []);

  const careerPathsOptions = useMemo(() => [
    { value: 'Software Development', label: 'Software Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Game Development', label: 'Game Development' },
    { value: 'Data Analysis/Science', label: 'Data Analysis/Science' },
    { value: 'Data Engineering', label: 'Data Engineering' },
    { value: 'Business Intelligence', label: 'Business Intelligence' },
    { value: 'UX/UI Design', label: 'UX/UI Design' },
    { value: 'Product Management', label: 'Product Management' },
    { value: 'Technical Project Management', label: 'Technical Project Management' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'Penetration Testing', label: 'Penetration Testing' },
    { value: 'Cloud Engineering', label: 'Cloud Engineering' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Site Reliability Engineering', label: 'Site Reliability Engineering (SRE)' },
    { value: 'AI/Machine Learning', label: 'AI/Machine Learning' },
    { value: 'Blockchain Development', label: 'Blockchain Development' },
    { value: 'AR/VR Development', label: 'AR/VR Development' },
    { value: 'Technical Writing', label: 'Technical Writing' },
    { value: 'Quality Assurance', label: 'Quality Assurance' },
    { value: 'Technical Support', label: 'Technical Support' },
    { value: 'Database Administration', label: 'Database Administration' },
    { value: 'Network Engineering', label: 'Network Engineering' },
    { value: 'Systems Administration', label: 'Systems Administration' },
    { value: 'Solutions Architecture', label: 'Solutions Architecture' },
    { value: 'Sales Engineering', label: 'Sales Engineering' },
    { value: 'Embedded Systems', label: 'Embedded Systems' },
    { value: 'IoT Engineering', label: 'IoT Engineering' },
    { value: 'Robotics Engineering', label: 'Robotics Engineering' },
    { value: 'Hardware Engineering', label: 'Hardware Engineering' },
    { value: 'IT Consulting', label: 'IT Consulting' },
    { value: 'Engineering Management', label: 'Engineering Management' },
    { value: 'Technical Program Management', label: 'Technical Program Management' },
    { value: 'Chief Technology Officer', label: 'Chief Technology Officer (CTO)' },
    { value: 'VP of Engineering', label: 'VP of Engineering' },
    { value: 'Head of Product', label: 'Head of Product' },
    { value: 'Product Operations', label: 'Product Operations' },
    { value: 'Technical Recruiting', label: 'Technical Recruiting' },
    { value: 'People Operations/HR Tech', label: 'People Operations/HR Tech' },
    { value: 'Business Development Tech', label: 'Business Development (Tech)' },
    { value: 'Vendor Management', label: 'Vendor Management' },
    { value: 'IT Strategy/Planning', label: 'IT Strategy/Planning' },
    { value: 'Digital Transformation', label: 'Digital Transformation' },
    { value: 'Technology Marketing', label: 'Technology Marketing' },
    { value: 'Developer Relations', label: 'Developer Relations/Advocacy' },
    { value: 'Customer Success Tech', label: 'Customer Success (Tech)' },
    { value: 'Agile Coach/Scrum Master', label: 'Agile Coach/Scrum Master' },
    { value: 'Compliance/GRC', label: 'Compliance/GRC' },
    { value: 'Legal Tech/IP', label: 'Legal (Tech/IP)' },
    { value: 'Finance Tech', label: 'Finance (Tech Industry)' },
    { value: 'Operations Management', label: 'Operations Management' },
    { value: 'Not Sure Yet', label: 'Not Sure Yet' }
  ], []);
  
  const industryOptions = useMemo(() => [
  { value: 'Healthcare/Medical', label: 'Healthcare/Medical' },
  { value: 'Finance/Fintech', label: 'Finance/Fintech' },
  { value: 'Education', label: 'Education' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Entertainment/Media', label: 'Entertainment/Media' },
  { value: 'Government', label: 'Government' },
  { value: 'Technology/Software/SaaS', label: 'Technology/Software/SaaS' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Transportation/Logistics', label: 'Transportation/Logistics' },
  { value: 'Real Estate/PropTech', label: 'Real Estate/PropTech' },
  { value: 'Energy/Utilities', label: 'Energy/Utilities' },
  { value: 'Agriculture/AgTech', label: 'Agriculture/AgTech' },
  { value: 'Manufacturing/Industrial', label: 'Manufacturing/Industrial' },
  { value: 'Legal Tech', label: 'Legal Tech' },
  { value: 'Non-Profit/Social Impact', label: 'Non-Profit/Social Impact' },
  { value: 'Travel/Hospitality', label: 'Travel/Hospitality' },
  { value: 'Sports/Fitness', label: 'Sports/Fitness' },
  { value: 'Food/Beverage', label: 'Food/Beverage' },
  { value: 'Fashion/Retail', label: 'Fashion/Retail' },
  { value: 'Construction/Infrastructure', label: 'Construction/Infrastructure' },
  { value: 'Marketing/Advertising', label: 'Marketing/Advertising' },
  { value: 'Same as current industry', label: 'Same as current industry' },
  { value: 'No preference', label: 'No preference' },
  { value: 'Other', label: 'Other' }
], []);

  // Beautiful Enhanced Loading Spinner
  if (loading || aiAnalyzing) {
    return (
      <div className="min-h-screen w-full overflow-hidden flex items-center justify-center relative bg-black">
        {/* Animated background overlay */}
        <div 
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`
          }}
        />
        
        <div className="bg-gradient-to-br from-black/50 via-gray-900/50 to-black/50 backdrop-blur-2xl p-12 rounded-3xl shadow-2xl border border-white/20 text-center transform animate-pulse">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6 shadow-2xl"
               style={{filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))'}}></div>
          <p className="text-white text-xl font-semibold mb-2" 
             style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>
            {aiAnalyzing ? "AI is analyzing your career path..." : "Loading your career assessment..."}
          </p>
          <p className="text-blue-300 text-sm" 
             style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative bg-black">
      {/* Animated background overlay */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`
        }}
      />

      {/* Enhanced Header with Navigation Menu */}
      <Navbar />

      {/* Main Content - Add top padding to account for fixed header */}
      <div className="pt-20 sm:pt-24 w-full">
        {/* Page Title Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4" 
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 50%, #ffffff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(255,255,255,0.3), 0 0 80px rgba(59, 130, 246, 0.2)',
                    filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.9))',
                    fontFamily: '"Inter", sans-serif'
                  }}>
                Career{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-orange-500"
                      style={{
                        textShadow: 'none',
                        filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                        animation: 'glow 2s ease-in-out infinite alternate'
                      }}>
                  Assessment
                </span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg md:text-xl font-light max-w-3xl mx-auto px-4" 
                 style={{
                   textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                   fontFamily: '"Inter", sans-serif'
                 }}>
                Discover your perfect tech career path with AI-powered insights
              </p>
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 pb-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Error Alert */}
            {error && (
              <div className="bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-xl border border-red-400/50 p-6 mb-8 rounded-2xl shadow-2xl animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-medium" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant */}
            <div className="mb-8 sm:mb-12">
              <button 
                onClick={toggleAiAssistant}
                className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                style={{boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)'}}
              >
                <div className="text-left">
                  <div className="font-black text-lg">
                    {showAiAssistant ? 'Hide AI Assistant' : 'Use AI Assistant'}
                  </div>
                  <div className="text-sm text-blue-100 font-light">
                    Auto-fill form with intelligent suggestions
                  </div>
                </div>
                <svg className={`w-6 h-6 ml-4 transform transition-transform duration-300 ${showAiAssistant ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAiAssistant && (
                <div className="mt-6 bg-gradient-to-br from-blue-500/20 via-blue-500/20 to-orange-500/20 backdrop-blur-2xl p-8 rounded-3xl border border-blue-500/30 shadow-2xl animate-fadeIn">
                  <div className="flex items-start">
                    <div className="text-5xl mr-6 animate-bounce" style={{filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))'}}></div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-3" 
                          style={{
                            textShadow: '0 0 15px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.8)',
                            fontFamily: '"Inter", sans-serif'
                          }}>
                        AI-Powered Career Assistant
                      </h3>
                      <p className="text-gray-200 mb-6 text-lg leading-relaxed" 
                         style={{
                           textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                           fontFamily: '"Inter", sans-serif'
                         }}>
                        Let our advanced AI analyze your background and automatically fill out the form with personalized suggestions based on your career goals.
                      </p>
                      <button 
                        onClick={handleAiFillForm}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center"
                      >
                        Generate AI Suggestions
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Progress Indicator */}
            <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 sm:mb-12 border border-white/20 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 shadow-2xl"
                       style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)'}}>
                    <span className="font-black">1</span>
                  </div>
                  <span className="font-bold text-white text-lg" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Career Assessment</span>
                </div>
                <div className="flex-1 mx-4 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-1/3 shadow-lg animate-pulse"
                       style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'}}></div>
                </div>
                <div className="flex items-center opacity-60">
                  <div className="bg-white/20 text-gray-400 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="font-black">2</span>
                  </div>
                  <span className="text-gray-400 text-lg">AI Analysis</span>
                </div>
                <div className="flex-1 mx-4 h-3 bg-white/20 rounded-full">
                  <div className="h-3 bg-white/20 rounded-full w-0"></div>
                </div>
                <div className="flex items-center opacity-60">
                  <div className="bg-white/20 text-gray-400 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <span className="font-black">3</span>
                  </div>
                  <span className="text-gray-400 text-lg">Results</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
              <EnhancedFormSection title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="Enter your full name"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="Enter your email address"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-3 text-sm font-bold text-white">
                    <span className="text-red-400">*</span> Highest Level of Education
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className={selectClassName}
                    required
                    style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                  >
                    <option value="" className="text-gray-800">Select your education level</option>
                    <option value="High School" className="text-gray-800">High School</option>
                    <option value="Associate's Degree" className="text-gray-800">Associate's Degree</option>
                    <option value="Bachelor's Degree" className="text-gray-800">Bachelor's Degree</option>
                    <option value="Master's Degree" className="text-gray-800">Master's Degree</option>
                    <option value="PhD" className="text-gray-800">PhD</option>
                    <option value="Other" className="text-gray-800">Other</option>
                  </select>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Educational Background">
                <div className="space-y-6">
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Most Recent Course of Study
                    </label>
                    <input
                      type="text"
                      name="studyField"
                      value={formData.studyField}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="E.g., Computer Science, Biology, Business, etc."
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Current or Most Recent Job Title
                    </label>
                    <input
                      type="text"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="E.g., Research Assistant, Project Manager, Teacher, etc."
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Years of Experience in Current/Previous Field
                    </label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      className={selectClassName}
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    >
                      <option value="" className="text-gray-800">Select your experience level</option>
                      <option value="Less than 1 year" className="text-gray-800">Less than 1 year</option>
                      <option value="1-3 years" className="text-gray-800">1-3 years</option>
                      <option value="3-5 years" className="text-gray-800">3-5 years</option>
                      <option value="5-10 years" className="text-gray-800">5-10 years</option>
                      <option value="10+ years" className="text-gray-800">10+ years</option>
                    </select>
                  </div>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Experience Details" >
                <div className="space-y-6">
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Key Job Responsibilities
                    </label>
                    <textarea
                      name="jobResponsibilities"
                      value={formData.jobResponsibilities}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="Describe your main responsibilities in your current/previous role. Feel free to copy and paste from your resume."
                      rows="4"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                    <p className="text-sm text-gray-300 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      List your key responsibilities, tasks performed, or duties from your current/previous job
                    </p>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Notable Projects or Achievements
                    </label>
                    <textarea
                      name="jobProjects"
                      value={formData.jobProjects}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="Describe 2-3 significant projects, achievements, or initiatives you've worked on"
                      rows="4"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                    <p className="text-sm text-gray-300 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      Include measurable results if possible (e.g., "Increased efficiency by 20%", "Managed a team of 5")
                    </p>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Software or Technologies Used
                    </label>
                    <textarea
                      name="jobTechnologies"
                      value={formData.jobTechnologies}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="List all software, tools, systems, or technologies you've used professionally"
                      rows="3"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                    <p className="text-sm text-gray-300 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      Include all technical and non-technical tools (e.g., CRM systems, MS Office, specialized software)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      Internships or Relevant Experience
                    </label>
                    <textarea
                      name="internships"
                      value={formData.internships}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="Describe any internships, volunteer work, or other experiences relevant to technology"
                      rows="3"
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                    <p className="text-sm text-gray-300 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      Include any tech-related side projects, freelance work, or personal initiatives
                    </p>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      Publications, Papers, Articles, or Blogs
                    </label>
                    <textarea
                      name="publications"
                      value={formData.publications}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="List any publications, research papers, articles, or blogs you've authored"
                      rows="3"
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                    <p className="text-sm text-gray-300 mt-2" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      Include titles, publications, dates, and brief descriptions if applicable
                    </p>
                  </div>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Motivation & Personal Strengths" >
                <div className="space-y-6">
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> What is your biggest motivation for pursuing a tech career?
                    </label>
                    <textarea
                      name="techMotivation"
                      value={formData.techMotivation}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="What drives you to pursue a career in technology?"
                      rows="3"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> What are you passionate about?
                    </label>
                    <textarea
                      name="techPassion"
                      value={formData.techPassion}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="Describe topics, activities or causes you're passionate about"
                      rows="3"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Transition Information" >
                <div className="space-y-6">
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> What is your primary reason for transitioning to tech?
                    </label>
                    <select
                      name="transitionReason"
                      value={formData.transitionReason}
                      onChange={handleChange}
                      className={selectClassName}
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    >
                      <option value="" className="text-gray-800">Select your primary reason</option>
                      <option value="Better career prospects" className="text-gray-800">Better career prospects</option>
                      <option value="Higher salary potential" className="text-gray-800">Higher salary potential</option>
                      <option value="Work-life balance" className="text-gray-800">Work-life balance</option>
                      <option value="Remote work opportunities" className="text-gray-800">Remote work opportunities</option>
                      <option value="Interest in technology" className="text-gray-800">Interest in technology</option>
                      <option value="Career advancement" className="text-gray-800">Career advancement</option>
                      <option value="Industry is changing/declining" className="text-gray-800">Industry is changing/declining</option>
                      <option value="Other" className="text-gray-800">Other (please specify in comments)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Which skills from your current/previous career do you believe will transfer well to tech?
                    </label>
                    <textarea
                      name="transferableSkills"
                      value={formData.transferableSkills}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="E.g., analytical thinking, project management, attention to detail, problem-solving, etc."
                      rows="4"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> What challenges do you anticipate in transitioning to tech?
                    </label>
                    <textarea
                      name="anticipatedChallenges"
                      value={formData.anticipatedChallenges}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="E.g., learning programming, technical terminology, finding entry-level positions, etc."
                      rows="4"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Tech Preferences & Experience" >
                <div className="space-y-6">
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Which tech areas are you most curious about or interested in learning?
                    </label>
                    <textarea
                      name="techInterests"
                      value={formData.techInterests}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="E.g., web development, data science, cybersecurity, etc."
                      rows="3"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Learning Comfort Level
                      </label>
                      <select
                        name="learningComfort"
                        value={formData.learningComfort}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select comfort level</option>
                        <option value="Very comfortable" className="text-gray-800">Very comfortable</option>
                        <option value="Comfortable" className="text-gray-800">Comfortable</option>
                        <option value="Somewhat comfortable" className="text-gray-800">Somewhat comfortable</option>
                        <option value="Not very comfortable" className="text-gray-800">Not very comfortable</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Work Preference
                      </label>
                      <select
                        name="workPreference"
                        value={formData.workPreference}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select work preference</option>
                        <option value="Remote work" className="text-gray-800">Remote work</option>
                        <option value="Office work" className="text-gray-800">Office work</option>
                        <option value="Hybrid" className="text-gray-800">Hybrid</option>
                        <option value="Flexible" className="text-gray-800">Flexible</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Current Tech Experience Level
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      className={selectClassName}
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    >
                      <option value="" className="text-gray-800">Select experience level</option>
                      <option value="Complete beginner" className="text-gray-800">Complete beginner</option>
                      <option value="Some exposure" className="text-gray-800">Some exposure</option>
                      <option value="Beginner" className="text-gray-800">Beginner</option>
                      <option value="Intermediate" className="text-gray-800">Intermediate</option>
                      <option value="Advanced" className="text-gray-800">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-4 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Which tools or platforms have you used before?
                    </label>
                    <div className="bg-black/30 border-2 border-dashed border-white/30 rounded-2xl p-6 backdrop-blur-sm max-h-96 overflow-y-auto">
                      {renderCheckboxGroup('toolsUsed', toolsOptions, true)}
                    </div>
                    <p className="text-sm text-gray-300 mt-3" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Select all that apply</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Existing Certifications
                      </label>
                      <select
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select an option</option>
                        <option value="Yes" className="text-gray-800">Yes</option>
                        <option value="No" className="text-gray-800">No</option>
                        <option value="Currently pursuing" className="text-gray-800">Currently pursuing</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Certification Details
                      </label>
                      <textarea
                        name="certificationsDetail"
                        value={formData.certificationsDetail}
                        onChange={handleChange}
                        className={textareaClassName}
                        placeholder="Enter your certifications (or type 'None')"
                        rows="3"
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      />
                    </div>
                  </div>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Tech Career Aspirations" >
                <div className="space-y-6">
                  <div>
                    <label className="block mb-4 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Which tech career paths interest you most?
                    </label>
                    <div className="bg-black/30 border-2 border-dashed border-white/30 rounded-2xl p-6 max-h-80 overflow-y-auto backdrop-blur-sm">
                      {renderCheckboxGroup('careerPathsInterest', careerPathsOptions, true)}
                    </div>
                    <p className="text-sm text-gray-300 mt-3" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Select all that apply</p>
                  </div>
                  
                  <div>
                    <label className="block mb-4 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Industry Preferences
                    </label>
                    <div className="bg-black/30 border-2 border-dashed border-white/30 rounded-2xl p-6 backdrop-blur-sm">
                      {renderCheckboxGroup('industryPreference', industryOptions, true)}
                    </div>
                    <p className="text-sm text-gray-300 mt-3" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Select all that apply</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Leverage Domain Expertise?
                      </label>
                      <select
                        name="leverageDomainExpertise"
                        value={formData.leverageDomainExpertise}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select an option</option>
                        <option value="Yes, definitely" className="text-gray-800">Yes, definitely</option>
                        <option value="Yes, somewhat" className="text-gray-800">Yes, somewhat</option>
                        <option value="Not sure" className="text-gray-800">Not sure</option>
                        <option value="No, I want a complete change" className="text-gray-800">No, I want a complete change</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Target Salary Range
                      </label>
                      <select
                        name="targetSalary"
                        value={formData.targetSalary}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select salary range</option>
                        <option value="$40,000-$60,000" className="text-gray-800">$40,000-$60,000</option>
                        <option value="$60,000-$80,000" className="text-gray-800">$60,000-$80,000</option>
                        <option value="$80,000-$100,000" className="text-gray-800">$80,000-$100,000</option>
                        <option value="$100,000-$120,000" className="text-gray-800">$100,000-$120,000</option>
                        <option value="$120,000+" className="text-gray-800">$120,000+</option>
                        <option value="Not sure" className="text-gray-800">Not sure</option>
                      </select>
                    </div>
                  </div>
                </div>
              </EnhancedFormSection>
              
              <EnhancedFormSection title="Commitment & Goals" >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Weekly Time Commitment
                      </label>
                      <select
                        name="timeCommitment"
                        value={formData.timeCommitment}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select time commitment</option>
                        <option value="5 hours or less" className="text-gray-800">5 hours or less</option>
                        <option value="5-10 hours" className="text-gray-800">5-10 hours</option>
                        <option value="10-15 hours" className="text-gray-800">10-15 hours</option>
                        <option value="15-20 hours" className="text-gray-800">15-20 hours</option>
                        <option value="20+ hours" className="text-gray-800">20+ hours</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-3 text-sm font-bold text-white">
                        <span className="text-red-400">*</span> Transition Timeline
                      </label>
                      <select
                        name="transitionTimeline"
                        value={formData.transitionTimeline}
                        onChange={handleChange}
                        className={selectClassName}
                        required
                        style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                      >
                        <option value="" className="text-gray-800">Select timeline</option>
                        <option value="Less than 6 months" className="text-gray-800">Less than 6 months</option>
                        <option value="6-12 months" className="text-gray-800">6-12 months</option>
                        <option value="1-2 years" className="text-gray-800">1-2 years</option>
                        <option value="2+ years" className="text-gray-800">2+ years</option>
                        <option value="Already transitioning" className="text-gray-800">Already transitioning</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> Current Role Status
                    </label>
                    <select
                      name="continueCurrent"
                      value={formData.continueCurrent}
                      onChange={handleChange}
                      className={selectClassName}
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    >
                      <option value="" className="text-gray-800">Select current status</option>
                      <option value="Yes, continuing full-time" className="text-gray-800">Yes, continuing full-time</option>
                      <option value="Yes, but reducing to part-time" className="text-gray-800">Yes, but reducing to part-time</option>
                      <option value="No, focusing exclusively on the transition" className="text-gray-800">No, focusing exclusively on the transition</option>
                      <option value="Currently unemployed/between roles" className="text-gray-800">Currently unemployed/between roles</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> What guidance do you need most right now?
                    </label>
                    <textarea
                      name="guidanceNeeded"
                      value={formData.guidanceNeeded}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="E.g., learning resources, career roadmap, resume help, etc."
                      rows="3"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-3 text-sm font-bold text-white">
                      <span className="text-red-400">*</span> 12-Month Goal
                    </label>
                    <textarea
                      name="futureGoal"
                      value={formData.futureGoal}
                      onChange={handleChange}
                      className={textareaClassName}
                      placeholder="E.g., completing a bootcamp, landing first tech job, etc."
                      rows="3"
                      required
                      style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', fontSize: '16px'}}
                    />
                  </div>
                </div>
              </EnhancedFormSection>
              
              {/* Terms and Submit */}
              <div className="bg-gradient-to-br from-black/40 via-gray-900/40 to-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl">
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-8" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">Terms of Service</a>
                    {' '}and acknowledge you've read our{' '}
                    <a href="/privacy" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300">Privacy Policy</a>.
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading || aiAnalyzing}
                    onClick={handleButtonClick}
                    onTouchStart={handleButtonClick}
                    className="relative bg-gradient-to-r from-blue-500 via-blue-500 to-orange-600 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 text-white px-12 py-6 rounded-2xl font-black text-xl transition-all duration-300 shadow-2xl w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 20px 40px rgba(0,0,0,0.3)',
                      fontFamily: '"Inter", sans-serif',
                      minHeight: '64px',
                      touchAction: 'manipulation',
                      WebkitAppearance: 'none',
                      fontSize: '16px'
                    }}
                  >
                    {loading || aiAnalyzing ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></span>
                        {aiAnalyzing ? 'Analyzing Your Career Path...' : 'Processing...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Get My AI Career Analysis
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(59, 130, 246, 0.8)); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        /* Mobile-specific fixes */
        button[type="submit"] {
          -webkit-appearance: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          touch-action: manipulation;
          cursor: pointer;
        }
        
        button[type="submit"]:focus {
          outline: none;
        }
        
        /* Ensure adequate touch targets */
        @media (max-width: 768px) {
          button, input, textarea, select {
            min-height: 44px;
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }
        
        /* Smooth transitions for all interactive elements */
        input, textarea, select, button {
          transition: all 0.3s ease;
        }

        /* Focus states for accessibility */
        input:focus, textarea:focus, select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Enhanced hover effects */
        .group:hover .group-hover\:rotate-12 {
          transform: rotate(12deg);
        }

        .group:hover .group-hover\:scale-125 {
          transform: scale(1.25);
        }

        .group:hover .group-hover\:text-blue-300 {
          color: rgb(147 197 253);
        }
      `}</style>
    </div>
  );
};

export default CareerTest;
