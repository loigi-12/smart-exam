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

function debounce(fn: (...args: any[]) => void, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Log events to Firebase
export function logEvent(eventType: string, extraData: Record<string, any> = {}) {
  const eventsRef = ref(database, "logs");
  const newEventRef = push(eventsRef);

  const openTabs = Object.keys(localStorage).filter((key) => key.startsWith("tab_")).length;

  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    visibilityState: document.visibilityState,
    openTabs,
    ...extraData,
  };

  set(newEventRef, payload).catch(console.error);
}

// Track open tabs in localStorage
function trackTabLifecycle() {
  const tabKey = `tab_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(tabKey, "open");

  window.addEventListener("beforeunload", () => {
    localStorage.removeItem(tabKey);
  });
}

// Monitor tab visibility and log events with tab count and hidden duration
let lastVisibilityState: string | null = null;

export function setupEventLogging(userPayload: Record<string, any> = {}) {
  trackTabLifecycle();

  window.addEventListener("load", () => {
    logEvent("tab_opened", userPayload);
  });

  document.addEventListener("visibilitychange", () => {
    const currentState = document.visibilityState;

    // Prevent duplicate logging for same state
    if (currentState === lastVisibilityState) return;

    lastVisibilityState = currentState;

    if (currentState === "hidden") {
      hiddenAt = Date.now();
      logEvent("tab_hidden", userPayload);
    } else if (currentState === "visible") {
      const hiddenDuration = hiddenAt ? formatDuration(Date.now() - hiddenAt) : undefined;
      logEvent("tab_visible", { ...userPayload, hiddenDuration });
      hiddenAt = null;
    }
  });
}

// Subscribe to real-time updates
export function subscribeToLogs(callback: (logs: any[]) => void) {
  const logsRef = ref(database, "logs");
  onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const logArray = Object.values(data);
    callback(logArray.reverse());
  });
}
