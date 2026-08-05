'use client';

import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ValidationFeedbackProps {
  measurements: Record<string, string>;
}

export function ValidationFeedback({ measurements }: ValidationFeedbackProps) {
  // Simple heuristic checks for proportion anomalies (e.g. bust smaller than waist)
  const bust = parseFloat(measurements.bust || '0');
  const waist = parseFloat(measurements.waist || '0');
  const hip = parseFloat(measurements.hip || '0');

  const issues: string[] = [];

  if (bust > 0 && waist > 0 && waist > bust + 4) {
    issues.push(
      'Waist measurement is significantly larger than Bust. Please double check.'
    );
  }
  if (hip > 0 && waist > 0 && waist > hip + 4) {
    issues.push(
      'Waist measurement is larger than Hip measurement. Please verify.'
    );
  }

  const isValid = issues.length === 0;

  return (
    <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-purple-50/60 to-red-50/40 border border-purple-100 flex items-start gap-3 text-xs">
      <div className="w-7 h-7 rounded-lg bg-[#7E153A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
        <Sparkles size={14} />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 flex items-center gap-1.5">
            AI Proportional Check
          </span>
          {isValid ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
              <CheckCircle2 size={12} /> Balanced
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
              <AlertCircle size={12} /> Check Values
            </span>
          )}
        </div>

        {isValid ? (
          <p className="text-gray-600 mt-1 leading-relaxed">
            All entered measurements appear proportionally balanced and safe for
            tailoring.
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1 text-amber-900 font-medium">
            {issues.map((msg) => (
              <li key={msg} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
