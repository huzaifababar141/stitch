'use client';

import React, { useState } from 'react';
import {
  Ruler,
  Info,
  Sparkles,
  PlayCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  MoveHorizontal,
  MoveVertical,
} from 'lucide-react';
import { MeasurementGarmentType } from '@/hooks/useMeasurementStudio';

interface BodyDiagramProps {
  activeField?: string;
  gender?: 'female' | 'male';
  category?: MeasurementGarmentType;
  onSelectField?: (field: string) => void;
  onOpenGuideModal?: () => void;
}

interface MeasurementGuideInfo {
  key: string;
  title: string;
  urduTitle: string;
  instruction: string;
  proTip: string;
  direction: 'horizontal' | 'vertical' | 'circumference';
  tapeCoords: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    labelX: number;
    labelY: number;
  };
}

const MEASUREMENT_DETAILS: Record<string, MeasurementGuideInfo> = {
  neck: {
    key: 'neck',
    title: 'Collar / Ban Size',
    urduTitle: 'بین / گلا ناپ',
    instruction:
      'Wrap the measuring tape around the base of the neck where the shirt collar / sherwani ban will sit.',
    proTip:
      'Keep one index finger under the measuring tape for a comfortable, non-suffocating collar fit.',
    direction: 'circumference',
    tapeCoords: { x1: 78, y1: 62, x2: 122, y2: 62, labelX: 100, labelY: 52 },
  },
  shoulder: {
    key: 'shoulder',
    title: 'Shoulder Width (Teera)',
    urduTitle: 'تیرا',
    instruction:
      'Measure across the back from the outer bone edge of one shoulder to the outer bone edge of the opposite shoulder.',
    proTip:
      'Stand naturally with relaxed shoulders. Do not hunch or push shoulder blades back.',
    direction: 'horizontal',
    tapeCoords: { x1: 44, y1: 82, x2: 156, y2: 82, labelX: 100, labelY: 92 },
  },
  chest: {
    key: 'chest',
    title: 'Chest / Bust Width',
    urduTitle: 'چھاتی / چیسٹ',
    instruction:
      'Wrap the tape around the fullest part of the chest / bust, keeping the measuring tape level and parallel to the floor.',
    proTip:
      'Breathe normally and keep arms relaxed down at your sides while measuring.',
    direction: 'circumference',
    tapeCoords: { x1: 48, y1: 122, x2: 152, y2: 122, labelX: 100, labelY: 132 },
  },
  bust: {
    key: 'bust',
    title: 'Bust Width',
    urduTitle: 'بسٹ چوڑائی',
    instruction:
      'Wrap tape around the fullest part of the bust over your regular undergarments.',
    proTip:
      'Ensure the tape is straight across your back and does not dip downwards.',
    direction: 'circumference',
    tapeCoords: { x1: 52, y1: 122, x2: 148, y2: 122, labelX: 100, labelY: 132 },
  },
  waist: {
    key: 'waist',
    title: 'Natural Waist',
    urduTitle: 'کمر ناپ',
    instruction:
      'Measure around the natural waistline (the narrowest point of the torso, typically 1 inch above the navel).',
    proTip:
      'Do not suck in your stomach; maintain your natural standing posture.',
    direction: 'circumference',
    tapeCoords: { x1: 52, y1: 165, x2: 148, y2: 165, labelX: 100, labelY: 175 },
  },
  hip: {
    key: 'hip',
    title: 'Hips / Seat Width',
    urduTitle: 'ہپ / گھیرا',
    instruction:
      'Stand with feet together and measure around the fullest part of the hips / buttocks.',
    proTip: 'Crucial for kameez side chaak (slits) and straight trouser fit.',
    direction: 'circumference',
    tapeCoords: { x1: 50, y1: 210, x2: 150, y2: 210, labelX: 100, labelY: 220 },
  },
  seat: {
    key: 'seat',
    title: 'Seat / Shalwar Ghera',
    urduTitle: 'شلوار گھیرا / سیٹ',
    instruction:
      'Measure across the widest part of the seat/pelvis for comfortable shalwar pleating and sitting ease.',
    proTip:
      'For traditional Pakistani shalwars, a generous seat allows seamless movement.',
    direction: 'circumference',
    tapeCoords: { x1: 50, y1: 210, x2: 150, y2: 210, labelX: 100, labelY: 220 },
  },
  length: {
    key: 'length',
    title: 'Kurta / Kameez Length',
    urduTitle: 'قمیض لمبائی',
    instruction:
      'Measure straight down from the highest point of the shoulder (near neck seam) over the chest to your desired hemline.',
    proTip: 'Standard formal kurta length falls just below the knee (40"-44").',
    direction: 'vertical',
    tapeCoords: { x1: 100, y1: 80, x2: 100, y2: 280, labelX: 115, labelY: 180 },
  },
  sleeve: {
    key: 'sleeve',
    title: 'Sleeve Length',
    urduTitle: 'آستین لمبائی',
    instruction:
      'Measure from the tip of the shoulder bone, down along the slightly bent arm, to the wrist bone.',
    proTip:
      'For formal cuff shirts/kurtas, allow 0.5" extra so cuffs rest properly on the wrist.',
    direction: 'vertical',
    tapeCoords: { x1: 44, y1: 82, x2: 28, y2: 200, labelX: 20, labelY: 140 },
  },
  armhole: {
    key: 'armhole',
    title: 'Armhole / Bicep (Mudha)',
    urduTitle: 'موڈھا / آرم ہول',
    instruction:
      'Measure around the armpit and over the top of the shoulder bone where the sleeve attaches to the body.',
    proTip: 'Ensure the tape is not pulled too tight so arms can move freely.',
    direction: 'circumference',
    tapeCoords: { x1: 46, y1: 95, x2: 46, y2: 125, labelX: 25, labelY: 110 },
  },
  trouser: {
    key: 'trouser',
    title: 'Shalwar / Trouser Length',
    urduTitle: 'شلوار / ٹراؤزر لمبائی',
    instruction:
      'Measure from the waistband point down the outer side of the leg straight to the ankle bone or desired hem.',
    proTip:
      'Measure with footwear you intend to wear (e.g. Peshawari chappal or heels).',
    direction: 'vertical',
    tapeCoords: { x1: 65, y1: 220, x2: 65, y2: 365, labelX: 45, labelY: 290 },
  },
  paicha: {
    key: 'paicha',
    title: 'Bottom Opening (Paicha / Ankle)',
    urduTitle: 'پائینچہ',
    instruction:
      'Measure around the ankle opening / trouser cuff opening where foot slips through.',
    proTip:
      'Standard Men shalwar paicha is 15"-17"; Cigarette pants are 13"-15".',
    direction: 'horizontal',
    tapeCoords: { x1: 58, y1: 365, x2: 142, y2: 365, labelX: 100, labelY: 380 },
  },
  gala: {
    key: 'gala',
    title: 'Neckline Depth (Gala)',
    urduTitle: 'گلا گہرائی',
    instruction:
      'Measure diagonally from top shoulder seam down to the center bottom of your desired neckline opening.',
    proTip:
      'Standard modest neck depth is 6.0"-6.5"; deeper cuts are 7.0"-7.5".',
    direction: 'vertical',
    tapeCoords: { x1: 90, y1: 75, x2: 100, y2: 105, labelX: 115, labelY: 90 },
  },
};

