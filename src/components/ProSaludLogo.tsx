interface ProSaludLogoProps {
  size?: number;
  className?: string;
}

const ProSaludLogo = ({ size = 80, className }: ProSaludLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="psg-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0f766e" />
        <stop offset="0.55" stopColor="#0c5652" />
        <stop offset="1" stopColor="#042f2e" />
      </linearGradient>

      <linearGradient id="psg-gold" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde68a" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>

      <linearGradient id="psg-gold-center" x1="30" y1="30" x2="50" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef3c7" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>

      <filter id="psg-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="psg-outer-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.45)" />
      </filter>
    </defs>

    {/* Background rounded square */}
    <rect width="80" height="80" rx="19" fill="url(#psg-bg)" filter="url(#psg-outer-shadow)" />

    {/* Subtle inner highlight top-left */}
    <rect width="80" height="80" rx="19" fill="url(#psg-highlight)" opacity="0.06" />
    <path
      d="M 4 22 Q 4 4 22 4 L 58 4 Q 40 4 40 22 Z"
      fill="rgba(255,255,255,0.06)"
    />

    {/* Corner accent dots */}
    <circle cx="11" cy="11" r="1.8" fill="rgba(94,234,212,0.35)" />
    <circle cx="69" cy="11" r="1.8" fill="rgba(94,234,212,0.35)" />
    <circle cx="11" cy="69" r="1.8" fill="rgba(94,234,212,0.35)" />
    <circle cx="69" cy="69" r="1.8" fill="rgba(94,234,212,0.35)" />

    {/* Mid-edge micro dots */}
    <circle cx="40" cy="6"  r="1.1" fill="rgba(94,234,212,0.2)" />
    <circle cx="6"  cy="40" r="1.1" fill="rgba(94,234,212,0.2)" />
    <circle cx="74" cy="40" r="1.1" fill="rgba(94,234,212,0.2)" />
    <circle cx="40" cy="74" r="1.1" fill="rgba(94,234,212,0.2)" />

    {/* Outer decorative dashed ring */}
    <circle
      cx="40" cy="40" r="34"
      stroke="rgba(45,212,191,0.22)"
      strokeWidth="0.8"
      strokeDasharray="2.5 5"
    />

    {/* Inner ring */}
    <circle
      cx="40" cy="40" r="28"
      stroke="rgba(45,212,191,0.1)"
      strokeWidth="0.6"
    />

    {/* ── Medical cross arms ── */}
    {/* Vertical arm */}
    <rect x="33" y="13" width="14" height="54" rx="7" fill="white" opacity="0.94" />
    {/* Horizontal arm */}
    <rect x="13" y="33" width="54" height="14" rx="7" fill="white" opacity="0.94" />

    {/* ── Gold nodes at each arm tip ── */}
    {/* Each node sits centered on the rounded end of its arm */}
    {/* Top  */}
    <circle cx="40" cy="20" r="5.8" fill="url(#psg-gold)" filter="url(#psg-glow)" />
    <circle cx="40" cy="20" r="2.2" fill="rgba(255,255,255,0.55)" />

    {/* Bottom */}
    <circle cx="40" cy="60" r="5.8" fill="url(#psg-gold)" filter="url(#psg-glow)" />
    <circle cx="40" cy="60" r="2.2" fill="rgba(255,255,255,0.55)" />

    {/* Left */}
    <circle cx="20" cy="40" r="5.8" fill="url(#psg-gold)" filter="url(#psg-glow)" />
    <circle cx="20" cy="40" r="2.2" fill="rgba(255,255,255,0.55)" />

    {/* Right */}
    <circle cx="60" cy="40" r="5.8" fill="url(#psg-gold)" filter="url(#psg-glow)" />
    <circle cx="60" cy="40" r="2.2" fill="rgba(255,255,255,0.55)" />

    {/* ── Central gold hub ── */}
    <circle cx="40" cy="40" r="10.5" fill="url(#psg-gold-center)" filter="url(#psg-glow)" />
    {/* Hub inner ring */}
    <circle cx="40" cy="40" r="6.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
    {/* Hub center dot */}
    <circle cx="40" cy="40" r="2.8" fill="rgba(255,255,255,0.5)" />

    {/* ── Thin connector lines from hub to each node ── */}
    <line x1="40" y1="29.5" x2="40" y2="14.2" stroke="rgba(253,230,138,0.35)" strokeWidth="1.5" />
    <line x1="40" y1="50.5" x2="40" y2="65.8" stroke="rgba(253,230,138,0.35)" strokeWidth="1.5" />
    <line x1="29.5" y1="40" x2="14.2" y2="40" stroke="rgba(253,230,138,0.35)" strokeWidth="1.5" />
    <line x1="50.5" y1="40" x2="65.8" y2="40" stroke="rgba(253,230,138,0.35)" strokeWidth="1.5" />
  </svg>
);

export default ProSaludLogo;
