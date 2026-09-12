import React from 'react';

export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path d="M5 20V5" stroke="#4285F4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 5L12 13" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13L19 5" stroke="#FBBC05" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 5V20" stroke="#34A853" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
