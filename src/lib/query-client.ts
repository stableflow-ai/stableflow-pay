import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";

const QUERY_RETRY_COUNT = 2;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= QUERY_RETRY_COUNT) return false;
  if (
    error instanceof ApiError
    && error.code !== "TIMEOUT"
    && error.status >= 400
    && error.status < 500
  ) {
    return false;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
  },
});
