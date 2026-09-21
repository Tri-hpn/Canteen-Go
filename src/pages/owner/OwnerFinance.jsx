import { useState, useEffect } from "react";
import {
  Wallet, CreditCard, TrendingUp, Receipt, DollarSign,
  BarChart3, CheckCircle2, Download, Save, Plus, Pencil, X
} from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";

const TABS = [
  { id: "account", label: "Tài khoản nhận tiền", icon: CreditCard },
  { id: "revenue", label: "Doanh thu", icon: TrendingUp },
  { id: "transactions", label: "Giao dịch", icon: Receipt },
  { id: "expenses", label: "Chi phí", icon: DollarSign },
  { id: "stats", label: "Thống kê", icon: BarChart3 },
  { id: "reconcile", label: "Đối soát", icon: CheckCircle2 },
  { id: "export", label: "Xuất báo cáo", icon: Download }
];

export default function OwnerFinance() {
  const [tab, setTab] = useState("account");

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap",
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 8
      }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 14px",
                background: active ? "#2634d5" : "transparent",
                color: active ? "#fff" : "var(--text-muted, #475569)",
                border: 0, borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: active ? 700 : 500,
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all 0.2s"
              }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "account" && <AccountTab />}
      {tab === "revenue" && <RevenueTab />}
      {tab === "transactions" && <TransactionsTab />}
      {tab === "expenses" && <ExpensesTab />}
      {tab === "stats" && <StatsTab />}
      {tab === "reconcile" && <ReconcileTab />}
      {tab === "export" && <ExportTab />}
    </div>
  );
}

