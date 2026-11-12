import { useState, useEffect } from "react";
import StatusBadge from "../../components/common/StatusBadge";
import borrowApi from "../../api/borrowApi";

export default function BorrowPage() {
  const [borrows, setBorrows] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentName: "", itemBorrowed: "", ngayMuon: "", phoneNumber: "" });

  useEffect(() => {
    loadBorrows();
  }, []);

  const loadBorrows = async () => {
    try {
      const data = await borrowApi.getAll();
      setBorrows(data);
    } catch (err) {
      console.error("Failed to fetch borrows", err);
    }
  };

  const filtered = borrows.filter(
    (b) => b.studentName?.toLowerCase().includes(search.toLowerCase()) || b.itemBorrowed?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      await borrowApi.create(form);
      loadBorrows();
      setShowModal(false);
      setForm({ studentName: "", itemBorrowed: "", ngayMuon: "", phoneNumber: "" });
    } catch (err) {
      console.error("Save failed", err);
      alert("Lỗi khi lưu phiếu mượn!");
    }
  };

  const handleReturn = async (id) => {
    try {
      await borrowApi.update(id, { ...borrows.find(b => b.id === id), status: "RETURNED", ngayTra: new Date().toISOString().split('T')[0] });
      loadBorrows();
    } catch (err) {
      console.error("Return failed", err);
    }
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Quản lý mượn / trả</h1>
          <p className="page-header-sub">Theo dõi tình trạng mượn trả thiết bị</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Tạo phiếu mượn</button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-box">
            <span>🔍</span>
            <input placeholder="Tìm theo người mượn, thiết bị..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Người mượn</th><th>Thiết bị</th><th>Ngày mượn</th><th>Ngày trả</th><th>Trạng thái</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{b.studentName}</td>
                <td>{b.itemBorrowed}</td>
                <td>{b.ngayMuon}</td>
                <td>{b.ngayTra || "—"}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>
                  {b.status === "BORROWED" && (
                    <button className="btn btn-success btn-sm" onClick={() => handleReturn(b.id)}>✅ Trả</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer"><span className="info">Tổng: {filtered.length} phiếu</span></div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Tạo phiếu mượn mới</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Người mượn (Tên sinh viên)</label>
                <input className="form-input" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Nhập tên người mượn" />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input className="form-input" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Nhập SĐT người mượn" />
              </div>
              <div className="form-group">
                <label className="form-label">Thiết bị mượn</label>
                <input className="form-input" value={form.itemBorrowed} onChange={(e) => setForm({ ...form, itemBorrowed: e.target.value })} placeholder="Nhập tên thiết bị" />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày mượn</label>
                <input className="form-input" type="date" value={form.ngayMuon} onChange={(e) => setForm({ ...form, ngayMuon: e.target.value })} />
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
