/**
 * ScoreRing.js – Animated circular progress ring for similarity score
 */

import React from 'react';

function getColor(score) {
  if (score >= 80) return 'var(--red)';
  if (score >= 50) return 'var(--amber)';
  if (score >= 20) return 'var(--blue)';
  return 'var(--green)';
}

export default function ScoreRing({ score = 0, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="score-label">
        <div style={{ fontSize: size * 0.2, color, lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: size * 0.09, color: 'var(--text-muted)', marginTop: 2 }}>similarity</div>
      </div>
    </div>
  );
}
