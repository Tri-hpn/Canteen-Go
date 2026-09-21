// ChatBot gợi ý món ăn — logic keyword matching
// Trả về: { text, items? } — items là danh sách món để hiện kèm

export function getBotReply(userText, menuItems = []) {
  const t = (userText || "").toLowerCase().trim();

  if (!t) return null;

  // ===== Chào hỏi =====
  if (/^(chào|chao|hi|hello|hey|xin chào|xin chao)\b/.test(t)) {
    return {
      text:
        "Xin chào! 👋 Mình là trợ lý Canteen VWA.\n" +
        "Bạn có thể hỏi mình:\n" +
        "• \"dưới 30k\" — món rẻ\n" +
        "• \"chay\" — món chay\n" +
        "• \"nước\" — đồ uống\n" +
        "• \"cay\" — món cay\n" +
        "• \"bán chạy\" — top món hot\n" +
        "• \"cơm\" — các món cơm\n" +
        "• \"gợi ý\" — món ngẫu nhiên",
      items: []
    };
  }

  // ===== Giờ mở cửa =====
  if (/(giờ mở|mở cửa|mấy giờ|đóng cửa)/.test(t)) {
    return {
      text: "🕐 Canteen VWA mở cửa từ 6:30 — 18:30 hàng ngày nhé!",
      items: []
    };
  }

  // ===== Địa chỉ =====
  if (/(địa chỉ|ở đâu|đường|địa điểm)/.test(t)) {
    return {
      text: "📍 Canteen VWA ở 68 Nguyễn Chí Thanh, Phường Láng, Hà Nội.",
      items: []
    };
  }

  // ===== Hotline =====
  if (/(hotline|số điện thoại|liên hệ|sđt|sdt)/.test(t)) {
    return {
      text: "☎️ Hotline Canteen VWA: 0328 866 959. Bạn có thể gọi khi cần hỗ trợ nhé!",
      items: []
    };
  }

  // ===== Top bán chạy =====
  if (/(bán chạy|ngon nhất|hot|phổ biến|best)/.test(t)) {
    const top = [...menuItems]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 3);
    return {
      text: "🔥 Top 3 món bán chạy nhất tại Canteen:",
      items: top
    };
  }

  // ===== Món chay =====
  if (/(chay|không thịt|ko thịt|ăn chay)/.test(t)) {
    const chay = menuItems.filter((m) => m.category === "Món chay").slice(0, 3);
    if (!chay.length) {
      return { text: "Hiện chưa có món chay trong thực đơn. Bạn xem tạm món khác nhé!", items: [] };
    }
    return { text: "🥗 Món chay ngon tại Canteen:", items: chay };
  }

  // ===== Đồ uống =====
  if (/(nước|uống|trà|cà phê|sinh tố|nước ép|trà sữa)/.test(t)) {
    const drinks = menuItems.filter((m) => m.category === "Đồ uống").slice(0, 3);
    return { text: "🥤 Đồ uống tại Canteen:", items: drinks };
  }

  // ===== Món cay =====
  if (/(cay|spicy)/.test(t)) {
    const cay = menuItems
      .filter((m) => /bún bò|huế|cay|sa tế/i.test(m.name))
      .slice(0, 3);
    if (!cay.length) {
      // fallback: lấy món mặn
      const man = menuItems.filter((m) => m.category === "Món mặn").slice(0, 3);
      return { text: "Các món đậm vị tại Canteen:", items: man };
    }
    return { text: "🌶️ Món cay bạn có thể thử:", items: cay };
  }

  // ===== Món cơm =====
  if (/(cơm|com rang|com ga|com suon)/.test(t)) {
    const com = menuItems.filter((m) => m.category === "Cơm").slice(0, 3);
    return { text: "🍚 Món cơm tại Canteen:", items: com };
  }

  // ===== Giá theo ngân sách =====
  const priceMatch = t.match(/(\d+)\s*(k|nghìn|ngàn|000|đ|d)/);
  if (priceMatch || /(rẻ|dưới|ít tiền|sinh viên)/.test(t)) {
    let maxPrice = 30000; // mặc định
    if (priceMatch) {
      let n = parseInt(priceMatch[1]);
      if (n < 1000) n = n * 1000;
      maxPrice = n;
    }
    const cheap = menuItems
      .filter((m) => m.price <= maxPrice)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    if (!cheap.length) {
      return { text: `Không có món nào dưới ${maxPrice.toLocaleString("vi-VN")}đ. Bạn thử ngân sách khác nhé!`, items: [] };
    }
    return {
      text: `💰 Món dưới ${maxPrice.toLocaleString("vi-VN")}đ cho bạn đây:`,
      items: cheap
    };
  }

  // ===== Gợi ý ngẫu nhiên =====
  if (/(gợi ý|random|ngẫu nhiên|ăn gì|món gì)/.test(t)) {
    if (!menuItems.length) {
      return { text: "Hiện chưa có thực đơn. Bạn xem sau nhé!", items: [] };
    }
    const rand = menuItems[Math.floor(Math.random() * menuItems.length)];
    return {
      text: `🎲 Mình gợi ý bạn thử món này nhé:`,
      items: [rand]
    };
  }

  // ===== Fallback =====
  return {
    text:
      "Mình chưa hiểu câu hỏi này. 🤔\n" +
      "Bạn thử hỏi: \"dưới 30k\", \"chay\", \"nước\", \"cay\", \"bán chạy\", \"cơm\", \"gợi ý\".",
    items: []
  };
}

// Dùng để test nhanh
export default getBotReply;
