import { describe, expect, it } from "vitest";
import { PAYER_WAIT_STATUS } from "./config";
import {
  canStayOnWaitingPage,
  waitingCardCopy,
  waitingSignedSubtitle,
} from "./waiting-copy";

describe("canStayOnWaitingPage", () => {
  it("keeps a refresh of a multisig waiting URL", () => {
    expect(canStayOnWaitingPage({
      paymentId: "",
      awaitingSubmit: false,
      hasMultisigQuery: true,
    })).toBe(true);
    expect(canStayOnWaitingPage({
      paymentId: "",
      awaitingSubmit: false,
      hasMultisigQuery: false,
    })).toBe(false);
  });
});

describe("waitingCardCopy", () => {
  it("puts n/m only in the subtitle while watching", () => {
    expect(waitingCardCopy({
      status: PAYER_WAIT_STATUS.Pending,
      multisigPending: true,
      signed: 2,
      required: 3,
    })).toEqual({
      title: "Waiting for multisig result...",
      subtitle: "2 / 3 signed",
    });
    expect(waitingSignedSubtitle(null, 3)).toBeNull();
  });

  it("returns payment copy after submit", () => {
    expect(waitingCardCopy({
      status: PAYER_WAIT_STATUS.Pending,
      multisigPending: false,
      signed: 2,
      required: 3,
    })).toEqual({
      title: "Waiting for Payment...",
      subtitle: "This can take 0-3 minutes",
    });
  });
});
