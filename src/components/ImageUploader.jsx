import { useRef, useState } from "react";
import { Image as ImageIcon, X, Upload, Loader2 } from "lucide-react";
import { toast } from "./Effects";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageUploader({ value, onChange, label = "Ảnh món ăn (JPEG/PNG)" }) {
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    setError("");
    if (!file) return;

    // Kiểm tra loại file
    if (!ALLOWED.includes(file.type)) {
      setError("Chỉ chấp nhận ảnh JPEG, PNG, WebP");
      toast("Chỉ chấp nhận ảnh JPEG, PNG, WebP", "error");
      return;
    }
    // Kiểm tra kích thước
    if (file.size > MAX_SIZE) {
      const mb = (file.size / 1024 / 1024).toFixed(2);
      setError("Ảnh vượt quá 2MB (hiện " + mb + "MB)");
      toast("Ảnh quá lớn! Tối đa 2MB", "error");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result;
      setPreview(dataUri);
      onChange?.(dataUri);
      setLoading(false);
      toast("Đã tải ảnh lên", "success");
    };
    reader.onerror = () => {
      setError("Không đọc được file");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const clear = () => {
    setPreview("");
    onChange?.("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ margin: "10px 0 16px" }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          position: "relative",
          border: dragging ? "2px dashed #2634d5" : "2px dashed #cbd5e1",
          borderRadius: 12,
          padding: preview ? 0 : 24,
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "#eef2ff" : "#f8fafc",
          minHeight: 160,
          display: "grid",
          placeItems: "center",
          transition: "all 0.25s",
          overflow: "hidden"
        }}
      >
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#2634d5" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
            <span>Đang xử lý...</span>
          </div>
        ) : preview ? (
          <>
            <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 10 }} />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "#ef4444", color: "#fff", border: 0,
                width: 28, height: 28, borderRadius: "50%",
                cursor: "pointer", display: "grid", placeItems: "center"
              }}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", color: "#64748b" }}>
            <ImageIcon size={32} />
            <b style={{ color: "#172033", fontSize: 14 }}>Kéo ảnh vào đây hoặc nhấn để chọn</b>
            <span style={{ fontSize: 12 }}>JPEG, PNG, WebP · Tối đa 2MB</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files[0])}
        style={{ display: "none" }}
      />

      {error && (
        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8, padding: "8px 12px", background: "#fde8e8", borderRadius: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}
