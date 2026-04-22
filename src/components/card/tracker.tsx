"use client";

import { useEffect, useRef, useCallback } from "react";

interface TrackerProps {
  username: string;
  children: React.ReactNode;
}

function getSessionId(): string {
  const key = "bcard_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function Tracker({ username, children }: TrackerProps) {
  const tracked = useRef(false);

  const track = useCallback(
    (event: string, extra?: Record<string, string>) => {
      const sessionId = getSessionId();
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, sessionId, event, ...extra }),
      }).catch(() => {});
    },
    [username]
  );

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    track("view");
  }, [track]);

  // Expose track function via a custom event so child components can use it
  useEffect(() => {
    function handleTrackEvent(e: Event) {
      const detail = (e as CustomEvent).detail;
      track(detail.event, detail.extra);
    }
    window.addEventListener("bcard:track", handleTrackEvent);
    return () => window.removeEventListener("bcard:track", handleTrackEvent);
  }, [track]);

  return <>{children}</>;
}

// Helper to dispatch track events from anywhere
export function trackEvent(event: string, extra?: Record<string, string>) {
  window.dispatchEvent(
    new CustomEvent("bcard:track", { detail: { event, extra } })
  );
}