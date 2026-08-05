'use client';

import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'tailorlink_draft_measurements';

const DEFAULT_MEASUREMENTS: Record<string, string> = {
  shoulder: '14',
  bust: '38',
  waist: '32',
  hip: '40',
  sleeve_length: '22',
  shirt_length: '44',
  trouser_length: '39',
  waist_bottom: '30',
};

export function useMeasurementStudio() {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [activeField, setActiveField] = useState<string>('bust');

  // Lazy initializer reads from localStorage on initial render without setState in useEffect
  const [measurements, setMeasurements] = useState<Record<string, string>>(
    () => {
      if (typeof window === 'undefined') return DEFAULT_MEASUREMENTS;
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return { ...DEFAULT_MEASUREMENTS, ...parsed };
          }
        }
      } catch (e) {
        console.warn('Failed to load draft measurements from localStorage');
      }
      return DEFAULT_MEASUREMENTS;
    }
  );

  // Auto-save draft to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(measurements));
    } catch (e) {
      console.warn('Failed to save draft measurements');
    }
  }, [measurements]);

  // Convert units dynamically
  const toggleUnit = (newUnit: 'inches' | 'cm') => {
    if (newUnit === unit) return;

    setMeasurements((prev) => {
      const updated: Record<string, string> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          if (newUnit === 'cm') {
            updated[key] = (num * 2.54).toFixed(1);
          } else {
            updated[key] = (num / 2.54).toFixed(1);
          }
        } else {
          updated[key] = val;
        }
      });
      return updated;
    });

    setUnit(newUnit);
  };

  const updateMeasurement = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
    setActiveField(field);
  };

  const applyPreset = (preset: Record<string, string>) => {
    setMeasurements((prev) => ({ ...prev, ...preset }));
  };

  const resetMeasurements = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setMeasurements(DEFAULT_MEASUREMENTS);
  };

  return {
    unit,
    toggleUnit,
    activeField,
    setActiveField,
    measurements,
    updateMeasurement,
    applyPreset,
    resetMeasurements,
  };
}
