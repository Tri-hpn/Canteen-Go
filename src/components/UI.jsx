import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, XCircle, AlertTriangle, Eye, Pencil, Trash2 } from "lucide-react";

export const money = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

// Đọc theme trực tiếp từ DOM mỗi lần render
function getTheme() {
  return document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
}

const STATUS_MAP = {
  light: {
    success: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    warning: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    pending: { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    info:    { bg: "#cffafe", color: "#0e7490", border: "#67e8f9" },
    danger:  { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    neutral: { bg: "#e2e8f0", color: "#334155", border: "#cbd5e1" }
  },
  dark: {
    success: { bg: "#065f46", color: "#d1fae5", border: "#10b981" },
    warning: { bg: "#92400e", color: "#fef3c7", border: "#f59e0b" },
    pending: { bg: "#1e40af", color: "#dbeafe", border: "#3b82f6" },
    info:    { bg: "#0e7490", color: "#cffafe", border: "#06b6d4" },
    danger:  { bg: "#991b1b", color: "#fee2e2", border: "#ef4444" },
    neutral: { bg: "#475569", color: "#f1f5f9", border: "#64748b" }
  }
};

export function StatusBadge({ status }) {
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    // Cập nhật khi class <html> thay đổi
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    // Lắng nghe custom event (nếu ThemeToggle phát)
    const handler = () => setTheme(getTheme());
    window.addEventListener("themechange", handler);

    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", handler);
    };
  }, []);

  const statusMap = {
    "Hoàn thành": "success",
    "Đang chuẩn bị": "warning",
    "Chờ xác nhận": "pending",
    "Chờ nhận": "info",
    "Đã hủy": "danger",
    "Hoạt động": "success",
    "Bị khóa": "danger",
    "Còn hàng": "success",
    "Sắp hết": "warning",
    "Hết hàng": "danger",
    "Đã xác nhận": "info"
  };

  const type = statusMap[status] || "neutral";
  const colors = STATUS_MAP[theme] || STATUS_MAP.light;
  const c = colors[type];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        backgroundColor: c.bg,
        color: c.color,
        border: "1px solid " + c.border,
        opacity: 1,
        filter: "none",
        WebkitTextFillColor: c.color,
        textShadow: "none"
      }}
    >
      {status === "Hoàn thành" && <CheckCircle2 size={12} />}
      {status === "Chờ xác nhận" && <Clock3 size={12} />}
      {status === "Đã hủy" && <XCircle size={12} />}
      {status === "Sắp hết" && <AlertTriangle size={12} />}
      {status}
    </span>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ text = "Chưa có dữ liệu" }) {
  return <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>{text}</div>;
}

export function TableActions({ onView, onEdit, onDelete }) {
  const btnStyle = {
    width: 30, height: 30, borderRadius: 6,
    border: "1px solid var(--border-color, #e5e9ef)",
    background: "var(--card-bg, #fff)",
    cursor: "pointer",
    display: "grid", placeItems: "center",
    color: "var(--text-muted, #475569)"
  };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {onView && <button style={btnStyle} onClick={onView} title="Xem"><Eye size={16} /></button>}
      {onEdit && <button style={btnStyle} onClick={onEdit} title="Sửa"><Pencil size={16} /></button>}
      {onDelete && <button style={{ ...btnStyle, color: "#ef4444" }} onClick={onDelete} title="Xóa"><Trash2 size={16} /></button>}
    </div>
  );
}
