import { PAY_API_PREFIX } from "@/api/config";
import { http } from "@/lib/http";

export function completeGuide() {
  return http<void>(`${PAY_API_PREFIX}/guide/complete`, {
    method: "POST",
  });
}
