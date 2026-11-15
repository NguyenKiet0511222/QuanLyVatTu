import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import DevicePage from "../pages/devices/DevicePage";
import BorrowPage from "../pages/borrow/BorrowPage";
import EmployeePage from "../pages/emloyees/EmployeePage";
import MaintenancePage from "../pages/maintenance/MaintenancePage";
import RoomPage from "../pages/rooms/RoomPage";
import ActivityLogPage from "../pages/activity/ActivityLogPage";
import LoginPage from "../pages/auth/LoginPage";
import ProfilePage from "../pages/auth/ProfilePage";
import AuthGuard from "../components/auth/AuthGuard";

export default function AppRoutes() {
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role?.toUpperCase() || "STAFF";
    } catch {
      return "STAFF";
    }
  };

  const userRole = getUserRole();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/rooms" element={<RoomPage />} />
            <Route path="/devices" element={<DevicePage />} />
            <Route path="/borrows" element={<BorrowPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Quản lý nhân sự & tài khoản người dùng */}
            <Route path="/employees" element={<EmployeePage />} />

            {/* Lịch sử thao tác chỉ cho ADMIN */}
            <Route
              path="/activity-logs"
              element={userRole === "ADMIN" ? <ActivityLogPage /> : <Navigate to="/" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
