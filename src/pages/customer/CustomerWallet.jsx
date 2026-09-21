import { useEffect, useState, useMemo } from "react";
import {
  Wallet, Plus, Minus, Link as LinkIcon, CreditCard, QrCode, Banknote,
  Clock, CheckCircle2, XCircle, ArrowDownCircle, ArrowUpCircle, ShoppingBag,
  Copy, Check, X, Save, Building2, History, AlertTriangle
} from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";

const BANKS = [
  { code: "VCB", name: "Vietcombank" }, { code: "TCB", name: "Techcombank" },
  { code: "VIB", name: "VIB" }, { code: "MBB", name: "MB Bank" },
  { code: "ACB", name: "ACB" }, { code: "TPB", name: "TPBank" },
  { code: "VPB", name: "VPBank" }, { code: "STB", name: "Sacombank" },
  { code: "BIDV", name: "BIDV" }, { code: "ICB", name: "Vietinbank" },
  { code: "AGB", name: "Agribank" }
];

export default function CustomerWallet({ user }) {
  const [wallet, setWallet] = useState({ balance: 0, bank_name: "", bank_account: "", bank_account_name: "", linked_at: "" });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showLinkBank, setShowLinkBank] = useState(false);

  const loadAll = async () => {
    try {
      const [w, txs] = await Promise.all([
        api.wallet.me().catch(() => null),
        api.wallet.transactions().catch(() => [])
      ]);
      if (w) setWallet(w);
      setTransactions(Array.isArray(txs) ? txs : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return transactions;
    if (tab === "deposit") return transactions.filter(t => t.type === "deposit");
    if (tab === "withdraw") return transactions.filter(t => t.type === "withdraw");
    if (tab === "payment") return transactions.filter(t => t.type === "payment");
    return transactions;
  }, [transactions, tab]);

  const stats = useMemo(() => {
    const approved = transactions.filter(t => t.status === "approved");
    return {
      deposited: approved.filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0),
      withdrawn: approved.filter(t => t.type === "withdraw").reduce((s, t) => s + t.amount, 0),
      paid: approved.filter(t => t.type === "payment").reduce((s, t) => s + t.amount, 0),
      pending: transactions.filter(t => t.status === "pending").length
    };
  }, [transactions]);

  const isLinked = !!wallet.bank_account;

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg, #2634d5 0%, #8b5cf6 50%, #18a967 100%)",
        borderRadius: 18, padding: "28px 32px", marginBottom: 20,
        color: "#fff", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -30, right: -20, fontSize: 140, opacity: 0.12 }}>💳</div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, opacity: 0.9, marginBottom: 8, letterSpacing: 1 }}>
            <Wallet size={14} /> VÍ CANTEEN
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>Số dư khả dụng</div>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            {money(wallet.balance || 0)}
          </div>
          <div className="wallet-hero-btns" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setShowDeposit(true)} style={{
              padding: "11px 20px", background: "#fff", color: "#2634d5",
              border: 0, borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 13,
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
              <Plus size={16} /> Nạp tiền
            </button>
            <button onClick={() => setShowWithdraw(true)} disabled={!isLinked || wallet.balance < 20000} style={{
              padding: "11px 20px",
              background: (!isLinked || wallet.balance < 20000) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.2)",
              color: (!isLinked || wallet.balance < 20000) ? "rgba(255,255,255,0.6)" : "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10, fontWeight: 700, fontSize: 13,
              cursor: (!isLinked || wallet.balance < 20000) ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
              <Minus size={16} /> Rút tiền
            </button>
            <button onClick={() => setShowLinkBank(true)} style={{
              padding: "11px 20px", background: "rgba(255,255,255,0.2)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 13,
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
              <LinkIcon size={16} /> {isLinked ? "Đổi tài khoản" : "Liên kết NH"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatBox icon={<ArrowDownCircle size={18} />} label="Đã nạp" value={money(stats.deposited)} color="#18a967" />
        <StatBox icon={<ArrowUpCircle size={18} />} label="Đã rút" value={money(stats.withdrawn)} color="#f59e0b" />
        <StatBox icon={<ShoppingBag size={18} />} label="Đã chi tiêu" value={money(stats.paid)} color="#8b5cf6" />
        <StatBox icon={<Clock size={18} />} label="Chờ duyệt" value={stats.pending} color="#ef4444" />
      </div>

      {isLinked && (
        <div style={{
          background: "linear-gradient(135deg, rgba(24, 169, 103, 0.08), rgba(38, 52, 213, 0.05))",
          border: "1px solid rgba(24, 169, 103, 0.3)",
          borderRadius: 12, padding: 16, marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#e8f9f1", color: "#18a967",
            display: "grid", placeItems: "center"
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 12, color: "var(--text-light, #8993a3)", fontWeight: 600, marginBottom: 2 }}>
              ĐÃ LIÊN KẾT TÀI KHOẢN
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
              <span><b>{wallet.bank_name}</b></span>
              <span style={{ fontFamily: "monospace" }}>{wallet.bank_account}</span>
              <span style={{ color: "var(--text-muted, #64748b)" }}>{wallet.bank_account_name}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <History size={18} /> Lịch sử giao dịch
          </h3>
          <div style={{ display: "flex", gap: 4, background: "var(--bg-tertiary, #f5f7fb)", padding: 4, borderRadius: 10 }}>
            {[
              { id: "all", label: "Tất cả" },
              { id: "deposit", label: "Nạp" },
              { id: "withdraw", label: "Rút" },
              { id: "payment", label: "Thanh toán" }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "7px 14px",
                background: tab === t.id ? "#2634d5" : "transparent",
                color: tab === t.id ? "#fff" : "var(--text-muted, #475569)",
                border: 0, borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap"
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)", background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10 }}>
            <Wallet size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 13 }}>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((t) => (
              <TransactionRow key={t.id} tx={t} />
            ))}
          </div>
        )}
      </div>

      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onSuccess={async () => { setShowDeposit(false); await loadAll(); }}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          balance={wallet.balance}
          bank={{ name: wallet.bank_name, account: wallet.bank_account, accountName: wallet.bank_account_name }}
          onClose={() => setShowWithdraw(false)}
          onSuccess={async () => { setShowWithdraw(false); await loadAll(); }}
        />
      )}

      {showLinkBank && (
        <LinkBankModal
          wallet={wallet}
          onClose={() => setShowLinkBank(false)}
          onSuccess={async () => { setShowLinkBank(false); await loadAll(); }}
        />
      )}
    </div>
  );
}

