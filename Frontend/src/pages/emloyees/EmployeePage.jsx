import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  Form,
  Popconfirm,
  message,
  Tag,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  ContactsOutlined,
  HomeOutlined,
  PhoneOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import employeeApi from "../../api/employeeApi";
import StatusBadge from "../../components/common/StatusBadge";

export default function EmployeePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data || []);
    } catch (err) {
      message.error("Không thể tải danh sách tài khoản người dùng!");
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingId) {
        await employeeApi.update(editingId, values);
        message.success("Cập nhật tài khoản thành công!");
      } else {
        await employeeApi.create(values);
        message.success("Thêm tài khoản người dùng thành công!");
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Lỗi khi lưu thông tin tài khoản!";
      message.error(errMsg);
    }
  };

  const handleToggleLock = async (record) => {
    try {
      await employeeApi.toggleLock(record.id);
      const nextLocked = record.trangThai !== "LOCKED";
      message.success(
        nextLocked
          ? `Đã khóa tài khoản ${record.hoTen}`
          : `Đã mở khóa tài khoản ${record.hoTen}`
      );
      loadEmployees();
    } catch (err) {
      message.error(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Không thể thay đổi trạng thái tài khoản"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeeApi.delete(id);
      message.success("Đã xóa tài khoản người dùng!");
      loadEmployees();
    } catch (err) {
      message.error("Xóa thất bại!");
    }
  };

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      role: "STAFF",
      trangThai: "ACTIVE",
      matKhau: "123456",
    });
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const filtered = employees.filter((e) => {
    const kw = search.trim().toLowerCase();
    const matchSearch =
      !kw ||
      e.hoTen?.toLowerCase().includes(kw) ||
      e.email?.toLowerCase().includes(kw) ||
      e.soDienThoai?.toLowerCase().includes(kw) ||
      e.tenDangNhap?.toLowerCase().includes(kw);

    const matchRole = roleFilter === "ALL" || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Tra cứu & Quản lý tài khoản người dùng</h1>
          <p className="page-header-sub">
            Tra cứu thông tin liên hệ (Họ tên, Email, SĐT), cấp quyền và quản lý trạng thái tài khoản
          </p>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            size="large"
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Thêm tài khoản mới
          </Button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box" style={{ minWidth: 320 }}>
              <SearchOutlined style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Tra cứu theo họ tên, email, SĐT, tên đăng nhập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 200 }}
              size="large"
              options={[
                { value: "ALL", label: "Tất cả vai trò" },
                { value: "ADMIN", label: "Cán bộ Quản lý (ADMIN)" },
                { value: "STAFF", label: "Giảng viên / Nhân viên" },
              ]}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Họ và tên</th>
              <th>Thông tin liên hệ (US5.2)</th>
              <th>Tên đăng nhập</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              {isAdmin && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6}>
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>Không tìm thấy tài khoản phù hợp</h3>
                    <p>Thử tìm kiếm bằng từ khóa khác</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                      NV{String(e.id).padStart(2, "0")}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {e.hoTen}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {e.chucVu || "Giảng viên / Cán bộ"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, color: "#0f172a" }}>
                      <MailOutlined style={{ marginRight: 6, color: "#4f46e5" }} />
                      {e.email || `${e.tenDangNhap || "user"}@uni.edu.vn`}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#475569", marginTop: 2 }}>
                      <PhoneOutlined style={{ marginRight: 6, color: "#10b981" }} />
                      {e.soDienThoai || "0912345678"}
                      {e.diaChi ? ` • ${e.diaChi}` : ""}
                    </div>
                  </td>
                  <td>
                    <Tag style={{ fontFamily: "monospace", fontSize: 12.5 }}>
                      {e.tenDangNhap || "Chưa cấp"}
                    </Tag>
                  </td>
                  <td>
                    <Tag color={e.role === "ADMIN" ? "volcano" : "blue"} style={{ fontWeight: 600 }}>
                      {e.role === "ADMIN" ? "ADMIN" : "STAFF"}
                    </Tag>
                  </td>
                  <td>
                    <StatusBadge status={e.trangThai || "ACTIVE"} />
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <Tooltip title="Chỉnh sửa thông tin">
                          <button className="action-btn" onClick={() => openEdit(e)}>
                            <EditOutlined />
                          </button>
                        </Tooltip>

                        {e.tenDangNhap && e.tenDangNhap !== "admin" && (
                          <Tooltip
                            title={
                              e.trangThai === "LOCKED"
                                ? "Mở khóa tài khoản"
                                : "Khóa tài khoản"
                            }
                          >
                            <button
                              className="action-btn"
                              style={{
                                color: e.trangThai === "LOCKED" ? "#10b981" : "#f59e0b",
                              }}
                              onClick={() => handleToggleLock(e)}
                            >
                              {e.trangThai === "LOCKED" ? <UnlockOutlined /> : <LockOutlined />}
                            </button>
                          </Tooltip>
                        )}

                        {e.tenDangNhap !== "admin" && (
                          <Popconfirm
                            title="Bạn có chắc chắn muốn xóa tài khoản này?"
                            onConfirm={() => handleDelete(e.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <button className="action-btn danger" title="Xóa">
                              <DeleteOutlined />
                            </button>
                          </Popconfirm>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="info">
            Hiển thị {filtered.length} / {employees.length} tài khoản người dùng
          </span>
        </div>
      </div>

      <Modal
        title={
          editingId
            ? "✏️ Chỉnh sửa thông tin & tài khoản người dùng"
            : "➕ Thêm tài khoản người dùng mới"
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu tài khoản"
        cancelText="Hủy"
        destroyOnClose
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ marginTop: 16 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <Form.Item
              name="hoTen"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="chucVu"
              label="Chức danh / Đơn vị"
              rules={[{ required: true, message: "Vui lòng nhập chức vụ!" }]}
            >
              <Input prefix={<ContactsOutlined />} placeholder="Ví dụ: Giảng viên CNTT" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <Form.Item
              name="email"
              label="Email liên hệ"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="nguyenvana@uni.edu.vn" />
            </Form.Item>

            <Form.Item
              name="soDienThoai"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập SĐT!" },
                { pattern: /^\d{9,11}$/, message: "SĐT chỉ chứa 9-11 chữ số!" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="tenDangNhap"
              label="Tên đăng nhập"
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ví dụ: gv_nguyenvana" />
            </Form.Item>

            <Form.Item
              name="matKhau"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="role" label="Vai trò hệ thống">
              <Select
                suffixIcon={<SafetyCertificateOutlined />}
                options={[
                  { value: "ADMIN", label: "ADMIN (Cán bộ quản lý)" },
                  { value: "STAFF", label: "STAFF (Giảng viên / Người dùng)" },
                ]}
              />
            </Form.Item>

            <Form.Item name="trangThai" label="Trạng thái tài khoản">
              <Select
                options={[
                  { value: "ACTIVE", label: "Đang hoạt động" },
                  { value: "LOCKED", label: "Bị khóa" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item name="diaChi" label="Địa chỉ">
            <Input prefix={<HomeOutlined />} placeholder="Ví dụ: Cầu Giấy, Hà Nội" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
