// lib/logEvent.ts
import { ref, push, set, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

let hiddenAt: number | null = null;

// Format duration into readable string
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);

  return parts.join(" ");
}

// Log events to Firebase
export function logEvent(eventType: string, extraData: Record<string, any> = {}) {
  const eventsRef = ref(database, "logs");
  const newEventRef = push(eventsRef);

  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    visibilityState: document.visibilityState,
    ...extraData,
  };

  set(newEventRef, payload).catch(console.error);
}

// Count open tabs and store in Firebase
function updateOpenTabs() {
  const openTabsRef = ref(database, "openTabs/count");

  // Use localStorage to simulate tab tracking
  const tabKey = `tab_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(tabKey, "open");

  window.addEventListener("beforeunload", () => {
    localStorage.removeItem(tabKey);
    set(openTabsRef, document.querySelectorAll("iframe").length);
  });

  const openCount = Object.keys(localStorage).filter((key) => key.startsWith("tab_")).length;
  set(openTabsRef, openCount);
}

// Monitor tab visibility and log with duration + tab count
export function setupEventLogging() {
  updateOpenTabs();

  window.addEventListener("load", () => {
    logEvent("tab_opened");
  });

  document.addEventListener("visibilitychange", () => {
    const openTabs = Object.keys(localStorage).filter((key) => key.startsWith("tab_")).length;

    if (document.visibilityState === "hidden") {
      hiddenAt = Date.now();
      logEvent("tab_hidden", { openTabs });
    } else if (document.visibilityState === "visible") {
      const hiddenDuration = hiddenAt ? formatDuration(Date.now() - hiddenAt) : undefined;
      logEvent("tab_visible", { hiddenDuration, openTabs });
      hiddenAt = null;
    }
  });
}

// Listen to log updates in real-time
export function subscribeToLogs(callback: (logs: any[]) => void) {
  const logsRef = ref(database, "logs");
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const logArray = Object.values(data);
    callback(logArray.reverse()); // newest first
  });
}
