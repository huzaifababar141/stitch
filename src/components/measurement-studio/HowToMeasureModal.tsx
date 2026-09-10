'use client';

import React, { useState } from 'react';
import {
  X,
  PlayCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Ruler,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  User,
  Scissors,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HowToMeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGender?: 'female' | 'male';
  onSelectField?: (fieldKey: string) => void;
}

interface StepGuide {
  id: string;
  fieldKey: string;
  title: string;
  urduTitle: string;
  category: 'upper' | 'lower';
  targetAudience: 'both' | 'male' | 'female';
  stepNumber: number;
  instruction: string;
  howToMeasure: string[];
  mistakesToAvoid: string;
  standardRange: { inches: string; cm: string };
  svgDemonstration: {
    tapeType: 'horizontal' | 'vertical' | 'circumference';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

const STEP_GUIDES: StepGuide[] = [
  {
    id: 'collar',
    fieldKey: 'neckCircumference',
    title: 'Collar & Sherwani Ban',
    urduTitle: 'بین / گلا ناپ',
    category: 'upper',
    targetAudience: 'both',
    stepNumber: 1,
    instruction:
      'Wrap the tape measure around the base of the neck where your collar rests comfortably.',
    howToMeasure: [
      'Locate the base of your neck above the collarbone.',
      'Wrap the measuring tape gently in a full circle.',
      'Insert 1 index finger between your neck and the tape for breathing ease.',
    ],
    mistakesToAvoid:
      'Do not pull the tape too tight around the throat or measure too high up on the neck.',
    standardRange: { inches: '14.5" - 17.5"', cm: '37 cm - 44.5 cm' },
    svgDemonstration: {
      tapeType: 'circumference',
      x1: 75,
      y1: 65,
      x2: 125,
      y2: 65,
    },
  },
  {
    id: 'shoulder',
    fieldKey: 'shoulderWidth',
    title: 'Shoulder Width (Teera)',
    urduTitle: 'تیرا',
    category: 'upper',
    targetAudience: 'both',
    stepNumber: 2,
    instruction:
      'Measure horizontally across the back from the tip of one shoulder bone to the other.',
    howToMeasure: [
      'Stand with arms relaxed naturally at your sides.',
      'Find the prominent bone at the outer edge of your left shoulder.',
      'Run the tape across the curve of your upper back to the right shoulder bone.',
    ],
    mistakesToAvoid:
      'Do not hunch or puff out your chest; natural shoulder posture ensures correct sleeve hang.',
    standardRange: { inches: '13.5" - 21.0"', cm: '34 cm - 53 cm' },
    svgDemonstration: {
      tapeType: 'horizontal',
      x1: 42,
      y1: 82,
      x2: 158,
      y2: 82,
    },
  },
  {
    id: 'chest',
    fieldKey: 'chest',
    title: 'Chest / Bust Width',
    urduTitle: 'چھاتی / چیسٹ',
    category: 'upper',
    targetAudience: 'both',
    stepNumber: 3,
    instruction:
      'Wrap the tape around the fullest part of the chest, keeping the tape level across the back.',
    howToMeasure: [
      'Pass the measuring tape under your armpits.',
      'Wrap across the fullest part of the chest / bust.',
      'Keep the tape parallel to the floor without drooping at the back.',
    ],
    mistakesToAvoid:
      'Do not hold your breath or expand your chest unnaturally while taking the reading.',
    standardRange: { inches: '34.0" - 48.0"', cm: '86 cm - 122 cm' },
    svgDemonstration: {
      tapeType: 'circumference',
      x1: 48,
      y1: 122,
      x2: 152,
      y2: 122,
    },
  },
  {
    id: 'waist',
    fieldKey: 'waist',
    title: 'Natural Waistline',
    urduTitle: 'کمر ناپ',
    category: 'upper',
    targetAudience: 'both',
    stepNumber: 4,
    instruction:
      'Measure around your natural waistline, usually 1 inch above the navel.',
    howToMeasure: [
      'Find the narrowest part of your midsection.',
      'Wrap the tape flat around the waist without squeezing.',
      'Check that the tape is comfortable for sitting down.',
    ],
    mistakesToAvoid:
      'Do not suck in your stomach; a tight waist causes strained buttonholes.',
    standardRange: { inches: '28.0" - 44.0"', cm: '71 cm - 112 cm' },
    svgDemonstration: {
      tapeType: 'circumference',
      x1: 52,
      y1: 165,
      x2: 148,
      y2: 165,
    },
  },
  {
    id: 'kameez_length',
    fieldKey: 'kameezLength',
    title: 'Kurta / Kameez Length',
    urduTitle: 'قمیض لمبائی',
    category: 'upper',
    targetAudience: 'both',
    stepNumber: 5,
    instruction:
      'Measure straight down from the highest shoulder neck point to your desired hemline.',
    howToMeasure: [
      'Place the tape where the shoulder seam meets the neck.',
      'Let the tape hang straight down over the chest point.',
      'Read the length at your desired hem (e.g. above knee, below knee, or calf).',
    ],
    mistakesToAvoid:
      'Do not bend forward while checking the measurement; have someone assist or look in a mirror.',
    standardRange: { inches: '38.0" - 48.0"', cm: '96 cm - 122 cm' },
    svgDemonstration: {
      tapeType: 'vertical',
      x1: 100,
      y1: 78,
      x2: 100,
      y2: 280,
    },
  },
  {
    id: 'sleeve',
    fieldKey: 'sleeveLength',
    title: 'Sleeve Length',
    urduTitle: 'آستین لمبائی',
    category: 'upper',
    targetAudience: 'both',
    stepNumber: 6,
    instruction:
      'Measure from the outer shoulder tip down along the slightly bent arm to the wrist bone.',
    howToMeasure: [
      'Place your hand on your hip so your elbow is slightly bent.',
      'Anchor the tape at the outer edge bone of your shoulder.',
      'Run tape past the elbow straight to the wrist bone.',
    ],
    mistakesToAvoid:
      'Do not measure with a stiff straight arm; sleeves will ride up when bent.',
    standardRange: { inches: '20.0" - 26.5"', cm: '51 cm - 67 cm' },
    svgDemonstration: {
      tapeType: 'vertical',
      x1: 44,
      y1: 82,
      x2: 28,
      y2: 200,
    },
  },
  {
    id: 'trouser_length',
    fieldKey: 'trouserLength',
    title: 'Shalwar / Trouser Length',
    urduTitle: 'شلوار / ٹراؤزر لمبائی',
    category: 'lower',
    targetAudience: 'both',
    stepNumber: 7,
    instruction:
      'Measure from where you comfortably tie your shalwar/trouser down to the ankle.',
    howToMeasure: [
      'Anchor tape at the waistband / hip bone point.',
      'Run tape down the outer seam of the leg.',
      'Stop at the ankle bone or top of your footwear sole.',
    ],
    mistakesToAvoid:
      'Wear the shoes or sandals you plan to pair with the garment for exact drape.',
    standardRange: { inches: '36.0" - 43.0"', cm: '91 cm - 109 cm' },
    svgDemonstration: {
      tapeType: 'vertical',
      x1: 65,
      y1: 220,
      x2: 65,
      y2: 365,
    },
  },
  {
    id: 'paicha',
    fieldKey: 'ankle',
    title: 'Bottom Opening (Paicha)',
    urduTitle: 'پائینچہ',
    category: 'lower',
    targetAudience: 'both',
    stepNumber: 8,
    instruction: 'Measure the circumference of the bottom opening / ankle hem.',
    howToMeasure: [
      'Wrap tape around the foot arch to ensure foot slips in and out easily.',
      'For formal trousers / cigarette pants: 13" - 15".',
      'For traditional men shalwar: 15" - 17".',
    ],
    mistakesToAvoid:
      'Do not make paicha narrower than your foot heel circumference or it will not pass through.',
    standardRange: { inches: '12.0" - 18.5"', cm: '30 cm - 47 cm' },
    svgDemonstration: {
      tapeType: 'horizontal',
      x1: 56,
      y1: 365,
      x2: 144,
      y2: 365,
    },
  },
];

export function HowToMeasureModal({
  isOpen,
  onClose,
  initialGender = 'female',
  onSelectField,
}: HowToMeasureModalProps) {
  const [activeGender, setActiveGender] = useState<'female' | 'male'>(
    initialGender
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEP_GUIDES[activeStepIndex];
  const isMale = activeGender === 'male';

  const handleNext = () => {
    if (activeStepIndex < STEP_GUIDES.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const handleApplyStep = () => {
    if (onSelectField && currentStep.fieldKey) {
      onSelectField(currentStep.fieldKey);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0">
              <Ruler size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                Interactive Measurement Guide & Visual Tutorial
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                Master Tailor step-by-step measuring standards for Pakistani
                attire
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gender Switcher */}
            <div className="flex bg-gray-200/80 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveGender('female')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeGender === 'female'
                    ? 'bg-white text-[#7E153A] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Women
              </button>
              <button
                type="button"
                onClick={() => setActiveGender('male')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeGender === 'male'
                    ? 'bg-white text-[#7E153A] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Men
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Step Strip Bar ── */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 sm:px-6 py-2 bg-gray-100/60 border-b border-gray-100 scrollbar-none">
          {STEP_GUIDES.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#7E153A] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200/70'
                }`}
              >
                <span className="text-[10px] opacity-75 font-mono">
                  #{idx + 1}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* ── Step Body Content (Grid: Animated Graphic + Step Instructions) ── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 scrollbar-none">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Dynamic Animated Visual Mannequin with Active Measuring Tape (5 Cols) */}
            <div className="md:col-span-5 bg-gradient-to-b from-gray-50 via-white to-red-50/30 rounded-3xl p-4 border border-gray-200/80 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Step {activeStepIndex + 1} of {STEP_GUIDES.length}
                </span>
                <span className="text-[10px] font-extrabold text-[#7E153A] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  {currentStep.standardRange.inches}
                </span>
              </div>

              {/* Animated Mannequin SVG */}
              <svg
                viewBox="0 0 200 400"
                className="w-full max-w-[200px] aspect-[1/2] drop-shadow-sm"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Yellow Measuring Tape Pattern */}
                  <pattern
                    id="modalTapePattern"
                    width="10"
                    height="8"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="10" height="8" fill="#FBBF24" />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="4"
                      stroke="#78350F"
                      strokeWidth="1"
                    />
                    <line
                      x1="5"
                      y1="0"
                      x2="5"
                      y2="2.5"
                      stroke="#92400E"
                      strokeWidth="0.8"
                    />
                  </pattern>
                </defs>

                {/* Head */}
                <ellipse
                  cx="100"
                  cy="36"
                  rx="20"
                  ry="24"
                  className="fill-gray-100 stroke-gray-300 stroke-2"
                />

                {/* Torso Outline */}
                {isMale ? (
                  <path
                    d="M 42 78 L 46 140 L 50 230 C 60 235, 140 235, 150 230 L 154 140 L 158 78 Z"
                    className="fill-gray-100 stroke-gray-300 stroke-2"
                  />
                ) : (
                  <path
                    d="M 48 80 C 44 110, 40 130, 58 145 C 50 180, 56 210, 60 230 C 70 235, 130 235, 140 230 C 144 210, 150 180, 142 145 C 160 130, 156 110, 152 80 Z"
                    className="fill-gray-100 stroke-gray-300 stroke-2"
                  />
                )}

                {/* Arms */}
                <path
                  d={
                    isMale
                      ? 'M 42 78 Q 26 140 24 200'
                      : 'M 48 80 Q 32 140 30 200'
                  }
                  className="stroke-gray-300 stroke-3"
                  strokeLinecap="round"
                />
                <path
                  d={
                    isMale
                      ? 'M 158 78 Q 174 140 176 200'
                      : 'M 152 80 Q 168 140 170 200'
                  }
                  className="stroke-gray-300 stroke-3"
                  strokeLinecap="round"
                />

                {/* Legs */}
                <path
                  d={
                    isMale
                      ? 'M 62 230 L 66 365 M 138 230 L 134 365'
                      : 'M 68 230 L 70 360 M 132 230 L 130 360'
                  }
                  className="stroke-gray-300 stroke-2"
                />

                {/* ── Active Animated Measuring Tape Graphic ── */}
                {currentStep.svgDemonstration.tapeType === 'horizontal' && (
                  <g className="animate-in fade-in zoom-in-95 duration-200">
                    <rect
                      x={currentStep.svgDemonstration.x1}
                      y={currentStep.svgDemonstration.y1 - 4}
                      width={Math.max(
                        10,
                        currentStep.svgDemonstration.x2 -
                          currentStep.svgDemonstration.x1
                      )}
                      height="8"
                      rx="2"
                      fill="url(#modalTapePattern)"
                      stroke="#B45309"
                      strokeWidth="1"
                      className="drop-shadow-md"
                    />
                    <circle
                      cx={currentStep.svgDemonstration.x1}
                      cy={currentStep.svgDemonstration.y1}
                      r="4"
                      className="fill-[#7E153A] stroke-white stroke-2"
                    />
                    <circle
                      cx={currentStep.svgDemonstration.x2}
                      cy={currentStep.svgDemonstration.y2}
                      r="4"
                      className="fill-[#7E153A] stroke-white stroke-2"
                    />
                    <circle
                      cx={currentStep.svgDemonstration.x2}
                      cy={currentStep.svgDemonstration.y2}
                      r="8"
                      className="stroke-[#7E153A] fill-none animate-ping"
                    />
                  </g>
                )}

                {currentStep.svgDemonstration.tapeType === 'vertical' && (
                  <g className="animate-in fade-in zoom-in-95 duration-200">
                    <rect
                      x={currentStep.svgDemonstration.x1 - 4}
                      y={currentStep.svgDemonstration.y1}
                      width="8"
                      height={Math.max(
                        10,
                        currentStep.svgDemonstration.y2 -
                          currentStep.svgDemonstration.y1
                      )}
                      rx="2"
                      fill="url(#modalTapePattern)"
                      stroke="#B45309"
                      strokeWidth="1"
                      className="drop-shadow-md"
                    />
                    <circle
                      cx={currentStep.svgDemonstration.x1}
                      cy={currentStep.svgDemonstration.y1}
                      r="4"
                      className="fill-[#7E153A] stroke-white stroke-2"
                    />
                    <circle
                      cx={currentStep.svgDemonstration.x2}
                      cy={currentStep.svgDemonstration.y2}
                      r="4"
                      className="fill-[#7E153A] stroke-white stroke-2"
                    />
                    <circle
                      cx={currentStep.svgDemonstration.x2}
                      cy={currentStep.svgDemonstration.y2}
                      r="8"
                      className="stroke-[#7E153A] fill-none animate-ping"
                    />
                  </g>
                )}

                {currentStep.svgDemonstration.tapeType === 'circumference' && (
                  <g className="animate-in fade-in zoom-in-95 duration-200">
                    <ellipse
                      cx="100"
                      cy={currentStep.svgDemonstration.y1}
                      rx={Math.max(
                        20,
                        (currentStep.svgDemonstration.x2 -
                          currentStep.svgDemonstration.x1) /
                          2
                      )}
                      ry="8"
                      fill="none"
                      stroke="url(#modalTapePattern)"
                      strokeWidth="6"
                      strokeDasharray="4 2"
                      className="drop-shadow-md animate-pulse"
                    />
                    <circle
                      cx="100"
                      cy={currentStep.svgDemonstration.y1}
                      r="5"
                      className="fill-[#7E153A] stroke-white stroke-2"
                    />
                    <circle
                      cx="100"
                      cy={currentStep.svgDemonstration.y1}
                      r="10"
                      className="stroke-[#7E153A] fill-none animate-ping"
                    />
                  </g>
                )}
              </svg>

              <div className="w-full text-center mt-3 bg-white/90 py-1.5 px-3 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[11px] font-extrabold text-[#7E153A]">
                  {currentStep.title} ({currentStep.urduTitle})
                </span>
              </div>
            </div>

            {/* Right: Step Detailed Instructions & Pro Tips (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7E153A] text-white text-xs font-extrabold flex items-center justify-center">
                    {activeStepIndex + 1}
                  </span>
                  <h4 className="text-base sm:text-lg font-extrabold text-gray-900">
                    {currentStep.title}
                  </h4>
                  <span className="text-xs font-semibold text-gray-500">
                    ({currentStep.urduTitle})
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {currentStep.instruction}
                </p>
              </div>

              {/* Step Checklist */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5">
                <span className="text-xs font-bold text-gray-900 block">
                  How to Record:
                </span>
                <ul className="space-y-2">
                  {currentStep.howToMeasure.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-emerald-600 shrink-0 mt-0.5"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mistakes to Avoid Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle
                  size={15}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <div>
                  <strong className="font-bold block">
                    Common Mistake to Avoid:
                  </strong>
                  <p className="text-[11.5px] text-amber-800 mt-0.5 leading-relaxed">
                    {currentStep.mistakesToAvoid}
                  </p>
                </div>
              </div>

              {/* Standard Pakistani Range Spec Box */}
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Standard Pakistani Average Range
                  </span>
                  <span className="font-extrabold text-gray-900 font-mono text-sm">
                    {currentStep.standardRange.inches} (
                    {currentStep.standardRange.cm})
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handleApplyStep}
                  className="h-8 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-3.5 rounded-xl cursor-pointer"
                >
                  Enter This Dimension
                </Button>
              </div>
            </div>
          </div>

          {/* Guaranteed Reassurance Banner */}
          <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 flex items-center gap-3 text-xs text-gray-700">
            <ShieldCheck className="text-[#7E153A] shrink-0" size={20} />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              <strong className="text-gray-900">
                100% Free Alteration Guarantee:
              </strong>{' '}
              Don&apos;t worry about minor errors! Our master tailors review all
              dimensions with AI verification and provide 7 days of free
              alterations.
            </p>
          </div>
        </div>

        {/* ── Footer Stepper Controls ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            type="button"
            variant="outline"
            disabled={activeStepIndex === 0}
            onClick={handlePrev}
            className="h-9 sm:h-10 text-xs font-bold px-4 rounded-xl cursor-pointer"
          >
            <ChevronLeft size={14} className="mr-1" /> Previous Step
          </Button>

          <div className="text-xs font-extrabold text-gray-500">
            {activeStepIndex + 1} / {STEP_GUIDES.length}
          </div>

          {activeStepIndex < STEP_GUIDES.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="h-9 sm:h-10 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-5 rounded-xl cursor-pointer"
            >
              Next Step <ChevronRight size={14} className="ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleApplyStep}
              className="h-9 sm:h-10 text-xs font-bold bg-[#7E153A] hover:bg-[#630f2d] text-white px-6 rounded-xl cursor-pointer"
            >
              Return to Studio <CheckCircle2 size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
