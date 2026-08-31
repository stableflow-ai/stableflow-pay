import { useEffect, useId, type CSSProperties, type ReactNode } from "react";
import { IconClose } from "@/components/icons/close";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card/Card";

export type OverlayPanelProps = {
  title?: ReactNode;
  ariaLabel?: string;
  titleClassName?: string;
  closeClassName?: string;
  closeIcon?: ReactNode;
  headerAction?: ReactNode;
  onClose?: () => void;
  cardClassName?: string;
  contentClassName?: string;
  children?: ReactNode;
  style?: CSSProperties;
  trapFocus?: boolean;
};

export function OverlayPanel(props: OverlayPanelProps) {
  const {
    title,
    ariaLabel,
    titleClassName,
    closeClassName,
    closeIcon,
    headerAction,
    onClose,
    cardClassName,
    contentClassName,
    children,
    style,
    trapFocus = true,
  } = props;
  const panelId = useId();
  const titleId = panelId + "-title";
  const hasTitle = title !== undefined && title !== null && title !== "";

  useEffect(() => {
    if (!trapFocus) return;

    const panel = document.getElementById(panelId);
    if (!panel) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0,
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === panel || activeElement === firstElement || !panel.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    panel.addEventListener("keydown", handleKeyDown);
    return () => {
      panel.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [panelId, trapFocus]);

  return (
    <Card
      id={panelId}
      role="dialog"
      aria-modal={trapFocus ? "true" : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-label={hasTitle ? undefined : ariaLabel}
      tabIndex={-1}
      className={cn("relative flex flex-col gap-5", cardClassName)}
      style={style}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex shrink-0 items-center gap-3">
        <h2
          id={hasTitle ? titleId : undefined}
          className={cn(
            "min-h-5 min-w-0 font-montserrat text-[20px] font-semibold leading-normal text-black",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {headerAction}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={cn(
            "ml-auto shrink-0 cursor-pointer rounded-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6284f5]/60",
            closeClassName,
          )}
        >
          {closeIcon ?? <IconClose className="size-3.25" />}
        </button>
      </div>
      <div className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>{children}</div>
    </Card>
  );
}

export default OverlayPanel;
