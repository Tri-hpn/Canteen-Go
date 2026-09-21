import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Layout from "./components/Layout";
import CardHoverEffect from "./components/CardHoverEffect";
import { api, setToken, getToken } from "./api";
import { toast } from "./components/Effects";

import CustomerHome from "./pages/customer/CustomerHome";
import CustomerMenu from "./pages/customer/CustomerMenu";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerCheckout from "./pages/customer/CustomerCheckout";
import CustomerPoints from "./pages/customer/CustomerPoints";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerSuccess from "./pages/customer/CustomerSuccess";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerPromotions from "./pages/customer/CustomerPromotions";
import CustomerWallet from "./pages/customer/CustomerWallet";
import CustomerChat from "./pages/customer/CustomerChat";
import CustomerSignature from "./pages/customer/CustomerSignature";

import EmployeeHome from "./pages/employee/EmployeeHome";
import EmployeeCheckInOut from "./pages/employee/EmployeeCheckInOut";
import EmployeeOrders from "./pages/employee/EmployeeOrders";
import EmployeeMenu from "./pages/employee/EmployeeMenu";
import EmployeeChat from "./pages/employee/EmployeeChat";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerEmployees from "./pages/owner/OwnerEmployees";
import OwnerAttendance from "./pages/owner/OwnerAttendance";
import OwnerCustomers from "./pages/owner/OwnerCustomers";
import OwnerMenu from "./pages/owner/OwnerMenu";
import OwnerPriceHistory from "./pages/owner/OwnerPriceHistory";
import OwnerInventory from "./pages/owner/OwnerInventory";
import OwnerReports from "./pages/owner/OwnerReports";
import OwnerPermissions from "./pages/owner/OwnerPermissions";
import OwnerBackup from "./pages/owner/OwnerBackup";
import OwnerWallet from "./pages/owner/OwnerWallet";
import OwnerVouchers from "./pages/owner/OwnerVouchers";
import OwnerShifts from "./pages/owner/OwnerShifts";
import StaffProfile from "./pages/StaffProfile";
import OwnerOrders from "./pages/owner/OwnerOrders";
import OwnerFinance from "./pages/owner/OwnerFinance";
import OwnerSettings from "./pages/owner/OwnerSettings";

