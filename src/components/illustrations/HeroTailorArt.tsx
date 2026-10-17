export default function HeroTailorArt({
  className = '',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 420 200"
      preserveAspectRatio="xMaxYMid slice"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hta-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.28" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="hta-mask">
          <rect width="420" height="200" fill="url(#hta-fade)" />
        </mask>
        <radialGradient id="hta-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F2C4C4" stopOpacity="0.85" />
          <stop offset="1" stopColor="#F2C4C4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hta-maroon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9A1B4A" />
          <stop offset="1" stopColor="#5A0B29" />
        </linearGradient>
        <linearGradient id="hta-jacket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1DEC6" />
          <stop offset="1" stopColor="#D2AE88" />
        </linearGradient>
        <linearGradient id="hta-collar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBF1E3" />
          <stop offset="1" stopColor="#E6CDAE" />
        </linearGradient>
        <linearGradient id="hta-tape" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F7E9B8" />
          <stop offset="1" stopColor="#EBD48E" />
        </linearGradient>
        <path id="hta-tape-path" d="M 40 205 C 120 160 215 112 310 8" />
      </defs>

      <g mask="url(#hta-mask)">
        {/* soft glows */}
        <circle cx="170" cy="105" r="95" fill="url(#hta-glow)" />
        <circle cx="330" cy="40" r="60" fill="url(#hta-glow)" opacity="0.6" />

        {/* maroon fabric (behind) */}
        <path
          d="M 250 0 L 420 0 L 420 200 L 290 200 C 292 130 280 55 250 0 Z"
          fill="url(#hta-maroon)"
        />
        <path
          d="M 300 0 C 330 60 335 140 322 200"
          stroke="#B8346A"
          strokeOpacity="0.35"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 345 0 C 370 70 372 140 360 200"
          stroke="#3E0719"
          strokeOpacity="0.35"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M 390 0 C 405 70 405 140 400 200"
          stroke="#B8346A"
          strokeOpacity="0.25"
          strokeWidth="2"
          fill="none"
        />

        {/* beige jacket shoulder */}
        <path
          d="M 20 200 C 40 150 85 108 150 84 C 180 73 202 58 214 28 L 252 20 C 272 62 288 128 302 200 Z"
          fill="url(#hta-jacket)"
        />
        {/* jacket shading / seam */}
        <path
          d="M 150 84 C 190 110 235 150 268 200"
          stroke="#B88E66"
          strokeOpacity="0.45"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 60 200 C 80 160 110 130 150 112"
          stroke="#FFF5E6"
          strokeOpacity="0.5"
          strokeWidth="3"
          fill="none"
        />
        {/* collar */}
        <path
          d="M 214 28 C 204 56 192 72 172 84 L 214 100 C 238 74 248 46 252 20 Z"
          fill="url(#hta-collar)"
        />
        <path
          d="M 172 84 L 214 100"
          stroke="#C9A982"
          strokeWidth="1.5"
          fill="none"
        />
        {/* button */}
        <circle cx="236" cy="150" r="4.5" fill="#B48A60" />
        <circle cx="236" cy="150" r="1.6" fill="#8A6540" />

        {/* measuring tape: shadow, body, ticks, numerals */}
        <use
          href="#hta-tape-path"
          stroke="#000"
          strokeOpacity="0.15"
          strokeWidth="17"
          fill="none"
          transform="translate(2 3)"
        />
        <use
          href="#hta-tape-path"
          stroke="url(#hta-tape)"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
        <use
          href="#hta-tape-path"
          stroke="#A98F4F"
          strokeOpacity="0.7"
          strokeWidth="15"
          fill="none"
          strokeDasharray="1 5"
          transform="translate(0 -0.5)"
        />
        <use
          href="#hta-tape-path"
          stroke="#8A7236"
          strokeOpacity="0.55"
          strokeWidth="1"
          fill="none"
          transform="translate(0 6)"
        />
        <text
          fontSize="6.5"
          fill="#6E5A24"
          fontFamily="sans-serif"
          fontWeight="600"
          letterSpacing="9"
        >
          <textPath href="#hta-tape-path" startOffset="6%">
            <tspan dy="-0.5">1 2 3 4 5 6 7 8 9 10 11 12 13 14 15</tspan>
          </textPath>
        </text>
      </g>
    </svg>
  );
}
