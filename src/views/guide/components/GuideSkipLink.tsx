import { Link } from "react-router-dom";
import { Icon2Right } from "@/components/icons/to-right";
import { cn } from "@/lib/utils";

export function GuideSkipLink({
  to,
  label,
  className,
}: {
  to: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-montserrat text-base font-medium text-[#606060] hover:text-black",
        className,
      )}
    >
      {label}
      <Icon2Right className="h-2 w-[11.5px]" />
    </Link>
  );
}