/* ============ TAB 1: TÀI KHOẢN NHẬN TIỀN ============ */
function AccountTab() {
  const [form, setForm] = useState({ bank: "VCB", account: "", accountName: "" });
  const [original, setOriginal] = useState({ bank: "VCB", account: "", accountName: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.get()
      .then(d => {
        const init = {
          bank: d.bank || "VCB",
          account: d.account || "",
          accountName: d.accountName || ""
        };
        setForm(init);
        setOriginal(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEdit = () => {
    setIsEditing(true);
    setSaved(false);
    toast("Bấm Lưu để hoàn tất", "info");
  };

  const cancelEdit = () => {
    setForm(original);
    setIsEditing(false);
    toast("Đã hủy thay đổi", "info");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.settings.update(form);
      setOriginal(form);
      toast("Đã lưu tài khoản nhận tiền", "success");
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const banks = [
    { code: "VCB", name: "Vietcombank" }, { code: "TCB", name: "Techcombank" },
    { code: "VIB", name: "VIB" }, { code: "MBB", name: "MB Bank" },
    { code: "ACB", name: "ACB" }, { code: "TPB", name: "TPBank" },
    { code: "VPB", name: "VPBank" }, { code: "STB", name: "Sacombank" },
    { code: "BIDV", name: "BIDV" }, { code: "ICB", name: "Vietinbank" },
    { code: "AGB", name: "Agribank" }
  ];

  const qrPreview = "https://img.vietqr.io/image/" + form.bank + "-" + form.account + "-compact2.png?amount=35000&accountName=" + encodeURIComponent(form.accountName);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ ...h3Style, margin: 0 }}><CreditCard size={18} /> Tài khoản nhận tiền</h3>
          {!loading && !isEditing && (
            <button onClick={startEdit} style={{
              padding: "8px 16px",
              background: "var(--bg-tertiary, #f5f7fb)",
              border: "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 8,
              cursor: "pointer",
              color: "var(--text-primary, #172033)",
              fontSize: 13, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
              <Pencil size={14} /> Sửa
            </button>
          )}
        </div>

        {isEditing && (
          <div style={{
            padding: "8px 12px",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#92400e",
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 14,
            fontWeight: 600
          }}>
            ✏️ Đang chỉnh sửa — bấm "Lưu" để hoàn tất hoặc "Hủy" để bỏ
          </div>
        )}

        <label style={labelStyle}>Ngân hàng</label>
        <select
          value={form.bank}
          onChange={e => setForm({ ...form, bank: e.target.value })}
          disabled={!isEditing}
          style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7, cursor: isEditing ? "pointer" : "not-allowed" }}
        >
          {banks.map(b => <option key={b.code} value={b.code}>{b.name} ({b.code})</option>)}
        </select>

        <label style={labelStyle}>Số tài khoản</label>
        <input
          value={form.account}
          onChange={e => setForm({ ...form, account: e.target.value })}
          placeholder="1234567890"
          disabled={!isEditing}
          style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7 }}
        />

        <label style={labelStyle}>Chủ tài khoản</label>
        <input
          value={form.accountName}
          onChange={e => setForm({ ...form, accountName: e.target.value.toUpperCase() })}
          placeholder="NGUYEN VAN A"
          disabled={!isEditing}
          style={{ ...inputStyle, opacity: isEditing ? 1 : 0.7 }}
        />

        {isEditing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            <button onClick={cancelEdit} disabled={saving} style={{
              padding: 14,
              background: "var(--card-bg, #fff)",
              color: "#ef4444",
              border: "1px solid #ef4444",
              borderRadius: 10,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              <X size={16} /> Hủy
            </button>
            <button onClick={save} disabled={saving} style={{
              padding: 14,
              background: saving ? "#94a3b8" : "#2634d5",
              color: "#fff", border: 0, borderRadius: 10,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              <Save size={16} /> {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        ) : (
          saved && (
            <div style={{
              marginTop: 8,
              padding: 14,
              background: "#e8f9f1",
              color: "#18a967",
              borderRadius: 10,
              fontWeight: 700,
              textAlign: "center",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%"
            }}>
              <CheckCircle2 size={18} /> Đã lưu
            </div>
          )
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={h3Style}>Preview QR</h3>
        <div style={{ textAlign: "center", padding: 14, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
          <img src={qrPreview} alt="QR" style={{ width: 200, height: 200, objectFit: "contain" }} onError={e => e.target.style.opacity = 0.3} />
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted, #64748b)", marginTop: 12, textAlign: "center" }}>
          QR này được dùng khi khách chọn thanh toán QR
        </div>
      </div>
    </div>
  );
}
/* ============ TAB 2: DOANH THU ============ */
function RevenueTab() {
  const [period, setPeriod] = useState("day");
  const [data, setData] = useState(null);

  useEffect(() => {
    api.reports.revenue(period).then(setData).catch(() => {});
  }, [period]);

  const periods = [
    { id: "day", label: "Ngày" }, { id: "week", label: "Tuần" },
    { id: "month", label: "Tháng" }, { id: "year", label: "Năm" }
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {periods.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            padding: "8px 16px", borderRadius: 20,
            background: period === p.id ? "#2634d5" : "var(--card-bg, #fff)",
            color: period === p.id ? "#fff" : "var(--text-muted, #475569)",
            border: "1px solid " + (period === p.id ? "#2634d5" : "var(--border-color, #e5e9ef)"),
            fontSize: 13, cursor: "pointer", fontWeight: period === p.id ? 700 : 500
          }}>{p.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <KPI label="Tổng doanh thu" value={money(data?.totalRevenue || 0)} color="#18a967" />
        <KPI label="Số đơn" value={data?.totalOrders || 0} color="#2634d5" />
        <KPI label="Giá trị TB / đơn" value={money(data?.avgOrder || 0)} color="#f59e0b" />
      </div>

      <div style={cardStyle}>
        <h3 style={h3Style}><TrendingUp size={18} /> Chi tiết doanh thu</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>Kỳ</th>
              <th style={thStyle}>Thời gian</th>
              <th style={thStyle}>Số đơn</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map((d, i) => (
              <tr key={i} style={trStyle}>
                <td style={tdStyle}><b>{d.label}</b></td>
                <td style={tdStyle}>{d.date}</td>
                <td style={tdStyle}>{d.orders}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}><b style={{ color: "#18a967" }}>{money(d.revenue)}</b></td>
              </tr>
            ))}
            {!data?.data?.length && <tr><td colSpan="4" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ TAB 3: GIAO DỊCH ============ */
function TransactionsTab() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.orders.all("Tất cả").then(setOrders).catch(() => {});
  }, []);

  const filtered = orders.filter(o => {
    if (filter === "paid") return o.status === "Hoàn thành";
    if (filter === "cancelled") return o.status === "Đã hủy";
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "all", label: "Tất cả" },
          { id: "paid", label: "Đã thanh toán" },
          { id: "cancelled", label: "Đã hủy" }
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "8px 16px", borderRadius: 20,
            background: filter === f.id ? "#2634d5" : "var(--card-bg, #fff)",
            color: filter === f.id ? "#fff" : "var(--text-muted, #475569)",
            border: "1px solid " + (filter === f.id ? "#2634d5" : "var(--border-color, #e5e9ef)"),
            fontSize: 13, cursor: "pointer", fontWeight: filter === f.id ? 700 : 500
          }}>{f.label}</button>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={h3Style}><Receipt size={18} /> Lịch sử giao dịch ({filtered.length})</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>Mã đơn</th>
              <th style={thStyle}>Khách</th>
              <th style={thStyle}>Ngày</th>
              <th style={thStyle}>PTTT</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Số tiền</th>
              <th style={thStyle}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o._id || o.id} style={trStyle}>
                <td style={tdStyle}><b>{o.code}</b></td>
                <td style={tdStyle}>{o.customer_name}</td>
                <td style={tdStyle}>{o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : "—"}</td>
                <td style={tdStyle}>{o.payment || "Tiền mặt"}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}><b>{money(o.total)}</b></td>
                <td style={tdStyle}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: o.status === "Hoàn thành" ? "#e8f9f1" : (o.status === "Đã hủy" ? "#fee2e2" : "#fff4d8"),
                    color: o.status === "Hoàn thành" ? "#18a967" : (o.status === "Đã hủy" ? "#ef4444" : "#c47d10")
                  }}>{o.status}</span>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có giao dịch</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ TAB 4: CHI PHÍ ============ */
function ExpensesTab() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Nguyên liệu", note: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.settings.get().then(d => {
      if (d.expenses) setExpenses(d.expenses);
    }).catch(() => {});
  }, []);

  const add = async () => {
    if (!form.title || !form.amount) { toast("Nhập đủ thông tin", "error"); return; }
    const newList = [...expenses, { ...form, amount: +form.amount, date: new Date().toISOString(), id: Date.now() }];
    try {
      await api.settings.update({ expenses: newList });
      setExpenses(newList);
      setForm({ title: "", amount: "", category: "Nguyên liệu", note: "" });
      setShowForm(false);
      toast("Đã thêm chi phí", "success");
    } catch (e) { toast(e.message, "error"); }
  };

  const remove = async (id) => {
    if (!confirm("Xóa chi phí này?")) return;
    const newList = expenses.filter(e => e.id !== id);
    await api.settings.update({ expenses: newList });
    setExpenses(newList);
    toast("Đã xóa", "success");
  };

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
        <KPI label="Tổng chi phí" value={money(totalExpense)} color="#ef4444" />
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: "10px 20px", background: "#2634d5", color: "#fff",
            border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6
          }}>
            <Plus size={16} /> {showForm ? "Đóng" : "Thêm chi phí"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <h3 style={h3Style}>Thêm khoản chi</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tên khoản chi *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="VD: Nhập gạo 50kg" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Số tiền *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="500000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Danh mục</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                <option>Nguyên liệu</option>
                <option>Nhập hàng</option>
                <option>Vận hành</option>
                <option>Lương</option>
                <option>Khác</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ghi chú</label>
              <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú thêm" style={inputStyle} />
            </div>
          </div>
          <button onClick={add} style={{
            marginTop: 12, padding: "12px 24px", background: "#18a967", color: "#fff",
            border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer"
          }}>Lưu chi phí</button>
        </div>
      )}

      <div style={cardStyle}>
        <h3 style={h3Style}><DollarSign size={18} /> Danh sách chi phí ({expenses.length})</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={theadStyle}>
              <th style={thStyle}>Ngày</th>
              <th style={thStyle}>Khoản chi</th>
              <th style={thStyle}>Danh mục</th>
              <th style={thStyle}>Ghi chú</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Số tiền</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} style={trStyle}>
                <td style={tdStyle}>{new Date(e.date).toLocaleDateString("vi-VN")}</td>
                <td style={tdStyle}><b>{e.title}</b></td>
                <td style={tdStyle}>{e.category}</td>
                <td style={tdStyle}>{e.note || "—"}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}><b style={{ color: "#ef4444" }}>-{money(e.amount)}</b></td>
                <td style={tdStyle}><button onClick={() => remove(e.id)} style={{
                  padding: "4px 10px", background: "transparent", color: "#ef4444",
                  border: "1px solid #ef4444", borderRadius: 6, fontSize: 11, cursor: "pointer"
                }}>Xóa</button></td>
              </tr>
            ))}
            {!expenses.length && <tr><td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>Chưa có chi phí</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ TAB 5: THỐNG KÊ ============ */
function StatsTab() {
  const [period, setPeriod] = useState("month");
  const [revenue, setRevenue] = useState(null);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    api.reports.revenue(period).then(setRevenue).catch(() => {});
    api.settings.get().then(d => {
      if (d.expenses) setExpenses(d.expenses);
    }).catch(() => {});
  }, [period]);

  const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const profit = (revenue?.totalRevenue || 0) - totalExpense;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["day", "week", "month", "year"].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: "8px 16px", borderRadius: 20,
            background: period === p ? "#2634d5" : "var(--card-bg, #fff)",
            color: period === p ? "#fff" : "var(--text-muted, #475569)",
            border: "1px solid " + (period === p ? "#2634d5" : "var(--border-color, #e5e9ef)"),
            fontSize: 13, cursor: "pointer", fontWeight: period === p ? 700 : 500
          }}>{p === "day" ? "Ngày" : p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <KPI label="Tổng doanh thu" value={money(revenue?.totalRevenue || 0)} color="#18a967" />
        <KPI label="Tổng chi phí" value={money(totalExpense)} color="#ef4444" />
        <KPI label="Lợi nhuận" value={money(profit)} color={profit >= 0 ? "#2634d5" : "#ef4444"} />
      </div>
    </div>
  );
}

