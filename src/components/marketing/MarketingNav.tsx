import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';

export function MarketingNav() {
  return <nav aria-label="Main navigation" className="marketing-nav" data-silent-click>
    <div className="marketing-nav-inner">
      <BrandLogo href="/" />
      <div className="marketing-nav-info"><Link href="/about">About</Link><Link href="/pricing">Pricing</Link></div>
      <div className="marketing-login-links" aria-label="Choose your login">
        <Link href="/kids" className="marketing-kid-login"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="8"/><path d="M8 14c1 3 7 3 8 0M9 9h.01M15 9h.01M10 4l2-2 2 2"/></svg>Kids log in</Link>
        <Link href="/login" className="marketing-parent-login"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>Parents log in</Link>
      </div>
      <Link href="/signup" className="marketing-nav-signup">Join SunSharp</Link>
    </div>
  </nav>;
}
