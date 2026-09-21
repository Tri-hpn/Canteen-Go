import { useState, useEffect, useRef } from "react";
import { X, Package, Clock, CheckCircle2, ChefHat, Truck, Star, Send, Heart, Edit3 } from "lucide-react";
import { api } from "../api";
import { money } from "./UI";
import { toast } from "./Effects";

const STATUS_FLOW = {
  "Chờ xác nhận": { step: 1, label: "Chờ xác nhận", color: "#f59e0b" },
  "Đã xác nhận": { step: 2, label: "Đã xác nhận", color: "#2634d5" },
  "Đang chuẩn bị": { step: 3, label: "Đang chuẩn bị", color: "#8b5cf6" },
  "Sẵn sàng nhận": { step: 4, label: "Sẵn sàng nhận", color: "#18a967" },
  "Hoàn thành": { step: 5, label: "Hoàn thành", color: "#18a967" },
  "Đã hủy": { step: 0, label: "Đã hủy", color: "#ef4444" }
};

const ALL_STEPS = [
  { step: 1, label: "Chờ xác nhận", icon: Clock },
  { step: 2, label: "Đã xác nhận", icon: CheckCircle2 },
  { step: 3, label: "Đang chuẩn bị", icon: ChefHat },
  { step: 4, label: "Sẵn sàng nhận", icon: Truck },
  { step: 5, label: "Hoàn thành", icon: CheckCircle2 }
];

