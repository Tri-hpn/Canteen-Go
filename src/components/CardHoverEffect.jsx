import { useEffect } from "react";

export default function CardHoverEffect() {
  useEffect(() => {
    const handler = (e) => {
      const card = e.target.closest(".menu-item-card, .food-card-clickable");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--mouse-x", x + "%");
      card.style.setProperty("--mouse-y", y + "%");
    };

    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return null;
}
