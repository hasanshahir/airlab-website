"use client";

import React, { useMemo, useRef, useState, type ElementType, type CSSProperties } from "react";
import { useFirstReveal } from "../../lib/useFirstReveal";

export interface TextRevealProps {
  text: string;
  as?: ElementType;
  href?: string;
  target?: string;
  className?: string;
  style?: CSSProperties;
  fontSize?: string;
  staggerDelay?: number;
  duration?: number;
  easing?: string;
  color?: string;
  hoverColor?: string;
  direction?: "up" | "down";
  uppercase?: boolean;
  revealed?: boolean;
  blurOnReveal?: boolean;
  revealDelay?: number;
  revealStagger?: number;
  revealDuration?: number;
  onClick?: (e: React.MouseEvent) => void;
}

function tokenizeCascadeText(text: string) {
  const segmenter =
    typeof Intl !== "undefined" && Intl.Segmenter
      ? new Intl.Segmenter("en", { granularity: "grapheme" })
      : null;

  const parts = text.split(/(\s+)/);
  const tokens: Array<
    | { isSpace: true; value: string; chars: [] }
    | { isSpace: false; value: string; chars: { char: string; index: number }[] }
  > = [];

  let nextIndex = 0;
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      nextIndex += 1;
      tokens.push({ isSpace: true, value: part, chars: [] });
      continue;
    }

    const graphemes = segmenter
      ? Array.from(segmenter.segment(part), (s) => s.segment)
      : [...part];

    const chars = graphemes.map((char, offset) => ({
      char,
      index: nextIndex + offset,
    }));
    nextIndex += graphemes.length;
    tokens.push({ isSpace: false, value: part, chars });
  }

  return { tokens, totalChars: nextIndex };
}

const TextReveal = React.memo(function TextReveal({
  text,
  as: Component = "a",
  href,
  target,
  className = "",
  style,
  fontSize,
  staggerDelay = 25,
  duration = 250,
  easing = "ease-in-out",
  color = "inherit",
  hoverColor = "var(--accent-orange)",
  direction = "up",
  uppercase,
  revealed,
  blurOnReveal = false,
  revealDelay = 0,
  revealStagger,
  revealDuration = 520,
  onClick,
}: TextRevealProps) {
  const [hovered, setHovered] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const autoRevealed = useFirstReveal(rootRef, false);
  const isRevealed = revealed !== undefined ? revealed : blurOnReveal ? autoRevealed : true;

  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const { tokens, totalChars } = useMemo(() => tokenizeCascadeText(text), [text]);
  const computedRevealStagger =
    revealStagger ?? Math.min(26, Math.max(10, Math.round(420 / Math.max(1, totalChars))));

  const sign = direction === "up" ? 1 : -1;
  const isAnchor = Component === "a";
  const applyUppercase = uppercase ?? isAnchor;
  const resolvedFontSize = fontSize ?? (isAnchor ? "3rem" : undefined);

  const anchorProps = isAnchor
    ? {
        href: href ?? "#",
        ...(target ? { target } : {}),
        ...(target === "_blank" ? { rel: "noopener noreferrer" } : {}),
      }
    : {};

  return (
    <Component
      ref={rootRef}
      className={`inline-block relative no-underline ${
        applyUppercase ? "font-extrabold uppercase" : ""
      } cursor-pointer select-none ${className}`.trim()}
      style={{
        ...(resolvedFontSize ? { fontSize: resolvedFontSize } : {}),
        color: hovered ? hoverColor : color,
        transition: "color 0.35s ease",
        ...(isAnchor ? { padding: "0.15em 0.4em", lineHeight: 1 } : {}),
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      aria-label={text}
      {...anchorProps}
    >
      <span aria-hidden="true">
        {tokens.map((token, tIdx) =>
          token.isSpace ? (
            <React.Fragment key={`s-${tIdx}`}> </React.Fragment>
          ) : (
            <span key={`w-${tIdx}`} className="inline-block whitespace-nowrap">
              {token.chars.map(({ char, index }) => (
                <span
                  key={index}
                  className="inline-block will-change-[filter,opacity,transform]"
                  style={
                    blurOnReveal && !prefersReducedMotion
                      ? {
                          opacity: isRevealed ? 1 : 0,
                          filter: isRevealed ? "blur(0px)" : "blur(10px)",
                          transform: isRevealed ? "translateY(0px)" : "translateY(6px)",
                          transitionProperty: "opacity, filter, transform",
                          transitionDuration: `${revealDuration}ms`,
                          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                          transitionDelay: isRevealed
                            ? `${revealDelay + index * computedRevealStagger}ms`
                            : "0ms",
                        }
                      : undefined
                  }
                >
                  <span
                    className="inline-flex overflow-hidden relative align-baseline"
                    style={{ height: "1.15em", lineHeight: 1.15 }}
                  >
                    <span
                      className="inline-block relative will-change-transform"
                      style={{
                        textShadow: `0 ${sign * 1.2}em currentColor`,
                        transition: `transform ${duration}ms ${easing}`,
                        transitionDelay: `${index * staggerDelay}ms`,
                        transform: hovered
                          ? `translateY(${-sign * 1.2}em)`
                          : "translateY(0)",
                      }}
                    >
                      {char}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          )
        )}
      </span>
    </Component>
  );
});

TextReveal.displayName = "TextReveal";
export { TextReveal };