import PaymentResult from "./pages/PaymentResult";

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("canteen_cart");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem("canteen_cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
    } catch {}
  }, [cart]);

  // Auto login
  useEffect(() => {
    if (getToken()) {
      api
        .me()
        .then(setUser)
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Listen refresh-user event
  useEffect(() => {
    const handler = () => {
      if (getToken()) {
        api.me().then(setUser).catch(() => {});
      }
    };
    window.addEventListener("refresh-user", handler);
    return () => window.removeEventListener("refresh-user", handler);
  }, []);

// Redirect neu path khong khop role
  useEffect(() => {
    if (!user) return;
    const rolePrefix = user.role === "ADMIN" ? "/owner" : user.role === "EMPLOYEE" ? "/employee" : "/customer";
    const path = location.pathname;
    if (!path.startsWith(rolePrefix)) {
      navigate(rolePrefix, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      const home =
        res.user.role === "ADMIN"
          ? "/owner"
          : res.user.role === "EMPLOYEE"
          ? "/employee"
          : "/customer";
      navigate(home);
      toast("Xin chào " + res.user.name + "!", "success");
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCart({});
    localStorage.removeItem("canteen_cart");
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
      Đang tải...
      </div>
    );
  }

  // ============ CHUA ĐĂNG NHẬP ============
  if (!user) {
    return (
      <>
        <CardHoverEffect />
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    );
  }

  // Helper wrap Layout
  const wrap = (title, subtitle, node) => (
    <Layout
      role={user.role}
      title={title}
      subtitle={subtitle}
      onLogout={handleLogout}
      user={user}
    >
      {node}
    </Layout>
  );

  return (
    <>
      <CardHoverEffect />
      <Routes>
        {/* ==================== CUSTOMER ==================== */}
        <Route
          path="/customer"
          element={
            <Layout
              role={user.role}
              title=""
              subtitle=""
              onLogout={handleLogout}
              user={user}
              hideHeading
              showFooter
            >
              <CustomerHome user={user} cart={cart} setCart={setCart} />
            </Layout>
          }
        />
        <Route
          path="/customer/menu"
          element={
            <Layout
              role={user.role}
              title=""
              subtitle=""
              onLogout={handleLogout}
              user={user}
              hideHeading
            >
              <CustomerMenu cart={cart} setCart={setCart} user={user} />
            </Layout>
          }
        />
        <Route
          path="/customer/cart"
          element={wrap("Giỏ hàng", "Món bạn đã chọn", <CustomerCart cart={cart} setCart={setCart} />)}
        />
        <Route
          path="/customer/checkout"
          element={wrap("Thanh toán", "Hoàn tất đơn hàng", <CustomerCheckout cart={cart} setCart={setCart} user={user} />)}
        />
        <Route
          path="/customer/points"
          element={<Navigate to="/customer/promotions" replace />}
        />
        <Route
          path="/customer/orders"
          element={wrap("Đơn hàng", "Lịch sử đơn hàng", <CustomerOrders user={user} />)}
        />
                <Route
          path="/customer/profile"
          element={wrap("Hồ sơ cá nhân", "Thông tin tài khoản", <CustomerProfile user={user} setUser={setUser} />)}
        />
                <Route
          path="/customer/promotions"
          element={wrap("Khuyến mãi", "Ưu đãi dành cho bạn", <CustomerPromotions />)}
        />

        <Route
          path="/customer/wallet"
          element={wrap("Ví Canteen", "Nạp tiền & thanh toán nhanh", <CustomerWallet user={user} />)}
        />
        <Route
          path="/customer/chat"
          element={wrap("Chat hỗ trợ", "Nhắn tin với Canteen", <CustomerChat user={user} cart={cart} setCart={setCart} />)}
        />
        <Route
          path="/customer/signature"
          element={wrap("Món Signature", "Đặc sản Canteen VWA", <CustomerSignature />)}
        />
        <Route
          path="/customer/success"
          element={wrap("Đặt hàng thành công", "Cảm ơn bạn!", <CustomerSuccess />)}
        />
        <Route
          path="/customer/payment-result"
          element={wrap("Kết quả thanh toán", "", <PaymentResult />)}
        />

        {/* ==================== EMPLOYEE ==================== */}
<Route
          path="/employee"
          element={
            <Layout role={user.role} title="" subtitle="" onLogout={handleLogout} user={user} hideHeading>
              <EmployeeHome />
            </Layout>
          }
        />
        <Route
          path="/employee/attendance"
          element={wrap("Chấm công", "Check-in / Check-out", <EmployeeCheckInOut />)}
        />
<Route
          path="/employee/orders"
          element={wrap("Đơn hàng", "Xử lý đơn khách", <EmployeeOrders />)}
        />
        <Route
          path="/employee/menu"
          element={wrap("Thực đơn", "Xem tình trạng món", <EmployeeMenu />)}
        />
        <Route
          path="/employee/profile"
          element={wrap("Hồ sơ cá nhân", "Thông tin tài khoản", <StaffProfile user={user} setUser={setUser} canEditEmail={false} />)}
        />
        <Route
          path="/employee/chat"
          element={wrap("Chat khách hàng", "Hỗ trợ khách hàng", <EmployeeChat />)}
        />

        {/* ==================== OWNER (ADMIN) ==================== */}
        <Route
          path="/owner"
          element={wrap("Tổng quan", "Theo dõi hoạt động Canteen", <OwnerDashboard />)}
        />
        <Route
          path="/owner/employees"
          element={wrap("Quản lý nhân viên", "Danh sách nhân viên", <OwnerEmployees />)}
        />
        <Route
          path="/owner/shifts"
          element={wrap("Quản lý ca", "Phân ca + theo dõi chấm công", <OwnerShifts />)}
        />
        <Route
          path="/owner/attendance"
          element={wrap("Chấm công", "Lịch sử chấm công nhân viên", <OwnerAttendance />)}
        />
        <Route
          path="/owner/customers"
          element={wrap("Quản lý khách hàng", "Danh sách khách hàng", <OwnerCustomers />)}
        />
        <Route
          path="/owner/menu"
          element={wrap("Quản lý thực đơn", "Món ăn", <OwnerMenu />)}
        />
        <Route
          path="/owner/price-history"
          element={wrap("Lịch sử giá", "Theo dõi thay đổi giá món ăn", <OwnerPriceHistory />)}
        />
        <Route
          path="/owner/inventory"
          element={wrap("Kho hàng", "Nguyên liệu", <OwnerInventory />)}
        />
        <Route
          path="/owner/reports"
          element={wrap("Báo cáo", "Doanh thu & thống kê", <OwnerReports />)}
        />
        <Route
          path="/owner/permissions"
          element={wrap("Phân quyền", "Phân quyền chi tiết cho từng user", <OwnerPermissions />)}
        />

        <Route
          path="/owner/orders"
          element={wrap("Quản lý đơn hàng", "Xử lý đơn khách như nhân viên", <OwnerOrders />)}
        />
        <Route
          path="/owner/vouchers"
          element={wrap("Quản lý Voucher", "Tạo / sửa / xóa voucher cho khách", <OwnerVouchers />)}
        />
        <Route
          path="/owner/finance"
          element={wrap("Quản lý tài chính", "Tài khoản nhận tiền, doanh thu, chi phí", <OwnerFinance />)}
        />
        <Route
          path="/owner/wallet"
          element={wrap("Quản lý Ví Canteen", "Duyệt nạp / rút / thanh toán của khách", <OwnerWallet />)}
        />
        <Route
          path="/owner/settings"
          element={wrap("Cài đặt", "Tài khoản nhận tiền + thông tin liên hệ", <OwnerSettings />)}
        />
        <Route
          path="/owner/profile"
          element={wrap("Hồ sơ cá nhân", "Thông tin tài khoản", <StaffProfile user={user} setUser={setUser} canEditEmail={true} />)}
        />
        <Route
          path="/owner/backup"
          element={wrap("Backup d? li?u", "Xu?t / nh?p / reset database", <OwnerBackup />)}
        />

        {/* ==================== FALLBACK ==================== */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user.role === "ADMIN"
                  ? "/owner"
                  : user.role === "EMPLOYEE"
                  ? "/employee"
                  : "/customer"
              }
            />
          }
        />
      </Routes>
    </>
  );
}
