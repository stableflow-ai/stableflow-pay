import type { HTMLAttributes } from "react";
import { Card } from "@/components/ui/card/Card";
import { cn } from "@/lib/utils";

export function CreateLinkCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn("mx-auto w-full px-[30px] py-8 md:w-[776px]", className)}
      {...props}
    />
  );
}

export default CreateLinkCard;
