import { useEffect, useState, useMemo } from "react";
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, ShoppingBag, Clock,
  CheckCircle2, XCircle, Check, Ban, Search, Filter,
  Users, TrendingUp, AlertTriangle, Eye, Copy, Building2, X
} from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";

const STATUS_TABS = [
  { id: "pending", label: "Chờ duyệt", color: "#f59e0b" },
  { id: "approved", label: "Đã duyệt", color: "#18a967" },
  { id: "rejected", label: "Từ chối", color: "#ef4444" },
  { id: "all", label: "Tất cả", color: "#2634d5" }
];

export default function OwnerWallet() {
  const [allTx, setAllTx] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0, totalUsers: 0, totalDeposited: 0,
    totalWithdrawn: 0, totalPaid: 0, pendingCount: 0,
    pendingDepositCount: 0, pendingWithdrawCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [q, setQ] = useState("");
  const [processing, setProcessing] = useState({});
  const [detailTx, setDetailTx] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [txs, st] = await Promise.all([
        api.wallet.all().catch(() => []),
        api.wallet.stats().catch(() => null)
      ]);
      setAllTx(Array.isArray(txs) ? txs : []);
      if (st) setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setInterval(() => {
      Promise.all([
        api.wallet.all().catch(() => []),
        api.wallet.stats().catch(() => null)
      ]).then(([txs, st]) => {
        setAllTx(Array.isArray(txs) ? txs : []);
        if (st) setStats(st);
      }).catch(() => {});
    }, 20000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let result = [...allTx];
    if (tab !== "all") result = result.filter(t => t.status === tab);
    if (typeFilter !== "all") result = result.filter(t => t.type === typeFilter);
    if (q.trim()) {
      const s = q.toLowerCase();
      result = result.filter(t =>
        (t.user_name || "").toLowerCase().includes(s) ||
        (t.user_email || "").toLowerCase().includes(s) ||
        (t.code || "").toLowerCase().includes(s)
      );
    }
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return result;
  }, [allTx, tab, typeFilter, q]);

  const counts = useMemo(() => ({
    pending: allTx.filter(t => t.status === "pending").length,
    approved: allTx.filter(t => t.status === "approved").length,
    rejected: allTx.filter(t => t.status === "rejected").length,
    all: allTx.length
  }), [allTx]);

  const approve = async (tx) => {
    setProcessing(p => ({ ...p, [tx.id]: "approve" }));
    try {
      await api.wallet.approve(tx.id);
      toast("Đã duyệt " + tx.code, "success");
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[tx.id]; return n; });
    }
  };

  const reject = async (tx) => {
    const note = prompt("Lý do từ chối (tùy chọn):", "");
    if (note === null) return;
    setProcessing(p => ({ ...p, [tx.id]: "reject" }));
    try {
      await api.wallet.reject(tx.id, note);
      toast("Đã từ chối " + tx.code, "success");
      load();
    } catch (e) {
      toast(e.message || "Lỗi", "error");
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[tx.id]; return n; });
    }
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatBox icon={<Wallet size={20} />} label="Tổng số dư ví" value={money(stats.totalBalance)} color="#2634d5" />
        <StatBox icon={<ArrowDownCircle size={20} />} label="Đã nạp" value={money(stats.totalDeposited)} color="#18a967" />
        <StatBox icon={<ArrowUpCircle size={20} />} label="Đã rút" value={money(stats.totalWithdrawn)} color="#f59e0b" />
        <StatBox icon={<ShoppingBag size={20} />} label="Thanh toán ví" value={money(stats.totalPaid)} color="#8b5cf6" />
      </div>

      {stats.pendingCount > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.08))",
          border: "2px solid #f59e0b", borderRadius: 12,
          padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
        }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <b style={{ fontSize: 14, color: "#92400e", display: "block", marginBottom: 2 }}>
              Có {stats.pendingCount} yêu cầu chờ duyệt
            </b>
            <span style={{ fontSize: 13, color: "#78350f" }}>
              {stats.pendingDepositCount} nạp · {stats.pendingWithdrawCount} rút — vui lòng xử lý sớm
            </span>
          </div>
          <button onClick={() => { setTab("pending"); setTypeFilter("all"); }} style={{
            padding: "9px 16px", background: "#f59e0b", color: "#fff",
            border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13
          }}>
            Xem ngay
          </button>
        </div>
      )}

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-tertiary, #f5f7fb)", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, padding: "8px 12px", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ color: "var(--text-light, #8993a3)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo tên, email, mã GD..." style={{ flex: 1, border: 0, outline: "none", background: "transparent", color: "var(--text-primary, #172033)", fontSize: 13 }} />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="all">Tất cả loại</option>
            <option value="deposit">Nạp tiền</option>
            <option value="withdraw">Rút tiền</option>
            <option value="payment">Thanh toán</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 4, background: "var(--bg-tertiary, #f5f7fb)", padding: 4, borderRadius: 10, flexWrap: "wrap" }}>
          {STATUS_TABS.map(t => {
            const active = tab === t.id;
            const count = counts[t.id] || 0;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "9px 14px",
                background: active ? t.color : "transparent",
                color: active ? "#fff" : "var(--text-muted, #475569)",
                border: 0, borderRadius: 8, cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap"
              }}>
                {t.label}
                {count > 0 && (
                  <span style={{
                    background: active ? "rgba(255,255,255,0.3)" : (t.id === "pending" ? "#ef4444" : "var(--card-bg, #e2e8f0)"),
                    color: active ? "#fff" : (t.id === "pending" ? "#fff" : "var(--text-muted, #64748b)"),
                    minWidth: 20, height: 18, padding: "0 6px", borderRadius: 9,
                    fontSize: 10.5, fontWeight: 800,
                    display: "inline-flex", alignItems: "center", justifyContent: "center"
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>
            <Wallet size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 13 }}>
              {tab === "pending" ? "Không có yêu cầu nào chờ duyệt" : "Chưa có giao dịch nào"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(tx => (
              <TxRow
                key={tx.id}
                tx={tx}
                processing={processing[tx.id]}
                onApprove={() => approve(tx)}
                onReject={() => reject(tx)}
                onView={() => setDetailTx(tx)}
              />
            ))}
          </div>
        )}
      </div>

      {detailTx && <DetailModal tx={detailTx} onClose={() => setDetailTx(null)} />}
    </div>
  );
}