/* ============ TRANSACTION ROW ============ */
function TransactionRow({ tx }) {
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

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: 14, background: "var(--bg-tertiary, #f8fafc)",
      borderRadius: 10, border: "1px solid var(--border-color, #eef2f7)"
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: config.bg, color: config.color,
        display: "grid", placeItems: "center", flexShrink: 0
      }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <b style={{ fontSize: 13, color: "var(--text-primary, #172033)" }}>{config.label}</b>
          <span style={{
            padding: "2px 8px", borderRadius: 10,
            fontSize: 10, fontWeight: 700,
            background: statusConfig.bg, color: statusConfig.color
          }}>{statusConfig.label}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "monospace" }}>{tx.code}</span>
          {tx.method === "QR" && <span>· VietQR</span>}
          {tx.method === "CASH" && <span>· Tiền mặt</span>}
          {tx.method === "BANK" && <span>· Chuyển khoản</span>}
          {tx.method === "WALLET" && <span>· Ví</span>}
          <span>· {new Date(tx.created_at).toLocaleString("vi-VN")}</span>
        </div>
        {tx.admin_note && (
          <div style={{ fontSize: 11, color: "var(--text-muted, #64748b)", marginTop: 4, fontStyle: "italic" }}>
            Admin: "{tx.admin_note}"
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <b style={{ fontSize: 15, color: config.color }}>
          {config.sign}{money(tx.amount)}
        </b>
      </div>
    </div>
  );
}