export function BodyDiagram({
  activeField = 'chest',
  gender = 'female',
  category,
  onSelectField,
  onOpenGuideModal,
}: BodyDiagramProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Normalize active field to our guide map
  const getNormalizedKey = (field: string) => {
    const f = field.toLowerCase();
    if (f.includes('neck') || f.includes('collar') || f.includes('ban'))
      return 'neck';
    if (f.includes('shoulder') || f.includes('teera')) return 'shoulder';
    if (f.includes('chest')) return 'chest';
    if (f.includes('bust')) return 'bust';
    if (f.includes('waist') && !f.includes('trouser')) return 'waist';
    if (f.includes('hip') || f.includes('chaak')) return 'hip';
    if (f.includes('seat') || f.includes('ghera')) return 'seat';
    if (
      f.includes('kameez') ||
      f.includes('shirt') ||
      f.includes('kurta') ||
      (f.includes('length') && !f.includes('trouser') && !f.includes('sleeve'))
    )
      return 'length';
    if (f.includes('sleeve') || f.includes('wrist') || f.includes('cuff'))
      return 'sleeve';
    if (f.includes('armhole') || f.includes('mudha') || f.includes('bicep'))
      return 'armhole';
    if (
      f.includes('trouser') ||
      f.includes('shalwar') ||
      f.includes('pant') ||
      f.includes('inseam') ||
      f.includes('asan')
    )
      return 'trouser';
    if (f.includes('paicha') || f.includes('ankle') || f.includes('bottom'))
      return 'paicha';
    if (f.includes('gala')) return 'gala';
    return 'chest';
  };

  const activeKey = getNormalizedKey(activeField);
  const guide = MEASUREMENT_DETAILS[activeKey] || MEASUREMENT_DETAILS.chest;

  const isMale =
    category === 'men_suit' || category === 'coat' || gender === 'male';

  const isFieldActive = (...fields: string[]) => {
    return fields.some(
      (f) =>
        activeField.toLowerCase().includes(f.toLowerCase()) ||
        hoveredRegion === f.toLowerCase()
    );
  };

  const handleRegionClick = (fieldKey: string) => {
    if (onSelectField) {
      onSelectField(fieldKey);
    }
  };

  return (
    <div className="w-full max-w-xs flex flex-col items-center gap-3 font-sans select-none">
      {/* ── Interactive Visual Canvas ── */}
      <div className="relative w-full aspect-[1/1.85] bg-gradient-to-b from-gray-50 via-white to-red-50/20 rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-center border border-gray-200/90 shadow-xs overflow-hidden">
        {/* Animated Tape Measurement Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Top Badges: Model silhouette & Active Zone Indicator */}
        <div className="absolute top-2.5 inset-x-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-gray-700 border border-gray-200 shadow-2xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isMale ? "Men's Silhouette" : "Women's Silhouette"}
          </span>

          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-50/95 text-[#7E153A] backdrop-blur-md px-2.5 py-1 rounded-full border border-red-100 shadow-2xs">
            Interactive Guide
          </span>
        </div>

        {/* ── SVG Anatomy with Animated Tailor Measuring Tape ── */}
        <svg
          viewBox="0 0 200 400"
          className="w-full h-full drop-shadow-sm transition-all duration-300 relative z-0 mt-3"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Measuring Tape Yellow Pattern with Real Inch Ticks */}
            <pattern
              id="measuringTapePattern"
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

            {/* Glowing filter for active measurement points */}
            <filter
              id="activeGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Head & Neck Landmark */}
          <ellipse
            cx="100"
            cy="36"
            rx="20"
            ry="24"
            className="fill-gray-100 stroke-gray-300 stroke-2"
          />

          {/* 2. Collar / Ban Box (Interactive Hotspot) */}
          <rect
            x="88"
            y="58"
            width="24"
            height="18"
            rx="4"
            onClick={() => handleRegionClick('neckCircumference')}
            onMouseEnter={() => setHoveredRegion('neck')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('neck', 'collar', 'ban')
                ? 'fill-amber-400/80 stroke-[#7E153A] stroke-2 shadow-md'
                : 'fill-gray-200 stroke-gray-300 stroke-2 hover:fill-red-100'
            }`}
          />

          {/* 3. Shoulder Line (Teera) */}
          <path
            d={isMale ? 'M 42 78 Q 100 73 158 78' : 'M 48 80 Q 100 76 152 80'}
            onClick={() => handleRegionClick('shoulderWidth')}
            onMouseEnter={() => setHoveredRegion('shoulder')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('shoulder', 'teera')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-4 hover:stroke-red-300'
            }`}
            strokeLinecap="round"
          />

          {/* 4. Torso Body Silhouette */}
          {isMale ? (
            /* Male Straight Cut Silhouette */
            <path
              d="M 42 78 
                 L 46 140
                 L 50 230
                 C 60 235, 140 235, 150 230
                 L 154 140
                 L 158 78 Z"
              className="fill-gray-100/90 stroke-gray-300 stroke-2"
            />
          ) : (
            /* Female Curved Tailoring Silhouette */
            <path
              d="M 48 80 
                 C 44 110, 40 130, 58 145
                 C 50 180, 56 210, 60 230
                 C 70 235, 130 235, 140 230
                 C 144 210, 150 180, 142 145
                 C 160 130, 156 110, 152 80 Z"
              className="fill-gray-100/90 stroke-gray-300 stroke-2"
            />
          )}

          {/* 5. Chest / Bust Line (Interactive Hotspot) */}
          <line
            x1={isMale ? '46' : '58'}
            y1="120"
            x2={isMale ? '154' : '142'}
            y2="120"
            onClick={() => handleRegionClick(isMale ? 'chest' : 'bust')}
            onMouseEnter={() => setHoveredRegion('chest')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('bust', 'chest')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-2 hover:stroke-red-300'
            }`}
            strokeDasharray={isFieldActive('bust', 'chest') ? 'none' : '4 4'}
          />

          {/* 6. Waist Line (Interactive Hotspot) */}
          <line
            x1={isMale ? '48' : '62'}
            y1="165"
            x2={isMale ? '152' : '138'}
            y2="165"
            onClick={() => handleRegionClick('waist')}
            onMouseEnter={() => setHoveredRegion('waist')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('waist')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-2 hover:stroke-red-300'
            }`}
            strokeDasharray={isFieldActive('waist') ? 'none' : '4 4'}
          />

          {/* 7. Hip / Chaak / Seat Line (Interactive Hotspot) */}
          <line
            x1={isMale ? '50' : '60'}
            y1="210"
            x2={isMale ? '150' : '140'}
            y2="210"
            onClick={() => handleRegionClick(isMale ? 'seat' : 'hips')}
            onMouseEnter={() => setHoveredRegion('hip')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('hip', 'ghera', 'seat')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-2 hover:stroke-red-300'
            }`}
            strokeDasharray={
              isFieldActive('hip', 'ghera', 'seat') ? 'none' : '4 4'
            }
          />

          {/* 8. Arms & Sleeves (Left & Right) */}
          <path
            d={isMale ? 'M 42 78 Q 26 140 24 200' : 'M 48 80 Q 32 140 30 200'}
            onClick={() => handleRegionClick('sleeveLength')}
            onMouseEnter={() => setHoveredRegion('sleeve')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('sleeve', 'wrist', 'cuff')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-3 hover:stroke-red-300'
            }`}
            strokeLinecap="round"
          />
          <path
            d={
              isMale
                ? 'M 158 78 Q 174 140 176 200'
                : 'M 152 80 Q 168 140 170 200'
            }
            onClick={() => handleRegionClick('sleeveLength')}
            onMouseEnter={() => setHoveredRegion('sleeve')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('sleeve', 'wrist', 'cuff')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-3 hover:stroke-red-300'
            }`}
            strokeLinecap="round"
          />

          {/* 9. Kurta / Kameez Length Vertical Guide Line */}
          <line
            x1="100"
            y1="76"
            x2="100"
            y2="280"
            onClick={() => handleRegionClick('kameezLength')}
            onMouseEnter={() => setHoveredRegion('length')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('length', 'kameez', 'shirt', 'kurta')
                ? 'stroke-[#7E153A] stroke-[5px]'
                : 'stroke-gray-300 stroke-2 stroke-dashed hover:stroke-red-300'
            }`}
            strokeDasharray={
              isFieldActive('length', 'kameez', 'shirt', 'kurta')
                ? 'none'
                : '3 3'
            }
          />

          {/* 10. Lower Legs: Shalwar / Trouser */}
          <path
            d={
              isMale
                ? 'M 62 230 L 66 365 M 138 230 L 134 365'
                : 'M 68 230 L 70 360 M 132 230 L 130 360'
            }
            onClick={() => handleRegionClick('trouserLength')}
            onMouseEnter={() => setHoveredRegion('trouser')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('trouser', 'shalwar', 'bottom', 'inseam', 'asan')
                ? 'stroke-[#7E153A] stroke-[5px]'
                : 'stroke-gray-300 stroke-2 hover:stroke-red-300'
            }`}
          />

          {/* 11. Bottom Opening (Paicha) Line */}
          <line
            x1="56"
            y1="365"
            x2="144"
            y2="365"
            onClick={() => handleRegionClick('ankle')}
            onMouseEnter={() => setHoveredRegion('paicha')}
            onMouseLeave={() => setHoveredRegion(null)}
            className={`transition-all duration-300 cursor-pointer ${
              isFieldActive('paicha', 'ankle', 'bottom')
                ? 'stroke-[#7E153A] stroke-[6px]'
                : 'stroke-gray-300 stroke-2 hover:stroke-red-300'
            }`}
            strokeLinecap="round"
          />

          {/* ── REALISTIC ANIMATED MEASURING TAPE OVERLAY ── */}
          {/* Active Yellow Tailor Measuring Tape Ribbon */}
          {guide.direction === 'horizontal' && (
            <g className="animate-in fade-in zoom-in-95 duration-200">
              <rect
                x={guide.tapeCoords.x1}
                y={guide.tapeCoords.y1 - 4}
                width={Math.max(10, guide.tapeCoords.x2 - guide.tapeCoords.x1)}
                height="8"
                rx="2"
                fill="url(#measuringTapePattern)"
                stroke="#B45309"
                strokeWidth="1"
                className="drop-shadow-md"
              />
              {/* Magnetic Start & End Pins with Concentric Pulsing Radar */}
              <circle
                cx={guide.tapeCoords.x1}
                cy={guide.tapeCoords.y1}
                r="4"
                className="fill-[#7E153A] stroke-white stroke-2"
              />
              <circle
                cx={guide.tapeCoords.x2}
                cy={guide.tapeCoords.y2}
                r="4"
                className="fill-[#7E153A] stroke-white stroke-2"
              />
              <circle
                cx={guide.tapeCoords.x2}
                cy={guide.tapeCoords.y2}
                r="9"
                className="stroke-[#7E153A] fill-none animate-ping opacity-75"
              />
            </g>
          )}

          {guide.direction === 'vertical' && (
            <g className="animate-in fade-in zoom-in-95 duration-200">
              <rect
                x={guide.tapeCoords.x1 - 4}
                y={guide.tapeCoords.y1}
                width="8"
                height={Math.max(10, guide.tapeCoords.y2 - guide.tapeCoords.y1)}
                rx="2"
                fill="url(#measuringTapePattern)"
                stroke="#B45309"
                strokeWidth="1"
                className="drop-shadow-md"
              />
              {/* Start & End Anchor Pins */}
              <circle
                cx={guide.tapeCoords.x1}
                cy={guide.tapeCoords.y1}
                r="4"
                className="fill-[#7E153A] stroke-white stroke-2"
              />
              <circle
                cx={guide.tapeCoords.x2}
                cy={guide.tapeCoords.y2}
                r="4"
                className="fill-[#7E153A] stroke-white stroke-2"
              />
              <circle
                cx={guide.tapeCoords.x2}
                cy={guide.tapeCoords.y2}
                r="9"
                className="stroke-[#7E153A] fill-none animate-ping opacity-75"
              />
            </g>
          )}

          {guide.direction === 'circumference' && (
            <g className="animate-in fade-in zoom-in-95 duration-200">
              {/* Wrapping Circumferential Tape Ribbon */}
              <ellipse
                cx={guide.tapeCoords.labelX}
                cy={guide.tapeCoords.y1}
                rx={Math.max(
                  20,
                  (guide.tapeCoords.x2 - guide.tapeCoords.x1) / 2
                )}
                ry="8"
                fill="none"
                stroke="url(#measuringTapePattern)"
                strokeWidth="6"
                strokeDasharray="4 2"
                className="drop-shadow-md animate-pulse"
              />
              <circle
                cx={guide.tapeCoords.labelX}
                cy={guide.tapeCoords.y1}
                r="5"
                className="fill-[#7E153A] stroke-white stroke-2"
              />
              <circle
                cx={guide.tapeCoords.labelX}
                cy={guide.tapeCoords.y1}
                r="10"
                className="stroke-[#7E153A] fill-none animate-ping opacity-75"
              />
            </g>
          )}
        </svg>

        {/* ── Active Floating Zone Chip ── */}
        <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-gray-200/90 shadow-sm flex items-center justify-between gap-2 z-10">
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block truncate">
              Active Measurement Zone
            </span>
            <span className="text-xs font-extrabold text-[#7E153A] truncate block">
              {guide.title}{' '}
              <span className="text-[10px] text-gray-500 font-normal">
                ({guide.urduTitle})
              </span>
            </span>
          </div>

          <div className="w-6 h-6 rounded-full bg-red-50 text-[#7E153A] flex items-center justify-center shrink-0">
            {guide.direction === 'horizontal' ? (
              <MoveHorizontal size={13} />
            ) : guide.direction === 'vertical' ? (
              <MoveVertical size={13} />
            ) : (
              <Ruler size={13} />
            )}
          </div>
        </div>
      </div>

      {/* ── Dynamic Pro Tailor Measuring Tip Box ── */}
      <div className="w-full bg-gradient-to-r from-red-50/70 via-pink-50/40 to-red-50/70 border border-red-100 rounded-2xl p-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#7E153A] font-extrabold text-[11px] uppercase tracking-wider">
          <Sparkles size={13} />
          <span>Tailor Master Measurement Guide</span>
        </div>

        <p className="text-[11px] text-gray-700 leading-relaxed">
          {guide.instruction}
        </p>

        <div className="bg-white/90 p-2 rounded-xl border border-red-100/80 text-[10.5px] text-gray-600 flex items-start gap-1.5">
          <Info size={13} className="text-[#7E153A] shrink-0 mt-0.5" />
          <span>
            <strong className="text-gray-900 font-bold">Pro Tip:</strong>{' '}
            {guide.proTip}
          </span>
        </div>

        {/* Modal Trigger */}
        {onOpenGuideModal && (
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="w-full mt-1 py-1.5 px-2.5 bg-white hover:bg-gray-50 border border-red-200 text-[#7E153A] font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlayCircle size={13} />
            <span>Open Step-by-Step Visual Tutorial</span>
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
