"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Encourages installing the PWA. On Chromium it captures `beforeinstallprompt`
 * and shows a one-tap Install button; on iOS Safari (no auto-prompt) it shows
 * the manual "Add to Home Screen" instructions. Hidden once installed.
 */
export function InstallHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(true); // assume installed until checked (no flash)
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean; MSStream?: unknown };
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true,
    );
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !nav.MSStream);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setStandalone(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || dismissed) return null;
  if (!deferred && !isIOS) return null; // nothing actionable to offer

  return (
    <div className="card-fun mt-10 flex w-full max-w-xl items-center gap-3 p-4 text-left">
      <span className="text-3xl">📲</span>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-slate-800">Add SummerSharp to your phone</p>
        {deferred ? (
          <p className="text-sm text-slate-500">Install it for a full-screen, app-like experience.</p>
        ) : (
          <p className="text-sm text-slate-500">
            Tap the Share button <span aria-hidden>⎋</span> below, then{" "}
            <b>“Add to Home Screen”</b> <span aria-hidden>➕</span>.
          </p>
        )}
      </div>
      {deferred ? (
        <button
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
          }}
          className="btn-pop shrink-0 px-4 py-2 text-white"
          style={{ background: "var(--brand-blue)" }}
        >
          Install
        </button>
      ) : (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 rounded-full px-2 text-xl text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      )}
    </div>
  );
}
