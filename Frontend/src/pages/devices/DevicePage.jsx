import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Popconfirm,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  StopOutlined,
  DesktopOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  ToolOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import StatusBadge from "../../components/common/StatusBadge";
import deviceApi from "../../api/deviceApi";
import roomApi from "../../api/roomApi";

export default function DevicePage() {
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modal Thêm / Sửa thiết bị (US7.1, US7.2)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();

  // Modal Thanh lý thiết bị (US7.4)
  const [liquidateTarget, setLiquidateTarget] = useState(null);
  const [liquidateReason, setLiquidateReason] = useState("");
  const [liquidating, setLiquidating] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devData, roomData] = await Promise.all([
        deviceApi.getAll(),
        roomApi.getAll(),
      ]);
      setDevices(devData || []);
      setRooms(roomData || []);
    } catch (err) {
      message.error("Không thể tải dữ liệu thiết bị");
    }
  };

  const filtered = devices.filter((d) => {
    const code = d.maThietBi || `TB${String(d.id).padStart(3, "0")}`;
    const matchSearch =
      !search.trim() ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase()) ||
      d.type?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
    const roomCode = d.maPhong || (d.idPhong ? `P${d.idPhong}` : "");
    const matchRoom =
      roomFilter === "ALL" ||
      roomCode === roomFilter ||
      String(d.idPhong) === String(roomFilter);
    const matchType = typeFilter === "ALL" || d.type === typeFilter;

    return matchSearch && matchStatus && matchRoom && matchType;
  });

  const openAdd = () => {
    setEditItem(null);
    form.resetFields();
    const nextCode = `TB${String(devices.length + 1).padStart(3, "0")}`;
    form.setFieldsValue({
      maThietBi: nextCode,
      status: "GOOD",
      ngayNhap: new Date().toISOString().split("T")[0],
      maPhong: rooms[0]?.maPhong || "A101",
    });
    setIsModalOpen(true);
  };

  const openEdit = (d) => {
    setEditItem(d);
    form.setFieldsValue({
      maThietBi: d.maThietBi || `TB${String(d.id).padStart(3, "0")}`,
      name: d.name,
      type: d.type,
      maPhong: d.maPhong || (d.idPhong ? `A${d.idPhong}` : "A101"),
      ngayNhap: d.ngayNhap || new Date().toISOString().split("T")[0],
      status: d.status,
      moTa: d.moTa,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (values) => {
    try {
      // Suy ra idPhong từ maPhong (VD: A101 -> 101) để tương thích ngược
      const numericRoom = parseInt(String(values.maPhong).replace(/\D/g, ""), 10) || 101;
      const payload = {
        ...values,
        idPhong: numericRoom,
      };

      if (editItem) {
        await deviceApi.update(editItem.id, payload);
        message.success("Cập nhật thiết bị thành công");
      } else {
        await deviceApi.create(payload);
        message.success("Thêm thiết bị thành công");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Không thể lưu thiết bị, vui lòng kiểm tra lại mã thiết bị!";
      message.error(errMsg);
    }
  };

  const openLiquidateModal = (device) => {
    if (device.status === "BORROWED") {
      message.error("Không thể thanh lý thiết bị đang được mượn");
      return;
    }
    setLiquidateTarget(device);
    setLiquidateReason("");
  };

  const handleConfirmLiquidate = async () => {
    if (!liquidateReason.trim()) {
      message.error("Vui lòng nhập lý do thanh lý thiết bị!");
      return;
    }
    setLiquidating(true);
    try {
      await deviceApi.liquidate(liquidateTarget.id, {
        lyDoThanhLy: liquidateReason.trim(),
      });
      message.success("Thanh lý thiết bị thành công");
      setLiquidateTarget(null);
      loadData();
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Không thể thanh lý thiết bị đang được mượn";
      message.error(errMsg);
    } finally {
      setLiquidating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deviceApi.delete(id);
      message.success("Đã xóa thiết bị khỏi hệ thống");
      loadData();
    } catch (err) {
      message.error("Xóa thiết bị thất bại!");
    }
  };

  const countGood = devices.filter((d) => d.status === "GOOD").length;
  const countBorrowed = devices.filter((d) => d.status === "BORROWED").length;
  const countMaint = devices.filter(
    (d) => d.status === "MAINTENANCE" || d.status === "BROKEN"
  ).length;
  const countLiquidated = devices.filter((d) => d.status === "LIQUIDATED").length;

  const uniqueTypes = Array.from(new Set(devices.map((d) => d.type).filter(Boolean)));

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Quản lý thiết bị & tài sản</h1>
          <p className="page-header-sub">
            Tra cứu kho thiết bị trực tuyến, cập nhật hiện trạng và thanh lý tài sản
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openAdd}
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          Thêm thiết bị mới
        </Button>
      </div>

      {/* Bộ thẻ thống kê nhanh theo trạng thái */}
      <div className="stats-grid">
        <div
          className="stat-card"
          onClick={() => setStatusFilter("ALL")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
            <DesktopOutlined />
          </div>
          <div className="stat-value">{devices.length}</div>
          <div className="stat-label">Tổng số thiết bị</div>
        </div>
        <div
          className="stat-card"
          onClick={() => setStatusFilter("GOOD")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
            <CheckCircleOutlined />
          </div>
          <div className="stat-value">{countGood}</div>
          <div className="stat-label">Sẵn sàng sử dụng</div>
        </div>
        <div
          className="stat-card"
          onClick={() => setStatusFilter("BORROWED")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon" style={{ background: "#eff6ff", color: "#3b82f6" }}>
            <SwapOutlined />
          </div>
          <div className="stat-value">{countBorrowed}</div>
          <div className="stat-label">Đang được mượn</div>
        </div>
        <div
          className="stat-card"
          onClick={() => setStatusFilter("MAINTENANCE")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
            <ToolOutlined />
          </div>
          <div className="stat-value">{countMaint}</div>
          <div className="stat-label">Đang bảo trì / Hỏng</div>
        </div>
        <div
          className="stat-card"
          onClick={() => setStatusFilter("LIQUIDATED")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon" style={{ background: "#f1f5f9", color: "#64748b" }}>
            <StopOutlined />
          </div>
          <div className="stat-value">{countLiquidated}</div>
          <div className="stat-label">Đã thanh lý</div>
        </div>
      </div>

      {/* Bảng dữ liệu & Bộ lọc tìm kiếm (US7.3) */}
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box" style={{ minWidth: 280 }}>
              <SearchOutlined style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Tìm theo mã TB, tên thiết bị..."
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
                { value: "ALL", label: "Tất cả tình trạng" },
                { value: "GOOD", label: "Sẵn sàng" },
                { value: "BORROWED", label: "Đang được mượn" },
                { value: "MAINTENANCE", label: "Đang bảo trì" },
                { value: "BROKEN", label: "Hỏng" },
                { value: "LIQUIDATED", label: "Đã thanh lý" },
              ]}
            />

            <Select
              value={roomFilter}
              onChange={setRoomFilter}
              style={{ width: 165 }}
              size="large"
              options={[
                { value: "ALL", label: "Tất cả phòng học" },
                ...rooms.map((r) => ({
                  value: r.maPhong,
                  label: `Phòng ${r.maPhong}`,
                })),
              ]}
            />

            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 165 }}
              size="large"
              options={[
                { value: "ALL", label: "Tất cả loại TB" },
                ...uniqueTypes.map((t) => ({ value: t, label: t })),
              ]}
            />

            {(search || statusFilter !== "ALL" || roomFilter !== "ALL" || typeFilter !== "ALL") && (
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setRoomFilter("ALL");
                  setTypeFilter("ALL");
                }}
              >
                Đặt lại
              </Button>
            )}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã thiết bị</th>
              <th>Tên thiết bị</th>
              <th>Loại thiết bị</th>
              <th>Phòng học</th>
              <th>Ngày nhập</th>
              <th>Tình trạng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>Không tìm thấy thiết bị phù hợp</h3>
                    <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc tình trạng</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                const code = d.maThietBi || `TB${String(d.id).padStart(3, "0")}`;
                const roomLabel = d.maPhong || (d.idPhong ? `Phòng ${d.idPhong}` : "Kho chung");
                return (
                  <tr key={d.id}>
                    <td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "var(--primary)",
                          background: "#eef2ff",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {code}
                      </span>
                    </td>
                    <td>
                      <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {d.name}
                      </div>
                      {d.status === "LIQUIDATED" && d.lyDoThanhLy && (
                        <div style={{ fontSize: 11.5, color: "#ef4444", marginTop: 2 }}>
                          Lý do thanh lý: {d.lyDoThanhLy}
                        </div>
                      )}
                    </td>
                    <td>
                      <Tag>{d.type || "Khác"}</Tag>
                    </td>
                    <td>
                      <Tag color="blue" style={{ fontWeight: 600 }}>
                        {roomLabel}
                      </Tag>
                    </td>
                    <td>{d.ngayNhap || "01/09/2026"}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      <div className="action-btns">
                        <Tooltip title="Chỉnh sửa thiết bị">
                          <button className="action-btn" onClick={() => openEdit(d)}>
                            <EditOutlined />
                          </button>
                        </Tooltip>

                        {isAdmin && d.status !== "LIQUIDATED" && (
                          <Tooltip title="Thanh lý thiết bị (US7.4)">
                            <button
                              className="action-btn"
                              style={{ color: "#d97706", borderColor: "#fde68a" }}
                              onClick={() => openLiquidateModal(d)}
                            >
                              <StopOutlined />
                            </button>
                          </Tooltip>
                        )}

                        {isAdmin && (
                          <Popconfirm
                            title="Bạn có chắc chắn muốn xóa thiết bị này?"
                            onConfirm={() => handleDelete(d.id)}
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="info">
            Hiển thị {filtered.length} / {devices.length} thiết bị
          </span>
        </div>
      </div>

      {/* Modal Thêm / Chỉnh sửa thiết bị (US7.1, US7.2) */}
      <Modal
        title={editItem ? `Cập nhật thiết bị ${editItem.maThietBi || ""}` : "Thêm thiết bị mới vào kho"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Lưu thiết bị"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 12 }}>
            <Form.Item
              name="maThietBi"
              label="Mã thiết bị"
              rules={[{ required: true, message: "Vui lòng nhập mã thiết bị!" }]}
            >
              <Input placeholder="VD: TB001" disabled={!!editItem} />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên thiết bị"
              rules={[{ required: true, message: "Vui lòng nhập tên thiết bị!" }]}
            >
              <Input placeholder="VD: Máy chiếu Epson EB-X06" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="type"
              label="Loại thiết bị"
              rules={[{ required: true, message: "Vui lòng chọn loại thiết bị!" }]}
            >
              <Select
                placeholder="Chọn loại thiết bị"
                options={[
                  { value: "Máy chiếu", label: "Máy chiếu (Projector)" },
                  { value: "Laptop", label: "Laptop" },
                  { value: "Camera", label: "Camera / Webcam" },
                  { value: "Âm thanh", label: "Thiết bị Âm thanh / Micro" },
                  { value: "Máy in", label: "Máy in / Máy quét" },
                  { value: "Thiết bị mạng", label: "Thiết bị mạng (Router/Switch)" },
                  { value: "Thiết bị điện", label: "Điều hòa / Thiết bị điện" },
                  { value: "Other", label: "Thiết bị khác" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="maPhong"
              label="Phòng học quản lý"
              rules={[{ required: true, message: "Vui lòng chọn phòng học!" }]}
            >
              <Select
                placeholder="Chọn phòng học"
                options={
                  rooms.length > 0
                    ? rooms.map((r) => ({
                        value: r.maPhong,
                        label: `${r.maPhong} - ${r.tenPhong}`,
                      }))
                    : [
                        { value: "A101", label: "A101 - Phòng học A101" },
                        { value: "A102", label: "A102 - Phòng học A102" },
                        { value: "B201", label: "B201 - Phòng máy B201" },
                      ]
                }
              />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="ngayNhap"
              label="Ngày nhập kho"
              rules={[{ required: true, message: "Vui lòng chọn ngày nhập!" }]}
            >
              <Input type="date" max={new Date().toISOString().split("T")[0]} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Tình trạng thiết bị"
              rules={[{ required: true, message: "Vui lòng chọn tình trạng!" }]}
            >
              <Select
                options={[
                  { value: "GOOD", label: "Sẵn sàng (Hoạt động tốt)" },
                  { value: "BORROWED", label: "Đang được mượn" },
                  { value: "MAINTENANCE", label: "Đang bảo trì" },
                  { value: "BROKEN", label: "Hỏng" },
                  { value: "LIQUIDATED", label: "Đã thanh lý" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item name="moTa" label="Ghi chú / Thông số kỹ thuật">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú hoặc cấu hình chi tiết..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xác nhận Thanh lý thiết bị (US7.4) */}
      <Modal
        title="⚠️ Xác nhận thanh lý thiết bị (US7.4)"
        open={!!liquidateTarget}
        onCancel={() => setLiquidateTarget(null)}
        onOk={handleConfirmLiquidate}
        confirmLoading={liquidating}
        okText="Xác nhận thanh lý"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        {liquidateTarget && (
          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 12, fontSize: 14, color: "#0f172a" }}>
              Bạn có chắc chắn muốn thanh lý thiết bị{" "}
              <b>
                {liquidateTarget.name} (
                {liquidateTarget.maThietBi || `TB${String(liquidateTarget.id).padStart(3, "0")}`})
              </b>{" "}
              không? Sau khi thanh lý, trạng thái sẽ chuyển thành <b>Đã thanh lý</b> và không còn
              được cho mượn.
            </p>
            <div className="form-group">
              <label className="form-label">
                Lý do thanh lý <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <Input.TextArea
                rows={3}
                value={liquidateReason}
                onChange={(e) => setLiquidateReason(e.target.value)}
                placeholder="VD: Thiết bị hỏng nặng không thể sửa chữa hoặc đã hết hạn khấu hao..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