export default function CustomerOrderDetail({ order: initialOrder, user, onClose, onUpdate }) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  // Review state
  const [showReview, setShowReview] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [myReviews, setMyReviews] = useState([]);

  const [checking, setChecking] = useState(true);
  const lastCodeRef = useRef(null);

  // Kiem tra da danh gia chua
  useEffect(() => {
    if (!initialOrder) return;
    // Chi chay khi code THAT SU doi (khong phai object ref doi)
    if (lastCodeRef.current === initialOrder.code) return;
    lastCodeRef.current = initialOrder.code;

    setChecking(true);

    // Check localStorage truoc
    const reviewedKey = "reviewed_order_" + initialOrder.code;
    const localReviewed = localStorage.getItem(reviewedKey);

    api.reviews.me()
      .then((list) => {
        const itemIds = (initialOrder.items || []).map(it => it.menu_item_id);
        const mine = (list || []).filter(r => itemIds.includes(r.menu_item_id));
        setMyReviews(mine);

        // Da danh gia neu: co localStorage HOAC API tra ve >= so mon
        if (localReviewed || (mine.length > 0 && mine.length >= itemIds.length)) {
          setReviewed(true);
          setReviewedCount(mine.length || itemIds.length);
        } else {
          setReviewed(false);
          setReviewedCount(0);
        }
      })
      .catch(() => {
        setMyReviews([]);
        // Fallback: dung localStorage
        if (localReviewed) {
          setReviewed(true);
        }
      })
      .finally(() => setChecking(false));
  }, [initialOrder]);

  if (!order) return null;

  const current = STATUS_FLOW[order.status] || STATUS_FLOW["Chờ xác nhận"];
  const isCancelled = order.status === "Đã hủy";
  const isCompleted = order.status === "Hoàn thành";

  const handleReceived = async () => {
    if (!confirm("Xác nhận bạn đã nhận món?")) return;
    setLoading(true);
    try {
      await api.orders.received(order.id || order._id);
      toast("Đã nhận món! Cảm ơn bạn!", "success");
      onUpdate?.();
      onClose?.();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;
    setLoading(true);
    try {
      await api.orders.cancel(order.id || order._id);
      toast("Đã hủy đơn", "success");
      onUpdate?.();
      onClose?.();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const openReview = () => {
    const items = order.items || [];
    if (!items.length) {
      toast("Đơn hàng không có món để đánh giá", "error");
      return;
    }
    setRating(5);
    setComment("");
    setShowReview(true);
    setShowMyReviews(false);
  };

  const submitReview = async () => {
    const items = order.items || [];
    if (!items.length) return;

    setSubmitting(true);
    let success = 0;

    for (const it of items) {
      try {
        await api.reviews.create({
          menuItemId: it.menu_item_id,
          rating,
          comment: comment.trim() || ""
        });
        success++;
      } catch (e) {
        // Bo qua mon da danh gia
      }
    }

    setSubmitting(false);

    if (success > 0) {
      setReviewedCount(success);
      setReviewed(true);
      setShowReview(false);

      // Luu localStorage danh dau don da danh gia
      localStorage.setItem("reviewed_order_" + order.code, Date.now().toString());

      // Reload my reviews de hien thi lai
      api.reviews.me().then((list) => {
        const itemIds = (order.items || []).map(it => it.menu_item_id);
        setMyReviews((list || []).filter(r => itemIds.includes(r.menu_item_id)));
      }).catch(() => {});

      window.dispatchEvent(new CustomEvent("refresh-user"));
      window.dispatchEvent(new CustomEvent("order-reviewed"));
      onUpdate?.();
    } else {
      toast("Không thể gửi đánh giá. Có thể các món đã được đánh giá rồi.", "error");
    }
  };

  // Xem lai danh gia
  const openMyReviews = () => {
    setShowMyReviews(true);
    setShowReview(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "grid", placeItems: "center", zIndex: 100, padding: 20, overflowY: "auto"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg, #fff)", borderRadius: 14, padding: 24,
          width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto"
        }}
      >
        {/* ============ MAN HINH XEM LAI DANH GIA ============ */}
        {showMyReviews ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                  color: "#fff", display: "grid", placeItems: "center"
                }}>
                  <Star size={20} fill="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>Đánh giá của bạn</h3>
                  <b style={{ fontSize: 13, color: "#2634d5" }}>{order.code}</b>
                </div>
              </div>
              <button
                onClick={() => setShowMyReviews(false)}
                style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div style={{
              padding: 14, background: "linear-gradient(135deg, rgba(24, 169, 103, 0.1), rgba(38, 52, 213, 0.1))",
              borderRadius: 10, marginBottom: 18, fontSize: 13, color: "#18a967", fontWeight: 600, textAlign: "center"
            }}>
              ✨ Bạn đã được cộng <b>{myReviews.length * 10} điểm</b> từ đánh giá này
            </div>

            {myReviews.map((r, i) => {
              const item = (order.items || []).find(it => it.menu_item_id === r.menu_item_id);
              return (
                <div key={r.id || i} style={{
                  padding: 14, background: "var(--bg-tertiary, #f8fafc)",
                  borderRadius: 10, marginBottom: 12,
                  border: "1px solid var(--border-color, #e5e9ef)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <b style={{ color: "var(--text-primary, #172033)", fontSize: 13 }}>
                      {item?.name || "Món ăn"}
                    </b>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= r.rating ? "#f59e0b" : "none"}
                          color={s <= r.rating ? "#f59e0b" : "#cbd5e1"}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted, #64748b)", fontStyle: "italic" }}>
                      "{r.comment}"
                    </p>
                  )}
                  {!r.comment && (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-light, #94a3b8)" }}>
                      (Không có nhận xét)
                    </p>
                  )}
                  <div style={{ fontSize: 10, color: "var(--text-light, #94a3b8)", marginTop: 8 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString("vi-VN") : ""}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowMyReviews(false)}
              style={{
                width: "100%", padding: 12, marginTop: 12,
                background: "#2634d5", color: "#fff", border: 0, borderRadius: 8,
                fontWeight: 600, cursor: "pointer", fontSize: 13
              }}
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            {/* ============ HEADER ============ */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "linear-gradient(135deg,#2634d5,#20c779)",
                  color: "#fff", display: "grid", placeItems: "center"
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>Đơn hàng</h3>
                  <b style={{ fontSize: 13, color: "#2634d5" }}>{order.code}</b>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: "transparent", border: 0, fontSize: 24, color: "var(--text-light, #8993a3)", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* ============ PROGRESS ============ */}
            {!isCancelled && (
              <div style={{ background: "var(--bg-tertiary, #f5f7fb)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                  {ALL_STEPS.map((s, i) => {
                    const active = current.step >= s.step;
                    const Icon = s.icon;
                    return (
                      <div key={s.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                        {i < ALL_STEPS.length - 1 && (
                          <div style={{
                            position: "absolute", top: 18, left: "50%", right: "-50%", height: 2,
                            background: current.step > s.step ? "#18a967" : "var(--border-color, #e5e9ef)", zIndex: 0
                          }} />
                        )}
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: active ? "#18a967" : "var(--card-bg, #fff)",
                          color: active ? "#fff" : "var(--text-light, #94a3b8)",
                          border: "2px solid " + (active ? "#18a967" : "var(--border-color, #e5e9ef)"),
                          display: "grid", placeItems: "center", position: "relative", zIndex: 1
                        }}>
                          <Icon size={16} />
                        </div>
                        <span style={{
                          fontSize: 10, marginTop: 6, textAlign: "center",
                          color: active ? "var(--text-primary, #172033)" : "var(--text-light, #94a3b8)",
                          fontWeight: active ? 700 : 500
                        }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div style={{ background: "#fee2e2", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "center" }}>
                <X size={32} color="#ef4444" style={{ margin: "0 auto 8px" }} />
                <b style={{ color: "#991b1b", fontSize: 15 }}>Đơn hàng đã bị hủy</b>
              </div>
            )}

            {/* ============ INFO ============ */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted, #64748b)" }}>Thời gian đặt</span>
                <b style={{ color: "var(--text-primary, #172033)" }}>{new Date(order.created_at).toLocaleString("vi-VN")}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted, #64748b)" }}>Trạng thái</span>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: current.color + "20", color: current.color }}>
                  {current.label}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-color, #eef2f7)", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted, #64748b)" }}>Thanh toán</span>
                <b style={{ color: "var(--text-primary, #172033)" }}>{order.payment || "Tiền mặt"}</b>
              </div>
            </div>

            {/* ============ ITEMS ============ */}
            <h4 style={{ margin: "16px 0 12px", color: "var(--text-primary, #172033)", fontSize: 14 }}>Món đã đặt</h4>
            <div style={{ background: "var(--bg-tertiary, #f8fafc)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
              {(order.items || []).map((it, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: i < (order.items.length - 1) ? "1px solid var(--border-color, #eef2f7)" : "none",
                  fontSize: 13
                }}>
                  <span style={{ color: "var(--text-primary, #172033)" }}><b>{it.qty}×</b> {it.name}</span>
                  <b style={{ color: "var(--text-muted, #64748b)" }}>{money(it.price * it.qty)}</b>
                </div>
              ))}
            </div>

            {/* ============ TOTAL ============ */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid var(--border-color, #eef2f7)" }}>
              <b style={{ color: "var(--text-primary, #172033)" }}>Tổng cộng</b>
              <strong style={{ color: "#2634d5", fontSize: 20 }}>{money(order.total)}</strong>
            </div>

            {/* ============ NOTE ============ */}
            {order.note && (
              <div style={{ marginTop: 12, padding: 12, background: "var(--bg-tertiary, #f8fafc)", borderRadius: 8, fontSize: 12, color: "var(--text-muted, #64748b)" }}>
                <b style={{ color: "var(--text-primary, #172033)" }}>Ghi chú:</b> {order.note}
              </div>
            )}

            {/* ============ FORM DANH GIA ============ */}
            {showReview && (
              <div style={{
                marginTop: 16, padding: 16, background: "var(--bg-tertiary, #f8fafc)",
                borderRadius: 12, border: "1px solid var(--border-color, #e5e9ef)"
              }}>
                <h4 style={{ margin: "0 0 12px", color: "var(--text-primary, #172033)", fontSize: 14 }}>
                  ⭐ Đánh giá đơn hàng
                </h4>

                <div style={{
                  marginBottom: 14, padding: "10px 12px",
                  background: "rgba(38, 52, 213, 0.08)", border: "1px solid rgba(38, 52, 213, 0.2)",
                  borderRadius: 8, fontSize: 12, color: "#2634d5", fontWeight: 600
                }}>
                  💡 Đánh giá sẽ áp dụng cho tất cả <b>{order.items?.length || 0} món</b> trong đơn
                </div>

                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-muted, #475569)" }}>
                  Số sao
                </label>
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      style={{ background: "transparent", border: 0, cursor: "pointer", padding: 2 }}
                    >
                      <Star size={28} fill={s <= rating ? "#f59e0b" : "none"} color={s <= rating ? "#f59e0b" : "#cbd5e1"} />
                    </button>
                  ))}
                </div>

                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--text-muted, #475569)" }}>
                  Cảm nhận của bạn <span style={{ fontWeight: 400, color: "var(--text-light, #94a3b8)" }}>(không bắt buộc)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="VD: Món ngon, giao nhanh... (có thể bỏ trống)"
                  style={{
                    width: "100%", padding: 10,
                    border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8,
                    minHeight: 70, outline: "none", resize: "vertical",
                    background: "var(--card-bg, #fff)", color: "var(--text-primary, #172033)", fontSize: 13
                  }}
                />

                <button
                  onClick={submitReview}
                  disabled={submitting}
                  style={{
                    marginTop: 12, width: "100%", padding: 12,
                    background: submitting ? "#94a3b8" : "#2634d5",
                    color: "#fff", border: 0, borderRadius: 8, fontWeight: 700,
                    cursor: submitting ? "not-allowed" : "pointer", fontSize: 13,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  <Send size={14} /> {submitting ? "Đang gửi..." : "Gửi đánh giá (+" + ((order.items?.length || 0) * 10) + " điểm)"}
                </button>
              </div>
            )}

            {/* ============ ACTIONS ============ */}
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexDirection: "column" }}>
              {order.status === "Sẵn sàng nhận" && (
                <button onClick={handleReceived} disabled={loading} style={{
                  padding: 12, background: "#18a967", color: "#fff", border: 0,
                  borderRadius: 8, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer"
                }}>
                  {loading ? "Đang xử lý..." : "✅ Tôi đã nhận món"}
                </button>
              )}

              {order.status === "Chờ xác nhận" && (
                <button onClick={handleCancel} disabled={loading} style={{
                  padding: 12, background: "var(--card-bg, #fff)", color: "#ef4444",
                  border: "1px solid #ef4444", borderRadius: 8, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer"
                }}>
                  {loading ? "Đang xử lý..." : "Hủy đơn"}
                </button>
              )}

              {/* Nut danh gia - Hoan thanh + chua danh gia */}
              {isCompleted && !showReview && !reviewed && !checking && !localStorage.getItem("reviewed_order_" + order.code) && (
                <button onClick={openReview} style={{
                  padding: 12, background: "#f59e0b", color: "#fff", border: 0,
                  borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <Star size={16} fill="#fff" /> Đánh giá đơn hàng
                </button>
              )}

              {/* Nut DA danh gia - click xem lai */}
              {isCompleted && reviewed && !showMyReviews && (
                <button onClick={openMyReviews} style={{
                  padding: 12, background: "rgba(24, 169, 103, 0.15)", color: "#18a967",
                  border: "1px solid #18a967", borderRadius: 8, fontWeight: 700,
                  cursor: "pointer", fontSize: 13,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  <CheckCircle2 size={16} /> Đã đánh giá — Xem lại
                </button>
              )}

              <button onClick={onClose} style={{
                padding: 12, background: "var(--card-bg, #fff)", color: "var(--text-primary, #172033)",
                border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8,
                fontWeight: 600, cursor: "pointer"
              }}>
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
