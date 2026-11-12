import { useNavigate } from "react-router-dom";
import { Dropdown, Avatar, message, Input } from "antd";
import { 
  SearchOutlined, 
  BellOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  UserOutlined 
} from "@ant-design/icons";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    message.success("Đã đăng xuất");
    navigate("/login");
  };

  const userMenuItems = [
    { key: "profile", label: "Hồ sơ", icon: <UserOutlined />, onClick: () => navigate("/profile") },
    { key: "settings", label: "Cài đặt", icon: <SettingOutlined /> },
    { type: "divider" },
    { 
      key: "logout", 
      label: "Đăng xuất", 
      icon: <LogoutOutlined />, 
      danger: true,
      onClick: handleLogout 
    },
  ];

  return (
    <header className="app-header">
      <div className="header-search">
        <SearchOutlined style={{ color: "var(--text-muted)" }} />
        <input type="text" placeholder="Tìm kiếm thiết bị, nhân viên..." />
      </div>

      <div className="header-actions">
        <button className="header-btn" title="Thông báo">
          <BellOutlined />
          <span className="notif-dot"></span>
        </button>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="header-user-info" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {user.hoTen || user.tenDangNhap || "User"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
              </div>
            </div>
            <Avatar 
              size={36} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: "var(--primary)" }}
            />
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

