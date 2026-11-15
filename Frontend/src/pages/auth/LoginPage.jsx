import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, message, Tabs, Alert, Divider, Tag } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import authApi from "../../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("LOGIN"); // LOGIN | REGISTER | FORGOT | RESET
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [resetData, setResetData] = useState({ email: "", resetToken: "" });

  const onLoginFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.login({
        tenDangNhap: values.username,
        matKhau: values.password,
      });

      if (res.success) {
        message.success("Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/");
      } else {
        message.error(res.message || "Email hoặc mật khẩu không chính xác!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email hoặc mật khẩu không chính xác!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        hoTen: values.hoTen,
        email: values.email,
        soDienThoai: values.soDienThoai,
        tenDangNhap: values.tenDangNhap,
        matKhau: values.matKhau,
        xacNhanMatKhau: values.xacNhanMatKhau,
      });

      if (res.success) {
        message.success("Đăng ký tài khoản thành công!");
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/");
      } else {
        message.error(res.message || "Đăng ký không thành công");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email hoặc tên đăng nhập đã được sử dụng!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onForgotFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: values.email });
      if (res.success) {
        message.success(res.message || "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn");
        setResetData({
          email: values.email,
          resetToken: res.data?.resetToken || "",
        });
        resetForm.setFieldsValue({
          resetToken: res.data?.resetToken || "",
        });
        setMode("RESET");
      } else {
        message.error(res.message || "Email không tồn tại trong hệ thống");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email không tồn tại trong hệ thống";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onResetFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        email: resetData.email,
        resetToken: values.resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      if (res.success) {
        message.success("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
        setMode("LOGIN");
      } else {
        message.error(res.message || "Không thể đặt lại mật khẩu");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Liên kết đã hết hạn hoặc không hợp lệ";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (u, p) => {
    loginForm.setFieldsValue({ username: u, password: p });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon">
            <SafetyCertificateOutlined />
          </div>
          <h1>HỆ THỐNG QUẢN LÝ THIẾT BỊ</h1>
          <p>Quản lý thiết bị phòng học, mượn trả và bảo trì tập trung</p>
        </div>

        {(mode === "LOGIN" || mode === "REGISTER") && (
          <Tabs
            activeKey={mode}
            onChange={(k) => setMode(k)}
            centered
            items={[
              {
                key: "LOGIN",
                label: (
                  <span>
                    <LoginOutlined /> Đăng nhập
                  </span>
                ),
              },
              {
                key: "REGISTER",
                label: (
                  <span>
                    <UserAddOutlined /> Đăng ký tài khoản
                  </span>
                ),
              },
            ]}
          />
        )}

        {mode === "LOGIN" && (
          <>
            <Form
              form={loginForm}
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={onLoginFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="Email hoặc Tên đăng nhập"
                rules={[{ required: true, message: "Vui lòng nhập email hoặc tên đăng nhập!" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Nhập email hoặc tên đăng nhập (VD: admin)"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ fontSize: 13 }}>Duy trì đăng nhập</Checkbox>
                </Form.Item>
                <Button
                  type="link"
                  style={{ padding: 0, fontSize: 13, fontWeight: 600 }}
                  onClick={() => setMode("FORGOT")}
                >
                  Quên mật khẩu?
                </Button>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<LoginOutlined />}
                style={{ height: 44, fontWeight: 700, borderRadius: 10 }}
              >
                ĐĂNG NHẬP HỆ THỐNG
              </Button>
            </Form>

            <Divider style={{ margin: "20px 0 12px", fontSize: 12, color: "#94a3b8" }}>
              Điền nhanh tài khoản kiểm thử
            </Divider>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Tag
                color="indigo"
                style={{ cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}
                onClick={() => fillDemoAccount("admin", "123456")}
              >
                🔑 Cán bộ Quản lý: <b>admin / 123456</b>
              </Tag>
              <Tag
                color="cyan"
                style={{ cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}
                onClick={() => fillDemoAccount("staff1", "123456")}
              >
                👤 Giảng viên: <b>staff1 / 123456</b>
              </Tag>
            </div>
          </>
        )}

        {mode === "REGISTER" && (
          <Form
            form={registerForm}
            name="register_form"
            onFinish={onRegisterFinish}
            layout="vertical"
            size="middle"
          >
            <Form.Item
              name="hoTen"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="name@example.com" />
              </Form.Item>

              <Form.Item
                name="soDienThoai"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập SĐT!" },
                  { pattern: /^\d{9,11}$/, message: "Số điện thoại chỉ chứa 9-11 chữ số!" },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
              </Form.Item>
            </div>

            <Form.Item name="tenDangNhap" label="Tên đăng nhập (Tùy chọn)">
              <Input prefix={<UserOutlined />} placeholder="Bỏ trống để tự tạo từ email" />
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Form.Item
                name="matKhau"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
              </Form.Item>

              <Form.Item
                name="xacNhanMatKhau"
                label="Xác nhận mật khẩu"
                dependencies={["matKhau"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("matKhau") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
              </Form.Item>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<UserAddOutlined />}
              style={{ height: 42, fontWeight: 700, borderRadius: 10, marginTop: 6 }}
            >
              ĐĂNG KÝ TÀI KHOẢN
            </Button>
          </Form>
        )}

        {mode === "FORGOT" && (
          <div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => setMode("LOGIN")}
              style={{ padding: 0, marginBottom: 12 }}
            >
              Quay lại đăng nhập
            </Button>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Khôi phục mật khẩu</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
              Nhập địa chỉ email đã đăng ký tài khoản để nhận mã xác thực đặt lại mật khẩu.
            </p>
            <Form form={forgotForm} layout="vertical" onFinish={onForgotFinish} size="large">
              <Form.Item
                name="email"
                label="Email đã đăng ký"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="VD: admin@uni.edu.vn" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 42, fontWeight: 600 }}
              >
                Gửi yêu cầu khôi phục
              </Button>
            </Form>
          </div>
        )}

        {mode === "RESET" && (
          <div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => setMode("FORGOT")}
              style={{ padding: 0, marginBottom: 12 }}
            >
              Gửi lại yêu cầu
            </Button>
            <Alert
              type="success"
              showIcon
              message="Liên kết đặt lại mật khẩu đã được gửi đến email của bạn"
              description={`Mã xác thực khôi phục cho ${resetData.email}: ${resetData.resetToken}`}
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
            <Form form={resetForm} layout="vertical" onFinish={onResetFinish} size="middle">
              <Form.Item
                name="resetToken"
                label="Mã xác thực khôi phục"
                rules={[{ required: true, message: "Vui lòng nhập mã xác thực!" }]}
              >
                <Input prefix={<KeyOutlined />} />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{ height: 42, fontWeight: 600 }}
              >
                Đặt lại mật khẩu
              </Button>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
