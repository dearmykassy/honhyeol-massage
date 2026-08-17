"use client";

import { useRef, type ReactNode } from "react";

export function Template4Carousel({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0");
    const step = (firstCard?.getBoundingClientRect().width ?? track.clientWidth) + gap;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="t4-carousel" aria-label={ariaLabel}>
      <button aria-label="이전 지역" className="carousel-arrow carousel-prev" onClick={() => move(-1)} type="button">‹</button>
      <div className="new-track" ref={trackRef}>{children}</div>
      <button aria-label="다음 지역" className="carousel-arrow carousel-next" onClick={() => move(1)} type="button">›</button>
    </div>
  );
}
