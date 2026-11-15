"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  /** Automatically animate right-to-left, pause on each centered card, and repeat. */
  autoPlay?: boolean;
  /** Duration in ms of the smooth glide between cards. @default 850 */
  transitionDuration?: number;
  /** Pause in ms after landing on the centered view before advancing. @default 850 */
  pauseDuration?: number;
  /** Legacy prop alias (seconds). */
  speed?: number;
  /** Width of the horizontal edge fade mask in percent (0 disables). @default 10 */
  edgeFade?: number;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Names the carousel for assistive tech. */
  label?: string;
  /** Content rendered above the carousel (e.g. hero headline and CTA). */
  children?: React.ReactNode;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 42,
  depth = 0.52,
  perspective = 3,
  falloff = 0.56,
  fade = 0.08,
  cardWidth = "min(80cqh, 74cqw)",
  gap = -0.06,
  loop = true,
  autoPlay = true,
  transitionDuration = 850,
  pauseDuration = 850,
  edgeFade = 10,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = "Cover carousel",
  children,
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const baseCount = slides.length;

  // When looping with a small slide list (e.g. 5 hero photos), repeat the list
  // around the 3D ring so outer cards at ±2 and ±3 stay at full presence and
  // only wrap at ±5 well outside the viewport.
  const ringSlides = React.useMemo(() => {
    if (!loop || baseCount === 0 || baseCount >= 10) return slides;
    const repeats = Math.ceil(10 / baseCount);
    return Array.from({ length: repeats }, () => slides).flat();
  }, [baseCount, loop, slides]);

  const count = ringSlides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(autoPlay && loop && count > 1 ? -1 : 0);
  /** Where the current settle is headed. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const pauseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = React.useRef(0);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /** Nearest whole card, folded back into 0..baseCount-1. */
  const indexAt = React.useCallback(
    (pos: number) =>
      baseCount > 0 ? ((Math.round(pos) % baseCount) + baseCount) % baseCount : 0,
    [baseCount],
  );

  const syncSelected = React.useCallback(
    (pos: number) => {
      const next = indexAt(pos);
      if (next !== selectedRef.current) {
        selectedRef.current = next;
        setSelected(next);
      }
    },
    [indexAt],
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring.
      let offset = index - pos;
      if (loop && count > 0) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // Fade smoothly before the half-turn wrap point off-screen.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(1000 - Math.round(distance * 100));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const clearPauseTimer = React.useCallback(() => {
    if (pauseTimerRef.current !== null) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const canAutoPlay =
    autoPlay && loop && count > 1 && !prefersReducedMotion;

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  // Smoothly animate `posRef` to `target` using a sine ease-in-out S-curve
  // (zero velocity jump on start/stop), pause briefly on the centered view, and repeat.
  const settle = React.useCallback(
    function runSettle(target: number) {
      clearPauseTimer();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      targetRef.current = target;
      syncSelected(target);

      const startPos = posRef.current;
      const delta = target - startPos;

      const scheduleNextStep = () => {
        if (!canAutoPlay || dragRef.current !== null) return;
        clearPauseTimer();
        pauseTimerRef.current = setTimeout(() => {
          pauseTimerRef.current = null;
          if (dragRef.current !== null) return;
          // Advance +1 so cards glide seamlessly from right to left.
          runSettle(clamp(Math.round(targetRef.current) + 1));
        }, pauseDuration);
      };

      if (Math.abs(delta) < 0.0004 || prefersReducedMotion) {
        posRef.current = target;
        paint();
        scheduleNextStep();
        return;
      }

      const startTime = performance.now();
      const duration = Math.max(220, transitionDuration);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        // Sine S-curve: gentle acceleration from rest + feather-soft landing on center.
        const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
        posRef.current = startPos + delta * eased;
        paint();

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          posRef.current = target;
          paint();
          rafRef.current = null;
          scheduleNextStep();
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [
      canAutoPlay,
      clamp,
      clearPauseTimer,
      paint,
      pauseDuration,
      prefersReducedMotion,
      syncSelected,
      transitionDuration,
    ],
  );

  React.useEffect(() => {
    if (!canAutoPlay) return;
    settle(Math.round(targetRef.current));
    return () => {
      clearPauseTimer();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [canAutoPlay, clearPauseTimer, settle]);

  const goTo = React.useCallback(
    (index: number) => {
      const span = baseCount || 1;
      const target = loop
        ? index + Math.round((targetRef.current - index) / span) * span
        : index;
      settle(clamp(target));
    },
    [baseCount, clamp, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    clearPauseTimer();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    syncSelected(posRef.current);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearPauseTimer();
    },
    [clearPauseTimer],
  );

  const active = slides[selected];
  const mask =
    edgeFade > 0
      ? `linear-gradient(90deg, transparent, #000 ${edgeFade}%, #000 ${100 - edgeFade
      }%, transparent)`
      : undefined;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        containerType: "size",
        ["--cf-card" as string]: cardWidth,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        className={cn(
          "relative w-full",
          children ? "flex h-full items-center" : "",
        )}
      >
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="w-full cursor-grab overflow-hidden py-3 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: "pan-y",
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "var(--cf-card)",
              transformStyle: "preserve-3d",
            }}
          >
            {ringSlides.map((slide, index) => (
              <div
                key={`${slide.src}-${index}`}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${(index % Math.max(baseCount, 1)) + 1} of ${baseCount}`}
                className={cn(
                  "absolute left-1/2 top-0 aspect-square overflow-hidden rounded-xl bg-muted shadow-lg will-change-transform",
                  cardClassName,
                )}
                style={{ width: "var(--cf-card)" }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  decoding="async"
                  className="h-full w-full select-none object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              className="absolute left-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              className="absolute right-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          className="mt-2 flex flex-col items-center px-6 transition-opacity duration-300"
        >
          <p className="text-[15px] font-semibold tracking-tight text-foreground">
            {active.title}
          </p>
          {active.subtitle && (
            <p className="mt-1 text-[13px] text-muted-foreground">
              {active.subtitle}
            </p>
          )}
          {active.meta && active.meta.length > 0 && (
            <dl className="mt-10 w-full max-w-[230px] text-[12px]">
              {active.meta.map((row) => (
                <div key={row.label} className="flex justify-between py-[5px]">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                "size-2 rounded-full bg-foreground transition-opacity",
                index === selected ? "opacity-100" : "opacity-30",
              )}
            />
          ))}
        </div>
      )}

      {children ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default CoverflowCarousel;
