import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ShoppingBag, Package } from "lucide-react";
import { api } from "../api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ list: [], unread: 0 });
  const boxRef = useRef();
  const navigate = useNavigate();

  const load = () => {
    api.notifications.list().then(setData).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (n) => {
    if (!n.read) {
      await api.notifications.read(n.id);
      load();
    }
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  const markAll = async () => {
    await api.notifications.readAll();
    load();
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return mins + " phút trước";
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + " giờ trước";
    return Math.floor(hours / 24) + " ngày trước";
  };

  return (
    <div ref={boxRef} style={{ position: "relative", color: "#18a967", background: "rgba(24,169,103,0.08)" }}>
      <button onClick={() => setOpen(!open)} className="icon-btn topbar-icon-btn notif-bell-btn" style={{ position: "relative" }}>
        <Bell size={19} />
        {data.unread > 0 && (
          <i style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 4px" }}>
            {data.unread > 9 ? "9+" : data.unread}
          </i>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 360, maxHeight: 500, overflowY: "auto", background: "#fff", borderRadius: 12, boxShadow: "0 20px 50px rgba(0,0,0,0.15)", border: "1px solid #e5e9ef", zIndex: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid #eef2f7" }}>
            <div>
              <b style={{ fontSize: 14 }}>Thông báo</b>
              {data.unread > 0 && (
                <span style={{ marginLeft: 8, fontSize: 11, color: "#fff", background: "#ef4444", padding: "2px 8px", borderRadius: 10 }}>{data.unread} mới</span>
              )}
            </div>
            {data.unread > 0 && (
              <button onClick={markAll} style={{ background: "none", border: 0, color: "#2634d5", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check size={12} /> Đọc tất cả
              </button>
            )}
          </div>
          {data.list.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#8993a3", fontSize: 13 }}>Không có thông báo</div>
          )}
          {data.list.map((n) => (
            <div key={n.id} onClick={() => markRead(n)} style={{ padding: 14, borderBottom: "1px solid #f5f7fb", cursor: "pointer", background: n.read ? "#fff" : "#eef2ff" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.type === "order" ? "#fff4d8" : "#e8f9f1", color: n.type === "order" ? "#f59e0b" : "#18a967", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {n.type === "order" ? <ShoppingBag size={16} /> : <Package size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{n.content}</div>
                  <div style={{ fontSize: 11, color: "#8993a3", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
