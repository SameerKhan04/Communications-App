import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";

import "./App.css";

function App() {
  return (
    <Routes>

      {/* PUBLIC ROUTE */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* AUTHENTICATED APP */}

      <Route element={<AppLayout />}>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/profile/edit"
          element={<EditProfilePage />}
        />

        <Route
          path="/users/:userId"
          element={<UserProfilePage />}
        />

      </Route>


      {/* FALLBACK */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;