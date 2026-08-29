import { NavLink, useNavigate } from "react-router";
import { signOut } from "firebase/auth";

import { auth } from "../firebase";

import "./AppNavbar.css";


function AppNavbar() {
  const navigate = useNavigate();


  // -----------------------------------------
  // SIGN OUT
  // -----------------------------------------

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

      {/* LOGO / LANDING PAGE */}

      <NavLink
        to="/"
        className="app-navbar-logo"
        aria-label="Go to landing page"
      >
        <span>CHUM</span>
        <strong>BUDDY</strong>
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
          to="/chats"
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