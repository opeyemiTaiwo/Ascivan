// src/Pages/PostHousing.jsx - List a Housing Space

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import usePosterName from '../hooks/usePosterName';
const PostHousing = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    housingType: '',
    title: '',
    description: '',
    city: '',
    state: '',
    address: '',
    monthlyRent: '',
    securityDeposit: '',
    bedrooms: '',
    bathrooms: '',
    availableFrom: '',
    leaseDuration: '',
    studentFriendly: true,
    utilitiesIncluded: false,
    petsAllowed: false,
    amenities: '',
    contactEmail: '',
    contactPhone: '',
    contactLink: '',
    posterName: '',
    posterEmail: '',
    expirationOption: '60',
    customExpirationDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { posterName: profilePosterName, isCompany: profileIsCompany } = usePosterName(currentUser);
  const housingTypes = [
    { id: 'apartment', label: 'Apartment', description: 'Entire apartment unit' },
    { id: 'room', label: 'Room / Shared', description: 'Room in shared house or apartment' },
    { id: 'studio', label: 'Studio', description: 'Self-contained studio unit' },
    { id: 'house', label: 'House', description: 'Full house for rent' },
    { id: 'student-housing', label: 'Student Housing', description: 'Dedicated student accommodation' },
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
        posterName: profilePosterName || currentUser.displayName || '',
        contactEmail: currentUser.email || '',
      }));
    }
  }, [currentUser, formData.posterEmail, profilePosterName]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const getMinDate = () => {
    const d = new Date();
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
    if (!formData.housingType) errors.push('Housing type is required');
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.posterName.trim()) errors.push('Your name is required');
    if (!formData.posterEmail.trim()) errors.push('Your email is required');
    if (!formData.contactEmail.trim() && !formData.contactPhone.trim() && !formData.contactLink.trim()) {
      errors.push('At least one contact method is required');
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'housing_posts'), {
        housingType: formData.housingType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || null,
        address: formData.address.trim() || null,
        monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : null,
        securityDeposit: formData.securityDeposit.trim() || null,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        availableFrom: formData.availableFrom ? new Date(formData.availableFrom) : null,
        leaseDuration: formData.leaseDuration.trim() || null,
        studentFriendly: formData.studentFriendly,
        utilitiesIncluded: formData.utilitiesIncluded,
        petsAllowed: formData.petsAllowed,
        amenities: formData.amenities.trim() ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        contactEmail: formData.contactEmail.trim() || null,
        contactPhone: formData.contactPhone.trim() || null,
        contactLink: formData.contactLink.trim() || null,
        posterName: formData.posterName.trim(),
        posterEmail: formData.posterEmail.trim(),
        posterId: currentUser.uid,
        isCompanyPost: profileIsCompany,
        status: 'active',
        viewCount: 0,
        expiresAt: calculateExpirationDate(),
        expirationOption: formData.expirationOption,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Housing listing posted successfully!');
      setTimeout(() => navigate('/housing'), 1500);
    } catch (error) {
      console.error(error);
      toast.error('Error posting listing: ' + error.message);
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
      <div className="min-h-screen overflow-x-hidden pt-20 sm:pt-24" style={{ backgroundColor: '#000' }}>        <main className="pb-16 sm:pb-20 md:pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-3xl">

            {/* Header */}
            <section className="text-center mb-10">
              <div className="inline-block mb-4 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-orange-400 font-semibold text-sm">🏠 List housing for international students</p>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-3">
                List a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Space</span>
              </h1>
              <p className="text-gray-300">Help international students find their new home</p>
            </section>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 md:p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Housing Type */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Housing Type *</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {housingTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, housingType: type.id }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                          formData.housingType === type.id
                            ? 'border-orange-400 bg-orange-500/20 shadow-lg scale-105'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-white font-bold mb-1 text-sm">{type.label}</div>
                        <div className="text-gray-400 text-xs">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Listing Details</h2>
                  <div>
                    <label className={labelClass}>Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className={inputClass} placeholder="e.g., Cozy 1BR near Morgan State University" />
                  </div>
                  <div>
                    <label className={labelClass}>Description *</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="5" className={inputClass + " resize-none"} placeholder="Describe the space, surroundings, and what makes it great for students..." />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Location *</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className={inputClass} placeholder="e.g., Baltimore" />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} placeholder="e.g., MD" maxLength={2} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Street Address <span className="text-gray-400 font-normal">(optional — shown after contact)</span></label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={inputClass} placeholder="e.g., 123 Main St" />
                    </div>
                  </div>
                </div>

                {/* Pricing & Details */}
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Pricing & Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Monthly Rent (USD)</label>
                      <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} className={inputClass} placeholder="e.g., 900" min="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Security Deposit</label>
                      <input type="text" name="securityDeposit" value={formData.securityDeposit} onChange={handleInputChange} className={inputClass} placeholder="e.g., 1 month's rent" />
                    </div>
                    <div>
                      <label className={labelClass}>Bedrooms</label>
                      <select name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select</option>
                        <option value="Studio">Studio</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4+">4+</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Bathrooms</label>
                      <select name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} className={inputClass}>
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="1.5">1.5</option>
                        <option value="2">2</option>
                        <option value="2+">2+</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Available From</label>
                      <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange} min={getMinDate()} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Lease Duration</label>
                      <input type="text" name="leaseDuration" value={formData.leaseDuration} onChange={handleInputChange} className={inputClass} placeholder="e.g., 12 months, Month-to-month" />
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {[
                      { name: 'studentFriendly', label: '✓ Student-Friendly' },
                      { name: 'utilitiesIncluded', label: '💡 Utilities Included' },
                      { name: 'petsAllowed', label: '🐾 Pets Allowed' },
                    ].map(item => (
                      <label key={item.name} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name={item.name} checked={formData[item.name]} onChange={handleInputChange} className={checkboxClass} />
                        <span className="text-white text-sm font-semibold">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className={labelClass}>Amenities <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input type="text" name="amenities" value={formData.amenities} onChange={handleInputChange} className={inputClass} placeholder="e.g., WiFi, Laundry, Parking, AC, Near Transit" />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Contact Information</h2>
                  <p className="text-gray-400 text-sm">Provide at least one way for students to reach you.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Contact Email</label>
                      <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className={inputClass} placeholder="landlord@email.com" />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Phone</label>
                      <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className={inputClass} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Listing URL / Application Link</label>
                      <input type="url" name="contactLink" value={formData.contactLink} onChange={handleInputChange} className={inputClass} placeholder="https://..." />
                    </div>
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
                    className="px-8 sm:px-12 py-4 w-full sm:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-black text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-3">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Posting...
                      </span>
                    ) : 'List My Space'}
                  </button>
                  <p className="text-gray-400 text-xs mt-3">* Required fields. Listing will be visible immediately.</p>
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

export default PostHousing;
