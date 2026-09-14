'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';
import { SignOutButton } from '@/components/SignOutButton';
const rewards = ['/rewards', '/garden', '/train', '/dinosaurs', '/bakery', '/train-preview'];
function NavigationIcon({ id }: { id: string }) {
  const paths: Record<string, string> = {
    home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
    practice: 'm14 5 5 5M4 20l4-1L21 6a2.1 2.1 0 0 0-3-3L5 16l-1 4Z',
    learn: 'M12 6v15M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Z',
    rewards: 'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z',
  };
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[id]} /></svg>;
}
export function StudentNavigation() {
  const path = usePathname();
  if (!path || !['/home', '/home-preview', '/learn', '/learn-preview', ...rewards].includes(path)) return null;
  const current = rewards.includes(path) ? 'rewards' : path.startsWith('/learn') ? 'learn' : 'home';
  return <header className="student-navigation"><div className="student-navigation-inner"><BrandLogo href="/home"/><nav aria-label="Student navigation">{[['home','Home','/home'],['practice','Practice','/practice/daily'],['learn','Lessons','/learn'],['rewards','My rewards','/rewards']].map(([id,label,href])=><Link key={id} href={href} aria-current={current===id?'page':undefined}><NavigationIcon id={id}/><span>{label}</span></Link>)}</nav><div className="student-signout"><SignOutButton/></div></div></header>;
}
