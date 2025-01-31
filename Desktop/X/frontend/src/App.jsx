import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/signup/Signup";
import Login from "./pages/auth/login/Login";
import Notification from "./pages/notification/Notification";
import Profile from "./pages/profile/Profile";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
      <RightPanel />
      <Toaster />
    </div>
  );
}

export default App;
