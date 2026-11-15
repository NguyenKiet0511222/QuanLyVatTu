const statusMap = {
  // Thiết bị (Devices)
  GOOD: { label: "Sẵn sàng", className: "badge-success", dot: "#10b981" },
  BORROWED: { label: "Đang được mượn", className: "badge-info", dot: "#3b82f6" },
  BORROWING: { label: "Đang mượn", className: "badge-info", dot: "#3b82f6" },
  MAINTENANCE: { label: "Đang bảo trì", className: "badge-warning", dot: "#f59e0b" },
  BROKEN: { label: "Hỏng", className: "badge-danger", dot: "#ef4444" },
  LIQUIDATED: { label: "Đã thanh lý", className: "badge-secondary", dot: "#64748b" },

  // Phòng học & Tài khoản (Rooms & Accounts)
  ACTIVE: { label: "Đang hoạt động", className: "badge-success", dot: "#10b981" },
  INACTIVE: { label: "Ngưng sử dụng", className: "badge-secondary", dot: "#64748b" },
  LOCKED: { label: "Đã khóa", className: "badge-danger", dot: "#ef4444" },

  // Mượn trả & Bảo trì (Borrows & Maintenance)
  PENDING: { label: "Chờ xử lý / Chờ duyệt", className: "badge-warning", dot: "#f59e0b" },
  APPROVED: { label: "Đã duyệt (Chờ giao)", className: "badge-purple", dot: "#8b5cf6" },
  REJECTED: { label: "Đã từ chối", className: "badge-danger", dot: "#ef4444" },
  RETURNED: { label: "Đã trả", className: "badge-success", dot: "#10b981" },
  IN_PROGRESS: { label: "Đang sửa chữa", className: "badge-info", dot: "#3b82f6" },
  REPAIRED: { label: "Đã sửa xong (Chờ nghiệm thu)", className: "badge-purple", dot: "#8b5cf6" },
  DONE: { label: "Đã nghiệm thu / Hoàn tất", className: "badge-success", dot: "#10b981" },
};

export default function StatusBadge({ status, context }) {
  let config = statusMap[status] || { label: status || "Không rõ", className: "badge-secondary", dot: "#64748b" };

  if (status === "PENDING" && context === "borrow") {
    config = { label: "Chờ duyệt", className: "badge-warning", dot: "#f59e0b" };
  } else if (status === "PENDING" && context === "maintenance") {
    config = { label: "Chờ xử lý", className: "badge-warning", dot: "#f59e0b" };
  } else if (status === "BORROWED" && context === "borrow") {
    config = { label: "Đang mượn", className: "badge-info", dot: "#3b82f6" };
  } else if (status === "ACTIVE" && context === "room") {
    config = { label: "Đang sử dụng", className: "badge-success", dot: "#10b981" };
  }

  return (
    <span className={`badge ${config.className}`}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: config.dot,
          display: "inline-block",
        }}
      />
      {config.label}
    </span>
  );
}
