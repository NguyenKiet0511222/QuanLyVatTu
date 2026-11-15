import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Badge, Popover, Button, Empty, Tag, message } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  HistoryOutlined,
  CheckOutlined,
  WarningOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import notificationApi from "../../api/notificationApi";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toUpperCase() || "STAFF";

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      // ignore background poll error
    }
  };

  const unreadCount = notifications.filter((n) => !n.daDoc).length;

  const handleMarkRead = async (notif) => {
    try {
      if (!notif.daDoc) {
        await notificationApi.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, daDoc: true } : n))
        );
      }
      setNotifOpen(false);
      if (notif.loai === "INCIDENT") {
        navigate("/maintenance");
      } else if (notif.loai === "BORROW") {
        navigate("/borrows");
      } else {
        navigate("/devices");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, daDoc: true })));
      message.success("Đã đánh dấu đọc tất cả thông báo");
    } catch (err) {
      message.error("Không thể cập nhật thông báo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    message.success("Đã đăng xuất");
    navigate("/login");
  };

  const handleQuickSearchKey = (e) => {
    if (e.key === "Enter" && quickSearch.trim()) {
      navigate(`/devices?q=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    ...(userRole === "ADMIN"
      ? [
          {
            key: "logs",
            label: "Nhật ký hoạt động",
            icon: <HistoryOutlined />,
            onClick: () => navigate("/activity-logs"),
          },
        ]
      : []),
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const notifContent = (
    <div style={{ width: 370, maxHeight: 440, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
          Thông báo hệ thống ({unreadCount} chưa đọc)
        </span>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            Đọc tất cả
          </Button>
        )}
      </div>

      <div style={{ overflowY: "auto", maxHeight: 350, paddingRight: 4 }}>
        {notifications.length === 0 ? (
          <Empty description="Chưa có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          notifications.slice(0, 15).map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 6,
                cursor: "pointer",
                background: n.daDoc ? "#ffffff" : "#eef2ff",
                border: n.daDoc ? "1px solid #f1f5f9" : "1px solid #c7d2fe",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ marginTop: 2, fontSize: 16 }}>
                  {n.loai === "INCIDENT" ? (
                    <WarningOutlined style={{ color: "#ef4444" }} />
                  ) : n.loai === "BORROW" ? (
                    <SwapOutlined style={{ color: "#3b82f6" }} />
                  ) : (
                    <InfoCircleOutlined style={{ color: "#6366f1" }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: n.daDoc ? 400 : 600,
                      color: "#0f172a",
                      lineHeight: 1.4,
                    }}
                  >
                    {n.noiDung}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 6,
                      fontSize: 11.5,
                      color: "#64748b",
                    }}
                  >
                    <span>
                      {n.thoiGian ? new Date(n.thoiGian).toLocaleString("vi-VN") : "Vừa xong"}
                    </span>
                    <Tag color={n.daDoc ? "default" : "processing"} style={{ margin: 0, fontSize: 10 }}>
                      {n.daDoc ? "Đã đọc" : "Mới"}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <header className="app-header">
      <div className="header-search">
        <SearchOutlined style={{ color: "var(--text-muted)", fontSize: 15 }} />
        <input
          type="text"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          onKeyDown={handleQuickSearchKey}
          placeholder="Nhập tên/mã thiết bị và nhấn Enter để tra cứu nhanh..."
        />
      </div>

      <div className="header-actions">
        <Popover
          content={notifContent}
          trigger="click"
          open={notifOpen}
          onOpenChange={setNotifOpen}
          placement="bottomRight"
        >
          <Badge count={unreadCount} size="small" offset={[-4, 4]}>
            <button className="header-btn" title="Thông báo sự cố & hệ thống">
              <BellOutlined />
            </button>
          </Badge>
        </Popover>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              padding: "5px 10px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "#f8fafc",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {user.hoTen || user.tenDangNhap || "Người dùng"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {userRole === "ADMIN" ? "Cán bộ Quản lý (ADMIN)" : "Giảng viên / Nhân viên"}
              </div>
            </div>
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                fontWeight: 700,
              }}
            />
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
