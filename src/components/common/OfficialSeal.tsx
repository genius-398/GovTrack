import React from 'react';

interface OfficialSealProps {
  className?: string;
  size?: number;
}

export const OfficialSeal: React.FC<OfficialSealProps> = ({ className = '', size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        className="stroke-slate-700 dark:stroke-slate-400"
        strokeWidth="2"
        strokeDasharray="3 2"
      />
      <circle
        cx="24"
        cy="24"
        r="18"
        className="stroke-slate-900 dark:stroke-blue-500 fill-slate-900 dark:fill-slate-800"
        strokeWidth="1.5"
      />
      <path
        d="M24 10L27.5 18H36L29 23.5L31.5 32L24 27L16.5 32L19 23.5L12 18H20.5L24 10Z"
        fill="#F8FAFC"
        stroke="#E2E8F0"
        strokeWidth="1"
      />
      <circle cx="24" cy="24" r="4" fill="#3B82F6" />
    </svg>
  );
};
