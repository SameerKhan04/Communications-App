import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";

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

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;