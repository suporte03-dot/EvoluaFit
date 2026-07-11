function Logo({ showTagline = false, compact = false }) {
  return (
    <span className={`logo ${compact ? 'logo--compact' : ''}`}>
      <svg
        className="logo__icon"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="22" stroke="#00E887" strokeWidth="1.5" opacity="0.35" />
        <path
          d="M24 4 A20 20 0 1 1 23.5 4"
          stroke="#00E887"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="24" cy="24" r="14" fill="#0D2A4D" stroke="#00E887" strokeWidth="1.5" />
        <ellipse cx="24" cy="24" rx="18" ry="7" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
        <path
          d="M24 13 L32.5 31 H27.5 L24 23 L20.5 31 H15.5 Z"
          fill="#F5F8FC"
        />
        <circle cx="35" cy="13" r="3.5" fill="#FF9F1C" />
        <text x="33" y="15" fill="#071B34" fontSize="5" fontWeight="800" fontFamily="system-ui">°</text>
      </svg>
      <span className="logo__text">
        <span className="logo__wordmark">
          <span className="logo__arena">Arena </span>
          <span className="logo__360">360</span>
        </span>
        {showTagline && (
          <span className="logo__tagline">O esporte em todos os ângulos</span>
        )}
      </span>
    </span>
  )
}

export default Logo
