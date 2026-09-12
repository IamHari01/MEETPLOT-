import React from 'react';

export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <path d="M5 19.5V5.5" stroke="#4285F4" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M19 19.5V5.5" stroke="#34A853" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M19 5.5L12 11.5" stroke="#FBBC05" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M5 5.5L12 11.5" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
