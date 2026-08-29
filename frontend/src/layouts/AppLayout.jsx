import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "../firebase";

import AppNavbar from "../components/AppNavbar";

import "./AppLayout.css";


function AppLayout() {
  const [user, setUser] =
    useState(auth.currentUser);

  const [authLoading, setAuthLoading] =
    useState(true);


  // -----------------------------------------
  // CHECK AUTHENTICATION
  // -----------------------------------------

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        }
      );


    return () => unsubscribe();
  }, []);


  // -----------------------------------------
  // WAIT FOR FIREBASE AUTH
  // -----------------------------------------

  if (authLoading) {
    return null;
  }


  // -----------------------------------------
  // NOT SIGNED IN
  // -----------------------------------------

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // -----------------------------------------
  // AUTHENTICATED APP
  // -----------------------------------------

  return (
    <div className="app-layout">

      <AppNavbar />


      <div
        className="app-background-mascot"
        aria-hidden="true"
      />


      <div className="app-layout-content">
        <Outlet />
      </div>

    </div>
  );
}


export default AppLayout;