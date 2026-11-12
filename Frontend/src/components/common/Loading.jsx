export default function Loading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "60px 0", color: "var(--text-muted)", gap: 10,
    }}>
      <span style={{ animation: "pulse 1.5s ease infinite", fontSize: 24 }}>⏳</span>
      <span style={{ fontSize: 14 }}>Đang tải dữ liệu...</span>
    </div>
  );
}
