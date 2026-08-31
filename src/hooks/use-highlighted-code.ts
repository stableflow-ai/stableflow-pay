import { useEffect, useState, type CSSProperties } from "react";
import {
  highlightCode,
  type HighlightLanguage,
  type HighlightTheme,
  type HighlightToken,
} from "@/utils";

/**
 * Asynchronously highlights a static code string with Shiki. Returns `null`
 * until the (shared) highlighter is ready and the tokens are computed, so
 * callers can keep rendering plain text and avoid layout shift.
 */
export function useHighlightedCode(
  code: string,
  language: HighlightLanguage,
  theme: HighlightTheme = "github-dark",
): HighlightToken[][] | null {
  const [tokens, setTokens] = useState<HighlightToken[][] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTokens(null);
    void highlightCode(code, language, theme).then((result) => {
      if (!cancelled) setTokens(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, theme]);

  return tokens;
}

/**
 * Maps a Shiki token to its inline styles. Shiki encodes italic / bold /
 * underline as a bitmask (1 = italic, 2 = bold, 4 = underline).
 */
export function highlightTokenStyle(token: HighlightToken): CSSProperties {
  const style: CSSProperties = {};
  if (token.color) style.color = token.color;
  const fontStyle = token.fontStyle ?? 0;
  if (fontStyle & 1) style.fontStyle = "italic";
  if (fontStyle & 2) style.fontWeight = "bold";
  if (fontStyle & 4) style.textDecoration = "underline";
  return style;
}
