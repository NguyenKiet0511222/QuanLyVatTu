import { useState, useEffect } from "react";
import deviceApi from "../../api/deviceApi";
import StatusBadge from "../../components/common/StatusBadge";

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toUpperCase();

  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalFilter, setModalFilter] = useState("ALL");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await deviceApi.getAll();
        setDevices(data);
      } catch (err) {
        console.error("Failed to fetch devices", err);
      }
    };
    fetchDevices();
  }, []);

  const goodCount = devices.filter(d => d.status === "GOOD").length;
  const maintenanceCount = devices.filter(d => d.status === "MAINTENANCE").length;
  const brokenCount = devices.filter(d => d.status === "BROKEN").length;

  const stats = [
    { title: "Tổng thiết bị", value: devices.length, icon: "💻", color: "#6366f1", filter: "ALL" },
    { title: "Đang hoạt động", value: goodCount, icon: "✅", color: "#22c55e", filter: "GOOD" },
    { title: "Đang bảo trì", value: maintenanceCount, icon: "🔧", color: "#f59e0b", filter: "MAINTENANCE" },
    { title: "Thiết bị hỏng", value: brokenCount, icon: "❌", color: "#ef4444", filter: "BROKEN" },
  ];

  const handleStatClick = (stat) => {
    setModalFilter(stat.filter);
    setModalTitle(stat.title);
    setShowModal(true);
  };

  const recentBorrows = [
    { id: 1, nguoi: "Nguyễn Văn An", thietBi: "Laptop Dell XPS 15", ngay: "16/05/2026", trangThai: "BORROWING" },
    { id: 2, nguoi: "Trần Thị Bình", thietBi: "Máy chiếu Epson", ngay: "15/05/2026", trangThai: "RETURNED" },
    { id: 3, nguoi: "Lê Hoàng Duy", thietBi: "Camera Sony A7III", ngay: "15/05/2026", trangThai: "BORROWING" },
    { id: 4, nguoi: "Phạm Minh Tuấn", thietBi: "iPad Pro 12.9", ngay: "14/05/2026", trangThai: "RETURNED" },
    { id: 5, nguoi: "Hoàng Thị Mai", thietBi: "Máy in Canon LBP", ngay: "14/05/2026", trangThai: "BORROWING" },
  ];

  const statusBadge = (s) => {
    if (s === "BORROWING") return <span className="badge badge-info">Đang mượn</span>;
    return <span className="badge badge-success">Đã trả</span>;
  };

  // --- HÀM TÍNH TOÁN BIỂU ĐỒ TRÒN (ACTIVITY RINGS) ---
  const total = devices.length || 1;
  const rOuter = 55;
  const rMiddle = 42;
  const rInner = 29;

  const circOuter = 2 * Math.PI * rOuter;
  const circMiddle = 2 * Math.PI * rMiddle;
  const circInner = 2 * Math.PI * rInner;

  const offsetOuter = circOuter - (goodCount / total) * circOuter;
  const offsetMiddle = circMiddle - (maintenanceCount / total) * circMiddle;
  const offsetInner = circInner - (brokenCount / total) * circInner;

  const pctGood = Math.round((goodCount / total) * 100);
  const pctMaint = Math.round((maintenanceCount / total) * 100);
  const pctBroken = Math.round((brokenCount / total) * 100);

  // --- PHÂN BỔ THIẾT BỊ THEO PHÒNG HỌC ---
  const displayRoomData = devices.length > 0
    ? Object.entries(devices.reduce((acc, d) => {
        const room = d.idPhong ? `Phòng ${d.idPhong}` : "Khác";
        acc[room] = (acc[room] || 0) + 1;
        return acc;
      }, {})).map(([room, count]) => ({ room, count })).sort((a, b) => b.count - a.count).slice(0, 6)
    : [
        { room: "Phòng 101", count: 8 },
        { room: "Phòng 102", count: 12 },
        { room: "Phòng 201", count: 15 },
        { room: "Phòng 202", count: 9 },
        { room: "Phòng 301", count: 6 },
        { room: "Phòng 302", count: 4 }
      ];

  // --- DỮ LIỆU TÀI CHÍNH ADMIN (FINANCE BAR CHART) ---
  const financeData = [
    { month: "Tháng 2", dt: 38000000, cp: 8000000 },
    { month: "Tháng 3", dt: 42000000, cp: 10000000 },
    { month: "Tháng 4", dt: 48000000, cp: 15000000 },
    { month: "Tháng 5", dt: 45500000, cp: 12000000 }
  ];

  const maxFinanceVal = 60000000;
  const getFinanceY = (val) => 160 - (val / maxFinanceVal) * 125;
  const getFinanceHeight = (val) => (val / maxFinanceVal) * 125;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Tổng quan hệ thống</h1>
          <p className="page-header-sub">Chào mừng trở lại! Đây là tình hình hôm nay.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.title} onClick={() => handleStatClick(s)} style={{ cursor: "pointer" }}>
            <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.title}</div>
          </div>
        ))}
      </div>

      {/* --- BIỂU ĐỒ BÁO CÁO TỔNG QUAN --- */}
      <div className="charts-grid">
        {/* Biểu đồ 1: Donut phân bổ thiết bị */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <span>📊 Trạng thái thiết bị</span>
            </h3>
            <p className="chart-subtitle">Tỷ lệ thiết bị đang hoạt động, bảo trì và hỏng hóc</p>
          </div>
          <div className="chart-body">
            <svg viewBox="0 0 160 160" style={{ width: "160px", height: "160px" }}>
              {/* Vòng ngoài: Hoạt động */}
              <circle cx="80" cy="80" r={rOuter} className="donut-ring-bg" />
              <circle 
                cx="80" cy="80" r={rOuter} 
                className="donut-ring-fg" 
                style={{
                  stroke: "var(--success)",
                  strokeDasharray: circOuter,
                  strokeDashoffset: offsetOuter
                }} 
              />

              {/* Vòng giữa: Bảo trì */}
              <circle cx="80" cy="80" r={rMiddle} className="donut-ring-bg" />
              <circle 
                cx="80" cy="80" r={rMiddle} 
                className="donut-ring-fg" 
                style={{
                  stroke: "var(--warning)",
                  strokeDasharray: circMiddle,
                  strokeDashoffset: offsetMiddle
                }} 
              />

              {/* Vòng trong: Hỏng */}
              <circle cx="80" cy="80" r={rInner} className="donut-ring-bg" />
              <circle 
                cx="80" cy="80" r={rInner} 
                className="donut-ring-fg" 
                style={{
                  stroke: "var(--danger)",
                  strokeDasharray: circInner,
                  strokeDashoffset: offsetInner
                }} 
              />
            </svg>
            <div className="gauge-center-text">
              <div className="gauge-center-val">{devices.length}</div>
              <div className="gauge-center-lbl">Thiết bị</div>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: "var(--success)" }} />
              <span>Hoạt động ({pctGood}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "var(--warning)" }} />
              <span>Bảo trì ({pctMaint}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "var(--danger)" }} />
              <span>Hỏng ({pctBroken}%)</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ 2: Phân bổ thiết bị theo phòng học */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <span>🏫 Phân bổ thiết bị theo phòng học</span>
            </h3>
            <p className="chart-subtitle">Số lượng thiết bị phân bố tại các phòng học & giảng đường</p>
          </div>
          <div className="chart-body" style={{ display: "block" }}>
            <svg viewBox="0 0 500 200" className="svg-chart-container" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="roomBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary)"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>

              {displayRoomData.map((r, idx) => {
                const y = 15 + idx * 30;
                const maxRoomCount = Math.max(...displayRoomData.map(item => item.count), 1);
                const barWidth = (r.count / maxRoomCount) * 330;

                return (
                  <g key={`room-bar-${idx}`}>
                    {/* Tên phòng */}
                    <text 
                      x="80" 
                      y={y + 10} 
                      textAnchor="end" 
                      className="chart-axis-text" 
                      style={{ fontWeight: 600, fill: "var(--text-secondary)" }}
                    >
                      {r.room}
                    </text>

                    {/* Vạch nền xám */}
                    <rect 
                      x="95" 
                      y={y} 
                      width="330" 
                      height="12" 
                      fill="var(--border)" 
                      opacity="0.3"
                      rx="6" 
                    />

                    {/* Vạch màu thực tế */}
                    <rect 
                      x="95" 
                      y={y} 
                      width={barWidth} 
                      height="12" 
                      fill="url(#roomBarGrad)" 
                      rx="6" 
                      className="bar-chart-rect"
                    />

                    {/* Số lượng */}
                    <text 
                      x={95 + barWidth + 8} 
                      y={y + 10} 
                      className="chart-axis-text" 
                      style={{ fill: "var(--text-primary)", fontWeight: 700 }}
                    >
                      {r.count} TB
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="chart-legend" style={{ marginTop: 0 }}>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "linear-gradient(90deg, var(--primary), #8b5cf6)", borderRadius: "2px", height: "10px", width: "16px" }} />
              <span>Số lượng thiết bị (Đơn vị: chiếc)</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID MƯỢN TRẢ & BÁO CÁO FINANCE --- */}
      <div style={{ display: "grid", gridTemplateColumns: userRole === "ADMIN" ? "1.1fr 0.9fr" : "1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Bảng Mượn trả gần đây */}
        <div className="table-card" style={{ height: "100%", margin: 0 }}>
          <div className="table-toolbar">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Hoạt động Mượn Trả gần đây</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người mượn</th>
                  <th>Thiết bị</th>
                  <th>Ngày mượn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrows.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{b.nguoi}</td>
                    <td>{b.thietBi}</td>
                    <td>{b.ngay}</td>
                    <td>{statusBadge(b.trangThai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Báo cáo tài chính cho ADMIN (Hiển thị biểu đồ cột sánh đôi) */}
        {userRole === "ADMIN" && (
          <div className="chart-card" style={{ borderLeft: "4px solid var(--primary)", minHeight: "338px" }}>
            <div className="chart-header" style={{ marginBottom: 12 }}>
              <h3 className="chart-title" style={{ color: "var(--warning)" }}>💰 Tài chính & Bảo trì thiết bị</h3>
              <p className="chart-subtitle">So sánh Doanh thu sử dụng và Chi phí bảo dưỡng (đơn vị: Triệu VND)</p>
            </div>
            
            <div className="chart-body" style={{ display: "block", minHeight: "180px" }}>
              <svg viewBox="0 0 450 180" className="svg-chart-container" style={{ overflow: "visible" }}>
                {/* Trục kẻ ngang */}
                <line x1="40" y1="35" x2="420" y2="35" className="grid-line" />
                <line x1="40" y1="97" x2="420" y2="97" className="grid-line" />
                <line x1="40" y1="160" x2="420" y2="160" style={{ stroke: "var(--border)", strokeWidth: 1 }} />

                {financeData.map((d, i) => {
                  const xCenter = 80 + i * 100;
                  const revHeight = getFinanceHeight(d.dt);
                  const revY = getFinanceY(d.dt);
                  const costHeight = getFinanceHeight(d.cp);
                  const costY = getFinanceY(d.cp);

                  return (
                    <g key={`finance-group-${i}`}>
                      {/* Cột Doanh Thu (Xanh lá) */}
                      <rect 
                        x={xCenter - 22} 
                        y={revY} 
                        width="18" 
                        height={revHeight} 
                        fill="var(--success)" 
                        rx="4" 
                        className="bar-chart-rect"
                      />
                      {/* Cột Chi Phí (Cam) */}
                      <rect 
                        x={xCenter + 2} 
                        y={costY} 
                        width="18" 
                        height={costHeight} 
                        fill="var(--warning)" 
                        rx="4" 
                        className="bar-chart-rect"
                      />

                      {/* Text nhãn tháng */}
                      <text x={xCenter - 2} y="176" textAnchor="middle" className="chart-axis-text" style={{ fontWeight: 600 }}>
                        {d.month}
                      </text>
                    </g>
                  );
                })}

                {/* Nhãn cột Y */}
                <text x="32" y="39" textAnchor="end" className="chart-axis-text">60M</text>
                <text x="32" y="101" textAnchor="end" className="chart-axis-text">30M</text>
                <text x="32" y="164" textAnchor="end" className="chart-axis-text">0</text>
              </svg>
            </div>
            
            <div className="chart-legend" style={{ marginTop: 8 }}>
              <div className="legend-item">
                <span className="legend-color" style={{ background: "var(--success)", borderRadius: "3px", height: "12px", width: "12px" }} />
                <span>Doanh thu hoạt động</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: "var(--warning)", borderRadius: "3px", height: "12px", width: "12px" }} />
                <span>Chi phí bảo trì</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal chi tiết thiết bị theo bộ lọc (ALL, GOOD, MAINTENANCE, BROKEN) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "800px", maxWidth: "95vw" }}>
            <div className="modal-header">
              <h3>Danh sách: {modalTitle}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto", padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ padding: "12px 24px" }}>Mã TB</th>
                    <th>Tên thiết bị</th>
                    <th>Loại</th>
                    <th>Phòng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.filter(d => modalFilter === "ALL" || d.status === modalFilter).map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: "var(--mono, monospace)", color: "var(--primary)", padding: "14px 24px" }}>TB{d.id.toString().padStart(3, '0')}</td>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{d.name}</td>
                      <td>{d.type}</td>
                      <td>{d.idPhong}</td>
                      <td><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                  {devices.filter(d => modalFilter === "ALL" || d.status === modalFilter).length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>Không có thiết bị nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}