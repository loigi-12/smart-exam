import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

interface LogEntry {
  event: string;
  timestamp: string;
  userAgent?: string;
  visibilityState?: string;
  openTabs?: number;
  hiddenDuration?: string;
  [key: string]: any;
}

const KeyLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const logsRef = ref(database, "logs");

    const unsubscribe = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.entries(data).map(([id, value]) => ({
          ...(value as LogEntry),
          id,
        }));

        // sort by timestamp descending
        logsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setLogs(logsArray);
      } else {
        setLogs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Logs</h1>
      <ul className="space-y-3">
        {logs &&
          logs.map((log, index) => (
            <li key={index} className="p-3 rounded shadow-sm">
              <p className="text-sm text-gray-400">
                <strong>User:</strong> {log.user?.userName}
              </p>
              <p className="text-sm text-gray-400">
                <strong>Status:</strong> {log.event}
              </p>
              <p className="text-sm text-gray-400">
                <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
              </p>
              {log.openTabs !== undefined && (
                <p className="text-sm text-gray-400">
                  <strong>Open Tabs:</strong> {log.openTabs}
                </p>
              )}
              {log.hiddenDuration && (
                <p className="text-sm text-gray-400">
                  <strong>Time spent:</strong> {log.hiddenDuration}
                </p>
              )}
              <p className="text-sm text-gray-400">{log.userAgent}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default KeyLogger;
