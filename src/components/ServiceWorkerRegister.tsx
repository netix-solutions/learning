"use client";

import { useEffect } from "react";

/** Registers the PWA service worker once the page has loaded. Renders nothing. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Dev chunk URLs are reused after edits. An old PWA worker can otherwise
    // mix yesterday's stylesheet with today's components during local testing.
    if(process.env.NODE_ENV==='development'){
      navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.filter(registration=>{
        const worker=registration.active??registration.waiting??registration.installing;
        return worker?.scriptURL===`${location.origin}/sw.js`;
      }).map(registration=>registration.unregister()))).catch(()=>{});
      return;
    }
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* SW is a progressive enhancement; ignore failures */
      });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}
