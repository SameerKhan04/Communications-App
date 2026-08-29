// src/components/AppNavbar.jsx

import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router";
import logo from "../assets/chum-buddy-colour.png";
import { auth } from "../firebase";

import "./AppNavbar.css";

function AppNavbar() {
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut(auth);
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error signing out:",
        error
      );
    }
  }

  return (
    <header className="app-navbar">

      {/* LOGO */}

      <NavLink
        to="/"
        className="app-navbar-logo"
        aria-label="Go to discovery page"
        style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
      >
        <img 
          src={logo} 
          alt="Chum Buddies Logo" 
          style={{ height: "65px", width: "auto", objectFit: "contain" }} 
        />
        <span>CHUM</span>
        <strong>BUDDIES</strong>
      </NavLink>

      {/* NAVIGATION */}

      <nav
        className="app-navbar-links"
        aria-label="Main navigation"
      >

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive
              ? "app-navbar-link active"
              : "app-navbar-link"
          }
        >
          Profile
        </NavLink>

        <NavLink
          to="/friends"
          className={({ isActive }) =>
            isActive
              ? "app-navbar-link active"
              : "app-navbar-link"
          }
        >
          Friends
        </NavLink>

        <NavLink
          to="/matches"
          className={({ isActive }) =>
            isActive
              ? "app-navbar-link active"
              : "app-navbar-link"
          }
        >
          Matches
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            isActive
              ? "app-navbar-link active"
              : "app-navbar-link"
          }
        >
          Chats
        </NavLink>

        <button
          type="button"
          className="app-navbar-signout"
          onClick={handleSignOut}
        >
          Sign out
        </button>

      </nav>

    </header>
  );
}

export default AppNavbar;