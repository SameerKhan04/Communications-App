import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
} from "react-router";

import {
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase";
import AppNavbar from "../components/AppNavbar";


function AppLayout() {
  const [user, setUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);


  // -----------------------------------------
  // CHECK AUTHENTICATION
  // -----------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // -----------------------------------------
  // WAIT FOR FIREBASE
  // -----------------------------------------

  if (authLoading) {
    return null;
  }


  // -----------------------------------------
  // NOT LOGGED IN
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
    <>
      <AppNavbar />

      <Outlet />
    </>
  );
}


export default AppLayout;