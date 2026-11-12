import { useState, useEffect } from "react";
import StatusBadge from "../../components/common/StatusBadge";
import maintenanceApi from "../../api/maintenanceApi";
export default function MaintenancePage() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ deviceId: "", description: "", imageUrl: "" });

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await maintenanceApi.getAll();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch maintenance items", err);
    }
  };

  const handleSave = async () => {
    try {
      await maintenanceApi.create({
        description: form.description,
        status: "PENDING",
        imageUrl: form.imageUrl,
        device: { id: parseInt(form.deviceId) }
      });
      loadItems();
      setShowModal(false);
      setForm({ deviceId: "", description: "", imageUrl: "" });
    } catch (err) {
      console.error("Save failed", err);
      alert("Lỗi khi tạo phiếu bảo trì!");
    }
  };

  const markDone = async (id) => {
    if (confirm("Xác nhận đã hoàn thành xử lý sự cố này và đưa thiết bị vào sử dụng lại?")) {
      try {
        await maintenanceApi.updateStatus(id, "DONE");
        loadItems();
      } catch (err) {
        console.error("Failed to update status", err);
        alert("Lỗi khi cập nhật trạng thái bảo trì!");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Quản lý bảo trì</h1>
          <p className="page-header-sub">Theo dõi lịch bảo trì thiết bị</p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Tạo phiếu bảo trì</button>
        )}
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Thiết bị (ID)</th><th>Hình ảnh</th><th>Mô tả sự cố</th><th>Trạng thái</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{i.device?.name || i.device?.id || "N/A"}</td>
                <td>
                  {i.imageUrl ? (
                    <img src={i.imageUrl} alt="Sự cố" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
                  ) : (
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Không có</span>
                  )}
                </td>
                <td>{i.description}</td>
                <td><StatusBadge status={i.status} /></td>
                <td>
                  {i.status === "PENDING" && isAdmin && (
                    <button className="btn btn-success btn-sm" onClick={() => markDone(i.id)}>✅ Hoàn tất</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Tạo phiếu bảo trì</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">ID Thiết bị</label><input className="form-input" type="number" value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} placeholder="Nhập ID thiết bị (VD: 1)" /></div>
              <div className="form-group"><label className="form-label">Mô tả sự cố</label><input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết lỗi" /></div>
              <div className="form-group"><label className="form-label">Hình ảnh minh họa</label><input className="form-input" type="file" accept="image/*" onChange={handleImageChange} />
                {form.imageUrl && <img src={form.imageUrl} alt="Preview" style={{ marginTop: "10px", maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }} />}
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
