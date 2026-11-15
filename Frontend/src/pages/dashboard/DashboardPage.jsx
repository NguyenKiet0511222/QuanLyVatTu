import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Modal, Tag, Alert, message } from "antd";
import {
  DesktopOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  ToolOutlined,
  StopOutlined,
  FileExcelOutlined,
  ArrowRightOutlined,
  BankOutlined,
} from "@ant-design/icons";
import deviceApi from "../../api/deviceApi";
import borrowApi from "../../api/borrowApi";
import roomApi from "../../api/roomApi";
import StatusBadge from "../../components/common/StatusBadge";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toUpperCase() || "STAFF";

  const [devices, setDevices] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalFilter, setModalFilter] = useState("ALL");
  const [modalTitle, setModalTitle] = useState("");

  // Xuất báo cáo mượn trả (US11.2)
  const [fromDate, setFromDate] = useState(() => {
    return new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [devData, borrowData, roomData] = await Promise.all([
          deviceApi.getAll(),
          borrowApi.getAll(),
          roomApi.getAll(),
        ]);
        setDevices(devData || []);
        setBorrows(borrowData || []);
        setRooms(roomData || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchAll();
  }, []);

  // US11.1: 5 chỉ số thống kê thiết bị khớp tổng 100%
  const goodCount = devices.filter((d) => d.status === "GOOD").length;
  const borrowedCount = devices.filter((d) => d.status === "BORROWED").length;
  const maintenanceCount = devices.filter(
    (d) => d.status === "MAINTENANCE" || d.status === "BROKEN"
  ).length;
  const liquidatedCount = devices.filter((d) => d.status === "LIQUIDATED").length;

  const stats = [
    {
      title: "Tổng số thiết bị",
      value: devices.length,
      icon: <DesktopOutlined />,
      color: "#4f46e5",
      bg: "#eef2ff",
      filter: "ALL",
    },
    {
      title: "Sẵn sàng",
      value: goodCount,
      icon: <CheckCircleOutlined />,
      color: "#10b981",
      bg: "#ecfdf5",
      filter: "GOOD",
    },
    {
      title: "Đang được mượn",
      value: borrowedCount,
      icon: <SwapOutlined />,
      color: "#3b82f6",
      bg: "#eff6ff",
      filter: "BORROWED",
    },
    {
      title: "Đang bảo trì / Hỏng",
      value: maintenanceCount,
      icon: <ToolOutlined />,
      color: "#f59e0b",
      bg: "#fffbeb",
      filter: "MAINTENANCE_GROUP",
    },
    {
      title: "Đã thanh lý",
      value: liquidatedCount,
      icon: <StopOutlined />,
      color: "#64748b",
      bg: "#f1f5f9",
      filter: "LIQUIDATED",
    },
  ];

  const handleStatClick = (stat) => {
    setModalFilter(stat.filter);
    setModalTitle(stat.title);
    setShowModal(true);
  };

  const getFilteredModalDevices = () => {
    if (modalFilter === "ALL") return devices;
    if (modalFilter === "MAINTENANCE_GROUP") {
      return devices.filter((d) => d.status === "MAINTENANCE" || d.status === "BROKEN");
    }
    return devices.filter((d) => d.status === modalFilter);
  };

  // Tính toán tỷ lệ phần trăm
  const total = devices.length || 1;
  const pctGood = Math.round((goodCount / total) * 100);
  const pctBorrowed = Math.round((borrowedCount / total) * 100);
  const pctMaint = Math.round((maintenanceCount / total) * 100);
  const pctLiquidated = Math.max(0, 100 - pctGood - pctBorrowed - pctMaint);

  const rOuter = 58;
  const rMiddle = 44;
  const rInner = 30;
  const circOuter = 2 * Math.PI * rOuter;
  const circMiddle = 2 * Math.PI * rMiddle;
  const circInner = 2 * Math.PI * rInner;

  const offsetOuter = circOuter - (goodCount / total) * circOuter;
  const offsetMiddle = circMiddle - (borrowedCount / total) * circMiddle;
  const offsetInner = circInner - (maintenanceCount / total) * circInner;

  // Phân bổ thiết bị theo phòng học thực tế
  const displayRoomData =
    devices.length > 0
      ? Object.entries(
          devices.reduce((acc, d) => {
            const room = d.maPhong
              ? `Phòng ${d.maPhong}`
              : d.idPhong
              ? `Phòng ${d.idPhong}`
              : "Kho chung";
            acc[room] = (acc[room] || 0) + 1;
            return acc;
          }, {})
        )
          .map(([room, count]) => ({ room, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)
      : [];

  // US11.2: Xuất báo cáo mượn trả từ trang Thống kê
  const handleExportBorrowReport = () => {
    if (!fromDate || !toDate) {
      message.error("Vui lòng chọn đầy đủ Từ ngày và Đến ngày!");
      return;
    }
    if (fromDate > toDate) {
      message.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    const reportItems = borrows.filter((b) => {
      const d = b.ngayMuon || "";
      return d >= fromDate && d <= toDate;
    });

    if (reportItems.length === 0) {
      message.warning("Không có dữ liệu để xuất báo cáo");
      return;
    }

    const headers = [
      "Mã phiếu",
      "Người mượn",
      "Số điện thoại",
      "Thiết bị",
      "Số lượng",
      "Phòng học",
      "Mục đích",
      "Ngày mượn",
      "Ngày trả dự kiến",
      "Ngày trả thực tế",
      "Trạng thái",
      "Tình trạng khi trả",
    ];
    const rows = reportItems.map((b) => [
      b.maPhieu || `PM${String(b.id).padStart(3, "0")}`,
      `"${(b.studentName || "").replace(/"/g, '""')}"`,
      b.phoneNumber || "",
      `"${(b.itemBorrowed || "").replace(/"/g, '""')}"`,
      b.soLuong || 1,
      b.phongHoc || "",
      `"${(b.mucDich || "").replace(/"/g, '""')}"`,
      b.ngayMuon || "",
      b.ngayTraDuKien || "",
      b.ngayTra || "",
      b.status || "",
      `"${(b.tinhTrangKhiTra || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BaoCao_MuonTra_${fromDate}_den_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Xuất báo cáo thành công");
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Thống kê & Tổng quan hệ thống (US11.1 & US11.2)</h1>
          <p className="page-header-sub">
            Chào mừng trở lại, <b>{user.hoTen || user.tenDangNhap}</b>! Dưới đây là số liệu tài sản
            và hoạt động mượn trả theo thời gian thực.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            icon={<BankOutlined />}
            size="large"
            onClick={() => navigate("/rooms")}
            style={{ borderRadius: 10 }}
          >
            {rooms.length} Phòng học
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SwapOutlined />}
            onClick={() => navigate("/borrows")}
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Quản lý Mượn / Trả
          </Button>
        </div>
      </div>

      {devices.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="Chưa có dữ liệu thống kê"
          description="Hệ thống hiện chưa có thiết bị nào trong kho."
          style={{ marginBottom: 20, borderRadius: 12 }}
        />
      )}

      {/* 5 Chỉ số thống kê thiết bị theo US11.1 */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div
            className="stat-card"
            key={s.title}
            onClick={() => handleStatClick(s)}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.title}</div>
          </div>
        ))}
      </div>

      {/* Khu vực Biểu đồ trực quan */}
      <div className="charts-grid">
        {/* Biểu đồ 1: Trạng thái thiết bị */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">📊 Cơ cấu tình trạng thiết bị</h3>
            <p className="chart-subtitle">
              Tỷ lệ Sẵn sàng, Đang được mượn, Bảo trì và Đã thanh lý
            </p>
          </div>
          <div className="chart-body">
            <svg viewBox="0 0 160 160" style={{ width: 165, height: 165 }}>
              <circle cx="80" cy="80" r={rOuter} className="donut-ring-bg" />
              <circle
                cx="80"
                cy="80"
                r={rOuter}
                className="donut-ring-fg"
                style={{
                  stroke: "var(--success)",
                  strokeDasharray: circOuter,
                  strokeDashoffset: offsetOuter,
                }}
              />

              <circle cx="80" cy="80" r={rMiddle} className="donut-ring-bg" />
              <circle
                cx="80"
                cy="80"
                r={rMiddle}
                className="donut-ring-fg"
                style={{
                  stroke: "var(--info)",
                  strokeDasharray: circMiddle,
                  strokeDashoffset: offsetMiddle,
                }}
              />

              <circle cx="80" cy="80" r={rInner} className="donut-ring-bg" />
              <circle
                cx="80"
                cy="80"
                r={rInner}
                className="donut-ring-fg"
                style={{
                  stroke: "var(--warning)",
                  strokeDasharray: circInner,
                  strokeDashoffset: offsetInner,
                }}
              />
            </svg>
            <div className="gauge-center-text">
              <div className="gauge-center-val">{devices.length}</div>
              <div className="gauge-center-lbl">Tổng TB</div>
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: "var(--success)" }} />
              <span>Sẵn sàng ({pctGood}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "var(--info)" }} />
              <span>Đang mượn ({pctBorrowed}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "var(--warning)" }} />
              <span>Bảo trì ({pctMaint}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: "#64748b" }} />
              <span>Thanh lý ({pctLiquidated}%)</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ 2: Phân bổ thiết bị theo phòng học */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">🏫 Phân bổ thiết bị theo phòng học</h3>
            <p className="chart-subtitle">
              Số lượng thiết bị hiện có tại các phòng học & phòng thực hành
            </p>
          </div>
          <div className="chart-body" style={{ display: "block" }}>
            <svg viewBox="0 0 500 200" className="svg-chart-container" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="roomBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {displayRoomData.map((r, idx) => {
                const y = 14 + idx * 30;
                const maxRoomCount = Math.max(...displayRoomData.map((item) => item.count), 1);
                const barWidth = (r.count / maxRoomCount) * 320;

                return (
                  <g key={`room-bar-${idx}`}>
                    <text
                      x="90"
                      y={y + 11}
                      textAnchor="end"
                      className="chart-axis-text"
                      style={{ fontWeight: 600 }}
                    >
                      {r.room}
                    </text>

                    <rect
                      x="105"
                      y={y}
                      width="320"
                      height="14"
                      fill="#f1f5f9"
                      rx="7"
                    />

                    <rect
                      x="105"
                      y={y}
                      width={barWidth}
                      height="14"
                      fill="url(#roomBarGrad)"
                      rx="7"
                      className="bar-chart-rect"
                    />

                    <text
                      x={105 + barWidth + 10}
                      y={y + 11}
                      className="chart-axis-text"
                      style={{ fill: "#0f172a", fontWeight: 700 }}
                    >
                      {r.count} thiết bị
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Bảng Hoạt động Mượn Trả thực tế & Xuất báo cáo mượn trả (US11.2) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: userRole === "ADMIN" ? "1.35fr 0.85fr" : "1fr",
          gap: 22,
          alignItems: "start",
        }}
      >
        <div className="table-card">
          <div className="table-toolbar">
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              📋 Phiếu mượn trả thiết bị gần đây
            </h3>
            <Button
              type="link"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/borrows")}
            >
              Xem tất cả
            </Button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Người mượn</th>
                  <th>Thiết bị</th>
                  <th>Phòng</th>
                  <th>Ngày mượn</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {borrows.slice(0, 6).map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                      {b.maPhieu || `PM${String(b.id).padStart(3, "0")}`}
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {b.studentName}
                    </td>
                    <td>{b.itemBorrowed}</td>
                    <td>
                      <Tag color="geekblue">{b.phongHoc || "A101"}</Tag>
                    </td>
                    <td>{b.ngayMuon}</td>
                    <td>
                      <StatusBadge status={b.status} context="borrow" />
                    </td>
                  </tr>
                ))}
                {borrows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                      Chưa có phiếu mượn trả nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khu vực Xuất báo cáo mượn trả (US11.2) */}
        {userRole === "ADMIN" && (
          <div className="chart-card" style={{ borderTop: "4px solid var(--primary)" }}>
            <div className="chart-header">
              <h3 className="chart-title">📑 Xuất báo cáo mượn trả (US11.2)</h3>
              <p className="chart-subtitle">
                Trích xuất báo cáo tần suất mượn trả thiết bị theo khoảng thời gian
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Từ ngày *</label>
                <Input
                  type="date"
                  size="large"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Đến ngày *</label>
                <Input
                  type="date"
                  size="large"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  color: "#475569",
                }}
              >
                Số phiếu mượn trả trong khoảng đã chọn:{" "}
                <b style={{ color: "#4f46e5", fontSize: 15 }}>
                  {
                    borrows.filter(
                      (b) =>
                        fromDate &&
                        toDate &&
                        (b.ngayMuon || "") >= fromDate &&
                        (b.ngayMuon || "") <= toDate
                    ).length
                  }{" "}
                  phiếu
                </b>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<FileExcelOutlined />}
                onClick={handleExportBorrowReport}
                style={{ height: 44, fontWeight: 700, borderRadius: 10 }}
              >
                Xuất báo cáo (.CSV / Excel)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal danh sách thiết bị khi click vào Stat Card */}
      <Modal
        title={`Danh sách: ${modalTitle}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Đóng
          </Button>,
        ]}
        width={760}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto", marginTop: 12 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã TB</th>
                <th>Tên thiết bị</th>
                <th>Loại</th>
                <th>Phòng</th>
                <th>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredModalDevices().map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                    {d.maThietBi || `TB${String(d.id).padStart(3, "0")}`}
                  </td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {d.name}
                  </td>
                  <td>{d.type}</td>
                  <td>{d.maPhong || `Phòng ${d.idPhong}`}</td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
              {getFilteredModalDevices().length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 30 }}>
                    Không có thiết bị nào thuộc trạng thái này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
