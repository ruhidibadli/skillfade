import React from 'react';

interface LogoIconProps {
  className?: string;
}

/**
 * SkillFade Logo Icon
 * Three declining bars with fading opacity, representing skill decay over time.
 * - Left bar: Tall, full opacity (fresh skill)
 * - Middle bar: Medium height, reduced opacity (aging skill)
 * - Right bar: Short, faded (decayed skill)
 */
const LogoIcon: React.FC<LogoIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bar 1: Tall, full opacity (fresh skill) */}
      <rect
        x="3"
        y="4"
        width="5"
        height="16"
        rx="1.5"
        fill="currentColor"
        opacity="1"
      />
      {/* Bar 2: Medium, reduced opacity (aging skill) */}
      <rect
        x="9.5"
        y="8"
        width="5"
        height="12"
        rx="1.5"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Bar 3: Short, faded (decayed skill) */}
      <rect
        x="16"
        y="12"
        width="5"
        height="8"
        rx="1.5"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
};

export default LogoIcon;