function TxRow({ tx, processing, onApprove, onReject, onView }) {
  const config = {
    deposit: { icon: ArrowDownCircle, color: "#18a967", bg: "#e8f9f1", label: "Nạp tiền", sign: "+" },
    withdraw: { icon: ArrowUpCircle, color: "#f59e0b", bg: "#fef3c7", label: "Rút tiền", sign: "-" },
    payment: { icon: ShoppingBag, color: "#8b5cf6", bg: "#ede9fe", label: "Thanh toán", sign: "-" }
  }[tx.type] || { icon: Wallet, color: "#2634d5", bg: "#eef2ff", label: "Giao dịch", sign: "" };

  const statusConfig = {
    pending: { label: "Chờ duyệt", color: "#f59e0b", bg: "#fef3c7" },
    approved: { label: "Thành công", color: "#18a967", bg: "#e8f9f1" },
    rejected: { label: "Từ chối", color: "#ef4444", bg: "#fee2e2" }
  }[tx.status] || { label: "—", color: "#64748b", bg: "#f1f5f9" };

  const Icon = config.icon;
  const isPending = tx.status === "pending";
  const isProcessing = !!processing;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: 14, background: "var(--bg-tertiary, #f8fafc)",
      borderRadius: 10,
      border: isPending ? "1px solid " + config.color + "40" : "1px solid var(--border-color, #eef2f7)"
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: config.bg, color: config.color,
        display: "grid", placeItems: "center", flexShrink: 0
      }}>
        <Icon size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <b style={{ fontSize: 13, color: "var(--text-primary, #172033)" }}>{tx.user_name || "Khách"}</b>
          <span style={{
            padding: "2px 8px", borderRadius: 10,
            fontSize: 10, fontWeight: 700,
            background: statusConfig.bg, color: statusConfig.color
          }}>{statusConfig.label}</span>
          {tx.method === "QR" && <span style={{ fontSize: 10, color: "#2634d5", background: "#eef2ff", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>VietQR</span>}
          {tx.method === "CASH" && <span style={{ fontSize: 10, color: "#18a967", background: "#e8f9f1", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Tiền mặt</span>}
          {tx.method === "BANK" && <span style={{ fontSize: 10, color: "#f59e0b", background: "#fef3c7", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Bank</span>}
          {tx.method === "WALLET" && <span style={{ fontSize: 10, color: "#8b5cf6", background: "#ede9fe", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Ví</span>}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "monospace" }}>{tx.code}</span>
          <span>· {tx.user_email}</span>
          <span>· {new Date(tx.created_at).toLocaleString("vi-VN")}</span>
        </div>
        {tx.note && (
          <div style={{ fontSize: 11, color: "var(--text-muted, #64748b)", marginTop: 3, fontStyle: "italic" }}>
            "{tx.note}"
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, marginRight: 8 }}>
        <b style={{ fontSize: 16, color: config.color, display: "block" }}>
          {config.sign}{money(tx.amount)}
        </b>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={onView} title="Chi tiết" style={iconBtn}>
          <Eye size={14} />
        </button>
        {isPending && (
          <>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              title="Duyệt"
              style={{
                padding: "7px 12px", background: "#18a967", color: "#fff",
                border: 0, borderRadius: 7,
                cursor: isProcessing ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 12,
                display: "inline-flex", alignItems: "center", gap: 4,
                opacity: isProcessing ? 0.5 : 1
              }}
            >
              <Check size={13} /> Duyệt
            </button>
            <button
              onClick={onReject}
              disabled={isProcessing}
              title="Từ chối"
              style={{
                padding: "7px 12px", background: "var(--card-bg, #fff)", color: "#ef4444",
                border: "1px solid #ef4444", borderRadius: 7,
                cursor: isProcessing ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 12,
                display: "inline-flex", alignItems: "center", gap: 4,
                opacity: isProcessing ? 0.5 : 1
              }}
            >
              <Ban size={13} /> Từ chối
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DetailModal({ tx, onClose }) {
  const config = {
    deposit: { icon: ArrowDownCircle, color: "#18a967", label: "Nạp tiền" },
    withdraw: { icon: ArrowUpCircle, color: "#f59e0b", label: "Rút tiền" },
    payment: { icon: ShoppingBag, color: "#8b5cf6", label: "Thanh toán" }
  }[tx.type] || { icon: Wallet, color: "#2634d5", label: "Giao dịch" };
  const Icon = config.icon;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100, padding: 20, overflowY: "auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 500 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon size={20} style={{ color: config.color }} /> Chi tiết giao dịch
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InfoRow label="Mã GD" value={tx.code} mono />
          <InfoRow label="Loại" value={config.label} />
          <InfoRow label="Số tiền" value={money(tx.amount)} highlight={config.color} />
          <InfoRow label="Khách hàng" value={tx.user_name || "—"} />
          <InfoRow label="Email" value={tx.user_email || "—"} />
          <InfoRow label="Phương thức" value={tx.method || "—"} />
          <InfoRow label="Trạng thái" value={tx.status === "pending" ? "Chờ duyệt" : tx.status === "approved" ? "Đã duyệt" : "Từ chối"} />
          <InfoRow label="Ngày tạo" value={new Date(tx.created_at).toLocaleString("vi-VN")} />
          {tx.approved_at && <InfoRow label="Ngày duyệt" value={new Date(tx.approved_at).toLocaleString("vi-VN")} />}
          {tx.approved_by && <InfoRow label="Người duyệt" value={tx.approved_by} />}
          {tx.bank_name && (
            <div style={{ background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", marginBottom: 6, fontWeight: 600 }}>THÔNG TIN NGÂN HÀNG</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                <Building2 size={13} style={{ color: "#2634d5" }} />
                <b style={{ fontSize: 13 }}>{tx.bank_name}</b>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-muted, #64748b)" }}>
                {tx.bank_account}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted, #64748b)", marginTop: 2 }}>
                {tx.bank_account_name}
              </div>
            </div>
          )}
          {tx.note && (
            <div style={{ background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", marginBottom: 4, fontWeight: 600 }}>GHI CHÚ CỦA KHÁCH</div>
              <div style={{ fontSize: 13, color: "var(--text-primary, #172033)", fontStyle: "italic" }}>"{tx.note}"</div>
            </div>
          )}
          {tx.admin_note && (
            <div style={{ background: "#fef3c7", borderRadius: 10, padding: 12, border: "1px solid #f59e0b40" }}>
              <div style={{ fontSize: 11, color: "#92400e", marginBottom: 4, fontWeight: 600 }}>GHI CHÚ CỦA ADMIN</div>
              <div style={{ fontSize: 13, color: "#92400e" }}>{tx.admin_note}</div>
            </div>
          )}
        </div>

        <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          Đóng
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
      <span style={{ color: "var(--text-muted, #64748b)" }}>{label}</span>
      <b style={{
        color: highlight || "var(--text-primary, #172033)",
        fontFamily: mono ? "monospace" : "inherit",
        fontSize: highlight ? 15 : 13
      }}>{value}</b>
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", color, display: "grid", placeItems: "center" }}>{icon}</div>
        <span style={{ fontSize: 11.5, color: "var(--text-light, #8993a3)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

const iconBtn = { padding: 6, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 6, background: "var(--card-bg, #fff)", cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-primary, #172033)", width: 30, height: 30 };
const selectStyle = { padding: "9px 12px", border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13, cursor: "pointer" };