/* ============ TAB 6: ĐỐI SOÁT ============ */
function ReconcileTab() {
  const [orders, setOrders] = useState([]);
  const [actualInput, setActualInput] = useState("");

  useEffect(() => {
    api.orders.all("Tất cả").then(setOrders).catch(() => {});
  }, []);

  const systemTotal = orders.filter(o => o.status === "Hoàn thành").reduce((s, o) => s + (o.total || 0), 0);
  const actual = +actualInput || 0;
  const diff = actual - systemTotal;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <KPI label="Tiền hệ thống" value={money(systemTotal)} color="#2634d5" />
        <KPI label="Tiền thực tế" value={money(actual)} color="#f59e0b" />
        <KPI label="Chênh lệch" value={money(diff)} color={diff === 0 ? "#18a967" : "#ef4444"} />
      </div>

      <div style={cardStyle}>
        <h3 style={h3Style}><CheckCircle2 size={18} /> Đối soát</h3>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13, marginTop: 0 }}>
          Nhập số tiền thực tế đã nhận (tiền mặt + chuyển khoản) để so sánh với hệ thống.
        </p>

        <label style={labelStyle}>Số tiền thực tế</label>
        <input type="number" value={actualInput} onChange={e => setActualInput(e.target.value)} placeholder="VD: 500000" style={inputStyle} />

        {actualInput && (
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 10,
            background: diff === 0 ? "#e8f9f1" : "#fde8e8",
            color: diff === 0 ? "#18a967" : "#ef4444",
            fontWeight: 700, fontSize: 14, textAlign: "center"
          }}>
            {diff === 0 ? "✅ Khớp chính xác!" : diff > 0 ? `⚠️ Thừa ${money(diff)}` : `⚠️ Thiếu ${money(-diff)}`}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ TAB 7: XUẤT BÁO CÁO ============ */
