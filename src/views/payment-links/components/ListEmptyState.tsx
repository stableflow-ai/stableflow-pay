import type { ReactNode } from "react";

export function ListEmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="py-10 text-center font-montserrat text-sm font-medium text-[#AAA]">{children}</p>
  );
}
