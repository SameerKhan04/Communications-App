import { Navigate, Route, Routes } from "react-router";

import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import New_signup from "./pages/New_signup.jsx";

// Don't forget the chat imports we just made!
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";

import "./App.css";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<New_signup />} />

      {/* AUTHENTICATED APP (Wrapped in your teammates' new AppLayout) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        
        {/* Your Messaging Routes */}
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:chatId" element={<ChatPage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;