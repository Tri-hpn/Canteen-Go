import { useEffect, useMemo, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import { Star, ShoppingCart, Zap } from "lucide-react";

import { api } from "../../api";

import { money } from "../../components/UI";

import FoodDetailModal from "../../components/FoodDetailModal";

import ChatBotWidget from "../../components/ChatBotWidget";



const CATEGORIES = [

  { id: "Tất cả",       label: "Tất cả" },

  { id: "Cơm",          label: "Cơm" },

  { id: "Món mặn",      label: "Món mặn" },

  { id: "Món chay",     label: "Món chay" },

  { id: "Món phụ",      label: "Món phụ" },

  { id: "Đồ ăn nhanh",  label: "Đồ ăn nhanh" },

  { id: "Đồ uống",      label: "Đồ uống" },

  { id: "Combo",        label: "Combo" }

];



export default function CustomerMenu({ cart, setCart, user }) {

  const [items, setItems] = useState([]);

  const [category, setCategory] = useState("Tất cả");

  const [selected, setSelected] = useState(null);

  const [mode, setMode] = useState("cart"); // "cart" | "buy"

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();



  // Doc category tu URL (?category=...)

  useEffect(() => {

    const urlCategory = searchParams.get("category");

    if (urlCategory) {

      setCategory(urlCategory);

    }

  }, [searchParams]);



  useEffect(() => {

    setLoading(true);

    Promise.all([

      api.menu.list("", "Tất cả", "popular").catch(() => []),

      api.categories.list().catch(() => [])

    ])

      .then(([d, cats]) => {

        setItems(Array.isArray(d) ? d : []);

        setCategories(Array.isArray(cats) ? cats : []);

      })

      .catch(() => { setItems([]); setCategories([]); })

      .finally(() => setLoading(false));

  }, []);



  useEffect(() => {

    const handler = (e) => setSearch(e.detail || "");

    window.addEventListener("globalsearch", handler);

    return () => window.removeEventListener("globalsearch", handler);

  }, []);



  const filtered = useMemo(() => {

    let list = items;

    if (category !== "Tất cả") list = list.filter((m) => m.category === category);

    if (search.trim()) {

      const q = search.toLowerCase().trim();

      list = list.filter((m) => m.name.toLowerCase().startsWith(q));

    }

    return list;

  }, [items, category, search]);



  const cartCount = Object.values(cart || {}).reduce((s, m) => s + (m.qty || 0), 0);



  const openWithMode = (item, m) => {

    setMode(m);

    setSelected(item);

  };



  return (

    <div>

      {/* Toolbar */}

      <div

        style={{

          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          gap: 14,

          marginBottom: 20,

          
          position: "sticky",
          top: 64,
          zIndex: 9,
          background: "var(--bg-primary, #f5f7fb)",
          paddingTop: 12,
          paddingBottom: 8

        }}

      >

        <div className="menu-cats-scroll" style={{ display: "flex", gap: 8, flex: "1 1 auto", minWidth: 0, overflowX: "auto", flexWrap: "nowrap", paddingBottom: 4 }}>

          {[{ id: "Tất cả", label: "Tất cả" }, ...categories.map(cat => ({ id: cat.name, label: cat.name, icon: cat.icon }))].map((c) => {

            const active = category === c.id;

            return (

              <button

                key={c.id}
                className={"cat-chip" + (active ? " active" : "")}

                onClick={() => { setCategory(c.id); setSearchParams(c.id === "Tất cả" ? {} : { category: c.id }); }}

                style={{

                  padding: "8px 16px",

                  borderRadius: 20,

                  border: active ? "1px solid #2634d5" : "1px solid var(--border-color, #e5e9ef)",

                  background: active ? "#2634d5" : "var(--card-bg, #fff)",

                  color: active ? "#fff" : "var(--text-muted, #475569)",

                  fontSize: 13,

                  cursor: "pointer",

                  fontWeight: active ? 600 : 500,

                  transition: "all 0.2s",

                  flexShrink: 0,

                  whiteSpace: "nowrap"

                }}

              >

                {c.icon ? c.icon + " " : ""}{c.label}

              </button>

            );

          })}

        </div>



        

      </div>



      {/* Số lượng */}

      <div style={{ fontSize: 13, color: "var(--text-light, #8993a3)", marginBottom: 14 }}>

        {filtered.length} món {category !== "Tất cả" && 'trong "' + category + '"'}

        {search && ' — tìm "' + search + '"'}

      </div>



      {/* Loading */}

      {loading && (

        <div style={{ textAlign: "center", padding: 40, color: "var(--text-light, #8993a3)" }}>

          Đang tải món...

        </div>

      )}



      {/* Rỗng */}

      {!loading && filtered.length === 0 && (

        <div

          style={{

            textAlign: "center",

            padding: 60,

            color: "var(--text-light, #8993a3)",

            background: "var(--card-bg, #fff)",

            borderRadius: 14

          }}

        >

          Không có món nào

        </div>

      )}



      {/* Grid */}

      <div
        className="menu-food-grid"

        style={{

          display: "grid",

          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 220px))",

          gap: 18

        }}

      >

        {filtered.map((m) => (

          <div

            key={m._id || m.id}

            className="food-card-clickable"

            style={{

              background: "var(--card-bg, #fff)",

              border: "1px solid var(--border-color, #e5e9ef)",

              borderRadius: 14,

              overflow: "hidden",

              display: "flex",

              flexDirection: "column"

            }}

          >

            <div onClick={() => openWithMode(m, "cart")} style={{ cursor: "pointer" }}>

              <img

                src={m.image}

                alt={m.name}

                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}

              />

              <div style={{ padding: "14px 14px 0" }}>

                <span

                  style={{

                    fontSize: 11,

                    color: "var(--text-light, #8993a3)",

                    textTransform: "uppercase",

                    letterSpacing: 0.4

                  }}

                >

                  {m.category}

                </span>

                <h4

                  style={{

                    margin: "6px 0",

                    fontSize: 15,

                    color: "var(--text-primary, #172033)",

                    fontWeight: 700

                  }}

                >

                  {m.name}

                </h4>

                {m.rating && (

                  <div

                    style={{

                      display: "flex",

                      alignItems: "center",

                      gap: 4,

                      marginBottom: 8,

                      fontSize: 12

                    }}

                  >

                    <Star size={13} fill="#f59e0b" color="#f59e0b" />

                    <b style={{ color: "var(--text-primary, #172033)" }}>{m.rating}</b>

                    <span style={{ color: "var(--text-light, #8993a3)" }}>

                      ({m.review_count || 0})

                    </span>

                  </div>

                )}
                {!m.rating && (
                  <div style={{ minHeight: 24, marginBottom: 8 }} />
                )}

                {/* desc an */}

              </div>

            </div>



            <div

  style={{

    padding: "0 14px 14px",

    display: "flex",

    flexDirection: "column",

    gap: 10,

    marginTop: "auto"

  }}

>

  {/* Giá */}

  <b style={{ color: "#18a967", fontSize: 17, fontWeight: 800 }}>

    {money(m.price)}

  </b>



  {/* 2 nút */}

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

    <button

      onClick={() => openWithMode(m, "cart")}

      title="Thêm vào giỏ"

      style={{

        background: "var(--bg-tertiary, #f5f7fb)",

        color: "var(--text-primary, #172033)",

        border: "1px solid var(--border-color, #e5e9ef)",

        padding: "10px 8px",

        borderRadius: 9,

        cursor: "pointer",

        fontSize: 13,

        fontWeight: 600,

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 5,

        whiteSpace: "nowrap"

      }}

    >

      <ShoppingCart size={14} />

      Thêm

    </button>



    <button

      onClick={() => openWithMode(m, "buy")}

      style={{

        background: "#2634d5",

        color: "#fff",

        border: 0,

        padding: "10px 8px",

        borderRadius: 9,

        cursor: "pointer",

        fontSize: 13,

        fontWeight: 700,

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 5,

        whiteSpace: "nowrap"

      }}

    >

      <Zap size={14} />

      Mua ngay

    </button>

  </div>

</div>

          </div>

        ))}

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

    </div>

  );

}