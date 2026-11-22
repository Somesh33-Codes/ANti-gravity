import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import { LoginPage, RegisterPage } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import SubmissionDetail from "./pages/SubmissionDetail";
import Passport from "./pages/Passport";
import EmployerDashboard from "./pages/EmployerDashboard";
import { LoadingPage } from "./components/ui";
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/landing.css";

// Route guards
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role && !(role === "employer" && user.role === "admin")) {
    return <Navigate to={user.role === "employer" ? "/employer" : "/dashboard"} replace />;
  }
  return children;
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (user) return <Navigate to={user.role === "employer" ? "/employer" : "/dashboard"} replace />;
  return children;
}

// Scroll to top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/login" element={
              <RedirectIfAuthed><LoginPage /></RedirectIfAuthed>
            } />
            <Route path="/register" element={
              <RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>
            } />

            {/* Student routes */}
            <Route path="/dashboard" element={
              <RequireAuth role="student"><Dashboard /></RequireAuth>
            } />
            <Route path="/challenges" element={
              <RequireAuth role="student"><Challenges /></RequireAuth>
            } />
            <Route path="/challenges/:slug" element={
              <RequireAuth role="student"><ChallengeDetail /></RequireAuth>
            } />
            <Route path="/submissions/:id" element={
              <RequireAuth><SubmissionDetail /></RequireAuth>
            } />
            <Route path="/passport" element={
              <RequireAuth><Passport /></RequireAuth>
            } />
            {/* Public passport view — no auth required */}
            <Route path="/passport/:id" element={<Passport />} />

            {/* Employer routes */}
            <Route path="/employer" element={
              <RequireAuth role="employer"><EmployerDashboard /></RequireAuth>
            } />

            {/* Catch-all */}
            <Route path="*" element={
              <div className="page">
                <div className="container--narrow" style={{ textAlign: "center", paddingTop: "4rem" }}>
                  <h1 style={{ fontSize: "4rem", fontFamily: "var(--font-display)", color: "var(--cobalt)" }}>404</h1>
                  <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>This page doesn't exist in the SkillProof ledger.</p>
                  <a href="/" className="btn btn--primary">Return Home</a>
                </div>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
