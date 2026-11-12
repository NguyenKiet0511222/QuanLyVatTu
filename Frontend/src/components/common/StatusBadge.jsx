const statusMap = {
  ACTIVE: { label: "Hoạt động", className: "badge-success" },
  INACTIVE: { label: "Ngưng", className: "badge-secondary" },
  GOOD: { label: "Tốt", className: "badge-success" },
  BROKEN: { label: "Hỏng", className: "badge-danger" },
  MAINTENANCE: { label: "Bảo trì", className: "badge-warning" },
  PENDING: { label: "Chờ xử lý", className: "badge-warning" },
  RETURNED: { label: "Đã trả", className: "badge-success" },
  BORROWING: { label: "Đang mượn", className: "badge-info" },
  DONE: { label: "Hoàn tất", className: "badge-success" },
};

export default function StatusBadge({ status }) {
  const config = statusMap[status] || { label: status, className: "badge-secondary" };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
