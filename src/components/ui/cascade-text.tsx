"use client";

import React, { useMemo, useState, type ElementType, type CSSProperties } from "react";

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

  return tokens;
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
  onClick,
}: TextRevealProps) {
  const [hovered, setHovered] = useState(false);

  const tokens = useMemo(() => tokenizeCascadeText(text), [text]);

  const sign = direction === "up" ? 1 : -1;
  const isAnchor = Component === "a";
  const applyUppercase = uppercase ?? isAnchor;
  const resolvedFontSize = fontSize ?? (isAnchor ? "3rem" : undefined);

  const rootProps: Record<string, unknown> = {
    className: `inline-block relative no-underline ${
      applyUppercase ? "font-extrabold uppercase" : ""
    } cursor-pointer select-none ${className}`.trim(),
    style: {
      ...(resolvedFontSize ? { fontSize: resolvedFontSize } : {}),
      color: hovered ? hoverColor : color,
      transition: "color 0.35s ease",
      ...(isAnchor ? { padding: "0.15em 0.4em", lineHeight: 1 } : {}),
      ...style,
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick,
    "aria-label": text,
  };

  if (isAnchor) {
    rootProps.href = href ?? "#";
    if (target) rootProps.target = target;
    if (target === "_blank") rootProps.rel = "noopener noreferrer";
  }

  return (
    <Component {...rootProps}>
      <span aria-hidden="true">
        {tokens.map((token, tIdx) =>
          token.isSpace ? (
            <React.Fragment key={`s-${tIdx}`}> </React.Fragment>
          ) : (
            <span
              key={`w-${tIdx}`}
              className="inline-flex overflow-hidden relative align-baseline"
              style={{ height: "1.15em", lineHeight: 1.15 }}
            >
              {token.chars.map(({ char, index }) => (
                <span
                  key={index}
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
