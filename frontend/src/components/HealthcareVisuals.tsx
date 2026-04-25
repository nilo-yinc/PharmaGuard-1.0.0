import React from 'react';

type VisualProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Lightweight, dependency-free healthcare visuals:
 * - grid + cross pattern for a clean "clinical" feel
 * - gene helix art for genomics context
 *
 * All visuals are subtle and use CSS variables so they adapt to light/dark.
 */

export const BackgroundGrid: React.FC<VisualProps & { opacity?: number }> = ({
  className,
  style,
  opacity = 0.35,
}) => {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        opacity,
        backgroundImage:
          'linear-gradient(to right, rgba(13,115,119,0.10) 1px, transparent 1px),\n' +
          'linear-gradient(to bottom, rgba(13,115,119,0.10) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage:
          'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 75%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 75%)',
        ...style,
      }}
    />
  );
};

export const MedicalCrossPattern: React.FC<VisualProps & { opacity?: number }> = ({
  className,
  style,
  opacity = 0.22,
}) => {
  return (
    <svg
      aria-hidden
      className={className}
      style={{ opacity, ...style }}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="cross" width="72" height="72" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="rgba(232,100,90,0.22)" strokeWidth="2">
            <path d="M36 22v28" />
            <path d="M22 36h28" />
          </g>
          <circle cx="36" cy="36" r="1.5" fill="rgba(13,115,119,0.25)" />
        </pattern>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0)" />
          <stop offset="0.35" stopColor="rgba(0,0,0,1)" />
          <stop offset="0.9" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#cross)" mask="url(#mask)" />
      <mask id="mask">
        <rect width="1200" height="800" fill="url(#fade)" />
      </mask>
    </svg>
  );
};

export const GeneHelixArt: React.FC<VisualProps> = ({ className, style }) => {
  return (
    <svg
      aria-hidden
      className={className}
      style={style}
      viewBox="0 0 420 820"
      fill="none"
    >
      <defs>
        <linearGradient id="helix" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(13,115,119,0.55)" />
          <stop offset="0.55" stopColor="rgba(232,100,90,0.42)" />
          <stop offset="1" stopColor="rgba(5,150,105,0.45)" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Left / right strands */}
      <path
        d="M260 20C140 110 140 210 260 300C380 390 380 490 260 580C140 670 140 770 260 800"
        stroke="url(#helix)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.55"
        filter="url(#soft)"
      />
      <path
        d="M160 20C280 110 280 210 160 300C40 390 40 490 160 580C280 670 280 770 160 800"
        stroke="url(#helix)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.40"
        filter="url(#soft)"
      />

      {/* Rungs */}
      {Array.from({ length: 18 }).map((_, i) => {
        const y = 60 + i * 42;
        const t = i / 18;
        // Smoothly oscillate between 150..270
        const x1 = 150 + Math.sin(t * Math.PI * 2) * 55;
        const x2 = 270 - Math.sin(t * Math.PI * 2) * 55;
        return (
          <g key={i} opacity={0.22}>
            <path
              d={`M${x1.toFixed(1)} ${y}L${x2.toFixed(1)} ${y}`}
              stroke="rgba(13,115,119,0.55)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={x1} cy={y} r={5} fill="rgba(232,100,90,0.35)" />
            <circle cx={x2} cy={y} r={5} fill="rgba(5,150,105,0.32)" />
          </g>
        );
      })}
    </svg>
  );
};
