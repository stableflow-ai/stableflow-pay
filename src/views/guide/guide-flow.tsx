import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { GUIDE_PATH } from "./config";

export type GuideGoOptions = {
  replace?: boolean;
};

type GuideFlowValue = {
  mask: boolean;
  close: () => void;
  go: (href: string, options?: GuideGoOptions) => void;
};

const GuideFlowContext = createContext<GuideFlowValue | null>(null);

export function useGuideFlow(): GuideFlowValue {
  const value = useContext(GuideFlowContext);
  if (!value) {
    throw new Error("useGuideFlow must be used within a GuideFlow provider");
  }
  return value;
}

export function GuideRouteFlow({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const value = useMemo<GuideFlowValue>(
    () => ({
      mask: false,
      close: () => navigate(GUIDE_PATH),
      go: (href, options) => navigate(href, { replace: options?.replace }),
    }),
    [navigate],
  );
  return <GuideFlowContext.Provider value={value}>{children}</GuideFlowContext.Provider>;
}

export function OverviewGuideFlow({
  children,
  onHrefChange,
}: {
  children: ReactNode;
  onHrefChange: (href: string | null) => void;
}) {
  const value = useMemo<GuideFlowValue>(
    () => ({
      mask: true,
      close: () => onHrefChange(null),
      go: (href) => {
        if (href === "/" || href === GUIDE_PATH) {
          onHrefChange(null);
          return;
        }
        onHrefChange(href);
      },
    }),
    [onHrefChange],
  );
  return <GuideFlowContext.Provider value={value}>{children}</GuideFlowContext.Provider>;
}

export function GuideRedirect({ to }: { to: string }) {
  const { go } = useGuideFlow();
  useLayoutEffect(() => {
    go(to, { replace: true });
  }, [go, to]);
  return null;
}
