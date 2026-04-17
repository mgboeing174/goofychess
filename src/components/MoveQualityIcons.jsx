import React from 'react';

// ── Brilliant (!!) — Cyan ──────────────────────────────────────
export const BrilliantIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#00b4c8"/>
    <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="-1">!!</text>
  </svg>
);

// ── Great (!) — Blue ───────────────────────────────────────────
export const GreatIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#3367d6"/>
    <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial, sans-serif">!</text>
  </svg>
);

// ── Good (thumbs up) — Green ───────────────────────────────────
export const GoodIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#1b8a42"/>
    <path d="M8 14.5V11L10.5 6.5C10.7 6.2 11 6 11.3 6H11.5C12 6 12.5 6.5 12.5 7V10H16C16.6 10 17 10.5 16.9 11.1L16 16.1C15.9 16.6 15.5 17 15 17H10C9.4 17 9 16.8 8.5 16.3L8 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <line x1="8" y1="10.5" x2="8" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ── Excellent (star) — Gold ────────────────────────────────────
export const ExcellentIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#b89b1e"/>
    <path d="M12 5.5L13.8 10.1L18.5 10.4L14.9 13.5L16 18.2L12 15.6L8 18.2L9.1 13.5L5.5 10.4L10.2 10.1L12 5.5Z" fill="white"/>
  </svg>
);

// ── Miss / Mistake (X cross) — Orange ──────────────────────────
export const MissIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#c98c00"/>
    <path d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ── Blunder (??) — Red ─────────────────────────────────────────
export const BlunderIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#cc0030"/>
    <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="-1">??</text>
  </svg>
);
