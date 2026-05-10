import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#accent-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="accent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        </svg>
        Cookbook
      </Link>
      <div>
        <a 
          href={process.env.NEXT_PUBLIC_SHEET_URL || "https://docs.google.com/spreadsheets/"} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}
        >
          Edit in Google Sheets ↗
        </a>
      </div>
    </nav>
  );
}
