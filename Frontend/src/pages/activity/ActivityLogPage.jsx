import { useState, useEffect } from "react";
import { Select, Input, Button, Tag, message } from "antd";
import {
  HistoryOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import activityLogApi from "../../api/activityLogApi";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [userFilter, setUserFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    user: "ALL",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await activityLogApi.getAll();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error("Không thể tải lịch sử thao tác hệ thống");
    }
  };

  const uniqueUsers = Array.from(
    new Set(logs.map((l) => l.nguoiThucHien).filter(Boolean))
  );

  const handleApplyFilter = () => {
    if (fromDate && toDate && fromDate > toDate) {
      message.error("Ngày bắt đầu không được sau ngày kết thúc!");
      return;
    }
    setAppliedFilters({ user: userFilter, fromDate, toDate });
  };

  const handleReset = () => {
    setUserFilter("ALL");
    setFromDate("");
    setToDate("");
    setAppliedFilters({ user: "ALL", fromDate: "", toDate: "" });
  };

  const filtered = logs.filter((l) => {
    if (appliedFilters.user !== "ALL" && l.nguoiThucHien !== appliedFilters.user) {
      return false;
    }
    if (l.thoiGian) {
      const dateOnly = l.thoiGian.split("T")[0];
      if (appliedFilters.fromDate && dateOnly < appliedFilters.fromDate) {
        return false;
      }
      if (appliedFilters.toDate && dateOnly > appliedFilters.toDate) {
        return false;
      }
    }
    return true;
  });

  const getActionColor = (action) => {
    if (!action) return "default";
    const a = action.toLowerCase();
    if (a.includes("thêm") || a.includes("lập") || a.includes("tạo") || a.includes("đăng ký"))
      return "green";
    if (a.includes("cập nhật") || a.includes("duyệt") || a.includes("giao") || a.includes("thu"))
      return "blue";
    if (a.includes("xóa") || a.includes("thanh lý") || a.includes("từ chối") || a.includes("khóa"))
      return "red";
    if (a.includes("báo lỗi") || a.includes("nghiệm thu")) return "purple";
    return "geekblue";
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Nhật ký lịch sử thao tác người dùng (US5.1)</h1>
          <p className="page-header-sub">
            Theo dõi và truy vết mọi thay đổi dữ liệu trong hệ thống đảm bảo tính minh bạch, chính xác
          </p>
        </div>
        <Button icon={<ReloadOutlined />} size="large" onClick={loadLogs}>
          Làm mới nhật ký
        </Button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <Select
              value={userFilter}
              onChange={setUserFilter}
              style={{ width: 220 }}
              size="large"
              placeholder="Chọn người thực hiện"
              options={[
                { value: "ALL", label: "Tất cả người thực hiện" },
                ...uniqueUsers.map((u) => ({ value: u, label: u })),
              ]}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Từ ngày:</span>
              <Input
                type="date"
                size="large"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: 160 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>Đến ngày:</span>
              <Input
                type="date"
                size="large"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: 160 }}
              />
            </div>

            <Button
              type="primary"
              size="large"
              icon={<FilterOutlined />}
              onClick={handleApplyFilter}
            >
              Lọc
            </Button>

            {(appliedFilters.user !== "ALL" ||
              appliedFilters.fromDate ||
              appliedFilters.toDate) && (
              <Button size="large" onClick={handleReset}>
                Xóa lọc
              </Button>
            )}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Người thực hiện</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
              <th>Đối tượng tác động</th>
              <th>Chi tiết thay đổi</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">
                      <HistoryOutlined />
                    </div>
                    <h3>Không có lịch sử thao tác</h3>
                    <p>Không tìm thấy bản ghi thao tác nào trong khoảng thời gian đã chọn</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((log, index) => (
                <tr key={log.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      <UserOutlined style={{ marginRight: 6, color: "var(--primary)" }} />
                      {log.nguoiThucHien || "Hệ thống"}
                    </span>
                  </td>
                  <td>
                    <Tag color={log.vaiTro === "ADMIN" ? "volcano" : "blue"}>
                      {log.vaiTro || "STAFF"}
                    </Tag>
                  </td>
                  <td>
                    <Tag color={getActionColor(log.thaoTac)} style={{ fontWeight: 600 }}>
                      {log.thaoTac}
                    </Tag>
                  </td>
                  <td style={{ fontWeight: 500, color: "#0f172a" }}>{log.doiTuong}</td>
                  <td style={{ color: "#475569" }}>{log.chiTiet || "—"}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                    {log.thoiGian
                      ? new Date(log.thoiGian).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <span className="info">
            Hiển thị {filtered.length} / {logs.length} bản ghi nhật ký hoạt động
          </span>
        </div>
      </div>
    </div>
  );
}
