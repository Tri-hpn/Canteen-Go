import { useEffect, useState } from "react";
import { Send, User } from "lucide-react";
import { api } from "../api";
import { toast } from "./Effects";
import StarRating from "./StarRating";

export default function ReviewSection({ menuItemId, currentUser, readOnly = false }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  const load = async () => {
    try {
      const data = await api.reviews.list(menuItemId);
      setReviews(data || []);
    } catch (e) {
      setReviews([]);
    }
  };

  const checkCanReview = async () => {
    if (!currentUser) return;
    try {
      const data = await api.reviews.canReview(menuItemId);
      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
      setHasPurchased(data.hasPurchased);
    } catch {
      // Bỏ qua — user chưa mua
    }
  };

  useEffect(() => {
    load();
    checkCanReview();
  }, [menuItemId, currentUser]);

  const submit = async () => {
    if (!rating) return toast("Vui lòng chọn số sao", "error");
    setLoading(true);
    try {
      const result = await api.reviews.create({ menuItemId, rating, comment });
      window.dispatchEvent(new CustomEvent("refresh-user"));
      toast("Đã gửi đánh giá!", "success");
      setComment("");
      setRating(5);
      load();
      checkCanReview();
    } catch (e) {
      toast(e.message || "Lỗi gửi đánh giá", "error");
    } finally {
      setLoading(false);
    }
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eef2f7" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>Đánh giá món ăn</h3>
        {reviews.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarRating value={parseFloat(avg)} readonly size={16} />
            <b>{avg}</b>
            <span style={{ color: "#8993a3", fontSize: 12 }}>({reviews.length} đánh giá)</span>
          </div>
        )}
      </div>

      {/* Form đánh giá — chỉ hiện khi user đã mua và chưa đánh giá */}
      {!currentUser && (
        <div style={{ background: "#fff4d8", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#92400e" }}>
          🔒 Vui lòng đăng nhập để đánh giá
        </div>
      )}

                  {!readOnly && currentUser && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#2634d5,#20c779)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
              {(currentUser.name || "?").slice(0, 2).toUpperCase()}
            </div>
            <b>{currentUser.name}</b>
            <StarRating value={rating} onChange={setRating} size={20} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về món này..."
            style={{ width: "100%", padding: 10, border: "1px solid #e5e9ef", borderRadius: 8, minHeight: 60, outline: "none", resize: "vertical", fontSize: 13 }}
          />
          <button
            onClick={submit}
            disabled={loading}
            style={{ marginTop: 10, padding: "8px 16px", background: "#2634d5", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, opacity: loading ? 0.6 : 1 }}
          >
            <Send size={14} /> {loading ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ display: "flex", gap: 12, padding: 12, background: "#fff", border: "1px solid #eef2f7", borderRadius: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eef2ff", color: "#2634d5", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              <User size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: 13 }}>{r.user_name}</b>
                <span style={{ fontSize: 11, color: "#8993a3" }}>{r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : ""}</span>
              </div>
              <StarRating value={r.rating} readonly size={14} />
              {r.comment && <p style={{ margin: "6px 0 0", fontSize: 13, color: "#334155" }}>{r.comment}</p>}
            </div>
          </div>
        ))}
        {!reviews.length && (
          <p style={{ textAlign: "center", color: "#8993a3", padding: 20, fontSize: 13 }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </div>
  );
}
