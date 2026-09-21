import { useEffect, useState } from "react";
import { LogIn, LogOut, Clock, Sunrise, Sun, Moon } from "lucide-react";
import { api } from "../api";
import { toast } from "./Effects";

const SHIFTS = [
  { id: "Ca sáng",  startHour: 6,  endHour: 12, icon: Sunrise, color: "#f59e0b", time: "06:00 - 12:00" },
  { id: "Ca chiều", startHour: 12, endHour: 18, icon: Sun,     color: "#2634d5", time: "12:00 - 18:00" },
  { id: "Ca tối",   startHour: 18, endHour: 22, icon: Moon,    color: "#8b5cf6", time: "18:00 - 22:00" }
];

function getCurrentShift() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return SHIFTS[0];
  if (h >= 12 && h < 18) return SHIFTS[1];
  if (h >= 18 && h < 22) return SHIFTS[2];
  return null;
}

function getNextShift() {
  const h = new Date().getHours();
  if (h < 6) return SHIFTS[0];
  if (h < 12) return SHIFTS[1];
  if (h < 18) return SHIFTS[2];
  return null;
}

export default function CheckInOutCard() {
  const [attendances, setAttendances] = useState([]);
  const [myShifts, setMyShifts] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    api.attendance.me()
      .then(d => setAttendances(Array.isArray(d) ? d : []))
      .catch(() => {});
    if (api.shifts?.mine) {
      api.shifts.mine()
        .then(d => setMyShifts(Array.isArray(d) ? d : []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadData();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const action = async (type, shiftId) => {
    setLoading(true);
    try {
      const fn = type === "in" ? api.attendance.checkIn : api.attendance.checkOut;
      await fn({ shift: shiftId });
      toast(type === "in" ? "Check-in " + shiftId + " thành công!" : "Check-out " + shiftId + " thành công!", "success");
      loadData();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const todayStr = now.toISOString().slice(0, 10);
  const todayAtts = attendances.filter(a => a.date === todayStr);

  const currentShift = getCurrentShift();
  const nextShift = getNextShift();

  // Kiem tra ca hien tai da check-in/out chua
  const currentAtt = currentShift ? todayAtts.find(a => a.shift === currentShift.id) : null;

  // Neu ca hien tai chua check-in
  const canCheckIn = currentShift && !currentAtt?.checkIn;
  // Neu ca hien tai da check-in nhung chua check-out
  const canCheckOut = currentAtt?.checkIn && !currentAtt?.checkOut;
  // Neu da check-out ca hien tai, cho phep check-in ca tiep theo
  const canCheckInNext = currentShift && currentAtt?.checkOut && nextShift;

  const fmt = (d) => d ? new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

  const statusColor = (s) => s === "Đúng giờ" ? "#18a967" : s === "Đi muộn" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ background: "#fff", border: "1px solid #e7ebf0", borderRadius: 16, padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      {/* Clock */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid #eef2f7" }}>
        <Clock size={20} style={{ color: "#2634d5" }} />
        <div>
          <b style={{ fontSize: 22, fontVariantNumeric: "tabular-nums", display: "block" }}>{time}</b>
          <span style={{ fontSize: 12, color: "#8993a3", textTransform: "capitalize" }}>{date}</span>
        </div>
      </div>

      {/* Ca hien tai */}
      {currentShift && (
        <div style={{
          marginTop: 16, padding: 14,
          background: currentShift.color + "12",
          border: "1px solid " + currentShift.color + "40",
          borderRadius: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <currentShift.icon size={16} style={{ color: currentShift.color }} />
            <span style={{ fontSize: 11, color: currentShift.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Ca hiện tại
            </span>
          </div>
          <b style={{ fontSize: 15, color: "#172033", display: "block", marginBottom: 4 }}>
            {currentShift.id} — {currentShift.time}
          </b>
          {currentAtt && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              {currentAtt.checkIn && <span>Check-in: {fmt(currentAtt.checkIn)}</span>}
              {currentAtt.checkOut && <span> · Check-out: {fmt(currentAtt.checkOut)}</span>}
            </div>
          )}
        </div>
      )}

      {/* Danh sach ca hom nay */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "#8993a3", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Chấm công hôm nay
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SHIFTS.map(s => {
            const att = todayAtts.find(a => a.shift === s.id);
            const Icon = s.icon;
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                background: "#f8fafc", borderRadius: 10,
                border: "1px solid " + (att ? statusColor(att.status) + "40" : "#eef2f7")
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: s.color + "20", color: s.color,
                  display: "grid", placeItems: "center", flexShrink: 0
                }}>
                  <Icon size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 12.5, color: "#172033", display: "block" }}>{s.id}</b>
                  <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{s.time}</span>
                </div>
                {att ? (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#172033", fontWeight: 600 }}>
                      {fmt(att.checkIn)}
                      {att.checkOut && " → " + fmt(att.checkOut)}
                    </div>
                    <span style={{
                      fontSize: 9.5, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 10,
                      background: statusColor(att.status) + "20",
                      color: statusColor(att.status)
                    }}>{att.status}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Chưa chấm công</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Nut check-in/out */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <button
          disabled={!canCheckIn || loading}
          onClick={() => action("in", currentShift.id)}
          style={{
            padding: 12,
            background: canCheckIn ? "#18a967" : "#94a3b8",
            color: "#fff", border: 0, borderRadius: 10,
            fontWeight: 700,
            cursor: canCheckIn ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontSize: 13
          }}
        >
          <LogIn size={16} /> {canCheckIn ? "Check-in " + currentShift.id.replace("Ca ", "") : "Đã check-in"}
        </button>
        <button
          disabled={!canCheckOut || loading}
          onClick={() => action("out", currentShift.id)}
          style={{
            padding: 12,
            background: canCheckOut ? "#f59e0b" : "#94a3b8",
            color: "#fff", border: 0, borderRadius: 10,
            fontWeight: 700,
            cursor: canCheckOut ? "pointer" : "not-allowed",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontSize: 13
          }}
        >
          <LogOut size={16} /> {canCheckOut ? "Check-out" : "Đã check-out"}
        </button>
      </div>

      {/* Check-in ca tiep theo neu da out ca hien tai */}
      {canCheckInNext && (
        <button
          onClick={() => action("in", nextShift.id)}
          style={{
            width: "100%", marginTop: 10, padding: 11,
            background: "linear-gradient(135deg, " + nextShift.color + ", " + nextShift.color + "dd)",
            color: "#fff", border: 0, borderRadius: 10,
            fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontSize: 13
          }}
        >
          <LogIn size={15} /> Check-in sớm {nextShift.id} ({nextShift.time})
        </button>
      )}

      <p style={{ fontSize: 11, color: "#8993a3", marginTop: 12, marginBottom: 0, textAlign: "center" }}>
        Mỗi ca cần check-in/check-out riêng. Đi muộn sau 15 phút.
      </p>
    </div>
  );
}
