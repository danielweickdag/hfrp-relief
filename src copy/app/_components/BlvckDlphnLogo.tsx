interface BlvckDlphnLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function BlvckDlphnLogo({
  width = 40,
  height = 40,
  className = ""
}: BlvckDlphnLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Golden gradient for main surfaces */}
        <linearGradient id="goldMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7DC6F" />
          <stop offset="30%" stopColor="#F4D03F" />
          <stop offset="60%" stopColor="#F1C40F" />
          <stop offset="100%" stopColor="#D4AC0D" />
        </linearGradient>

        {/* Shadow gradient for depth */}
        <linearGradient id="goldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B7950B" />
          <stop offset="50%" stopColor="#9A7D0A" />
          <stop offset="100%" stopColor="#7D6608" />
        </linearGradient>

        {/* Highlight gradient for edges */}
        <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCF3CF" />
          <stop offset="50%" stopColor="#F7DC6F" />
          <stop offset="100%" stopColor="#F4D03F" />
        </linearGradient>

        {/* Drop shadow filter */}
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="6" stdDeviation="8" floodColor="#2C3E50" floodOpacity="0.3"/>
        </filter>
      </defs>

      <g transform="translate(200,200)" filter="url(#dropShadow)">
        {/* Letter "B" - Left side of hexagon */}
        <g>
          {/* Main vertical stroke of B */}
          <path
            d="M -60,-80 L -40,-80 L -40,80 L -60,80 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Top horizontal stroke of B */}
          <path
            d="M -40,-80 L 20,-80 L 30,-60 L 10,-60 L -40,-60 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Middle horizontal stroke of B */}
          <path
            d="M -40,-10 L 15,-10 L 25,10 L 5,10 L -40,10 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Bottom horizontal stroke of B */}
          <path
            d="M -40,60 L 20,60 L 30,80 L 10,80 L -40,80 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Top curve of B */}
          <path
            d="M 10,-60 L 30,-60 L 40,-40 L 25,-10 L 5,10 L 5,-10 L 15,-40 L 10,-60 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Bottom curve of B */}
          <path
            d="M 5,10 L 25,10 L 40,30 L 30,60 L 10,80 L 10,60 L 20,40 L 5,10 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* 3D depth for B - side faces */}
          <path
            d="M -60,-80 L -50,-90 L -30,-90 L -40,-80 Z"
            fill="url(#goldShadow)"
            stroke="url(#goldShadow)"
            strokeWidth="0.5"
          />

          <path
            d="M -40,-80 L -30,-90 L 30,-90 L 20,-80 Z"
            fill="url(#goldShadow)"
            stroke="url(#goldShadow)"
            strokeWidth="0.5"
          />
        </g>

        {/* Letter "S" - Right side of hexagon */}
        <g>
          {/* Top curve of S */}
          <path
            d="M 40,-80 L 60,-60 L 60,-40 L 40,-20 L 20,-20 L 20,-40 L 35,-55 L 50,-65 L 40,-80 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Middle section of S */}
          <path
            d="M 20,-20 L 40,-20 L 60,0 L 40,20 L 20,20 L 40,0 L 20,-20 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* Bottom curve of S */}
          <path
            d="M 20,20 L 40,20 L 60,40 L 60,60 L 40,80 L 20,65 L 35,50 L 20,40 L 20,20 Z"
            fill="url(#goldMain)"
            stroke="url(#goldHighlight)"
            strokeWidth="1"
          />

          {/* 3D depth for S - side faces */}
          <path
            d="M 40,-80 L 50,-90 L 70,-70 L 60,-60 Z"
            fill="url(#goldShadow)"
            stroke="url(#goldShadow)"
            strokeWidth="0.5"
          />

          <path
            d="M 60,60 L 70,70 L 50,90 L 40,80 Z"
            fill="url(#goldShadow)"
            stroke="url(#goldShadow)"
            strokeWidth="0.5"
          />
        </g>

        {/* Connecting elements to form hexagonal shape */}
        <path
          d="M 30,-60 L 40,-40 L 60,-40 L 60,-60 Z"
          fill="url(#goldMain)"
          stroke="url(#goldHighlight)"
          strokeWidth="1"
        />

        <path
          d="M 60,40 L 60,60 L 30,60 L 40,40 Z"
          fill="url(#goldMain)"
          stroke="url(#goldHighlight)"
          strokeWidth="1"
        />

        {/* Additional highlights for premium look */}
        <line x1="-60" y1="-80" x2="40" y2="-80" stroke="url(#goldHighlight)" strokeWidth="2" opacity="0.8"/>
        <line x1="-60" y1="80" x2="40" y2="80" stroke="url(#goldHighlight)" strokeWidth="2" opacity="0.8"/>
        <line x1="-60" y1="-80" x2="-60" y2="80" stroke="url(#goldHighlight)" strokeWidth="2" opacity="0.8"/>
        <line x1="60" y1="-60" x2="60" y2="60" stroke="url(#goldHighlight)" strokeWidth="2" opacity="0.8"/>

        {/* Corner highlights */}
        <circle cx="40" cy="-80" r="3" fill="url(#goldHighlight)" opacity="0.9"/>
        <circle cx="60" cy="-60" r="3" fill="url(#goldHighlight)" opacity="0.9"/>
        <circle cx="60" cy="60" r="3" fill="url(#goldHighlight)" opacity="0.9"/>
        <circle cx="40" cy="80" r="3" fill="url(#goldHighlight)" opacity="0.9"/>
        <circle cx="-60" cy="80" r="3" fill="url(#goldHighlight)" opacity="0.9"/>
        <circle cx="-60" cy="-80" r="3" fill="url(#goldHighlight)" opacity="0.9"/>
      </g>
    </svg>
  );
}
