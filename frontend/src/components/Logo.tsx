export function ChakraIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="#E8890C" strokeWidth="1.6" aria-hidden="true">
      <circle cx="16" cy="16" r="13" /><circle cx="16" cy="16" r="2.5" fill="#E8890C" />
      <path d="M16 3v26M3 16h26M6.8 6.8l18.4 18.4M25.2 6.8L6.8 25.2" />
    </svg>
  );
}

export default function Logo() {
  return <div className="logo"><ChakraIcon />UPSC Desk</div>;
}
