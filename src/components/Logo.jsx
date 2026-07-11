export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#111827" stroke="#00E887" strokeWidth="2" />
      <path
        d="M14 30 L20 18 L24 26 L28 18 L34 30"
        stroke="#00E887"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="14" r="3" fill="#2563EB" />
    </svg>
  )
}
