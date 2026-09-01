import { cn } from "@/lib/utils";
import { REPORT_SOURCE_OPTIONS, type ReportSource } from "../config";

export function ReportsSourceToggle({
  value,
  onChange,
}: {
  value: ReportSource;
  onChange: (value: ReportSource) => void;
}) {
  return (
    <div className="flex h-9 items-center justify-center rounded-[6px] border border-[#E3E3E3] bg-white px-1 py-1 text-sm text-[#606060]">
      {REPORT_SOURCE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "flex h-full flex-1 items-center justify-center rounded-[6px] px-4",
            value === option.value ? "cursor-default bg-[#eee] text-black" : "cursor-pointer",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
