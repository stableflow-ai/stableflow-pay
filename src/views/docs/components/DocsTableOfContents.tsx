import { Card } from "@/components/ui/card/Card";
import { cn } from "@/lib/utils";
import { DOCS_TOC_ITEMS, type DocsTocId } from "../config";

export function DocsTableOfContents({
  activeId,
  cardClassName,
  onNavigate,
}: {
  activeId: DocsTocId;
  cardClassName?: string;
  onNavigate: (id: DocsTocId) => void;
}) {
  return (
    <Card className={cn("p-2", cardClassName)}>
      <nav aria-label="Developer Docs sections" className="flex flex-col gap-1">
        {DOCS_TOC_ITEMS.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
              aria-current={active ? "location" : undefined}
              className={cn(
                "rounded-[10px] px-3 py-2.5 font-montserrat text-[13px] leading-snug transition-colors",
                active
                  ? "bg-primary/10 font-medium text-[#1F6FD6]"
                  : "font-normal text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </Card>
  );
}
