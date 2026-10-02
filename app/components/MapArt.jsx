const pins = [
  { x: 170, y: 250, n: 1 },
  { x: 440, y: 200, n: 2 },
  { x: 650, y: 290, n: 3 },
  { x: 660, y: 420, n: 4 },
];

export default function MapArt({ className = "" }) {
  return (
    <svg
      viewBox="0 0 800 520"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* grid */}
      <g stroke="white" strokeOpacity="0.12">
        {[...Array(9)].map((_, i) => (
          <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="520" />
        ))}
        {[...Array(6)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} />
        ))}
      </g>

      {/* land */}
      <g
        fill="white"
        fillOpacity="0.14"
        stroke="white"
        strokeOpacity="0.4"
        strokeWidth="1.5"
      >
        <path d="M90 150 C130 110 210 120 240 170 C265 215 230 260 245 310 C255 360 215 420 170 440 C130 455 110 400 120 350 C128 310 80 280 70 230 C65 200 70 170 90 150 Z" />
        <path d="M380 120 C420 95 480 105 500 140 C520 175 490 200 505 245 C520 300 500 380 450 420 C410 450 370 410 375 360 C380 310 350 270 360 220 C368 180 350 145 380 120 Z" />
        <path d="M540 110 C600 80 700 95 740 150 C770 195 740 240 700 250 C660 258 640 300 600 290 C560 282 570 230 540 210 C515 190 515 135 540 110 Z" />
        <path d="M600 380 C640 360 700 370 720 400 C735 430 700 460 655 455 C615 450 580 410 600 380 Z" />
        <ellipse cx="560" cy="330" rx="14" ry="8" />
        <ellipse cx="300" cy="460" rx="18" ry="9" />
      </g>

      {/* route */}
      <path
        d="M170 250 Q300 100 440 200 Q560 280 650 290 Q690 340 660 420"
        stroke="white"
        strokeOpacity="0.85"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 10"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-28"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>

      {/* pins */}
      {pins.map((p) => (
        <g key={p.n}>
          <circle cx={p.x} cy={p.y} r="14" fill="#fb923c" fillOpacity="0.5">
            <animate
              attributeName="r"
              values="14;34;14"
              dur="2.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="0.5;0;0.5"
              dur="2.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={p.x}
            cy={p.y}
            r="14"
            fill="url(#pinGrad)"
            stroke="white"
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={p.y + 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="white"
          >
            {p.n}
          </text>
        </g>
      ))}
    </svg>
  );
}
