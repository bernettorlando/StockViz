
import React from 'react';

export const QualtrimLogo: React.FC = () => (
  <div className="flex items-center">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H8V20H4V4Z" fill="white"/>
        <path d="M10 4H14V20H10V4Z" fill="white" fillOpacity="0.7"/>
        <path d="M16 4H20V20H16V4Z" fill="white" fillOpacity="0.4"/>
    </svg>
    <span className="ml-2 font-bold text-lg tracking-wider">QUALTRIM</span>
  </div>
);
