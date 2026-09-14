'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { SignOutButton } from '@/components/SignOutButton';
const rewards = ['/rewards', '/garden', '/train', '/dinosaurs', '/bakery', '/train-preview'];
export function StudentNavigation() {
  const path = usePathname();
  if (!path || !['/home', '/home-preview', '/learn', '/learn-preview', ...rewards].includes(path)) return null;
  const current = rewards.includes(path) ? 'rewards' : path.startsWith('/learn') ? 'learn' : 'home';
  return <header className="student-navigation"><div className="student-navigation-inner"><BrandLogo href="/home"/><nav aria-label="Student navigation">{[['home','Home','/home'],['practice','Practice','/practice/daily'],['learn','Lessons','/learn'],['rewards','My rewards','/rewards']].map(([id,label,href])=><Link key={id} href={href} aria-current={current===id?'page':undefined}>{label}</Link>)}</nav><div className="student-signout"><SignOutButton/></div></div></header>;
}
