'use client';

import React from 'react';

interface BodyDiagramProps {
  activeField?: string;
  gender?: 'female' | 'male';
}

export function BodyDiagram({
  activeField = 'bust',
  gender = 'female',
}: BodyDiagramProps) {
  // Highlight colors based on active field
  const isFieldActive = (field: string) => {
    return activeField.toLowerCase().includes(field.toLowerCase());
  };

  return (
    <div className="relative w-full max-w-[240px] aspect-[1/2] bg-gradient-to-b from-gray-50 to-red-50/20 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100 shadow-inner">
      <svg
        viewBox="0 0 200 400"
        className="w-full h-full drop-shadow-sm transition-all duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <ellipse
          cx="100"
          cy="40"
          rx="22"
          ry="26"
          className="fill-gray-200 stroke-gray-300 stroke-2"
        />

        {/* Neck */}
        <rect
          x="92"
          y="64"
          width="16"
          height="14"
          rx="2"
          className="fill-gray-200 stroke-gray-300 stroke-2"
        />

        {/* Shoulder Line */}
        <path
          d="M 50 82 Q 100 78 150 82"
          className={`stroke-4 transition-all duration-300 ${
            isFieldActive('shoulder')
              ? 'stroke-[#7E153A] stroke-[6px]'
              : 'stroke-gray-300'
          }`}
          strokeLinecap="round"
        />

        {/* Torso Outline */}
        <path
          d="M 50 82 
             C 45 110, 40 130, 60 145
             C 52 180, 58 210, 62 230
             C 70 235, 130 235, 138 230
             C 142 210, 148 180, 140 145
             C 160 130, 155 110, 150 82 Z"
          className="fill-gray-100 stroke-gray-300 stroke-2"
        />

        {/* Chest / Bust Line */}
        <line
          x1="62"
          y1="120"
          x2="138"
          y2="120"
          className={`transition-all duration-300 ${
            isFieldActive('bust') || isFieldActive('chest')
              ? 'stroke-[#7E153A] stroke-[5px]'
              : 'stroke-gray-300 stroke-2 stroke-dashed'
          }`}
          strokeDasharray={
            isFieldActive('bust') || isFieldActive('chest') ? 'none' : '4 4'
          }
        />

        {/* Waist Line */}
        <line
          x1="68"
          y1="165"
          x2="132"
          y2="165"
          className={`transition-all duration-300 ${
            isFieldActive('waist')
              ? 'stroke-[#7E153A] stroke-[5px]'
              : 'stroke-gray-300 stroke-2 stroke-dashed'
          }`}
          strokeDasharray={isFieldActive('waist') ? 'none' : '4 4'}
        />

        {/* Hip Line */}
        <line
          x1="60"
          y1="210"
          x2="140"
          y2="210"
          className={`transition-all duration-300 ${
            isFieldActive('hip')
              ? 'stroke-[#7E153A] stroke-[5px]'
              : 'stroke-gray-300 stroke-2 stroke-dashed'
          }`}
          strokeDasharray={isFieldActive('hip') ? 'none' : '4 4'}
        />

        {/* Arms */}
        <path
          d="M 50 82 Q 35 140 32 200"
          className={`transition-all duration-300 ${
            isFieldActive('sleeve') || isFieldActive('arm')
              ? 'stroke-[#7E153A] stroke-[5px]'
              : 'stroke-gray-300 stroke-3'
          }`}
          strokeLinecap="round"
        />
        <path
          d="M 150 82 Q 165 140 168 200"
          className={`transition-all duration-300 ${
            isFieldActive('sleeve') || isFieldActive('arm')
              ? 'stroke-[#7E153A] stroke-[5px]'
              : 'stroke-gray-300 stroke-3'
          }`}
          strokeLinecap="round"
        />

        {/* Shirt Length Indicator Line */}
        <line
          x1="100"
          y1="78"
          x2="100"
          y2="290"
          className={`transition-all duration-300 ${
            isFieldActive('length')
              ? 'stroke-[#7E153A] stroke-[4px]'
              : 'stroke-gray-300 stroke-1 stroke-dashed'
          }`}
          strokeDasharray={isFieldActive('length') ? 'none' : '3 3'}
        />

        {/* Legs / Lower Garment */}
        <path
          d="M 70 230 L 72 360 M 130 230 L 128 360"
          className={`transition-all duration-300 ${
            isFieldActive('trouser') ||
            isFieldActive('bottom') ||
            isFieldActive('inseam')
              ? 'stroke-[#7E153A] stroke-[4px]'
              : 'stroke-gray-300 stroke-2'
          }`}
        />

        {/* Interactive Measurement Target Badges */}
        {isFieldActive('shoulder') && (
          <circle
            cx="100"
            cy="80"
            r="7"
            className="fill-[#7E153A] animate-ping"
          />
        )}
        {isFieldActive('bust') && (
          <circle
            cx="100"
            cy="120"
            r="7"
            className="fill-[#7E153A] animate-ping"
          />
        )}
        {isFieldActive('waist') && (
          <circle
            cx="100"
            cy="165"
            r="7"
            className="fill-[#7E153A] animate-ping"
          />
        )}
        {isFieldActive('hip') && (
          <circle
            cx="100"
            cy="210"
            r="7"
            className="fill-[#7E153A] animate-ping"
          />
        )}
        {isFieldActive('length') && (
          <circle
            cx="100"
            cy="280"
            r="7"
            className="fill-[#7E153A] animate-ping"
          />
        )}
      </svg>

      {/* Active Measurement Field Label Overlay */}
      <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-gray-200/80 text-center shadow-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block">
          Active Measurement
        </span>
        <span className="text-xs font-bold text-[#7E153A] capitalize">
          {activeField.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}
