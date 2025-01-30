import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/signup/Signup";
import Login from "./pages/auth/login/Login";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import Notification from "./pages/notification/Notification";
function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>
      <RightPanel />
    </div>
  );
}

export default App;
