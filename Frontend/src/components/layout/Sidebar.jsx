import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  BankOutlined,
  DesktopOutlined,
  SwapOutlined,
  ToolOutlined,
  TeamOutlined,
  HistoryOutlined,
  IdcardOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { message } from "antd";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toUpperCase() || "STAFF";

  const mainMenu = [
    { path: "/", label: "Tổng quan & Thống kê", icon: <DashboardOutlined /> },
    { path: "/rooms", label: "Quản lý phòng học", icon: <BankOutlined /> },
    { path: "/devices", label: "Quản lý thiết bị", icon: <DesktopOutlined /> },
    { path: "/borrows", label: "Mượn & Trả thiết bị", icon: <SwapOutlined /> },
    { path: "/maintenance", label: "Bảo trì & Báo lỗi", icon: <ToolOutlined /> },
  ];

  const systemMenu = [
    { path: "/employees", label: "Tài khoản người dùng", icon: <TeamOutlined /> },
    { path: "/activity-logs", label: "Lịch sử thao tác", icon: <HistoryOutlined />, adminOnly: true },
    { path: "/profile", label: "Hồ sơ cá nhân", icon: <IdcardOutlined /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    message.success("Đã đăng xuất khỏi hệ thống");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <SafetyCertificateOutlined />
        </div>
        <div>
          <h2>QUẢN LÝ VẬT TƯ</h2>
          <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", marginTop: 2 }}>
            Thiết bị & Phòng học
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Nghiệp vụ chính</div>
        {mainMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-title" style={{ marginTop: 12 }}>
          Quản trị & Hệ thống
        </div>
        {systemMenu
          .filter((item) => !item.adminOnly || userRole === "ADMIN")
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            marginBottom: 8,
            borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#f8fafc",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.hoTen || user.tenDangNhap || "Người dùng"}
            </div>
            <div style={{ fontSize: 11, color: userRole === "ADMIN" ? "#fbbf24" : "#38bdf8", fontWeight: 600 }}>
              {userRole === "ADMIN" ? "● Cán bộ Quản lý (ADMIN)" : "● Giảng viên / Người dùng"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ color: "#f87171", justifyContent: "flex-start" }}
        >
          <span className="nav-icon">
            <LogoutOutlined />
          </span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