function ExportTab() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [orders, settings, reports] = await Promise.all([
        api.orders.all("Tất cả"),
        api.settings.get(),
        api.reports.revenue("day")
      ]);

      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59);

      const filteredOrders = (orders || []).filter(o => {
        const d = new Date(o.created_at);
        return d >= fromDate && d <= toDate;
      });

      const csv = [
        ["CANTEEN VWA - BAO CAO TAI CHINH"],
        ["Tu ngay", from, "Den ngay", to],
        [],
        ["MA DON", "KHACH HANG", "NGAY", "PTTT", "TRANG THAI", "TONG TIEN"],
        ...filteredOrders.map(o => [
          o.code,
          o.customer_name || "",
          o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : "",
          o.payment || "Tien mat",
          o.status,
          o.total || 0
        ]),
        [],
        ["TONG DOANH THU", filteredOrders.filter(o => o.status === "Hoàn thành").reduce((s, o) => s + o.total, 0)],
        ["SO DON", filteredOrders.length]
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canteen-baocao-${from}-to-${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Đã xuất báo cáo", "success");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={h3Style}><Download size={18} /> Xuất báo cáo tài chính</h3>
      <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13, marginTop: 0 }}>
        Xuất file CSV gồm: doanh thu, chi phí, giao dịch trong khoảng thời gian.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Từ ngày</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Đến ngày</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <button onClick={handleExport} disabled={exporting} style={{
        marginTop: 14, padding: "12px 24px", background: "#2634d5", color: "#fff",
        border: 0, borderRadius: 8, fontWeight: 600, cursor: exporting ? "not-allowed" : "pointer",
        display: "inline-flex", alignItems: "center", gap: 6
      }}>
        <Download size={16} /> {exporting ? "Đang xuất..." : "Tải xuống CSV"}
      </button>
    </div>
  );
}