/* ============ DEPOSIT MODAL ============ */
function DepositModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(100000);
  const [method, setMethod] = useState("QR");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tx, setTx] = useState(null);

  const submit = async () => {
    if (amount < 10000) { toast("Số tiền tối thiểu 10.000đ", "error"); return; }
    setSubmitting(true);
    try {
      const res = await api.wallet.deposit({ amount, method, note });
      setTx(res.transaction);
      toast("Đã tạo yêu cầu nạp tiền", "success");
      if (method === "CASH") {
        setTimeout(() => onSuccess(), 800);
      } else {
        setStep(2);
      }
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  if (step === 2 && tx && method === "QR") {
    const qrUrl = "https://img.vietqr.io/image/VCB-1234567890-compact2.png?amount=" + tx.amount + "&addInfo=" + encodeURIComponent(tx.code) + "&accountName=" + encodeURIComponent("CANTEEN VWA");
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#eef2ff", color: "#2634d5", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
              <QrCode size={28} />
            </div>
            <h3 style={{ margin: "0 0 6px", color: "var(--text-primary, #172033)" }}>Quét mã để nạp tiền</h3>
            <p style={{ margin: 0, color: "var(--text-muted, #64748b)", fontSize: 13 }}>
              Chuyển <b style={{ color: "#2634d5" }}>{money(tx.amount)}</b> với nội dung <b>{tx.code}</b>
            </p>
          </div>

          <div style={{ background: "#fff", padding: 16, borderRadius: 12, display: "grid", placeItems: "center", marginBottom: 16, border: "1px solid var(--border-color, #e5e9ef)" }}>
            <img src={qrUrl} alt="QR" style={{ width: 240, height: 240 }} onError={(e) => e.target.style.opacity = 0.3} />
          </div>

          <div style={{ background: "#fff4d8", border: "1px solid #f59e0b40", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: "#92400e", display: "flex", gap: 8 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Sau khi chuyển khoản, admin sẽ xác nhận trong vòng 5-15 phút. Số dư sẽ cập nhật tự động.</span>
          </div>

          <button onClick={onClose} style={{ width: "100%", padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Đã hiểu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={20} style={{ color: "#18a967" }} /> Nạp tiền vào ví
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
        </div>

        <label style={label}>Số tiền *</label>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            style={{ ...input, paddingRight: 50, fontSize: 18, fontWeight: 700, color: "#18a967" }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-light, #94a3b8)", fontWeight: 600 }}>đ</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
          {quickAmounts.map(a => (
            <button key={a} type="button" onClick={() => setAmount(a)} style={{
              padding: "8px 4px",
              background: amount === a ? "#2634d5" : "var(--bg-tertiary, #f5f7fb)",
              color: amount === a ? "#fff" : "var(--text-primary, #172033)",
              border: "1px solid " + (amount === a ? "#2634d5" : "var(--border-color, #e5e9ef)"),
              borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700
            }}>{a.toLocaleString("vi-VN")}đ</button>
          ))}
        </div>

        <label style={label}>Phương thức nạp</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { id: "QR", icon: QrCode, label: "Chuyển khoản", desc: "VietQR", color: "#2634d5" },
            { id: "CASH", icon: Banknote, label: "Tiền mặt", desc: "Tại quầy", color: "#18a967" }
          ].map(m => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)} style={{
                padding: 14,
                background: active ? m.color + "15" : "var(--card-bg, #fff)",
                border: active ? "2px solid " + m.color : "1px solid var(--border-color, #e5e9ef)",
                borderRadius: 10, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4
              }}>
                <Icon size={22} style={{ color: active ? m.color : "var(--text-light, #94a3b8)" }} />
                <b style={{ fontSize: 12, color: active ? m.color : "var(--text-primary, #475569)" }}>{m.label}</b>
                <span style={{ fontSize: 10, color: "var(--text-light, #94a3b8)" }}>{m.desc}</span>
              </button>
            );
          })}
        </div>

        <label style={label}>Ghi chú</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Nạp để mua đồ ăn sáng..."
          style={input}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={btnCancel}>Hủy</button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || amount < 10000}
            style={{
              ...btnPrimary,
              background: (submitting || amount < 10000) ? "#94a3b8" : "#18a967"
            }}
          >
            {submitting ? "Đang tạo..." : "Nạp " + amount.toLocaleString("vi-VN") + "đ"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ WITHDRAW MODAL ============ */
function WithdrawModal({ balance, bank, onClose, onSuccess }) {
  const [amount, setAmount] = useState(50000);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (amount < 20000) { toast("Số tiền tối thiểu 20.000đ", "error"); return; }
    if (amount > balance) { toast("Số dư không đủ", "error"); return; }
    setSubmitting(true);
    try {
      await api.wallet.withdraw({ amount, note });
      toast("Đã tạo yêu cầu rút tiền", "success");
      onSuccess();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <Minus size={20} style={{ color: "#f59e0b" }} /> Rút tiền về ngân hàng
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ background: "linear-gradient(135deg, #fef3c7, #fff4d8)", border: "1px solid #f59e0b40", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: "#92400e" }}>
          <div><b>Số dư khả dụng:</b> {money(balance)}</div>
        </div>

        <label style={label}>Số tiền rút *</label>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            style={{ ...input, paddingRight: 50, fontSize: 18, fontWeight: 700, color: "#f59e0b" }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-light, #94a3b8)", fontWeight: 600 }}>đ</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
          {[50000, 100000, 200000].map(a => (
            <button key={a} type="button" onClick={() => setAmount(a)} disabled={a > balance} style={{
              padding: "8px 4px",
              background: amount === a ? "#f59e0b" : "var(--bg-tertiary, #f5f7fb)",
              color: amount === a ? "#fff" : "var(--text-primary, #172033)",
              border: "1px solid " + (amount === a ? "#f59e0b" : "var(--border-color, #e5e9ef)"),
              borderRadius: 7, cursor: a > balance ? "not-allowed" : "pointer",
              fontSize: 11, fontWeight: 700, opacity: a > balance ? 0.4 : 1
            }}>{a.toLocaleString("vi-VN")}đ</button>
          ))}
        </div>
        <button type="button" onClick={() => setAmount(balance)} style={{
          width: "100%", padding: 8, marginBottom: 14,
          background: "var(--bg-tertiary, #f5f7fb)",
          border: "1px dashed var(--border-color, #cbd5e1)",
          borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
          color: "var(--text-muted, #64748b)"
        }}>Rút hết {money(balance)}</button>

        <label style={label}>Tài khoản nhận</label>
        <div style={{ background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <Building2 size={14} style={{ color: "#2634d5" }} />
            <b>{bank.name}</b>
          </div>
          <div style={{ fontFamily: "monospace", color: "var(--text-muted, #64748b)" }}>
            {bank.account} · {bank.accountName}
          </div>
        </div>

        <label style={label}>Ghi chú</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: Cần tiền mặt gấp..." style={input} />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={btnCancel}>Hủy</button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || amount < 20000 || amount > balance}
            style={{
              ...btnPrimary,
              background: (submitting || amount < 20000 || amount > balance) ? "#94a3b8" : "#f59e0b"
            }}
          >
            {submitting ? "Đang gửi..." : "Yêu cầu rút"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ LINK BANK MODAL ============ */
function LinkBankModal({ wallet, onClose, onSuccess }) {
  const [bankName, setBankName] = useState(wallet.bank_name || "VCB");
  const [account, setAccount] = useState(wallet.bank_account || "");
  const [accountName, setAccountName] = useState(wallet.bank_account_name || "");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!account.trim() || account.trim().length < 6) { toast("Số tài khoản không hợp lệ", "error"); return; }
    if (!accountName.trim()) { toast("Vui lòng nhập tên chủ tài khoản", "error"); return; }
    setSubmitting(true);
    try {
      await api.wallet.linkBank({
        bank_name: bankName,
        bank_account: account.trim(),
        bank_account_name: accountName.trim()
      });
      toast("Đã liên kết tài khoản", "success");
      onSuccess();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCard size={20} style={{ color: "#2634d5" }} /> Liên kết tài khoản ngân hàng
          </h3>
          <button onClick={onClose} style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ background: "#eef2ff", border: "1px solid #2634d540", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: "#2634d5", display: "flex", gap: 8 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Tài khoản này dùng để <b>rút tiền</b> từ ví Canteen. Đảm bảo thông tin chính xác để tránh mất tiền.</span>
        </div>

        <label style={label}>Ngân hàng *</label>
        <select value={bankName} onChange={(e) => setBankName(e.target.value)} style={input}>
          {BANKS.map(b => <option key={b.code} value={b.code}>{b.name} ({b.code})</option>)}
        </select>

        <label style={label}>Số tài khoản *</label>
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="1234567890"
          style={{ ...input, fontFamily: "monospace" }}
        />

        <label style={label}>Tên chủ tài khoản *</label>
        <input
          value={accountName}
          onChange={(e) => setAccountName(e.target.value.toUpperCase())}
          placeholder="NGUYEN VAN A"
          style={input}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} style={btnCancel}>Hủy</button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !account.trim() || !accountName.trim()}
            style={{
              ...btnPrimary,
              background: (submitting || !account.trim() || !accountName.trim()) ? "#94a3b8" : "#2634d5"
            }}
          >
            {submitting ? "Đang lưu..." : "Lưu tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ SMALL COMPONENTS ============ */
function StatBox({ icon, label, value, color }) {
  return (
    <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e7ebf0)", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: color + "18", color, display: "grid", placeItems: "center" }}>{icon}</div>
        <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

const label = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 12, color: "var(--text-muted, #475569)" };
const input = { width: "100%", padding: 10, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, outline: "none", background: "var(--bg-secondary, #fff)", color: "var(--text-primary, #172033)", fontSize: 13, boxSizing: "border-box" };
const btnCancel = { flex: 1, padding: 12, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", cursor: "pointer", color: "var(--text-primary, #172033)", fontWeight: 600 };
const btnPrimary = { flex: 1, padding: 12, background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer" };