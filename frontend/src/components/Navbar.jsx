import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Menu, X, BookOpen, LogOut, User, LayoutDashboard, Sun, Moon } from "lucide-react";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const studentLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/challenges", label: "Challenges" },
    { to: "/passport", label: "Skill Passport" },
  ];

  const employerLinks = [
    { to: "/employer", label: "Talent Discovery" },
  ];

  const links = !user ? [] : user.role === "employer" ? employerLinks : studentLinks;

  return (
    <nav className="navbar" aria-label="Primary navigation">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="SkillProof Home">
          <div className="navbar__logo-mark" aria-hidden="true">Sp</div>
          <span className="navbar__brand-name">Skill<span>Proof</span></span>
        </Link>

        <ul className={`navbar__nav${mobileOpen ? " navbar__nav--open" : ""}`} role="list">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => `navbar__link${isActive ? " active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          {user && mobileOpen && (
            <>
              <li><hr className="divider" /></li>
              <li>
                <button className="btn btn--outline w-full" onClick={handleLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              </li>
            </>
          )}
        </ul>

        <div className="navbar__actions">
          {/* Theme Toggle Button in top right corner */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun size={17} style={{ color: "#FBBF24" }} />
            ) : (
              <Moon size={17} style={{ color: "var(--ink-muted)" }} />
            )}
          </button>

          {user ? (
            <>
              <div className="navbar__user-pill hide-mobile">
                <div className="navbar__avatar" aria-hidden="true">
                  {user.full_name?.[0] || "U"}
                </div>
                <span>{user.full_name?.split(" ")[0]}</span>
              </div>
              <button
                className="btn btn--ghost btn--sm hide-mobile"
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--outline btn--sm hide-mobile">Log In</Link>
              <Link to="/register" className="btn btn--primary btn--sm hide-mobile">Get Started</Link>
            </>
          )}
          <button
            className="navbar__menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
