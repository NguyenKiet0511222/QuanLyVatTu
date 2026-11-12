import { NavLink, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/", label: "Tổng quan", icon: "📊" },
  { path: "/devices", label: "Thiết bị", icon: "💻" },
  { path: "/borrows", label: "Mượn / Trả", icon: "🔄" },
  { path: "/employees", label: "Quản lý nhân viên", icon: "👥" },
  { path: "/maintenance", label: "Bảo trì", icon: "🔧" },
];

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toUpperCase();

  const filteredMenuItems = menuItems.filter(item => {
    if (item.path === "/employees" && userRole !== "ADMIN") {
      return false;
    }
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">📦</div>
        <div>
          <h2>Quản lý Vật tư</h2>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Quản lý vật tư và thiết bị
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/login" className="nav-item" style={{ color: "var(--danger)" }}>
          <span className="nav-icon">🚪</span>
          Đăng xuất
        </NavLink>
      </div>
    </aside>
  );
}
