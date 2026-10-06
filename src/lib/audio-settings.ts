import type { RewardTheme } from '@/lib/train';

type Settings = { music: boolean; effects: boolean; theme: RewardTheme };
const initial: Settings = { music: true, effects: true, theme: 'garden' };
let settings = initial;
let initialized = false;
const listeners = new Set<() => void>();
export const audioSettings = () => settings;
export const serverAudioSettings = () => initial;
export function subscribeAudioSettings(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(next: Settings) { settings = next; listeners.forEach(listener => listener()); }
export function initializeAudioSettings() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try { publish({ ...settings, music: localStorage.getItem('ss-music-enabled') !== '0', effects: localStorage.getItem('ss-effects-enabled') !== '0' }); } catch { /* Private browsing can disable storage. */ }
}
export function setAudioEnabled(kind: 'music' | 'effects', enabled: boolean) {
  publish({ ...settings, [kind]: enabled });
  try { localStorage.setItem(kind === 'music' ? 'ss-music-enabled' : 'ss-effects-enabled', enabled ? '1' : '0'); } catch { /* Keep the session preference. */ }
}
export function setRewardMusicTheme(theme: RewardTheme) { if (settings.theme !== theme) publish({ ...settings, theme }); }
