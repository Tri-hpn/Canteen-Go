import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            style={{
              background: "none",
              border: 0,
              cursor: readonly ? "default" : "pointer",
              padding: 0,
              display: "grid",
              placeItems: "center"
            }}
          >
            <Star
              size={size}
              fill={filled ? "#f59e0b" : "none"}
              color={filled ? "#f59e0b" : "#cbd5e1"}
            />
          </button>
        );
      })}
    </div>
  );
}
