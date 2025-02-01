import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Signup from "./pages/auth/signup/Signup";
import Login from "./pages/auth/login/Login";
import Notification from "./pages/notification/Notification";
import Profile from "./pages/profile/Profile";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { useQuery } from "@tanstack/react-query";
function App() {
  const { data, isLoading,error,isError } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me",{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong .");
        console.log(data);
        return data;
      } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
      }
    },
  });
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
