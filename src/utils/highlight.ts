import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import http from "shiki/langs/http.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import python from "shiki/langs/python.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";

/**
 * Syntax highlighting via Shiki (the same TextMate engine VS Code uses).
 *
 * The app imports the fine-grained Shiki core with only the languages and
 * themes it uses, so no unused grammar files are shipped. The JavaScript
 * regex engine is used instead of the Oniguruma wasm one, which removes the
 * ~450 kB wasm download entirely; all bundled languages are supported.
 *
 * The highlighter is created lazily as a module-level singleton shared by
 * every code block across the app. GitHub Dark is used for code on dark
 * surfaces; GitHub Light for code on light surfaces (e.g. the guide test
 * result panel).
 */
export type HighlightLanguage = "bash" | "http" | "javascript" | "json" | "python" | "text";

export type HighlightTheme = "github-dark" | "github-light";

export type HighlightToken = {
  content: string;
  color?: string;
  fontStyle?: number;
};

export type HighlightedLine = HighlightToken[];

const LANGUAGES = [bash, http, javascript, json, python] as const;
const THEMES = [githubDark, githubLight] as const;

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    langs: [...LANGUAGES],
    themes: [...THEMES],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

/**
 * Highlights `code` for the given language and theme, returning one entry per
 * line, each a list of colored tokens. The `"text"` language returns plain
 * single-token lines (no highlighting).
 */
export async function highlightCode(
  code: string,
  language: HighlightLanguage,
  theme: HighlightTheme = "github-dark",
): Promise<HighlightedLine[]> {
  if (language === "text") {
    return code.split("\n").map((line) => [{ content: line }]);
  }
  const highlighter = await getHighlighter();
  const { tokens } = highlighter.codeToTokens(code, {
    lang: language,
    theme,
  });
  return tokens;
}