/* ============ HELPERS ============ */
const cardStyle = {
  background: "var(--card-bg, #fff)",
  border: "1px solid var(--border-color, #e7ebf0)",
  borderRadius: 12, padding: 20
};
const h3Style = {
  marginTop: 0, marginBottom: 16, color: "var(--text-primary, #172033)",
  display: "flex", alignItems: "center", gap: 8, fontSize: 15
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  marginBottom: 4, color: "var(--text-muted, #475569)", marginTop: 4
};
const inputStyle = {
  width: "100%", padding: "10px 12px",
  border: "1px solid var(--border-color, #e5e9ef)",
  borderRadius: 8, marginBottom: 12, outline: "none",
  background: "var(--bg-secondary, #fff)",
  color: "var(--text-primary, #172033)", fontSize: 13
};
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const theadStyle = { background: "var(--bg-tertiary, #f5f7fb)" };
const thStyle = { padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" };
const trStyle = { borderBottom: "1px solid var(--border-color, #eef2f7)" };
const tdStyle = { padding: 11, fontSize: 13, color: "var(--text-primary, #172033)" };

function KPI({ label, value, color }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #e7ebf0)",
      borderRadius: 12, padding: 18
    }}>
      <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>{label}</span>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 6 }}>{value}</div>
    </div>
  );
}