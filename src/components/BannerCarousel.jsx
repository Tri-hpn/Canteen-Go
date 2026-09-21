import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bannerSlides } from "../data/bannerSlides";

const AUTO_INTERVAL = 4000;
const TRANSITION_MS = 300;

export default function BannerCarousel({ slides = bannerSlides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const total = slides.length;

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, total]);

  const goTo = (i) => setIndex(((i % total) + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  return (
    <div
      className="banner-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: 260,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 22,
        background: "#0f172a"
      }}
    >
      <div
        style={{
          display: "flex",
          width: `${total * 100}%`,
          height: "100%",
          transform: `translateX(-${index * (100 / total)}%)`,
          transition: `transform ${TRANSITION_MS}ms ease-in-out`
        }}
      >
        {slides.map((s) => (
          <Slide key={s.id} slide={s} />
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="banner-nav banner-nav-left"
            style={navBtnStyle("left")}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="banner-nav banner-nav-right"
            style={navBtnStyle("right")}
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {total > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 8,
            zIndex: 3
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Di toi slide ${i + 1}`}
              style={{
                width: i === index ? 28 : 10,
                height: 10,
                borderRadius: 20,
                border: 0,
                cursor: "pointer",
                background: i === index ? "#fff" : "rgba(255,255,255,0.5)",
                transition: `all ${TRANSITION_MS}ms ease`,
                padding: 0
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Slide({ slide }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        flexShrink: 0,
        backgroundImage: `linear-gradient(120deg, rgba(10,15,30,0.85) 0%, rgba(10,15,30,0.35) 55%, rgba(10,15,30,0.15) 100%), url(${slide.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        padding: "0 60px"
      }}
    >
      <div style={{ maxWidth: 560, position: "relative", zIndex: 2 }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 800,
            margin: "0 0 10px",
            color: "#fff",
            lineHeight: 1.2,
            letterSpacing: "-0.5px"
          }}
        >
          {slide.title}
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            opacity: 0.92,
            margin: "0 0 20px",
            color: "#e5e7eb"
          }}
        >
          {slide.description}
        </p>
        <Link
          to={slide.buttonLink}
          style={{
            display: "inline-block",
            background: "#fff",
            color: "#2634d5",
            padding: "11px 22px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            transition: "all 0.2s",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
          }}
        >
          {slide.buttonText}
        </Link>
      </div>
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 16,
    transform: "translateY(-50%)",
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: 0,
    background: "rgba(255,255,255,0.85)",
    color: "#0f172a",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    zIndex: 3,
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    transition: `background ${TRANSITION_MS}ms ease`
  };
}
