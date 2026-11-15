import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button, Popconfirm, Tag, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  TeamOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import roomApi from "../../api/roomApi";
import deviceApi from "../../api/deviceApi";
import StatusBadge from "../../components/common/StatusBadge";

export default function RoomPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomList, deviceList] = await Promise.all([
        roomApi.getAll(),
        deviceApi.getAll(),
      ]);
      setRooms(roomList || []);
      setDevices(deviceList || []);
    } catch (err) {
      message.error("Không thể tải danh sách phòng học");
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchKeyword =
      !search.trim() ||
      r.maPhong?.toLowerCase().includes(search.toLowerCase()) ||
      r.tenPhong?.toLowerCase().includes(search.toLowerCase()) ||
      r.viTri?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.trangThai === statusFilter;
    return matchKeyword && matchStatus;
  });

  const getDevicesInRoom = (room) => {
    return devices.filter(
      (d) =>
        (d.maPhong && d.maPhong.toUpperCase() === room.maPhong?.toUpperCase()) ||
        (d.idPhong && room.maPhong?.endsWith(String(d.idPhong)))
    );
  };

  const openAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    form.setFieldsValue({ trangThai: "ACTIVE", sucChua: 60 });
    setIsModalOpen(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    form.setFieldsValue({
      maPhong: room.maPhong,
      tenPhong: room.tenPhong,
      viTri: room.viTri,
      sucChua: room.sucChua,
      trangThai: room.trangThai,
      moTa: room.moTa,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (values) => {
    try {
      if (editingRoom) {
        await roomApi.update(editingRoom.id, values);
        message.success("Cập nhật phòng học thành công");
      } else {
        await roomApi.create(values);
        message.success("Thêm phòng học thành công");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Mã phòng đã tồn tại hoặc thông tin không hợp lệ";
      message.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      await roomApi.delete(id);
      message.success("Đã xóa phòng học");
      loadData();
    } catch (err) {
      message.error("Không thể xóa phòng học");
    }
  };

  const activeCount = rooms.filter((r) => r.trangThai === "ACTIVE").length;
  const maintCount = rooms.filter((r) => r.trangThai === "MAINTENANCE").length;
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.sucChua || 0), 0);

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Quản lý phòng học</h1>
          <p className="page-header-sub">
            Danh mục không gian giảng đường, phòng thực hành và phân bổ thiết bị
          </p>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Thêm phòng học
          </Button>
        )}
      </div>

      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
            <BankOutlined />
          </div>
          <div className="stat-value">{rooms.length}</div>
          <div className="stat-label">Tổng số phòng học</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
            <CheckCircleOutlined />
          </div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Đang sử dụng</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
            <ToolOutlined />
          </div>
          <div className="stat-value">{maintCount}</div>
          <div className="stat-label">Đang bảo trì</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}>
            <TeamOutlined />
          </div>
          <div className="stat-value">{totalCapacity}</div>
          <div className="stat-label">Tổng sức chứa (Sinh viên)</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box" style={{ minWidth: 300 }}>
              <SearchOutlined style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Tìm kiếm theo mã phòng, tên phòng, vị trí..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              size="large"
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "ACTIVE", label: "Đang sử dụng" },
                { value: "MAINTENANCE", label: "Đang bảo trì" },
                { value: "INACTIVE", label: "Ngưng sử dụng" },
              ]}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã phòng</th>
              <th>Tên phòng học</th>
              <th>Vị trí</th>
              <th>Sức chứa</th>
              <th>Thiết bị trong phòng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">🏫</div>
                    <h3>Không tìm thấy phòng học phù hợp</h3>
                    <p>Vui lòng thử lại với từ khóa hoặc bộ lọc khác</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRooms.map((r) => {
                const roomDevices = getDevicesInRoom(r);
                return (
                  <tr key={r.id}>
                    <td>
                      <Tag color="geekblue" style={{ fontWeight: 700, fontSize: 13 }}>
                        {r.maPhong}
                      </Tag>
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {r.tenPhong}
                      {r.moTa && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>
                          {r.moTa}
                        </div>
                      )}
                    </td>
                    <td>{r.viTri || "—"}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.sucChua}</span> chỗ
                    </td>
                    <td>
                      <Button
                        size="small"
                        type="dashed"
                        icon={<EyeOutlined />}
                        onClick={() => setViewingRoom(r)}
                      >
                        {roomDevices.length} thiết bị
                      </Button>
                    </td>
                    <td>
                      <StatusBadge status={r.trangThai} context="room" />
                    </td>
                    <td>
                      <div className="action-btns">
                        {isAdmin && (
                          <>
                            <button
                              className="action-btn"
                              title="Chỉnh sửa phòng học"
                              onClick={() => openEdit(r)}
                            >
                              <EditOutlined />
                            </button>
                            <Popconfirm
                              title="Xác nhận xóa phòng học này?"
                              onConfirm={() => handleDelete(r.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <button className="action-btn danger" title="Xóa phòng học">
                                <DeleteOutlined />
                              </button>
                            </Popconfirm>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="info">
            Hiển thị {filteredRooms.length} / {rooms.length} phòng học
          </span>
        </div>
      </div>

      {/* Modal Thêm / Cập nhật phòng học (US6.1, US6.2) */}
      <Modal
        title={editingRoom ? `Chỉnh sửa phòng học ${editingRoom.maPhong}` : "Thêm phòng học mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu thông tin"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 12 }}>
            <Form.Item
              name="maPhong"
              label="Mã phòng"
              rules={[{ required: true, message: "Vui lòng nhập mã phòng!" }]}
            >
              <Input placeholder="VD: A101" disabled={!!editingRoom} />
            </Form.Item>

            <Form.Item
              name="tenPhong"
              label="Tên phòng học"
              rules={[{ required: true, message: "Vui lòng nhập tên phòng học!" }]}
            >
              <Input placeholder="VD: Phòng học A101" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
            <Form.Item
              name="viTri"
              label="Vị trí"
              rules={[{ required: true, message: "Vui lòng nhập vị trí phòng!" }]}
            >
              <Input placeholder="VD: Tầng 1, Tòa A" />
            </Form.Item>

            <Form.Item
              name="sucChua"
              label="Sức chứa (Số người)"
              rules={[
                { required: true, message: "Vui lòng nhập sức chứa!" },
                {
                  validator: (_, val) =>
                    val && Number.isInteger(Number(val)) && Number(val) > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Sức chứa phải là số nguyên dương")),
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} placeholder="VD: 60" />
            </Form.Item>
          </div>

          <Form.Item
            name="trangThai"
            label="Trạng thái hiện tại"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select
              options={[
                { value: "ACTIVE", label: "Đang sử dụng" },
                { value: "MAINTENANCE", label: "Đang bảo trì" },
                { value: "INACTIVE", label: "Ngưng sử dụng" },
              ]}
            />
          </Form.Item>

          <Form.Item name="moTa" label="Ghi chú / Mô tả trang thiết bị">
            <Input.TextArea rows={2} placeholder="Mô tả thêm về hạ tầng của phòng học..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xem danh sách thiết bị trong phòng */}
      <Modal
        title={viewingRoom ? `Thiết bị tại ${viewingRoom.tenPhong} (${viewingRoom.maPhong})` : ""}
        open={!!viewingRoom}
        onCancel={() => setViewingRoom(null)}
        footer={[
          <Button key="close" onClick={() => setViewingRoom(null)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {viewingRoom && (
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Mã TB</th>
                <th>Tên thiết bị</th>
                <th>Loại</th>
                <th>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {getDevicesInRoom(viewingRoom).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                    Chưa có thiết bị nào được phân bổ tại phòng này
                  </td>
                </tr>
              ) : (
                getDevicesInRoom(viewingRoom).map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                      {d.maThietBi || `TB${String(d.id).padStart(3, "0")}`}
                    </td>
                    <td style={{ fontWeight: 500, color: "#0f172a" }}>{d.name}</td>
                    <td>{d.type}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
