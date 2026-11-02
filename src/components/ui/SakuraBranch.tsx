interface SakuraBranchProps {
  className?: string;
}

export default function SakuraBranch({ className = "" }: SakuraBranchProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "170px",
        height: "190px",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 170 190"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main curved branch entering from top right corner */}
        <path
          d="M 170 8 Q 130 35 110 65 T 85 115 T 70 140"
          stroke="#423a35"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Sub branches */}
        <path
          d="M 130 35 Q 105 20 90 15"
          stroke="#423a35"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 110 65 Q 80 70 65 75"
          stroke="#423a35"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M 95 98 Q 72 108 58 122"
          stroke="#423a35"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Blossom 1 (Top) */}
        <g transform="translate(120, 28) scale(0.85)">
          <circle cx="0" cy="-6" r="4" fill="#f0d3dc" opacity="0.9" />
          <circle cx="6" cy="-2" r="4" fill="#f0d3dc" opacity="0.9" />
          <circle cx="4" cy="5" r="4" fill="#f0d3dc" opacity="0.9" />
          <circle cx="-4" cy="5" r="4" fill="#f0d3dc" opacity="0.9" />
          <circle cx="-6" cy="-2" r="4" fill="#f0d3dc" opacity="0.9" />
          <circle cx="0" cy="0" r="2.2" fill="#ab5065" />
        </g>

        {/* Blossom 2 (Upper branch) */}
        <g transform="translate(90, 16) scale(0.75)">
          <circle cx="0" cy="-6" r="4" fill="#eed0d9" opacity="0.85" />
          <circle cx="6" cy="-2" r="4" fill="#eed0d9" opacity="0.85" />
          <circle cx="4" cy="5" r="4" fill="#eed0d9" opacity="0.85" />
          <circle cx="-4" cy="5" r="4" fill="#eed0d9" opacity="0.85" />
          <circle cx="-6" cy="-2" r="4" fill="#eed0d9" opacity="0.85" />
          <circle cx="0" cy="0" r="2" fill="#ab5065" />
        </g>

        {/* Blossom 3 (Center large) */}
        <g transform="translate(100, 78) scale(1.1)">
          <circle cx="0" cy="-6" r="4.5" fill="#f5dfeb" opacity="0.95" />
          <circle cx="6" cy="-2" r="4.5" fill="#f5dfeb" opacity="0.95" />
          <circle cx="4" cy="5" r="4.5" fill="#f5dfeb" opacity="0.95" />
          <circle cx="-4" cy="5" r="4.5" fill="#f5dfeb" opacity="0.95" />
          <circle cx="-6" cy="-2" r="4.5" fill="#f5dfeb" opacity="0.95" />
          <circle cx="0" cy="0" r="2.4" fill="#b9576e" />
        </g>

        {/* Blossom 4 (Mid branch) */}
        <g transform="translate(76, 110) scale(0.9)">
          <circle cx="0" cy="-6" r="4.2" fill="#f0d3dc" opacity="0.9" />
          <circle cx="6" cy="-2" r="4.2" fill="#f0d3dc" opacity="0.9" />
          <circle cx="4" cy="5" r="4.2" fill="#f0d3dc" opacity="0.9" />
          <circle cx="-4" cy="5" r="4.2" fill="#f0d3dc" opacity="0.9" />
          <circle cx="-6" cy="-2" r="4.2" fill="#f0d3dc" opacity="0.9" />
          <circle cx="0" cy="0" r="2.2" fill="#ab5065" />
        </g>

        {/* Blossom 5 (Lower branch) */}
        <g transform="translate(62, 134) scale(0.95)">
          <circle cx="0" cy="-6" r="4.4" fill="#f5dfeb" opacity="0.95" />
          <circle cx="6" cy="-2" r="4.4" fill="#f5dfeb" opacity="0.95" />
          <circle cx="4" cy="5" r="4.4" fill="#f5dfeb" opacity="0.95" />
          <circle cx="-4" cy="5" r="4.4" fill="#f5dfeb" opacity="0.95" />
          <circle cx="-6" cy="-2" r="4.4" fill="#f5dfeb" opacity="0.95" />
          <circle cx="0" cy="0" r="2.3" fill="#b9576e" />
        </g>

        {/* Falling Petals */}
        <ellipse cx="128" cy="110" rx="2.4" ry="4.8" fill="#f0d3dc" opacity="0.8" transform="rotate(35 128 110)" />
        <ellipse cx="108" cy="148" rx="2.2" ry="4.4" fill="#edd1db" opacity="0.75" transform="rotate(-25 108 148)" />
        <ellipse cx="72" cy="172" rx="2" ry="4" fill="#f0d3dc" opacity="0.65" transform="rotate(45 72 172)" />
      </svg>
    </div>
  );
}
