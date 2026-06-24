// src/utils/profileCompletion.js
// Single source of truth for "is this user's profile complete enough to
// create or join a project". Mirrors the required fields enforced during
// onboarding so the gate stays consistent everywhere.
//
// Required for everyone: a display name and at least one selected interest.
// Individuals additionally need: experience level + a LinkedIn URL.
// Companies additionally need: company name + a (business) company email.

const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'zoho.com', 'yandex.com',
  'mail.com', 'gmx.com', 'fastmail.com', 'tutanota.com',
];

const isBusinessEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return !BLOCKED_EMAIL_DOMAINS.includes(domain);
};

const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

// Returns { complete: boolean, missing: string[] }.
// Pass the user's Firestore user-doc data.
export const checkProfileComplete = (userData) => {
  const missing = [];
  if (!userData) return { complete: false, missing: ['your profile'] };

  // onboarding must have been completed at all
  if (!userData.onboardingComplete) missing.push('onboarding');

  if (!nonEmpty(userData.displayName)) missing.push('your name');
  if (!nonEmpty(userData.country)) missing.push('your current country');
  if (!Array.isArray(userData.interests) || userData.interests.length === 0) {
    missing.push('at least one interest');
  }

  if (userData.isCompany) {
    const cp = userData.companyProfile || {};
    if (!nonEmpty(cp.companyName)) missing.push('company name');
    if (!nonEmpty(cp.companyEmail) || !isBusinessEmail(cp.companyEmail)) {
      missing.push('a business company email');
    }
  } else {
    if (!nonEmpty(userData.experienceLevel)) missing.push('experience level');
    if (!nonEmpty(userData.linkedinUrl)) missing.push('LinkedIn URL');
  }

  // Treat an explicitly-skipped profile as incomplete regardless of the above,
  // unless the required fields above are actually present.
  return { complete: missing.length === 0, missing };
};
