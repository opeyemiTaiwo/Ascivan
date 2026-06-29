// src/components/PremiumBadge.jsx - Orange premium badge for premium members
import React from 'react';

export const PremiumBadge = ({ size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-[8px] px-1 py-0',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  };
  return (
    <span className={`inline-flex items-center gap-0.5 bg-orange-500 text-white font-bold rounded-full ${sizeClasses[size] || sizeClasses.sm}`}>
      <svg className={`${size === 'xs' ? 'w-2 h-2' : size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      PRO
    </span>
  );
};

export const isPremium = (user) => {
  if (!user) return false;
  return user.membershipPlan === 'Premium' || user.role === 'admin';
};

export default PremiumBadge;
