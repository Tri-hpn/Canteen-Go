import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Send, Globe } from "lucide-react";

const SOCIALS = [
  { Icon: Facebook,  href: "https://facebook.com/",  label: "Facebook", color: "#1877F2" },
  { Icon: Instagram, href: "https://instagram.com/", label: "Instagram", color: "#E4405F" },
  { Icon: Youtube,   href: "https://youtube.com/",   label: "YouTube",  color: "#FF0000" },
  { Icon: Send,      href: "https://t.me/",          label: "Telegram", color: "#0088CC" },
  { Icon: Globe,     href: "https://vwa.vn/",        label: "Website",  color: "#20c779" }
];

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-grid">
        {/* Cột 1: Brand + mô tả */}
        <div className="footer-col footer-col-brand">
          <div className="footer-brand">
            <div className="footer-logo">C</div>
            <div>
              <b>CANTEEN VWA</b>
              <small>SMART MANAGEMENT</small>
            </div>
          </div>
          <p className="footer-desc">
            Đặt món nhanh — Quản lý gọn — Phục vụ tận tâm cho sinh viên & cán bộ.
          </p>
        </div>

        {/* Cột 2: Liên hệ */}
        <div className="footer-col footer-col-contact">
          <h4 className="footer-heading">Liên hệ</h4>

          <div className="footer-row">
            <Phone size={14} className="footer-icon" />
            <div>
              <span className="footer-label">Hotline</span>
              <a href="tel:0328866959" className="footer-value footer-link">0328 866 959</a>
            </div>
          </div>

          <div className="footer-row">
            <Mail size={14} className="footer-icon" />
            <div>
              <span className="footer-label">Email</span>
              <a href="mailto:admin@vwa.vn" className="footer-value footer-link">admin@vwa.vn</a>
            </div>
          </div>

          <div className="footer-row">
            <MapPin size={14} className="footer-icon" />
            <div>
              <span className="footer-label">Địa chỉ</span>
              <span className="footer-value">68 Nguyễn Chí Thanh, P. Láng, Hà Nội</span>
            </div>
          </div>
        </div>

        {/* Cột 3: Social + Bản đồ */}
        <div className="footer-col footer-col-social-map">
          {/* Social icons */}
          <div className="footer-socials">
            {SOCIALS.map(({ Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="footer-social"
                style={{ "--social-color": color }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>

          {/* Bản đồ */}
          <div className="footer-map">
            <a
              href="https://www.google.com/maps/search/?api=1&query=68+Nguy%E1%BB%85n+Ch%C3%AD+Thanh,+Ph%C6%B0%E1%BB%9Dng+L%C3%A1ng,+H%C3%A0+N%E1%BB%99i"
              target="_blank"
              rel="noopener noreferrer"
              title="Mở Google Maps"
            >
              <iframe
                title="Canteen VWA Map"
                src="https://www.google.com/maps?q=68+Nguy%E1%BB%85n+Ch%C3%AD+Thanh,+Ph%C6%B0%E1%BB%9Dng+L%C3%A1ng,+H%C3%A0+N%E1%BB%99i&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
