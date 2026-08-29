import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import Friends from "./pages/Friends";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* My profile */}
      <Route
        path="/profile"
        element={<ProfilePage />}
      />

      {/* Edit my profile */}
      <Route
        path="/profile/edit"
        element={<EditProfilePage />}
      />

      {/* Someone else's profile */}
      <Route
        path="/users/:userId"
        element={<UserProfilePage />}
      />

      {/* Friends */}
      <Route
        path="/friends"
        element={<Friends />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;