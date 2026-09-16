import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PrivacyExecutionSnapshot } from "@/lib/confidential/execution-types";

interface PrivacyTransferExecutionState {
  snapshots: Record<string, PrivacyExecutionSnapshot>;
  upsert: (snapshot: PrivacyExecutionSnapshot) => void;
}

export const usePrivacyTransferExecutionStore = create<PrivacyTransferExecutionState>()(
  persist(
    (set) => ({
      snapshots: {},
      upsert: (snapshot) => {
        set((state) => ({
          snapshots: { ...state.snapshots, [snapshot.id]: snapshot },
        }));
      },
    }),
    {
      name: "stableflow-pay:privacy-transfer-execution:v1",
    },
  ),
);

export function listPrivacyTransferExecutions(): PrivacyExecutionSnapshot[] {
  return Object.values(usePrivacyTransferExecutionStore.getState().snapshots)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getPrivacyTransferExecution(id: string): PrivacyExecutionSnapshot | undefined {
  return usePrivacyTransferExecutionStore.getState().snapshots[id];
}
