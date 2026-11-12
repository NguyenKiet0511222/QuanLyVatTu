import { Card, Descriptions, Typography, Input, Space } from "antd";
import { UserOutlined, KeyOutlined, IdcardOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="profile-page slide-up" style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <Card
        style={{ width: 600, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", background: "var(--card-bg)" }}
        title={
          <Title level={3} style={{ margin: 0, color: "var(--primary)", display: "flex", alignItems: "center", gap: 8 }}>
            👤 Thông tin cá nhân
          </Title>
        }
      >
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label={<Space><IdcardOutlined /> Họ và tên</Space>}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.hoTen || "Chưa cập nhật"}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><UserOutlined /> Tên đăng nhập</Space>}>
            <span style={{ color: "var(--text-secondary)" }}>{user.tenDangNhap}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><SafetyCertificateOutlined /> Chức vụ / Vai trò</Space>}>
            <span style={{ 
              padding: "4px 8px", 
              borderRadius: 4, 
              background: user.role === "ADMIN" ? "rgba(255, 77, 79, 0.2)" : "rgba(82, 196, 26, 0.2)",
              color: user.role === "ADMIN" ? "#ff4d4f" : "#52c41a",
              fontWeight: 600 
            }}>
              {user.role === "ADMIN" ? "Quản trị viên (ADMIN)" : "Nhân viên (STAFF)"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={<Space><KeyOutlined /> Mật khẩu</Space>}>
            <Input.Password 
              value={user.matKhau} 
              readOnly 
              bordered={false}
              style={{ width: "100%", padding: 0, color: "var(--text-secondary)" }}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
