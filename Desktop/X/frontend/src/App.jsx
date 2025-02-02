import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/signup/Signup";
import Login from "./pages/auth/login/Login";
import Notification from "./pages/notification/Notification";
import Profile from "./pages/profile/Profile";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
function App() {
  const { data:authenticatedUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) throw new Error(data.message || "Something went wrong .");
        console.log(data);
        return data;
      } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
      }
    },
    retry: false,
  });
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      {authenticatedUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authenticatedUser ? <Home /> : <Navigate to="login" />}
        />
        <Route
          path="/login"
          element={!authenticatedUser ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authenticatedUser ? <Signup /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={
            authenticatedUser ? <Notification /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile/:username"
          element={authenticatedUser ? <Profile /> : <Navigate to="/login" />}
        />
      </Routes>
      {authenticatedUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
