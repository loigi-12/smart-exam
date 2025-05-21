import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./Pages/Login";
import MainPage from "./Pages/main-page";
import DashboardPage from "./components/Dashboard/dashboard";
import ClassroomPage from "./components/Classroom/classroom";
import UsersPage from "./components/Users/users";

import "./App.css";
import DepartmentPage from "./components/Department/department";
import SubjectPage from "./components/Subject/subject";
import SelectedClassroom from "./components/Classroom/Selected-Room/selected-classroom";
import SelectedSubjectInRoom from "./components/Classroom/Selected-Room/Subject/Selected-Subject/selected-subject";
import ProfilePage from "./components/Profile/profile";
import BlockPage from "./components/Block/block";
import UserSettingsPage from "./components/Settings/user-settings";

import KeyLogger from "./components/KeyLogger";
import { setupEventLogging, subscribeToLogs } from "./lib/logs";

interface LogEntry {
  event: string;
  timestamp: string;
  visibilityState: string;
  hiddenDuration?: string;
  openTabs?: number;
  [key: string]: any;
}

function AppContent() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (user && user.role === "student") {
      const userPayload = {
        user: {
          userId: user.documentId,
          userName: user.name,
        },
      };

      setupEventLogging(userPayload);
      subscribeToLogs(setLogs);

      // insertDOM
      const mainElement = document.querySelector("main");
      if (mainElement !== null) {
        mainElement.setAttribute("user", "student");

        const el1 = document.querySelector('main[user="student"]');
        const el2 = document.querySelector('div[role="dialog"]');

        const targets = [el1, el2].filter((el): el is Element => el !== null);
        preventInteraction(targets);

        function preventInteraction(targets: Element | Element[]) {
          const elements = Array.isArray(targets) ? targets : [targets];

          elements.forEach((target) => {
            ["contextmenu", "copy", "cut", "paste", "selectstart"].forEach((eventType) => {
              target.addEventListener(eventType, (e) => e.preventDefault());
            });
          });
        }
      }
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={user ? <MainPage /> : <Navigate to="/" />}>
          <Route index element={<DashboardPage />} />
          <Route path="department" element={<DepartmentPage />} />
          <Route path="subject" element={<SubjectPage />} />
          <Route path="classroom" element={<ClassroomPage />} />
          <Route path="classroom/:id" element={<SelectedClassroom />} />
          <Route path="classroom/:id/:id" element={<SelectedSubjectInRoom />} />
          <Route path="subject/:id/profile" element={<ProfilePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/profile" element={<ProfilePage />} />
          <Route path="block" element={<BlockPage />} />
          <Route path="user-settings" element={<UserSettingsPage />} />

          <Route path="exam-logs" element={<KeyLogger />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <div className="content">
        <Router>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
              <Toaster />
            </ToastProvider>
          </ThemeProvider>
        </Router>
      </div>
    </main>
  );
}

export default App;
