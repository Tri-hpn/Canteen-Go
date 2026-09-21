import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Clock, Utensils, Gift, Sparkles, Zap, ShoppingCart, Quote } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import FoodDetailModal from "../../components/FoodDetailModal";
import ChatBotWidget from "../../components/ChatBotWidget";
import { useTranslation } from "../../i18n";

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
    overlay: "linear-gradient(120deg, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.75) 55%, rgba(10,15,30,0.55) 100%)",
    greeting: "Xin chào",
    title: "hôm nay ăn gì?",
    useName: true,
    desc: "Đặt món nhanh chóng — Nhận ngay tại quầy. Ưu đãi dành riêng cho sinh viên VWA.",
    badge: "🎉 Ưu đãi sinh viên — Giảm 10%",
    chips: [
      { icon: "clock", text: "Chuẩn bị 5-8 phút" },
      { icon: "utensils", text: "VietQR · Ví · Tiền mặt" }
    ],
    btn: "Xem thực đơn",
    link: "/customer/menu"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
    overlay: "linear-gradient(120deg, rgba(15,10,5,0.92) 0%, rgba(15,10,5,0.75) 55%, rgba(15,10,5,0.55) 100%)",
    badge: "🔥 Combo tiết kiệm",
    title: "Combo sinh viên — Tiết kiệm đến 20%",
    desc: "Gọi combo cơm + nước + tráng miệng, tiết kiệm hơn gọi lẻ.",
    chips: [
      { icon: "sparkles", text: "Giảm đến 20%" },
      { icon: "utensils", text: "Nhiều combo mỗi ngày" }
    ],
    btn: "Xem combo",
    link: "/customer/menu"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=80",
    overlay: "linear-gradient(120deg, rgba(30,10,50,0.92) 0%, rgba(30,10,50,0.75) 55%, rgba(30,10,50,0.55) 100%)",
    badge: "🏆 Tích điểm mỗi đơn",
    title: "Tích điểm — Đổi Voucher",
    desc: "Mua hàng tích điểm, đổi ngay voucher giảm giá cho đơn tiếp theo.",
    chips: [
      { icon: "gift", text: "1 điểm = 100đ" },
      { icon: "sparkles", text: "Đổi từ 100 điểm" }
    ],
    btn: "Đổi voucher ngay",
    link: "/customer/promotions"
  }
];

const CATEGORIES = [
  { id: "Tất cả",      label: "Tất cả",       icon: "✨" },
  { id: "Cơm",         label: "Cơm",          icon: "🍚" },
  { id: "Món mặn",     label: "Món mặn",      icon: "🍖" },
  { id: "Món chay",    label: "Món chay",     icon: "🥗" },
  { id: "Món phụ",     label: "Món phụ",      icon: "🍜" },
  { id: "Đồ ăn nhanh", label: "Đồ ăn nhanh",  icon: "🍔" },
  { id: "Đồ uống",     label: "Đồ uống",      icon: "🥤" },
  { id: "Combo",       label: "Combo",        icon: "🍱" }
];

const TESTIMONIALS = [
  { name: "Nguyễn Minh Anh", role: "Sinh viên K20", rating: 5, text: "Món ăn ngon, giá cả hợp lý. Đặt online tiện lợi hơn hẳn so với xếp hàng!" },
  { name: "Trần Quốc Bảo",   role: "Cán bộ VWA",   rating: 5, text: "Giao nhanh, nhân viên thân thiện, món ăn luôn nóng hổi. Rất hài lòng." },
  { name: "Lê Thu Hà",       role: "Sinh viên K19", rating: 4, text: "Canteen sạch sẽ, đồ ăn đa dạng. Đặt món qua app dễ dùng, giao đúng giờ." }
];

