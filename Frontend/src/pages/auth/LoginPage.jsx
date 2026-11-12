import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message, Typography, Space } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import authApi from "../../api/authApi";

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API đăng nhập với dữ liệu từ Form
      const res = await authApi.login({ 
        tenDangNhap: values.username, 
        matKhau: values.password 
      });

      if (res.success) {
        message.success("Đăng nhập thành công!");
        
        // LƯU Ý QUAN TRỌNG: Lưu toàn bộ object res.data (bao gồm role, hoTen, matKhau)
        // để hệ thống biết ai đang đăng nhập và hiển thị giao diện phù hợp.  [cite: 5, 556-558]
        localStorage.setItem("user", JSON.stringify(res.data));
        
        // Chuyển hướng về trang chủ
        navigate("/");
      } else {
        message.error(res.message || "Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi kết nối máy chủ!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      <div className="login-card">
        
        {/* Phần Header của Form */}
        <div className="logo-section">
          <div className="logo-icon">
            <SafetyCertificateOutlined />
          </div>
          <h1>HỆ THỐNG QUẢN LÝ VẬT TƯ</h1>
          <p>Hệ thống quản lý vật tư và thiết bị</p>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* Nhập tài khoản */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: "var(--text-muted)", marginRight: 8 }} />} 
              placeholder="Tên đăng nhập" 
              className="form-input"
            />
          </Form.Item>

          {/* Nhập mật khẩu */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "var(--text-muted)", marginRight: 8 }} />}
              placeholder="Mật khẩu"
              className="form-input"
            />
          </Form.Item>

          {/* Tiện ích ghi nhớ & quên mật khẩu */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px" }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Ghi nhớ</Checkbox>
            </Form.Item>
            <a href="#" style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
              Quên mật khẩu?
            </a>
          </div>

          {/* Nút đăng nhập */}
          <Form.Item>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "14px" }}>
              <LoginOutlined style={{ marginRight: 8 }} /> ĐĂNG NHẬP
            </button>
          </Form.Item>
        </Form>

        {/* Sạch sẽ hoàn toàn không có khối tài khoản dùng thử */}
        
      </div>
    </div>
  );
}