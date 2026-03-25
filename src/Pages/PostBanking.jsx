// src/Pages/PostBanking.jsx - List a Banking / Financial Service

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const PostBanking = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    serviceType: '',
    title: '',
    description: '',
    providerName: '',
    city: '',
    state: '',
    availableNationwide: false,
    fees: '',
    tags: '',
    noSSNRequired: false,
    internationalFriendly: true,
    externalLink: '',
    contactEmail: '',
    posterName: '',
    posterEmail: '',
    expirationOption: '60',
    customExpirationDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceTypes = [
    { id: 'bank-account', label: 'Bank Account', description: 'Checking or savings account' },
    { id: 'credit-card', label: 'Credit Card', description: 'Credit building for internationals' },
    { id: 'insurance', label: 'Insurance', description: 'Health, renters, or auto insurance' },
    { id: 'money-transfer', label: 'Money Transfer', description: 'Send money internationally' },
    { id: 'investment', label: 'Investment', description: 'Investing and savings services' },
    { id: 'tax-services', label: 'Tax Services', description: 'Tax filing and ITIN assistance' },
    { id: 'financial-aid', label: 'Financial Aid', description: 'Grants, scholarships, or aid' },
  ];

  const expirationOptions = [
    { value: '30', label: '30 days' },
    { value: '60', label: '60 days' },
    { value: '90', label: '90 days' },
    { value: 'custom', label: 'Custom date' },
    { value: 'never', label: 'Never expires' },
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (currentUser && !formData.posterEmail) {
      setFormData(prev => ({
        ...prev,
        posterEmail: currentUser.email || '',
        posterName: currentUser.displayName || '',
        contactEmail: currentUser.email || '',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const calculateExpirationDate = () => {
    if (formData.expirationOption === 'never') return null;
    if (formData.expirationOption === 'custom') return new Date(formData.customExpirationDate);
    const d = new Date();
    d.setDate(d.getDate() + parseInt(formData.expirationOption));
    return d;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errors = [];
    if (!formData.serviceType) errors.push('Service type is required');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.availableNationwide && !formData.city.trim()) errors.push('City is required (or check "Available Nationwide")');
    if (!formData.posterName.trim()) errors.push('Your name is required');
    if (!formData.posterEmail.trim()) errors.push('Your email is required');
    if (!formData.externalLink.trim() && !formData.contactEmail.trim()) errors.push('A link or contact email is required');

    if (errors.length > 0) {
      toast.error(errors[0]);
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'banking_posts'), {
        serviceType: formData.serviceType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        providerName: formData.providerName.trim() || null,
        city: formData.availableNationwide ? null : formData.city.trim(),
        state: formData.availableNationwide ? null : formData.state.trim() || null,
        availableNationwide: formData.availableNationwide,
        fees: formData.fees.trim() || null,
        tags: formData.tags.trim() ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        noSSNRequired: formData.noSSNRequired,
        internationalFriendly: formData.internationalFriendly,
        externalLink: formData.externalLink.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        posterName: formData.posterName.trim(),
        posterEmail: formData.posterEmail.trim(),
        posterId: currentUser.uid,
        status: 'active',
        viewCount: 0,
        expiresAt: calculateExpirationDate(),
        expirationOption: formData.expirationOption,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Service listed successfully!');
      setTimeout(() => navigate('/banking'), 1500);
    } catch (error) {
      console.error(error);
      toast.error('Error listing service: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[44px] text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm transition-all";
  const labelClass = "block text-orange-400 font-semibold mb-2 text-sm";
  const checkboxClass = "w-5 h-5 rounded border-white/30 bg-white/10 text-orange-500 focus:ring-orange-400 cursor-pointer";

  if (authLoading || !currentUser) {
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
      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#000' }}>
        <main className="pb-16 sm:pb-20 md:pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-3xl">

            {/* Header */}
            <section className="text-center mb-10">
              <div className="inline-block mb-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-orange-400 font-semibold text-sm">💳 Help international students access financial services</p>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3">
                List a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Service</span>
              </h1>
              <p className="text-gray-600">Share banking and financial resources with the community</p>
            </section>

            <div className="bg-white/5 rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Service Type */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Service Type *</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {serviceTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, serviceType: type.id }))}
                        className={`p-4 rounded-xl border-2 text-left ${
                          formData.serviceType === type.id
                            ? 'border-orange-400 bg-orange-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-white font-bold mb-1 text-sm">{type.label}</div>
                        <div className="text-gray-400 text-xs">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Service Details</h2>
                  <div>
                    <label className={labelClass}>Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className={inputClass} placeholder="e.g., No-SSN Checking Account for International Students" />
                  </div>
                  <div>
                    <label className={labelClass}>Provider / Institution Name</label>
                    <input type="text" name="providerName" value={formData.providerName} onChange={handleInputChange} className={inputClass} placeholder="e.g., Bank of America, Wise, H&R Block" />
                  </div>
                  <div>
                    <label className={labelClass}>Description *</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="5" className={inputClass + " resize-none"} placeholder="Describe the service, who it's for, key benefits, and how to apply or access it..." />
                  </div>
                  <div>
                    <label className={labelClass}>Fees / Pricing</label>
                    <input type="text" name="fees" value={formData.fees} onChange={handleInputChange} className={inputClass} placeholder="e.g., Free, $5/month, No monthly fee" />
                  </div>
                  <div>
                    <label className={labelClass}>Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className={inputClass} placeholder="e.g., F-1 Visa, No Credit History, Online, ITIN" />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Availability</h2>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="availableNationwide" checked={formData.availableNationwide} onChange={handleInputChange} className={checkboxClass} />
                    <span className="text-white text-sm font-semibold">🌎 Available Nationwide (online or all states)</span>
                  </label>
                  {!formData.availableNationwide && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} placeholder="e.g., Baltimore" />
                      </div>
                      <div>
                        <label className={labelClass}>State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} placeholder="e.g., MD" maxLength={2} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Eligibility Flags */}
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Eligibility Flags</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="noSSNRequired" checked={formData.noSSNRequired} onChange={handleInputChange} className={checkboxClass} />
                      <span className="text-white text-sm font-semibold">✅ No SSN Required</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="internationalFriendly" checked={formData.internationalFriendly} onChange={handleInputChange} className={checkboxClass} />
                      <span className="text-white text-sm font-semibold">🌍 International Student Friendly</span>
                    </label>
                  </div>
                </div>

                {/* Links & Contact */}
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Links & Contact</h2>
                  <div>
                    <label className={labelClass}>Website / Application Link</label>
                    <input type="url" name="externalLink" value={formData.externalLink} onChange={handleInputChange} className={inputClass} placeholder="https://..." />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={inputClass} placeholder="contact@provider.com" />
                  </div>
                </div>

                {/* Your Info */}
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Your Info</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Your Name *</label>
                      <input type="text" name="posterName" value={formData.posterName} onChange={handleInputChange} required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Your Email *</label>
                      <input type="email" name="posterEmail" value={formData.posterEmail} onChange={handleInputChange} required className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Expiration */}
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Listing Duration</h2>
                  <select name="expirationOption" value={formData.expirationOption} onChange={handleInputChange} className={inputClass}>
                    {expirationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {formData.expirationOption === 'custom' && (
                    <input type="date" name="customExpirationDate" value={formData.customExpirationDate} onChange={handleInputChange} min={getMinDate()} className={inputClass} />
                  )}
                </div>

                {/* Submit */}
                <div className="text-center pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 sm:px-12 py-4 w-full sm:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-black text-base sm:text-lg rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{}}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-3">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Posting...
                      </span>
                    ) : 'List Service'}
                  </button>
                  <p className="text-gray-400 text-xs mt-3">* Required. Listing visible immediately.</p>
                </div>
              </form>
            </div>
          </div>
        </main>
        <style jsx>{`select option { background-color: #111; color: white; }`}</style>
      </div>
    </>
  );
};

export default PostBanking;
