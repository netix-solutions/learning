'use client';
import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { isStudentRoute } from '@/lib/student-routes';

const subscribe = (notify: () => void) => {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
};
const online = () => navigator.onLine;
const serverOnline = () => true;

export function ConnectionNotice() {
  const connected = useSyncExternalStore(subscribe, online, serverOnline);
  const pathname = usePathname();
  if (connected || !isStudentRoute(pathname)) return null;
  return <aside className="connection-notice" role="status" aria-live="polite">
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m3 3 18 18M2 8a16 16 0 0 1 3-2M9 4a16 16 0 0 1 13 4M5 12a11 11 0 0 1 4-2M14 10a11 11 0 0 1 5 2M8 16a6 6 0 0 1 8 0M12 20h.01"/></svg>
    <div><strong>Waiting for the internet</strong><p>Stay here. Reconnect, then retry any answer that hasn’t saved.</p></div>
  </aside>;
}