export default function CustomerHome({ user, cart, setCart }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [newItems, setNewItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("cart");
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flashItems, setFlashItems] = useState([]);
  const [publicVouchers, setPublicVouchers] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.menu.list("", "Tất cả", "popular").catch(() => []),
      api.promotions.list().catch(() => []),
      api.categories.list().catch(() => []),
      api.vouchers.public().catch(() => [])
    ])
      .then(([d, promoList, catList, pubVouchers]) => {
        const list = Array.isArray(d) ? d : [];
        const bestSellers = list.filter(m => (m.sold || 0) > 0);
        const sorted = [...bestSellers].sort((a, b) => (b.sold || 0) - (a.sold || 0));
        setItems(sorted.slice(0, 5));

        const sortedById = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
        setNewItems(sortedById.slice(0, 4));
        setPromotions(Array.isArray(promoList) ? promoList : []);
        setPublicVouchers(Array.isArray(pubVouchers) ? pubVouchers : []);
        setCategories(Array.isArray(catList) ? catList : []);
        const flashList = [];
        (Array.isArray(pubVouchers) ? pubVouchers : []).forEach(v => {
          flashList.push({
            type: "voucher",
            text: "🎁 GIẢM " + (v.value || 0).toLocaleString("vi-VN") + "đ — Mã " + v.code,
            value: v.value || 0
          });
        });
        (Array.isArray(promoList) ? promoList : []).forEach(m => {
          flashList.push({
            type: "promo",
            text: "🔥 " + m.name + " GIẢM " + m.discount_percent + "% (còn " + (m.price || 0).toLocaleString("vi-VN") + "đ)",
            value: m.discount_percent || 0
          });
        });
        setFlashItems(flashList.length > 0 ? flashList : [
          { type: "info", text: "🎉 Ưu đãi sinh viên — Giảm 10% khi đặt món qua app" },
          { type: "info", text: "⚡ Chuẩn bị món 5-8 phút — Nhận ngay tại quầy" },
          { type: "info", text: "💳 Thanh toán VietQR · Ví Canteen · Tiền mặt" }
        ]);
      })
      .catch((err) => {
        console.error("Load menu error:", err);
        setItems([]);
        setNewItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const next = () => setIdx((i) => (i + 1) % SLIDES.length);
  const prev = () => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  const renderIcon = (iconName) => {
    if (iconName === "clock") return <Clock size={13} />;
    if (iconName === "utensils") return <Utensils size={13} />;
    if (iconName === "gift") return <Gift size={13} />;
    if (iconName === "sparkles") return <Sparkles size={13} />;
    return <Zap size={13} />;
  };

  // Render card mon (dung chung cho "Ban chay" + "Mon moi")
  const renderFoodCard = (m) => (
    <div
      key={m.id || m._id}
      className="food-card-clickable"
      style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e5e9ef)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <img
        src={m.image}
        alt={m.name}
        style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
      />
      <div style={{ padding: 10, display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{ fontSize: 10, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.4 }}>
          {m.category}
        </span>
        <h4 style={{ margin: "4px 0", fontSize: 13, color: "var(--text-primary, #172033)", fontWeight: 700, lineHeight: 1.3 }}>
          {m.name}
        </h4>

        {m.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 6, fontSize: 11 }}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <b style={{ color: "var(--text-primary, #172033)" }}>{m.rating}</b>
            <span style={{ color: "var(--text-light, #8993a3)" }}>({m.review_count || 0})</span>
          </div>
        )}

        <b style={{ color: "#18a967", fontSize: 14, marginTop: "auto" }}>{money(m.price)}</b>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
          <button
            onClick={() => { setMode("cart"); setSelected(m); }}
            style={{
              background: "var(--bg-tertiary, #f5f7fb)",
              color: "var(--text-primary, #172033)",
              border: "1px solid var(--border-color, #e5e9ef)",
              padding: "6px 4px",
              borderRadius: 7,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              whiteSpace: "nowrap"
            }}
          >
            <ShoppingCart size={12} /> Thêm
          </button>
          <button
            onClick={() => { setMode("buy"); setSelected(m); }}
            style={{
              background: "#2634d5",
              color: "#fff",
              border: 0,
              padding: "6px 4px",
              borderRadius: 7,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              whiteSpace: "nowrap"
            }}
          >
            <Zap size={12} /> Mua
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ============ SLIDESHOW ============ */}
      

      <div
        className="banner-carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          position: "relative", width: "100%", aspectRatio: "16 / 4.5", minHeight: 180, maxHeight: 280,
          borderRadius: 16, overflow: "hidden", marginBottom: 22,
          background: "#0f172a"
        }}
      >
        <div style={{
          display: "flex", width: (SLIDES.length * 100) + "%", height: "100%", maxWidth: "none",
          transform: "translateX(-" + (idx * (100 / SLIDES.length)) + "%)",
          transition: "transform 0.3s ease-in-out"
        }}>
          {SLIDES.map((s) => (
            <div
              key={s.id}
              style={{
                width: (100 / SLIDES.length) + "%", minWidth: (100 / SLIDES.length) + "%", height: "100%", flexShrink: 0, boxSizing: "border-box",
                backgroundImage: s.overlay + ", url(" + s.image + ")",
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "0 70px",
                position: "relative"
              }}
            >
              <div className="banner-content" style={{ maxWidth: 680, position: "relative", zIndex: 2 }}>


                <h2 className="banner-title" style={{
                  margin: "6px 0 10px",
                  fontSize: s.id === 1 ? 30 : 28,
                  color: "#fff", fontWeight: 800, lineHeight: 1.2,
                  textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                }}>
                  {s.useName && user?.name ? user.name + " ơi, " : ""}{s.title}
                </h2>

                <p className="banner-desc" style={{
                  margin: "0 0 14px", opacity: 0.95, color: "#e5e7eb",
                  fontSize: 14, lineHeight: 1.6, maxWidth: 620,
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)"
                }}>
                  {s.desc}
                </p>

                {s.steps && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                    {s.steps.map((st, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        padding: "8px 14px", borderRadius: 30,
                        fontSize: 12, color: "#fff"
                      }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: "#fff", color: "#2634d5",
                          display: "grid", placeItems: "center",
                          fontWeight: 800, fontSize: 11
                        }}>{st.num}</span>
                        {st.text}
                      </div>
                    ))}
                  </div>
                )}

                {s.progress && (
                  <div style={{ marginBottom: 16, maxWidth: 400 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6, color: "#fff" }}>
                      <span>{s.progress.label}</span>
                      <b>{s.progress.current} / {s.progress.target} điểm</b>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 20, overflow: "hidden" }}>
                      <div style={{
                        width: Math.min(100, (s.progress.current / s.progress.target) * 100) + "%",
                        height: "100%",
                        background: "linear-gradient(90deg, #20c779, #4ade80)",
                        borderRadius: 20,
                        transition: "width 0.6s ease"
                      }} />
                    </div>
                  </div>
                )}

                {s.chips && (
                 <div className="banner-chips" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
  {s.badge && (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(245, 158, 11, 0.3)",
      border: "1px solid rgba(245, 158, 11, 0.6)",
      padding: "6px 14px",
      borderRadius: 20,
      fontSize: 12,
      color: "#fff",
      fontWeight: 600
    }}>
      {s.badge}
    </span>
  )}
                    {s.chips.map((c, i) => (
                      <span key={i} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        padding: "6px 12px", borderRadius: 20,
                        fontSize: 12, color: "#fff"
                      }}>
                        {renderIcon(c.icon)}
                        {c.text}
                      </span>
                    ))}
                  </div>
                )}

                <a className="banner-btn" href={s.link} onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(s.link); }} style={{
                  display: "inline-block", background: "#fff", color: "#2634d5",
                  padding: "12px 24px", borderRadius: 10, textDecoration: "none",
                  fontWeight: 700, fontSize: 13,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                  transition: "all 0.2s",
                  position: "relative",
                  zIndex: 50,
                  pointerEvents: "auto",
                  cursor: "pointer"
                }}>
                  {s.btn}
                </a>
              </div>
            </div>
          ))}
        </div>

        <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Prev" className="banner-nav banner-nav-left" style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          width: 38, height: 38, borderRadius: "50%", border: 0,
          background: "rgba(255,255,255,0.25)", color: "#fff",
          cursor: "pointer", display: "grid", placeItems: "center",
          opacity: 0.5, transition: "all 0.3s", zIndex: 5
        }}>
          <ChevronLeft size={20} />
        </button>

        <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="banner-nav banner-nav-right" style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          width: 38, height: 38, borderRadius: "50%", border: 0,
          background: "rgba(255,255,255,0.25)", color: "#fff",
          cursor: "pointer", display: "grid", placeItems: "center",
          opacity: 0.5, transition: "all 0.3s", zIndex: 5
        }}>
          <ChevronRight size={20} />
        </button>

        <div className="banner-dots" style={{
          position: "absolute", bottom: 14, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 8, zIndex: 5
        }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} aria-label={"Slide " + (i + 1)} style={{
              width: i === idx ? 28 : 10, height: 10, borderRadius: 20, border: 0,
              cursor: "pointer",
              background: i === idx ? "#fff" : "rgba(255,255,255,0.5)",
              transition: "all 0.3s ease", padding: 0
            }} />
          ))}
        </div>
      </div>

      {flashItems.length > 0 && (
        <Link
          to="/customer/promotions"
          className="flash-marquee"
          style={{
            display: "block",
            background: "linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)",
            color: "#fff",
            padding: "10px 0",
            borderRadius: 12,
            marginBottom: 16,
            overflow: "hidden",
            textDecoration: "none",
            position: "relative"
          }}
        >
          <div className="flash-track">
            {[...flashItems, ...flashItems, ...flashItems].map((item, i) => (
              <span key={i} className="flash-item">
                <span className="flash-dot" />
                {item.text}
                <span className="flash-sep">•</span>
              </span>
            ))}
          </div>
          <span className="flash-label">
            <Sparkles size={12} /> ƯU ĐÃI
          </span>
        </Link>
      )}

      <h3 style={{ marginBottom: 14, fontSize: 18, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>⚡</span> FLASH SALE <span style={{ background: "linear-gradient(135deg, #ef4444, #f59e0b)", color: "#fff", padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800 }}>HOT</span></h3>




{promotions.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          
          <div className="home-food-grid-5">
        {publicVouchers.slice(0, 2).map((v) => (
          <Link key={"v-"+v.id} to="/customer/promotions" className="food-card-clickable" style={{ textDecoration: "none", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e5e9ef)" }}>
            <div style={{ width: 130, height: 130, borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "grid", placeItems: "center", color: "#fff", margin: "12px auto 8px", border: "3px solid #fff", boxShadow: "0 6px 20px rgba(139, 92, 246, 0.3)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>🎟️</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{(v.value||0).toLocaleString("vi-VN")}đ</div>
              </div>
            </div>
            <div style={{ padding: "0 10px 10px", textAlign: "center", flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>VOUCHER</span>
              <h4 style={{ margin: "4px 0", fontSize: 13, fontWeight: 700, color: "var(--text-primary, #172033)", textAlign: "center", minHeight: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>Giảm {(v.value||0).toLocaleString("vi-VN")}đ</h4>
              <div style={{ fontSize: 10, color: "var(--text-light, #8993a3)", fontFamily: "monospace", marginBottom: 8 }}>{v.code}</div>
              <div style={{ marginTop: "auto", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "#fff", padding: "8px 6px", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 700, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>Nhận ngay</div>
            </div>
          </Link>
        ))}

            {promotions.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="food-card-clickable"
                style={{
                  background: "var(--card-bg, #fff)",
                  border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
              >
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  background: "linear-gradient(135deg, #ef4444, #f59e0b)",
                  color: "#fff", padding: "4px 10px", borderRadius: 20,
                  fontSize: 11, fontWeight: 800, zIndex: 2,
                  boxShadow: "0 4px 10px rgba(239, 68, 68, 0.4)"
                }}>-{m.discount_percent}%</div>
                <img
                  src={m.image}
                  alt={m.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: 10, display: "flex", flexDirection: "column", flex: 1 }}>
                  <span style={{ fontSize: 10, color: "var(--text-light, #8993a3)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    {m.category}
                  </span>
                  <h4 style={{ margin: "4px 0", fontSize: 13, color: "var(--text-primary, #172033)", fontWeight: 700, lineHeight: 1.3 }}>
                    {m.name}
                  </h4>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                    <b style={{ color: "#ef4444", fontSize: 15 }}>{money(m.price)}</b>
                    <span style={{ fontSize: 11, color: "var(--text-light, #94a3b8)", textDecoration: "line-through" }}>
                      {money(m.original_price)}
                    </span>
                  </div>
                  <button
                    onClick={() => { setMode("buy"); setSelected(m); }}
                    style={{
                      marginTop: "auto", width: "100%",
                      background: "#2634d5", color: "#fff",
                      border: 0, padding: "8px 6px", borderRadius: 8,
                      cursor: "pointer", fontSize: 12, fontWeight: 700,
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5
                    }}
                  >
                    <Zap size={13} /> Đặt ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ============ BÁN CHẠY NHẤT ============ */}
      <h3 style={{ marginBottom: 14, fontSize: 16, color: "var(--text-primary, #172033)" }}>
        🔥 {t("customer.bestSeller")}
      </h3>

      <div className="home-food-grid-5" style={{ marginBottom: 26 }}>
        {loading && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#8993a3" }}>
            Đang tải món...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#8993a3" }}>
            Không có món nào. Kiểm tra backend!
          </div>
        )}
        {items.map((m) => renderFoodCard(m))}
      </div>

      {/* ============ (5) MÓN MỚI LÊN KỆ ============ */}
      {newItems.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--text-primary, #172033)" }}>
              ✨ Món mới lên kệ
            </h3>
            <Link to="/customer/menu" style={{ color: "#2634d5", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
              Xem tất cả →
            </Link>
          </div>
          <div className="home-food-grid-5">
            {newItems.map((m) => renderFoodCard(m))}
          </div>
        </div>
      )}

      {/* ============ (3) ĐÁNH GIÁ KHÁCH HÀNG ============ */}
      <div style={{ marginBottom: 26 }}>
        <h3 style={{ marginBottom: 14, fontSize: 16, color: "var(--text-primary, #172033)" }}>
          ⭐ Khách hàng nói gì về Canteen VWA
        </h3>
        <div className="home-testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 14,
              padding: 18,
              position: "relative",
              display: "flex",
              flexDirection: "column"
            }}>
              <Quote size={28} style={{ color: "#2634d5", opacity: 0.15, position: "absolute", top: 12, right: 12 }} />
              <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= t.rating ? "#f59e0b" : "none"} color={s <= t.rating ? "#f59e0b" : "#cbd5e1"} />
                ))}
              </div>
              <p style={{
                margin: "0 0 14px",
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-muted, #64748b)",
                fontStyle: "italic",
                flex: 1
              }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12, borderTop: "1px solid var(--border-color, #eef2f7)" }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2634d5, #20c779)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {t.name.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase()}
                </div>
                <div>
                  <b style={{ fontSize: 13, color: "var(--text-primary, #172033)", display: "block" }}>{t.name}</b>
                  <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ (6) QR XEM MENU ============ */}
      <div style={{
        marginBottom: 26,
        background: "linear-gradient(135deg, rgba(38, 52, 213, 0.06), rgba(32, 199, 121, 0.06))",
        border: "1px solid rgba(38, 52, 213, 0.2)",
        borderRadius: 16,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap"
      }}>
        <div style={{
          width: 100,
          height: 100,
          background: "#fff",
          borderRadius: 12,
          padding: 6,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          flexShrink: 0
        }}>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http%3A%2F%2F127.0.0.1%3A5173%2Fcustomer%2Fmenu&margin=0"
            alt="QR Menu"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{
            margin: "0 0 6px",
            fontSize: 17,
            color: "var(--text-primary, #172033)",
            fontWeight: 800
          }}>
            📱 Quét mã QR để xem menu
          </h3>
          <p style={{
            margin: "0 0 12px",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--text-muted, #64748b)"
          }}>
            Mở camera điện thoại và quét mã để truy cập thực đơn Canteen VWA ngay — không cần tải app.
          </p>
          <Link
            to="/customer/menu"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#2634d5",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 13
            }}
          >
            Hoặc bấm vào đây →
          </Link>
        </div>
      </div>

      {selected && (
        <FoodDetailModal
          item={selected}
          cart={cart}
          setCart={setCart}
          user={user}
          mode={mode}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ============ CHATBOT AI ============ */}
      <ChatBotWidget cart={cart} setCart={setCart} user={user} />

      {/* Responsive */}
      <style>{`
        @media (max-width: 1100px) {
          .home-cat-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .home-new-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-testi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}