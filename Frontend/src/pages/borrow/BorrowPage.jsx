import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Tag,
  Steps,
  Descriptions,
  Tooltip,
  Tabs,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  RollbackOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import StatusBadge from "../../components/common/StatusBadge";
import borrowApi from "../../api/borrowApi";
import deviceApi from "../../api/deviceApi";
import roomApi from "../../api/roomApi";

export default function BorrowPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const currentUserName = user?.hoTen || user?.tenDangNhap || "";

  const [borrows, setBorrows] = useState([]);
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewTab, setViewTab] = useState("ALL"); // ALL | MY_BORROWS (US8.4)

  // Modal Lập phiếu mượn (US8.1)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Modal Từ chối phiếu mượn (US8.2)
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal Giao thiết bị (US8.3)
  const [handoverTarget, setHandoverTarget] = useState(null);
  const [handoverCondition, setHandoverCondition] = useState("Tốt - Đầy đủ phụ kiện");

  // Modal Thu thiết bị & Ghi tình trạng sau trả (US9.1 & US9.2)
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnForm] = Form.useForm();

  // Modal Xem chi tiết phiếu mượn (US8.4)
  const [detailTarget, setDetailTarget] = useState(null);

  // Modal Xuất báo cáo mượn trả (US11.2)
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportDates, setReportDates] = useState({ fromDate: "", toDate: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [borrowList, deviceList, roomList] = await Promise.all([
        borrowApi.getAll(),
        deviceApi.getAll(),
        roomApi.getAll(),
      ]);
      setBorrows(borrowList || []);
      setDevices(deviceList || []);
      setRooms(roomList || []);
    } catch (err) {
      message.error("Không thể tải dữ liệu mượn trả");
    }
  };

  const filtered = borrows.filter((b) => {
    if (viewTab === "MY_BORROWS") {
      const matchMy =
        b.nguoiTao?.toLowerCase() === currentUserName.toLowerCase() ||
        b.studentName?.toLowerCase() === currentUserName.toLowerCase();
      if (!matchMy) return false;
    }

    const code = b.maPhieu || `PM${String(b.id).padStart(3, "0")}`;
    const matchSearch =
      !search.trim() ||
      b.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      b.itemBorrowed?.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase()) ||
      b.phongHoc?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreateModal = () => {
    createForm.resetFields();
    const today = new Date().toISOString().split("T")[0];
    createForm.setFieldsValue({
      studentName: currentUserName,
      phoneNumber: user.soDienThoai || "0912345678",
      soLuong: 1,
      phongHoc: rooms[0]?.maPhong || "A101",
      ngayMuon: today,
      ngayTraDuKien: today,
    });
    setIsCreateOpen(true);
  };

  // US8.1: Lập phiếu mượn
  const handleCreateBorrow = async (values) => {
    if (values.ngayTraDuKien < values.ngayMuon) {
      message.error("Ngày trả phải sau hoặc bằng ngày mượn");
      return;
    }

    const selectedDevice = devices.find((d) => d.id === values.deviceId);
    if (selectedDevice && selectedDevice.status !== "GOOD") {
      message.error("Thiết bị hiện không sẵn sàng để mượn");
      return;
    }

    try {
      await borrowApi.create({
        ...values,
        itemBorrowed: selectedDevice ? selectedDevice.name : values.itemBorrowed,
        status: "PENDING",
      });
      message.success("Lập phiếu mượn thành công! Phiếu đang ở trạng thái Chờ duyệt.");
      setIsCreateOpen(false);
      loadData();
    } catch (err) {
      const errMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Không thể lập phiếu mượn";
      message.error(errMsg);
    }
  };

  // US8.2: Duyệt phiếu mượn
  const handleApprove = async (record) => {
    if (record.status !== "PENDING") {
      message.error("Phiếu mượn đã được xử lý");
      return;
    }
    try {
      await borrowApi.approve(record.id);
      message.success("Duyệt phiếu mượn thành công");
      loadData();
    } catch (err) {
      message.error(
        typeof err.response?.data === "string" ? err.response.data : "Lỗi khi duyệt phiếu"
      );
    }
  };

  // US8.2: Từ chối phiếu mượn
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối phiếu mượn!");
      return;
    }
    try {
      await borrowApi.reject(rejectTarget.id, { lyDoTuChoi: rejectReason.trim() });
      message.success("Từ chối phiếu mượn thành công");
      setRejectTarget(null);
      setRejectReason("");
      loadData();
    } catch (err) {
      message.error(
        typeof err.response?.data === "string" ? err.response.data : "Lỗi khi từ chối phiếu"
      );
    }
  };

  // US8.3: Giao thiết bị
  const handleConfirmHandover = async () => {
    if (!handoverCondition.trim()) {
      message.error("Vui lòng xác nhận tình trạng thiết bị lúc giao!");
      return;
    }
    try {
      await borrowApi.handover(handoverTarget.id, {
        tinhTrangLucGiao: handoverCondition.trim(),
      });
      message.success("Giao thiết bị thành công");
      setHandoverTarget(null);
      loadData();
    } catch (err) {
      message.error(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Phiếu mượn chưa được duyệt"
      );
    }
  };

  // US9.1 & US9.2: Thu thiết bị & Ghi tình trạng sau mượn
  const openReturnModal = (record) => {
    if (record.status !== "BORROWED") {
      message.error("Phiếu mượn không ở trạng thái đang mượn");
      return;
    }
    setReturnTarget(record);
    returnForm.resetFields();
    returnForm.setFieldsValue({
      tinhTrangKhiTra: "Tốt",
      ghiChuTra: "",
    });
  };

  const handleConfirmReturn = async (values) => {
    try {
      await borrowApi.returnDevice(returnTarget.id, {
        tinhTrangKhiTra: values.tinhTrangKhiTra,
        ghiChuTra: values.ghiChuTra || "",
      });
      message.success("Thu thiết bị thành công & Đã ghi nhận tình trạng thiết bị");
      setReturnTarget(null);
      loadData();
    } catch (err) {
      message.error(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Không thể thu thiết bị"
      );
    }
  };

  // US11.2: Xuất báo cáo mượn trả
  const handleExportReport = () => {
    const { fromDate, toDate } = reportDates;
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

    // Tạo nội dung CSV có BOM UTF-8 để mở trực tiếp trên Excel tiếng Việt
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
      "Ghi chú",
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
      `"${(b.ghiChuTra || "").replace(/"/g, '""')}"`,
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
    setIsReportOpen(false);
  };

  const getStepCurrent = (status) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "APPROVED":
        return 1;
      case "REJECTED":
        return 1;
      case "BORROWED":
        return 2;
      case "RETURNED":
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h1>Quản lý Mượn & Trả thiết bị</h1>
          <p className="page-header-sub">
            Đăng ký phiếu mượn, xét duyệt, bàn giao thiết bị và nghiệm thu hoàn trả
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {isAdmin && (
            <Button
              size="large"
              icon={<FileExcelOutlined />}
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                const lastMonth = new Date(Date.now() - 30 * 86400000)
                  .toISOString()
                  .split("T")[0];
                setReportDates({ fromDate: lastMonth, toDate: today });
                setIsReportOpen(true);
              }}
              style={{ borderRadius: 10, fontWeight: 600 }}
            >
              Xuất báo cáo mượn trả
            </Button>
          )}
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            style={{ borderRadius: 10, fontWeight: 600 }}
          >
            Lập phiếu mượn
          </Button>
        </div>
      </div>

      <div className="table-card">
        <div style={{ padding: "0 22px", borderBottom: "1px solid var(--border)" }}>
          <Tabs
            activeKey={viewTab}
            onChange={setViewTab}
            items={[
              { key: "ALL", label: `Tất cả phiếu mượn (${borrows.length})` },
              { key: "MY_BORROWS", label: "Phiếu mượn của tôi (US8.4)" },
            ]}
            style={{ marginBottom: -1 }}
          />
        </div>

        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-box" style={{ minWidth: 280 }}>
              <SearchOutlined style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Tìm theo mã phiếu, người mượn, thiết bị, phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 200 }}
              size="large"
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "PENDING", label: "Chờ duyệt" },
                { value: "APPROVED", label: "Đã duyệt (Chờ giao)" },
                { value: "BORROWED", label: "Đang mượn" },
                { value: "RETURNED", label: "Đã trả" },
                { value: "REJECTED", label: "Đã từ chối" },
              ]}
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Người mượn</th>
              <th>Thiết bị</th>
              <th>Phòng</th>
              <th>Ngày mượn</th>
              <th>Hạn trả / Ngày trả</th>
              <th>Trạng thái</th>
              <th>Thao tác nghiệp vụ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>
                      {viewTab === "MY_BORROWS"
                        ? "Bạn chưa có phiếu mượn nào"
                        : "Không tìm thấy phiếu mượn phù hợp"}
                    </h3>
                    <p>Nhấn nút "Lập phiếu mượn" để đăng ký sử dụng thiết bị cho buổi học</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const code = b.maPhieu || `PM${String(b.id).padStart(3, "0")}`;
                return (
                  <tr key={b.id}>
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
                        {b.studentName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {b.phoneNumber || ""}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{b.itemBorrowed}</div>
                      {b.mucDich && (
                        <div style={{ fontSize: 12, color: "#64748b" }}>Mục đích: {b.mucDich}</div>
                      )}
                    </td>
                    <td>
                      <Tag color="geekblue">{b.phongHoc || "A101"}</Tag>
                    </td>
                    <td>{b.ngayMuon}</td>
                    <td>
                      {b.status === "RETURNED" ? (
                        <span style={{ color: "#059669", fontWeight: 600 }}>
                          Đã trả: {b.ngayTra}
                        </span>
                      ) : (
                        <span>Dự kiến: {b.ngayTraDuKien || b.ngayMuon}</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={b.status} context="borrow" />
                      {b.status === "RETURNED" && b.tinhTrangKhiTra && (
                        <div style={{ fontSize: 11.5, color: "#475569", marginTop: 4 }}>
                          Tình trạng trả: <b>{b.tinhTrangKhiTra}</b>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-btns">
                        <Tooltip title="Xem chi tiết tiến độ phiếu mượn (US8.4)">
                          <button className="action-btn" onClick={() => setDetailTarget(b)}>
                            <EyeOutlined />
                          </button>
                        </Tooltip>

                        {/* US8.2: Duyệt / Từ chối phiếu mượn */}
                        {isAdmin && b.status === "PENDING" && (
                          <>
                            <Button
                              size="small"
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() => handleApprove(b)}
                              style={{ background: "#10b981", borderColor: "#10b981" }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="small"
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => {
                                setRejectTarget(b);
                                setRejectReason("");
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}

                        {/* US8.3: Giao thiết bị */}
                        {isAdmin && b.status === "APPROVED" && (
                          <Button
                            size="small"
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => {
                              setHandoverTarget(b);
                              setHandoverCondition("Tốt - Đầy đủ phụ kiện");
                            }}
                          >
                            Giao thiết bị
                          </Button>
                        )}

                        {/* US9.1 & US9.2: Thu thiết bị & Ghi tình trạng */}
                        {isAdmin && b.status === "BORROWED" && (
                          <Button
                            size="small"
                            type="primary"
                            icon={<RollbackOutlined />}
                            onClick={() => openReturnModal(b)}
                            style={{ background: "#059669", borderColor: "#059669" }}
                          >
                            Thu thiết bị
                          </Button>
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
          <span className="info">Tổng số: {filtered.length} phiếu mượn</span>
        </div>
      </div>

      {/* Modal Lập phiếu mượn (US8.1) */}
      <Modal
        title="📝 Lập phiếu đăng ký mượn thiết bị (US8.1)"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="Gửi phiếu mượn"
        cancelText="Hủy"
        width={580}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateBorrow}
          style={{ marginTop: 14 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
            <Form.Item
              name="studentName"
              label="Họ và tên người mượn"
              rules={[{ required: true, message: "Vui lòng nhập tên người mượn!" }]}
            >
              <Input placeholder="VD: Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Số điện thoại liên hệ"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input placeholder="VD: 0912345678" />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.8fr", gap: 12 }}>
            <Form.Item
              name="deviceId"
              label="Chọn thiết bị mượn"
              rules={[{ required: true, message: "Vui lòng chọn thiết bị cần mượn!" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Chọn thiết bị từ kho"
                options={devices.map((d) => ({
                  value: d.id,
                  label: `${d.maThietBi || "TB" + d.id} - ${d.name} (${
                    d.status === "GOOD" ? "Sẵn sàng" : "Không sẵn sàng"
                  })`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="soLuong"
              label="Số lượng"
              rules={[
                { required: true, message: "Nhập số lượng!" },
                {
                  validator: (_, val) =>
                    val && Number(val) > 0
                      ? Promise.resolve()
                      : Promise.reject(new Error("Số lượng phải > 0")),
                },
              ]}
            >
              <InputNumber min={1} max={10} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Form.Item
              name="phongHoc"
              label="Phòng học sử dụng"
              rules={[{ required: true, message: "Vui lòng chọn phòng học!" }]}
            >
              <Select
                options={
                  rooms.length > 0
                    ? rooms.map((r) => ({ value: r.maPhong, label: `Phòng ${r.maPhong}` }))
                    : [
                        { value: "A101", label: "Phòng A101" },
                        { value: "A102", label: "Phòng A102" },
                        { value: "B201", label: "Phòng B201" },
                      ]
                }
              />
            </Form.Item>

            <Form.Item
              name="ngayMuon"
              label="Ngày mượn"
              rules={[{ required: true, message: "Chọn ngày mượn!" }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="ngayTraDuKien"
              label="Ngày trả dự kiến"
              rules={[{ required: true, message: "Chọn ngày trả dự kiến!" }]}
            >
              <Input type="date" />
            </Form.Item>
          </div>

          <Form.Item
            name="mucDich"
            label="Mục đích sử dụng"
            rules={[{ required: true, message: "Vui lòng nhập mục đích mượn thiết bị!" }]}
          >
            <Input.TextArea rows={2} placeholder="VD: Phục vụ giảng dạy buổi học / Thuyết trình đồ án..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Từ chối phiếu mượn (US8.2) */}
      <Modal
        title="Từ chối phiếu mượn (US8.2)"
        open={!!rejectTarget}
        onCancel={() => setRejectTarget(null)}
        onOk={handleConfirmReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p style={{ marginBottom: 10 }}>
          Nhập lý do từ chối phiếu mượn của <b>{rejectTarget?.studentName}</b>:
        </p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="VD: Thiết bị đang trong lịch bảo trì định kỳ..."
        />
      </Modal>

      {/* Modal Giao thiết bị (US8.3) */}
      <Modal
        title="📦 Bàn giao thiết bị cho người mượn (US8.3)"
        open={!!handoverTarget}
        onCancel={() => setHandoverTarget(null)}
        onOk={handleConfirmHandover}
        okText="Xác nhận giao thiết bị"
        cancelText="Hủy"
      >
        {handoverTarget && (
          <div>
            <p style={{ marginBottom: 12 }}>
              Bàn giao thiết bị <b>{handoverTarget.itemBorrowed}</b> cho{" "}
              <b>{handoverTarget.studentName}</b> sử dụng tại phòng <b>{handoverTarget.phongHoc}</b>.
            </p>
            <label className="form-label">Tình trạng thiết bị lúc giao *</label>
            <Select
              value={handoverCondition}
              onChange={setHandoverCondition}
              style={{ width: "100%" }}
              size="large"
              options={[
                { value: "Tốt - Đầy đủ phụ kiện", label: "Tốt - Đầy đủ phụ kiện" },
                { value: "Hoạt động bình thường", label: "Hoạt động bình thường" },
                { value: "Hao mòn nhẹ vỏ ngoài, hoạt động tốt", label: "Hao mòn nhẹ vỏ ngoài, hoạt động tốt" },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal Thu thiết bị & Ghi nhận tình trạng sau mượn (US9.1 & US9.2) */}
      <Modal
        title="✅ Thu thiết bị & Ghi nhận tình trạng sau mượn (US9.1 & US9.2)"
        open={!!returnTarget}
        onCancel={() => setReturnTarget(null)}
        onOk={() => returnForm.submit()}
        okText="Lưu & Hoàn tất thu thiết bị"
        cancelText="Hủy"
      >
        {returnTarget && (
          <Form
            form={returnForm}
            layout="vertical"
            onFinish={handleConfirmReturn}
            style={{ marginTop: 12 }}
          >
            <p style={{ marginBottom: 14, color: "#475569" }}>
              Tiếp nhận hoàn trả thiết bị <b>{returnTarget.itemBorrowed}</b> từ người mượn{" "}
              <b>{returnTarget.studentName}</b>.
            </p>

            <Form.Item
              name="tinhTrangKhiTra"
              label="Tình trạng thiết bị sau khi trả"
              rules={[{ required: true, message: "Vui lòng chọn tình trạng thiết bị!" }]}
            >
              <Select
                size="large"
                options={[
                  { value: "Tốt", label: "Tốt (Hoạt động bình thường, nguyên vẹn)" },
                  { value: "Hao mòn nhẹ", label: "Hao mòn nhẹ (Trầy xước nhỏ, vẫn sử dụng tốt)" },
                  { value: "Hư hỏng", label: "Hư hỏng (Cần chuyển sang bảo trì / sửa chữa)" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="ghiChuTra"
              label="Ghi chú chi tiết hiện trạng"
              rules={[{ max: 255, message: "Ghi chú không vượt quá 255 ký tự!" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="VD: Trầy xước nhỏ ở vỏ máy / Hoàn trả đầy đủ dây cáp..."
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Modal Xem chi tiết phiếu mượn (US8.4) */}
      <Modal
        title={
          detailTarget
            ? `Chi tiết phiếu mượn ${detailTarget.maPhieu || "PM" + detailTarget.id}`
            : ""
        }
        open={!!detailTarget}
        onCancel={() => setDetailTarget(null)}
        footer={[
          <Button key="close" onClick={() => setDetailTarget(null)}>
            Đóng
          </Button>,
        ]}
        width={640}
      >
        {detailTarget && (
          <div style={{ marginTop: 16 }}>
            <Steps
              size="small"
              current={getStepCurrent(detailTarget.status)}
              status={detailTarget.status === "REJECTED" ? "error" : "process"}
              style={{ marginBottom: 24 }}
              items={[
                { title: "Lập phiếu" },
                {
                  title:
                    detailTarget.status === "REJECTED" ? "Đã từ chối" : "Duyệt phiếu",
                },
                { title: "Giao thiết bị" },
                { title: "Đã hoàn trả" },
              ]}
            />

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã phiếu">
                <b>{detailTarget.maPhieu || `PM${String(detailTarget.id).padStart(3, "0")}`}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <StatusBadge status={detailTarget.status} context="borrow" />
              </Descriptions.Item>
              <Descriptions.Item label="Người mượn">
                {detailTarget.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {detailTarget.phoneNumber || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Thiết bị" span={2}>
                <b>{detailTarget.itemBorrowed}</b> (Số lượng: {detailTarget.soLuong || 1})
              </Descriptions.Item>
              <Descriptions.Item label="Phòng học">
                {detailTarget.phongHoc || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Mục đích">
                {detailTarget.mucDich || "Phục vụ học tập / giảng dạy"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày mượn">
                {detailTarget.ngayMuon}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày trả dự kiến">
                {detailTarget.ngayTraDuKien || detailTarget.ngayMuon}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng lúc giao">
                {detailTarget.tinhTrangLucGiao || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày trả thực tế">
                {detailTarget.ngayTra || "Chưa trả"}
              </Descriptions.Item>
              {detailTarget.tinhTrangKhiTra && (
                <Descriptions.Item label="Tình trạng sau trả" span={2}>
                  <Tag color={detailTarget.tinhTrangKhiTra === "Hư hỏng" ? "error" : "success"}>
                    {detailTarget.tinhTrangKhiTra}
                  </Tag>{" "}
                  {detailTarget.ghiChuTra}
                </Descriptions.Item>
              )}
              {detailTarget.lyDoTuChoi && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  <span style={{ color: "#ef4444" }}>{detailTarget.lyDoTuChoi}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal Xuất báo cáo mượn trả (US11.2) */}
      <Modal
        title="📊 Xuất báo cáo mượn trả thiết bị (US11.2)"
        open={isReportOpen}
        onCancel={() => setIsReportOpen(false)}
        onOk={handleExportReport}
        okText="Xuất báo cáo (.CSV)"
        cancelText="Hủy"
      >
        <p style={{ marginBottom: 16, color: "#475569", fontSize: 13.5 }}>
          Chọn khoảng thời gian cần thống kê để xuất danh sách các phiếu mượn trả thiết bị:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Từ ngày *</label>
            <Input
              type="date"
              size="large"
              value={reportDates.fromDate}
              onChange={(e) => setReportDates({ ...reportDates, fromDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Đến ngày *</label>
            <Input
              type="date"
              size="large"
              value={reportDates.toDate}
              onChange={(e) => setReportDates({ ...reportDates, toDate: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
