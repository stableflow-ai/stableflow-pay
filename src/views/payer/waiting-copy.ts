import {
  MULTISIG_SIGNED_LABEL,
  MULTISIG_WAITING_TITLE,
} from "@/wallet/multisig/config";
import { PAYER_WAIT_STATUS, type PayerWaitStatus } from "./config";

export function canStayOnWaitingPage(input: {
  paymentId: string;
  awaitingSubmit: boolean;
  hasMultisigQuery: boolean;
}): boolean {
  return Boolean(input.paymentId || input.awaitingSubmit || input.hasMultisigQuery);
}

export function waitingSignedSubtitle(
  signed: number | null,
  required: number | null,
): string | null {
  if (signed == null || required == null) return null;
  return `${signed} / ${required} ${MULTISIG_SIGNED_LABEL}`;
}

export function waitingCardCopy(input: {
  status: PayerWaitStatus;
  multisigPending: boolean;
  signed: number | null;
  required: number | null;
}): { title: string; subtitle: string | null } {
  if (input.status === PAYER_WAIT_STATUS.Success) {
    return { title: "Payment Successful!", subtitle: null };
  }
  if (input.status === PAYER_WAIT_STATUS.Failed) {
    return { title: "Payment Failed", subtitle: null };
  }
  if (input.status === PAYER_WAIT_STATUS.Suspended) {
    return { title: "Payment Suspended", subtitle: "This payment has expired." };
  }
  if (input.multisigPending) {
    return {
      title: MULTISIG_WAITING_TITLE,
      subtitle: waitingSignedSubtitle(input.signed, input.required),
    };
  }
  return { title: "Waiting for Payment...", subtitle: "This can take 0-3 minutes" };
}
