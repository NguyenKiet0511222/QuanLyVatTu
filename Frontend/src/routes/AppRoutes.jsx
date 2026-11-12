import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import DevicePage from "../pages/devices/DevicePage";
import BorrowPage from "../pages/borrow/BorrowPage";
import EmployeePage from "../pages/emloyees/EmployeePage";
import MaintenancePage from "../pages/maintenance/MaintenancePage";
import LoginPage from "../pages/auth/LoginPage";
import ProfilePage from "../pages/auth/ProfilePage"; // Thêm trang xem thông tin cá nhân
import AuthGuard from "../components/auth/AuthGuard";

export default function AppRoutes() {
  // Lấy dữ liệu user từ localStorage  [cite: 5, 556-558]
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role?.toUpperCase(); 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/devices" element={<DevicePage />} />
            <Route path="/borrows" element={<BorrowPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            
            {/* Trang xem tài khoản/mật khẩu dùng chung cho cả 2 */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Chỉ Admin mới vào được trang này, Staff sẽ bị đẩy về Home */}
            <Route 
              path="/employees" 
              element={userRole === "ADMIN" ? <EmployeePage /> : <Navigate to="/" />} 
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}