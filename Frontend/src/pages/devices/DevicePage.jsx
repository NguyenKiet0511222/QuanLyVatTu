import { useState, useEffect } from "react";
import StatusBadge from "../../components/common/StatusBadge";
import deviceApi from "../../api/deviceApi";
import axiosClient from "../../api/axiosClient";
import { Alert, Button, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";

export default function DevicePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toUpperCase();

  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", type: "", idPhong: "", status: "GOOD" });
  
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDevices();
    if (userRole === "ADMIN") {
      loadNotifications();
    }
  }, []);

  const loadDevices = async () => {
    try {
      const data = await deviceApi.getAll();
      setDevices(data);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await axiosClient.get("notifications");
      setNotifications(data.filter(n => !n.daDoc));
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAllRead = async () => {
    try {
      await axiosClient.put("notifications/mark-all-read");
      setNotifications([]);
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  const filtered = devices.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.id?.toString().includes(search)
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", type: "", idPhong: "", status: "GOOD" });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditItem(d);
    setForm({ name: d.name, type: d.type, idPhong: d.idPhong, status: d.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await deviceApi.update(editItem.id, form);
      } else {
        await deviceApi.create(form);
      }
      loadDevices();
      setShowModal(false);
    } catch (err) {
      console.error("Save failed", err);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa thiết bị này?")) {
      try {
        await deviceApi.delete(id);
        loadDevices();
      } catch (err) {
        console.error("Delete failed", err);
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Quản lý thiết bị</h1>
          <p className="page-header-sub">Tổng cộng {devices.length} thiết bị trong hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Thêm thiết bị</button>
      </div>

      {userRole === "ADMIN" && notifications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Alert
            message="Thông báo thao tác từ Nhân viên"
            description={
              <div>
                <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                  {notifications.map(n => (
                    <li key={n.id} style={{ marginBottom: 4 }}>
                      <strong>{new Date(n.thoiGian).toLocaleString('vi-VN')}</strong>: {n.noiDung}
                    </li>
                  ))}
                </ul>
                <Button size="small" type="primary" onClick={markAllRead}>Đã kiểm tra (Xóa thông báo)</Button>
              </div>
            }
            type="warning"
            showIcon
            icon={<BellOutlined />}
            style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          />
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box">
              <span>🔍</span>
              <input placeholder="Tìm kiếm thiết bị..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã TB</th>
              <th>Tên thiết bị</th>
              <th>Loại</th>
              <th>Phòng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📭</div><h3>Không tìm thấy thiết bị</h3></div></td></tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontFamily: "var(--mono, monospace)", color: "var(--primary)" }}>TB{d.id.toString().padStart(3, '0')}</td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{d.name}</td>
                  <td>{d.type}</td>
                  <td>{d.idPhong}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn" title="Sửa" onClick={() => openEdit(d)}>✏️</button>
                      <button className="action-btn danger" title="Xóa" onClick={() => handleDelete(d.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="table-footer">
          <span className="info">Hiển thị {filtered.length} / {devices.length} thiết bị</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? "✏️ Sửa thiết bị" : "➕ Thêm thiết bị mới"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Tên thiết bị</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Laptop HP Pavilion" />
              </div>
              <div className="form-group">
                <label className="form-label">Loại thiết bị</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="">-- Chọn loại --</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Máy chiếu">Máy chiếu</option>
                  <option value="Camera">Camera</option>
                  <option value="Máy in">Máy in</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Màn hình">Màn hình</option>
                  <option value="PC">PC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ID Phòng</label>
                <input className="form-input" value={form.idPhong} onChange={(e) => setForm({ ...form, idPhong: e.target.value })} placeholder="VD: 1" type="number" />
              </div>
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="GOOD">Tốt</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="BROKEN">Hỏng</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
