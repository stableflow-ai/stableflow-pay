import { useCallback, useEffect, useRef, useState } from "react";
import { DOCS_TOC_ITEMS, type DocsTocId } from "./config";

const DEFAULT_ID = DOCS_TOC_ITEMS[0].id;

function isDocsTocId(value: string): value is DocsTocId {
  return DOCS_TOC_ITEMS.some((item) => item.id === value);
}

function readHashId(): DocsTocId | null {
  const value = window.location.hash.replace(/^#/, "");
  return isDocsTocId(value) ? value : null;
}

function scrollToId(id: DocsTocId, behavior: ScrollBehavior) {
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

function focusHeading(id: DocsTocId) {
  document.getElementById(`${id}-heading`)?.focus({ preventScroll: true });
}

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function useDocsToc() {
  const [activeId, setActiveId] = useState<DocsTocId>(DEFAULT_ID);
  const scrollingRef = useRef(false);
  const scrollTimerRef = useRef<number | null>(null);

  const navigateTo = useCallback((id: DocsTocId) => {
    scrollingRef.current = true;
    if (scrollTimerRef.current != null) window.clearTimeout(scrollTimerRef.current);

    setActiveId(id);
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
    const behavior = preferredScrollBehavior();
    scrollToId(id, behavior);
    window.requestAnimationFrame(() => focusHeading(id));
    scrollTimerRef.current = window.setTimeout(() => {
      scrollingRef.current = false;
      scrollTimerRef.current = null;
    }, behavior === "smooth" ? 1400 : 100);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const hashId = readHashId();
      if (!hashId) return;
      setActiveId(hashId);
      scrollToId(hashId, "auto");
    });

    const onHashChange = () => {
      const hashId = readHashId();
      if (!hashId) return;
      setActiveId(hashId);
      scrollToId(hashId, preferredScrollBehavior());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  useEffect(() => {
    const elements = DOCS_TOC_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const id = visible[0]?.target.id;
        if (!id || !isDocsTocId(id)) return;

        setActiveId(id);
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${id}`);
      },
      { root: null, rootMargin: "-15% 0px -60% 0px", threshold: [0.05, 0.25, 0.5] },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (scrollTimerRef.current != null) window.clearTimeout(scrollTimerRef.current);
    },
    [],
  );

  return { activeId, navigateTo };
}
