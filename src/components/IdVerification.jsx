// src/components/IdVerification.jsx - Reusable ID Verification Form
// Used in both Onboarding and Dashboard Profile

import React, { useState } from 'react';

const idTypes = [
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_licence', label: "Driver's Licence" },
  { value: 'passport', label: 'Passport' },
];

const IdVerification = ({ initialData, onSave, saving = false, inputClass, labelClass }) => {
  const defaultInput = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 min-h-[44px] text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none text-sm transition-all";
  const defaultLabel = "block text-orange-400 font-semibold mb-2 text-sm";
  const iCls = inputClass || defaultInput;
  const lCls = labelClass || defaultLabel;

  const [idForm, setIdForm] = useState({
    idType: initialData?.idType || '',
    fullName: initialData?.fullName || '',
    idNumber: initialData?.idNumber || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    expiryDate: initialData?.expiryDate || '',
    issuingCountry: initialData?.issuingCountry || '',
    issuingAuthority: initialData?.issuingAuthority || '',
    isPublic: initialData?.isPublic ?? false,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, WebP, or PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB');
      return;
    }

    // Create preview for reference only — image is NOT stored
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { setPreviewUrl(ev.target.result); setImageLoaded(true); };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      setImageLoaded(true);
    }
  };

  const handleChange = (field, value) => {
    setIdForm(prev => ({ ...prev, [field]: value }));
  };

  const isExpired = () => {
    if (!idForm.expiryDate) return false;
    return new Date(idForm.expiryDate) < new Date();
  };

  const handleSubmit = () => {
    if (!idForm.idType) { alert('Please select an ID type'); return; }
    if (!imageLoaded) { alert('Please upload a photo of your ID document'); return; }
    if (!idForm.fullName.trim()) { alert('Please enter the full name on the ID'); return; }
    if (!idForm.idNumber.trim()) { alert('Please enter the ID number'); return; }
    if (!idForm.expiryDate) { alert('Please enter the expiry date'); return; }
    if (isExpired()) { alert('This ID has expired. Please use a valid, non-expired document.'); return; }

    // Only save text info, never the image
    onSave({
      idType: idForm.idType,
      fullName: idForm.fullName.trim(),
      idNumber: idForm.idNumber.trim(),
      dateOfBirth: idForm.dateOfBirth || null,
      expiryDate: idForm.expiryDate,
      issuingCountry: idForm.issuingCountry.trim() || null,
      issuingAuthority: idForm.issuingAuthority.trim() || null,
      isPublic: idForm.isPublic,
      verified: true,
      verifiedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      {/* ID Type */}
      <div>
        <label className={lCls}>ID Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {idTypes.map(t => (
            <button key={t.value} type="button" onClick={() => handleChange('idType', t.value)}
              className={`p-3 rounded-xl border-2 text-center text-sm font-semibold transition-all active:scale-95 ${
                idForm.idType === t.value ? 'border-orange-400 bg-orange-500/20 text-white' : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload for reference */}
      <div>
        <label className={lCls}>Upload ID Document *</label>
        <p className="text-gray-500 text-xs mb-2">Upload a clear photo of your ID. The image is used for verification only and will not be stored.</p>
        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileUpload}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-300 hover:file:bg-orange-500/30 file:cursor-pointer file:transition-all" />
        {previewUrl && (
          <div className="mt-3 relative">
            <img src={previewUrl} alt="ID Preview" className="max-h-48 rounded-xl border border-white/20 object-contain" />
            <button type="button" onClick={() => { setPreviewUrl(null); setImageLoaded(false); }}
              className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/80 transition-colors">
              X
            </button>
            <p className="text-gray-500 text-[10px] mt-1">This image is used for verification and will not be saved to our servers</p>
          </div>
        )}
      </div>

      {/* Manual entry fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={lCls}>Full Name (as on ID) *</label>
          <input type="text" value={idForm.fullName} onChange={e => handleChange('fullName', e.target.value)} className={iCls} placeholder="Full legal name" />
        </div>
        <div>
          <label className={lCls}>ID Number *</label>
          <input type="text" value={idForm.idNumber} onChange={e => handleChange('idNumber', e.target.value)} className={iCls} placeholder="ID / Licence / Passport number" />
        </div>
        <div>
          <label className={lCls}>Date of Birth</label>
          <input type="date" value={idForm.dateOfBirth} onChange={e => handleChange('dateOfBirth', e.target.value)} className={iCls} />
        </div>
        <div>
          <label className={lCls}>Expiry Date *</label>
          <input type="date" value={idForm.expiryDate} onChange={e => handleChange('expiryDate', e.target.value)} className={iCls} />
          {isExpired() && (
            <p className="text-red-400 text-xs mt-1 font-semibold">This ID has expired. Please use a valid document.</p>
          )}
        </div>
        <div>
          <label className={lCls}>Issuing Country</label>
          <input type="text" value={idForm.issuingCountry} onChange={e => handleChange('issuingCountry', e.target.value)} className={iCls} placeholder="e.g., United States" />
        </div>
        <div className="sm:col-span-2">
          <label className={lCls}>Issuing Authority</label>
          <input type="text" value={idForm.issuingAuthority} onChange={e => handleChange('issuingAuthority', e.target.value)} className={iCls} placeholder="e.g., Department of Motor Vehicles" />
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-semibold">ID Visibility</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {idForm.isPublic ? 'Your ID details are visible on your profile' : 'Your ID details are private (only you and admins can see)'}
            </p>
          </div>
          <button type="button" onClick={() => handleChange('isPublic', !idForm.isPublic)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${idForm.isPublic ? 'bg-orange-500' : 'bg-white/20'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${idForm.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
        <p className="text-gray-600 text-[10px] mt-2">Regardless of this setting, your ID information is always securely saved in our database.</p>
      </div>

      {/* Save */}
      <button type="button" onClick={handleSubmit} disabled={saving}
        className="w-full py-3 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {saving ? 'Saving...' : 'Save ID Information'}
      </button>
    </div>
  );
};

// Display component for showing saved ID info (used in profile view)
export const IdVerificationDisplay = ({ idData, onToggleVisibility, onEdit }) => {
  if (!idData || !idData.verified) return null;

  const idTypeLabels = { national_id: 'National ID', drivers_licence: "Driver's Licence", passport: 'Passport' };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">ID Verification</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button type="button" onClick={onEdit} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-orange-400 font-semibold rounded-lg text-xs transition-all min-h-[32px]">
              Edit
            </button>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30">Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          ['ID Type', idTypeLabels[idData.idType] || idData.idType],
          ['Full Name', idData.fullName],
          ['ID Number', idData.isPublic ? idData.idNumber : '****' + (idData.idNumber?.slice(-4) || '')],
          ['Date of Birth', idData.dateOfBirth ? new Date(idData.dateOfBirth).toLocaleDateString() : null],
          ['Expiry Date', idData.expiryDate ? new Date(idData.expiryDate).toLocaleDateString() : null],
          ['Issuing Country', idData.issuingCountry],
        ].filter(([, val]) => val).map(([label, val]) => (
          <div key={label}>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-white text-sm font-medium">{val}</p>
          </div>
        ))}
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          <p className="text-gray-400 text-xs font-semibold">{idData.isPublic ? 'Public' : 'Private'}</p>
          <p className="text-gray-600 text-[10px]">{idData.isPublic ? 'Visible on your profile' : 'Only you and admins can see'}</p>
        </div>
        {onToggleVisibility && (
          <button type="button" onClick={onToggleVisibility}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${idData.isPublic ? 'bg-orange-500' : 'bg-white/20'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${idData.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default IdVerification;
