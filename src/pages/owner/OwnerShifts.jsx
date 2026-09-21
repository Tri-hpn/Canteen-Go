import { useEffect, useState, useMemo } from "react";
import {
  Calendar, Clock, Users, CheckCircle2, AlertTriangle, UserX,
  Plus, Trash2, Sun, Sunrise, Moon, Save, X, Search,
  ChevronLeft, ChevronRight, CalendarDays, Edit, Copy, List
} from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

const SHIFTS = [
  { id: "Ca sáng", label: "Ca sáng", time: "06:00 - 12:00", icon: Sunrise, color: "#f59e0b" },
  { id: "Ca chiều", label: "Ca chiều", time: "12:00 - 18:00", icon: Sun, color: "#2634d5" },
  { id: "Ca tối", label: "Ca tối", time: "18:00 - 22:00", icon: Moon, color: "#8b5cf6" }
];

const TABS = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "Theo tuần" },
  { id: "assign", label: "Phân ca" },
  { id: "history", label: "Lịch sử" }
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function shiftColor(s) {
  const sh = SHIFTS.find(x => x.id === s);
  return sh ? sh.color : "#64748b";
}

export default function OwnerShifts() {
  const [tab, setTab] = useState("today");
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [weekDate, setWeekDate] = useState(getToday());
  const [historyMonth, setHistoryMonth] = useState(getToday().slice(0, 7));
  const [search, setSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("nextWeek");

  const load = async () => {
    setLoading(true);
    try {
      const [emps, atts, shs] = await Promise.all([
        api.users.list("EMPLOYEE").catch(() => []),
        api.attendance.all({ month: historyMonth }).catch(() => []),
        fetch("/api/shifts", {
          headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
        }).then(r => r.json()).catch(() => [])
      ]);
      setEmployees(emps || []);
      setAttendances(atts || []);
      setShifts(Array.isArray(shs) ? shs : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [historyMonth]);

  const stats = useMemo(() => {
    const today = getToday();
    const todayAtts = attendances.filter(a => a.date === today);
    return {
      total: employees.length,
      working: todayAtts.filter(a => a.checkIn && !a.checkOut).length,
      late: todayAtts.filter(a => a.status === "Đi muộn").length,
      absent: employees.length - todayAtts.length
    };
  }, [employees, attendances]);

  const todayShifts = useMemo(() => {
    const today = getToday();
    return SHIFTS.map(s => ({
      ...s,
      employees: shifts.filter(x => x.date === today && x.shift === s.id)
    }));
  }, [shifts]);

  const weekDays = useMemo(() => {
    const start = new Date(weekDate);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, [weekDate]);

  const changeWeek = (delta) => {
    const d = new Date(weekDate);
    d.setDate(d.getDate() + delta * 7);
    setWeekDate(d.toISOString().slice(0, 10));
  };

  const goToThisWeek = () => setWeekDate(getToday());

  const weekLabel = weekDays.length ? new Date(weekDays[0]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) + " - " + new Date(weekDays[6]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const sundayReminder = useMemo(() => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    const hour = d.getHours();
    if (dayOfWeek !== 0) return null;
    if (hour >= 15) return "urgent";
    if (hour >= 9) return "warn";
    return null;
  }, []);

  const filteredShifts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = today.getDay();
    const daysUntilMon = day === 0 ? -6 : 1 - day;
    const thisMon = new Date(today);
    thisMon.setDate(today.getDate() + daysUntilMon);
    const thisSun = new Date(thisMon);
    thisSun.setDate(thisMon.getDate() + 6);
    thisSun.setHours(23, 59, 59, 999);
    const nextMon = new Date(thisMon);
    nextMon.setDate(thisMon.getDate() + 7);
    const nextSun = new Date(nextMon);
    nextSun.setDate(nextMon.getDate() + 6);
    nextSun.setHours(23, 59, 59, 999);

    let list = [...shifts];
    if (historyFilter === "week") {
      list = list.filter(s => {
        const d = new Date(s.date + "T00:00:00");
        return d >= thisMon && d <= thisSun;
      });
    } else if (historyFilter === "nextWeek") {
      list = list.filter(s => {
        const d = new Date(s.date + "T00:00:00");
        return d >= nextMon && d <= nextSun;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => (s.employee_name || "").toLowerCase().includes(q));
    }
    return list;
  }, [shifts, historyFilter, search]);

  const groupedShifts = useMemo(() => {
    const map = {};
    filteredShifts.forEach(s => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map(date => {
        const list = map[date];
        const shiftTypes = [...new Set(list.map(s => s.shift))];
        const d = new Date(date + "T00:00:00");
        return {
          date,
          label: d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }),
          weekdayShort: d.toLocaleDateString("vi-VN", { weekday: "short" }),
          dayNum: String(d.getDate()).padStart(2, "0"),
          shifts: list,
          shiftTypes
        };
      });
  }, [filteredShifts]);

  const uniqueEmployees = useMemo(() => {
    return new Set(filteredShifts.map(s => s.employee_id)).size;
  }, [filteredShifts]);

  // === SAVE (Add or Edit) ===
  const saveAssignment = async (formData, isEdit) => {
    try {
      if (isEdit) {
        const res = await fetch("/api/shifts/" + formData.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token")
          },
          body: JSON.stringify({ date: formData.date, shift: formData.shift, note: formData.note })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        toast("Da cap nhat ca", "success");
      } else {
        const { employeeId, dateShifts, note } = formData;
        let totalCreated = 0;
        let totalSkipped = 0;
        for (const [date, shiftList] of Object.entries(dateShifts)) {
          if (!shiftList || !shiftList.length) continue;
          const res = await fetch("/api/shifts/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token")
            },
            body: JSON.stringify({
              employee_id: employeeId,
              dates: [date],
              shifts: shiftList,
              note
            })
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Loi phan ca");
          totalCreated += json.created || 0;
          totalSkipped += json.skipped || 0;
        }
        toast("Da phan " + totalCreated + " ca" + (totalSkipped ? " (bo qua " + totalSkipped + " ca trung)" : ""), "success");
      }
      setAssignModal(null);
      load();
    } catch (e) { toast(e.message || "Loi", "error"); }
  };

  const removeAssignment = async (id) => {
    if (!confirm("Xóa phân ca này?")) return;
    await fetch("/api/shifts/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
    });
    toast("Đã xóa", "success");
    load();
  };

  const openEdit = (s) => setAssignModal({ ...s, _isEdit: true });
  const openNew = () => setAssignModal({ _isNew: true, date: getToday(), shift: "Ca sáng" });

  const filteredEmployees = employees.filter(e =>
    !search.trim() || e.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {sundayReminder && (
        <div style={{
          marginBottom: 16, padding: "14px 18px",
          background: sundayReminder === "urgent"
            ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))"
            : "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(38, 52, 213, 0.08))",
          border: "2px solid " + (sundayReminder === "urgent" ? "#ef4444" : "#f59e0b"),
          borderRadius: 12, display: "flex", alignItems: "center", gap: 14
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: sundayReminder === "urgent" ? "#ef4444" : "#f59e0b",
            color: "#fff", display: "grid", placeItems: "center", flexShrink: 0
          }}>
            <CalendarDays size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ color: sundayReminder === "urgent" ? "#991b1b" : "#92400e", fontSize: 15, display: "block", marginBottom: 2 }}>
              {sundayReminder === "urgent" ? "⚠️ Hạn chót xếp ca tuần sau: 15:00 hôm nay!" : "📅 Nhắc nhở xếp ca tuần sau"}
            </b>
            <span style={{ color: sundayReminder === "urgent" ? "#7f1d1d" : "#78350f", fontSize: 13 }}>
              {sundayReminder === "urgent" ? "Vui lòng phân ca cho nhân viên TRƯỚC 15:00 Chủ nhật." : "Vui lòng xếp ca cho nhân viên trước 15:00 Chủ nhật hàng tuần."}
            </span>
          </div>
          <button onClick={() => setTab("week")} style={{
            padding: "10px 16px",
            background: sundayReminder === "urgent" ? "#ef4444" : "#f59e0b",
            color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer",
            fontSize: 13, whiteSpace: "nowrap"
          }}>Xếp ca ngay</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <Stat icon={<Users size={18} />} label="Tổng nhân viên" value={stats.total} color="#2634d5" />
        <Stat icon={<CheckCircle2 size={18} />} label="Đang làm việc" value={stats.working} color="#18a967" />
        <Stat icon={<AlertTriangle size={18} />} label="Đi muộn" value={stats.late} color="#f59e0b" />
        <Stat icon={<UserX size={18} />} label="Vắng mặt" value={stats.absent} color="#ef4444" />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 8, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 18px",
            background: tab === t.id ? "#2634d5" : "transparent",
            color: tab === t.id ? "#fff" : "var(--text-muted, #475569)",
            border: 0, borderRadius: 8, cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "today" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {todayShifts.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.id} style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + "20", color: s.color, display: "grid", placeItems: "center" }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <b style={{ color: "var(--text-primary, #172033)", fontSize: 14 }}>{s.label}</b>
                    <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{s.time}</div>
                  </div>
                  <span style={{ background: s.color + "20", color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {s.employees.length}
                  </span>
                </div>
                {s.employees.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)", fontSize: 12 }}>Chưa phân ca</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {s.employees.map(emp => {
                      const today = getToday();
                      const att = attendances.find(a => a.employee_id === emp.employee_id && a.date === today);
                      return (
                        <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2634d5, #20c779)", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
                            {(emp.employee_name || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ fontSize: 13, color: "var(--text-primary, #172033)", display: "block" }}>{emp.employee_name}</b>
                            <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>
                              {att ? "Vào " + fmtTime(att.checkIn) + (att.checkOut ? " · Ra " + fmtTime(att.checkOut) : "") : "Chưa chấm công"}
                            </span>
                          </div>
                          {att && (
                            <span style={{ padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, background: att.status === "Đi muộn" ? "#fef3c7" : "#d1fae5", color: att.status === "Đi muộn" ? "#92400e" : "#065f46" }}>{att.status}</span>
                          )}
                          <button onClick={() => openEdit(emp)} style={{ background: "transparent", border: 0, color: "#2634d5", cursor: "pointer", padding: 4 }}><Edit size={14} /></button>
                          <button onClick={() => removeAssignment(emp.id)} style={{ background: "transparent", border: 0, color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "week" && (
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 4px", color: "var(--text-primary, #172033)" }}>Lịch phân ca tuần</h3>
              <span style={{ fontSize: 12, color: "var(--text-muted, #64748b)" }}>📅 {weekLabel}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => changeWeek(-1)} title="Tuần trước" style={navBtn}><ChevronLeft size={18} /></button>
              <button onClick={goToThisWeek} style={navBtnWide}><CalendarDays size={14} /> Tuần này</button>
              <button onClick={() => changeWeek(1)} title="Tuần sau" style={navBtn}><ChevronRight size={18} /></button>
              <button onClick={openNew} style={{ padding: "9px 14px", borderRadius: 8, background: "#2634d5", color: "#fff", border: 0, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} /> Phân ca
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
                  <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)", minWidth: 150 }}>Nhân viên</th>
                  {weekDays.map(d => (
                    <th key={d} style={{ padding: 8, textAlign: "center", fontSize: 11, color: "var(--text-muted, #64748b)", minWidth: 80 }}>
                      <div style={{ fontWeight: 700 }}>{new Date(d).toLocaleDateString("vi-VN", { weekday: "short" })}</div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{d.slice(8)}/{d.slice(5, 7)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                    <td style={{ padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" }}><b>{emp.name}</b></td>
                    {weekDays.map(d => {
                      const empShifts = shifts.filter(s => s.employee_id === emp.id && s.date === d);
                      return (
                        <td key={d} style={{ padding: 6, textAlign: "center" }}>
                          {empShifts.length === 0 ? (
                            <span style={{ color: "var(--text-light, #cbd5e1)", fontSize: 12 }}>—</span>
                          ) : (
                            <div style={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                              {empShifts.map(s => {
                                const code = s.shift === "Ca sáng" ? "S" : s.shift === "Ca chiều" ? "C" : "T";
                                return (
                                  <button key={s.id} onClick={() => openEdit(s)} title="Bấm để sửa" style={{
                                    width: 24, height: 24, borderRadius: 6, border: 0,
                                    background: shiftColor(s.shift), color: "#fff",
                                    display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, cursor: "pointer"
                                  }}>{code}</button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}>
            {SHIFTS.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, background: s.color, display: "grid", placeItems: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  {s.id === "Ca sáng" ? "S" : s.id === "Ca chiều" ? "C" : "T"}
                </span>
                <span style={{ color: "var(--text-muted, #64748b)" }}>{s.label}</span>
              </div>
            ))}
            <span style={{ marginLeft: "auto", color: "var(--text-light, #8993a3)", fontStyle: "italic" }}>💡 Bấm vào ô để sửa ca</span>
          </div>
        </div>
      )}

      {tab === "assign" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "9px 12px", flex: 1, maxWidth: 400 }}>
              <Search size={16} style={{ color: "var(--text-light, #8993a3)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tim nhan vien..." style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: "var(--text-primary, #172033)", fontSize: 13 }} />
            </div>

            <div style={{ display: "flex", gap: 4, background: "var(--bg-tertiary, #f5f7fb)", padding: 4, borderRadius: 8 }}>
              {[
                { id: "week", label: "Tuan nay" },
                { id: "nextWeek", label: "Tuan sau" },
                { id: "all", label: "Tat ca" }
              ].map(f => (
                <button key={f.id} onClick={() => setHistoryFilter(f.id)} type="button" style={{
                  padding: "6px 14px",
                  background: historyFilter === f.id ? "#2634d5" : "transparent",
                  color: historyFilter === f.id ? "#fff" : "var(--text-muted, #475569)",
                  border: 0, borderRadius: 6, cursor: "pointer",
                  fontSize: 12, fontWeight: 600
                }}>{f.label}</button>
              ))}
            </div>

            <button onClick={openNew} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#2634d5", color: "#fff", padding: "10px 16px", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              <Plus size={16} /> Phan ca
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
            <SummaryCard label="Tong ca" value={filteredShifts.length} color="#2634d5" />
            <SummaryCard label="So ngay" value={groupedShifts.length} color="#18a967" />
            <SummaryCard label="Nhan vien" value={uniqueEmployees} color="#f59e0b" />
          </div>

          {groupedShifts.length === 0 ? (
            <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--text-light, #8993a3)" }}>
              Khong co phan ca nao
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {groupedShifts.map(group => (
                <div key={group.date} style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", background: "var(--bg-tertiary, #f5f7fb)", borderBottom: "1px solid var(--border-color, #eef2f7)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #2634d5, #20c779)", color: "#fff", display: "grid", placeItems: "center", lineHeight: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>{group.weekdayShort}</span>
                          <span style={{ fontSize: 15, fontWeight: 800 }}>{group.dayNum}</span>
                        </div>
                      </div>
                      <div>
                        <b style={{ fontSize: 14, color: "var(--text-primary, #172033)", display: "block" }}>{group.label}</b>
                        <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{group.shifts.length} ca</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {group.shiftTypes.map(s => (
                        <span key={s} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: shiftColor(s) + "20", color: shiftColor(s) }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {group.shifts.map((s, i) => (
                      <div key={s.id} style={{ padding: "10px 18px", borderBottom: i < group.shifts.length - 1 ? "1px solid var(--border-color, #f5f7fb)" : "none", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2634d5, #20c779)", color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {(s.employee_name || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <b style={{ fontSize: 13, color: "var(--text-primary, #172033)", display: "block" }}>{s.employee_name}</b>
                            {s.note && <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{s.note}</span>}
                          </div>
                        </div>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: shiftColor(s.shift) + "20", color: shiftColor(s.shift), whiteSpace: "nowrap" }}>
                          {s.shift}
                        </span>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => openEdit(s)} title="Sua" style={iconBtn}><Edit size={14} /></button>
                          <button onClick={() => removeAssignment(s.id)} title="Xoa" style={{ ...iconBtn, color: "#ef4444" }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>Lịch sử chấm công</h3>
            <input type="month" value={historyMonth} onChange={e => setHistoryMonth(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13 }} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
                <th style={th}>Ngày</th><th style={th}>Nhân viên</th><th style={th}>Ca</th>
                <th style={th}>Check-in</th><th style={th}>Check-out</th><th style={th}>Giờ làm</th><th style={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>Chưa có dữ liệu</td></tr>
              ) : (
                attendances.map(a => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                    <td style={td}><b>{a.date}</b></td>
                    <td style={td}>{a.employee_name}</td>
                    <td style={td}>{a.shift || "—"}</td>
                    <td style={td}>{fmtTime(a.checkIn)}</td>
                    <td style={{ ...td, color: "var(--text-muted, #64748b)" }}>{fmtTime(a.checkOut)}</td>
                    <td style={td}>{a.hours ? a.hours + "h" : "—"}</td>
                    <td style={td}>
                      <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: a.status === "Đi muộn" ? "#fef3c7" : a.status === "Về sớm" ? "#dbeafe" : "#d1fae5", color: a.status === "Đi muộn" ? "#92400e" : a.status === "Về sớm" ? "#1e40af" : "#065f46" }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {assignModal && (
        <AssignModal
          modal={assignModal}
          employees={filteredEmployees}
          weekDays={weekDays}
          shifts={shifts}
          onSave={saveAssignment}
          onClose={() => setAssignModal(null)}
        />
      )}
    </div>
  );
}

/* ============ ASSIGN MODAL ============ */
function AssignModal({ modal, employees, weekDays, shifts = [], onSave, onClose }) {
  const isEdit = modal._isEdit === true;

  const getNextWeekDays = () => {
    const d = new Date();
    const day = d.getDay();
    const daysUntilMon = day === 0 ? 1 : (8 - day);
    const nextMon = new Date(d);
    nextMon.setDate(d.getDate() + daysUntilMon);
    nextMon.setHours(0, 0, 0, 0);
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(nextMon);
      dd.setDate(nextMon.getDate() + i);
      const y = dd.getFullYear();
      const m = String(dd.getMonth() + 1).padStart(2, "0");
      const dt = String(dd.getDate()).padStart(2, "0");
      arr.push(y + "-" + m + "-" + dt);
    }
    return arr;
  };

  const displayWeekDays = useMemo(() => {
    if (isEdit) return weekDays;
    return getNextWeekDays();
  }, [isEdit, weekDays]);

  const [dateShifts, setDateShifts] = useState(() => {
    if (isEdit) return { [modal.date]: [modal.shift] };
    if (modal.date && modal.shift) return { [modal.date]: [modal.shift] };
    return {};
  });
  const [activeDate, setActiveDate] = useState(isEdit ? modal.date : null);
  const [employeeId, setEmployeeId] = useState(modal.employee_id || "");
  const [note, setNote] = useState(modal.note || "");

  const assignedDays = useMemo(() => {
    if (!employeeId || isEdit) return new Set();
    const empId = +employeeId;
    return new Set(
      shifts
        .filter(s => +s.employee_id === empId && displayWeekDays.includes(s.date))
        .map(s => s.date)
    );
  }, [shifts, employeeId, displayWeekDays, isEdit]);

  const currentShifts = activeDate ? (dateShifts[activeDate] || []) : [];

  const isDayAssigned = (d) =>
    (dateShifts[d] && dateShifts[d].length > 0) || assignedDays.has(d);

  const clickDate = (d) => setActiveDate(d);

  const toggleShift = (s) => {
    if (isEdit) {
      setDateShifts({ [activeDate]: [s] });
      return;
    }
    if (!activeDate) { alert("Vui long chon ngay truoc"); return; }
    setDateShifts((prev) => {
      const cur = prev[activeDate] || [];
      const has = cur.includes(s);
      const next = has ? cur.filter((x) => x !== s) : [...cur, s];
      const copy = { ...prev };
      if (next.length === 0) delete copy[activeDate];
      else copy[activeDate] = next;
      return copy;
    });
  };

  const applyToWholeWeek = () => {
    const tpl = currentShifts.length > 0 ? currentShifts : ["Ca sang"];
    const next = { ...dateShifts };
    displayWeekDays.forEach((d) => { next[d] = [...tpl]; });
    setDateShifts(next);
  };

  const clearAll = () => { setDateShifts({}); setActiveDate(null); };

  const submit = (e) => {
    e.preventDefault();
    if (!employeeId) { alert("Chon nhan vien"); return; }
    const dates = Object.keys(dateShifts).filter((d) => dateShifts[d]?.length > 0);
    if (!dates.length) { alert("Chon it nhat 1 ngay va 1 ca"); return; }

    if (isEdit) {
      onSave({ id: modal.id, date: dates[0], shift: dateShifts[dates[0]][0], note }, true);
    } else {
      onSave({ employeeId: +employeeId, dateShifts, note }, false);
    }
  };

  const totalAssignments = Object.values(dateShifts).reduce((s, arr) => s + (arr?.length || 0), 0);
  const totalDays = Object.keys(dateShifts).filter((d) => dateShifts[d]?.length > 0).length;

  const weekLabel = displayWeekDays.length
    ? new Date(displayWeekDays[0]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      + " - "
      + new Date(displayWeekDays[6]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    : "";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>
            {isEdit ? "Sua ca lam viec" : "Phan ca lam viec"}
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>x</button>
        </div>

        {!isEdit && (
          <div style={{
            marginBottom: 14, padding: "8px 12px",
            background: "rgba(38, 52, 213, 0.08)", border: "1px solid rgba(38, 52, 213, 0.25)",
            borderRadius: 8, fontSize: 12, color: "#2634d5", fontWeight: 600
          }}>
            Dang phan ca cho tuan sau ({weekLabel})
          </div>
        )}

        <form onSubmit={submit}>
          <label style={label}>Nhan vien *</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required={!isEdit} disabled={isEdit} style={input}>
            <option value="">-- Chon nhan vien --</option>
            {employees.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
          </select>

          {!isEdit && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
              <label style={{ ...label, margin: 0 }}>Ngay *</label>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={applyToWholeWeek} style={{ padding: "4px 10px", background: "rgba(38, 52, 213, 0.1)", color: "#2634d5", border: "1px solid rgba(38, 52, 213, 0.3)", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                  Ap dung ca tuan
                </button>
                {totalAssignments > 0 && (
                  <button type="button" onClick={clearAll} style={{ padding: "4px 10px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                    Xoa het
                  </button>
                )}
              </div>
            </div>
          )}
          {isEdit && <label style={label}>Ngay *</label>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 16 }}>
            {displayWeekDays.map((d) => {
              const isActive = activeDate === d;
              const isAssigned = isDayAssigned(d);
              const dayLabel = new Date(d).toLocaleDateString("vi-VN", { weekday: "short" });

              let bg = "var(--bg-tertiary, #f5f7fb)";
              let color = "var(--text-primary, #172033)";
              let border = "1px solid var(--border-color, #e5e9ef)";

              if (isAssigned && !isActive) {
                bg = "#d1fae5"; color = "#065f46"; border = "1px solid #18a967";
              }
              if (isActive) {
                bg = isAssigned ? "#18a967" : "#2634d5";
                color = "#fff";
                border = "2px solid " + (isAssigned ? "#18a967" : "#2634d5");
              }

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => clickDate(d)}
                  title={isAssigned ? "Da co ca - bam de chon them ca" : "Bam de chon ngay"}
                  style={{
                    padding: "8px 4px", borderRadius: 8,
                    background: bg, color: color, border: border,
                    cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
                    position: "relative", transition: "all 0.15s"
                  }}
                >
                  {isAssigned && (
                    <span style={{
                      position: "absolute", top: 2, right: 2,
                      width: 14, height: 14, borderRadius: "50%",
                      background: isActive ? "#fff" : "#18a967",
                      color: isActive ? "#18a967" : "#fff",
                      display: "grid", placeItems: "center",
                      fontSize: 9, fontWeight: 800, lineHeight: 1
                    }}>v</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{dayLabel}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{d.slice(8)}</span>
                </button>
              );
            })}
          </div>

          <label style={label}>
            Ca lam * {!isEdit && activeDate && (
              <span style={{ fontWeight: 400, color: "var(--text-light, #94a3b8)" }}>
                (ngay {activeDate.slice(8)}/{activeDate.slice(5, 7)})
              </span>
            )}
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {SHIFTS.map((s) => {
              const Icon = s.icon;
              const sel = currentShifts.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleShift(s.id)}
                  style={{
                    padding: "10px 8px", borderRadius: 10,
                    background: sel ? s.color + "20" : "var(--card-bg, #fff)",
                    border: sel ? "2px solid " + s.color : "2px solid var(--border-color, #e5e9ef)",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4
                  }}
                >
                  <Icon size={18} style={{ color: sel ? s.color : "var(--text-light, #94a3b8)" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: sel ? s.color : "var(--text-muted, #475569)" }}>{s.label}</span>
                  <span style={{ fontSize: 9, color: "var(--text-light, #94a3b8)" }}>{s.time}</span>
                </button>
              );
            })}
          </div>

          <label style={label}>Ghi chu</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Ban viec rieng..." style={input} />

          {!isEdit && totalAssignments > 0 && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(24, 169, 103, 0.1)", border: "1px solid rgba(24, 169, 103, 0.3)", borderRadius: 8, fontSize: 12, color: "#18a967", fontWeight: 600 }}>
              Da chon <b>{totalAssignments}</b> ca tren <b>{totalDays}</b> ngay
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600 }}>Huy</button>
            <button type="submit" style={{ flex: 1, padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Save size={14} /> {isEdit ? "Luu thay doi" : "Phan ca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

  function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: "14px 16px" }}>
      <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{label}</span>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "18", color, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
        <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

const th = { padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)", fontWeight: 600 };
const td = { padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" };
const label = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 12, color: "var(--text-muted, #475569)" };
const input = { width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13, boxSizing: "border-box" };
const iconBtn = { padding: 6, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6, background: "var(--card-bg, #fff)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-primary, #172033)", width: 30, height: 30 };
const navBtn = { width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border-color, #e5e9ef)", background: "var(--card-bg, #fff)", color: "var(--text-primary, #172033)", cursor: "pointer", display: "grid", placeItems: "center" };
const navBtnWide = { padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border-color, #e5e9ef)", background: "var(--card-bg, #fff)", color: "var(--text-primary, #172033)", cursor: "pointer", fontWeight: 600, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 };
