import { useState, useEffect } from "react";
import { Table, Button, Input, Modal, Form, Space, Popconfirm, message, Card, Typography, Tag, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, ContactsOutlined, HomeOutlined, PhoneOutlined, KeyOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import employeeApi from "../../api/employeeApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      message.error("Không thể tải danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      if (editingId) {
        await employeeApi.update(editingId, values);
        message.success("Cập nhật nhân viên thành công!");
      } else {
        await employeeApi.create(values);
        message.success("Thêm nhân viên thành công!");
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (err) {
      console.error("Save failed", err);
      if (err.response && err.response.data && typeof err.response.data === "string") {
        message.error(err.response.data);
      } else {
        message.error("Lỗi khi lưu thông tin!");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await employeeApi.delete(id);
      message.success("Xóa nhân viên thành công!");
      loadEmployees();
    } catch (err) {
      console.error("Delete failed", err);
      message.error("Xóa thất bại!");
    }
  };

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const filtered = employees.filter(
    (e) => e.hoTen?.toLowerCase().includes(search.toLowerCase()) || 
           e.tenDangNhap?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Mã NV",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text strong style={{ color: "var(--primary)" }}>NV{id}</Text>,
    },
    {
      title: "Họ tên",
      dataIndex: "hoTen",
      key: "hoTen",
      render: (text) => <Text style={{ fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "ADMIN" ? "volcano" : "green"}>
          {role === "ADMIN" ? "ADMIN" : "STAFF"}
        </Tag>
      ),
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "tenDangNhap",
      key: "tenDangNhap",
      render: (text) => <Text code>{text || "Chưa cấp"}</Text>,
    },
    {
      title: "Mật khẩu",
      dataIndex: "matKhau",
      key: "matKhau",
      render: (text) => (
        text ? (
          <Input.Password 
            value={text} 
            readOnly 
            bordered={false} 
            style={{ width: 120, padding: 0 }}
          />
        ) : (
          <Text type="secondary">Chưa cấp</Text>
        )
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "diaChi",
      key: "diaChi",
    },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="slide-up" style={{ padding: 24 }}>
      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>Quản lý nhân viên</Title>
            <Text type="secondary">Cấp tài khoản, phân vai trò ADMIN/STAFF và quản trị hệ thống</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={openAdd}
            size="large"
            style={{ borderRadius: 8 }}
          >
            Thêm nhân viên
          </Button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <Input
            placeholder="Tìm kiếm theo họ tên hoặc tên đăng nhập..."
            prefix={<SearchOutlined style={{ color: "var(--text-muted)" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 350, borderRadius: 8 }}
            size="large"
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filtered} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 8 }}
          style={{ borderRadius: 8, overflow: "hidden" }}
        />
      </Card>

      <Modal
        title={editingId ? "✏️ Chỉnh sửa nhân viên & tài khoản" : "➕ Thêm nhân viên & tài khoản mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="hoTen"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên nhân viên!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="chucVu"
            label="Chức danh"
            rules={[{ required: true, message: "Vui lòng nhập chức vụ!" }]}
          >
            <Input prefix={<ContactsOutlined />} placeholder="Ví dụ: Thủ kho, Quản lý..." />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò (Phân quyền)"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            initialValue="STAFF"
          >
            <Select suffixIcon={<SafetyCertificateOutlined />}>
              <Option value="ADMIN">ADMIN (Quản trị viên)</Option>
              <Option value="STAFF">STAFF (Nhân viên)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tenDangNhap"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ví dụ: nv_nguyenvana" />
          </Form.Item>

          <Form.Item
            name="matKhau"
            label="Mật khẩu (Reset mật khẩu)"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            initialValue="123456"
          >
            <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="diaChi"
            label="Địa chỉ"
          >
            <Input prefix={<HomeOutlined />} placeholder="Ví dụ: 123 Đường Láng, Hà Nội" />
          </Form.Item>

          <Form.Item
            name="soDienThoai"
            label="Số điện thoại"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Ví dụ: 0987654321" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}