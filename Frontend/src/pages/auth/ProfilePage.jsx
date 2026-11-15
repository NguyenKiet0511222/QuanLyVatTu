import { useState } from "react";
import { Card, Form, Input, Button, Avatar, Tag, message, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  KeyOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import authApi from "../../api/authApi";

export default function ProfilePage() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.updateProfile({
        tenDangNhap: user.tenDangNhap,
        hoTen: values.hoTen,
        email: values.email,
        soDienThoai: values.soDienThoai,
        diaChi: values.diaChi,
        matKhauMoi: values.matKhauMoi,
      });

      if (res.success) {
        message.success("Cập nhật thông tin thành công");
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
        form.setFieldValue("matKhauMoi", "");
      } else {
        message.error(res.message || "Không thể cập nhật thông tin");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Số điện thoại hoặc email không hợp lệ!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Thông tin cá nhân</h1>
          <p className="page-header-sub">
            Quản lý và cập nhật hồ sơ liên hệ, mật khẩu tài khoản của bạn
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>
        {/* Thẻ tóm tắt tài khoản */}
        <Card className="table-card" style={{ textAlign: "center", padding: "12px 0" }}>
          <Avatar
            size={84}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              marginBottom: 16,
              boxShadow: "0 8px 20px rgba(79, 70, 229, 0.3)",
            }}
          />
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            {user.hoTen || user.tenDangNhap}
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
            @{user.tenDangNhap}
          </p>
          <Tag
            color={user.role === "ADMIN" ? "volcano" : "blue"}
            style={{ padding: "4px 12px", borderRadius: 999, fontWeight: 600 }}
          >
            <SafetyCertificateOutlined />{" "}
            {user.role === "ADMIN" ? "Cán bộ Quản lý (ADMIN)" : "Giảng viên / Nhân viên (STAFF)"}
          </Tag>

          <Divider style={{ margin: "20px 0 16px" }} />

          <div style={{ textAlign: "left", fontSize: 13.5, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Email:</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{user.email || "Chưa cập nhật"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Số điện thoại:</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{user.soDienThoai || "Chưa cập nhật"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Địa chỉ:</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{user.diaChi || "Chưa cập nhật"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Trạng thái:</span>
              <Tag color="success" style={{ margin: 0 }}>Đang hoạt động</Tag>
            </div>
          </div>
        </Card>

        {/* Biểu mẫu cập nhật hồ sơ (US4.1) */}
        <Card
          className="table-card"
          title={
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              <IdcardOutlined style={{ marginRight: 8, color: "var(--primary)" }} />
              Chỉnh sửa thông tin hồ sơ
            </span>
          }
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              tenDangNhap: user.tenDangNhap,
              hoTen: user.hoTen || "",
              email: user.email || "",
              soDienThoai: user.soDienThoai || "",
              diaChi: user.diaChi || "",
              matKhauMoi: "",
            }}
            onFinish={handleUpdate}
            size="large"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Form.Item
                name="hoTen"
                label="Họ và tên"
                rules={[{ required: true, message: "Họ và tên không được để trống!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item name="tenDangNhap" label="Tên đăng nhập (Không thể thay đổi)">
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Form.Item
                name="email"
                label="Địa chỉ Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="example@uni.edu.vn" />
              </Form.Item>

              <Form.Item
                name="soDienThoai"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { pattern: /^\d{9,11}$/, message: "Số điện thoại không hợp lệ (chỉ gồm 9-11 chữ số)!" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
              </Form.Item>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Form.Item name="diaChi" label="Địa chỉ liên hệ / Đơn vị công tác">
                <Input prefix={<HomeOutlined />} placeholder="Ví dụ: Khoa CNTT - Tòa nhà A1" />
              </Form.Item>

              <Form.Item
                name="matKhauMoi"
                label="Đổi mật khẩu mới (Để trống nếu giữ nguyên)"
                rules={[{ min: 6, message: "Mật khẩu mới phải từ 6 ký tự trở lên!" }]}
              >
                <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu mới nếu muốn đổi" />
              </Form.Item>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                style={{ borderRadius: 10, fontWeight: 600, padding: "0 28px" }}
              >
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
