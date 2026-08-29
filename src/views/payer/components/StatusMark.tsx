import { IconAlert } from "@/components/icons/alert";
import { IconCheck2 } from "@/components/icons/check";
import { IconClose } from "@/components/icons/close";
import { IconLoading } from "@/components/icons/loading";
import { PAYER_WAIT_STATUS, type PayerWaitStatus } from "../config";

export function StatusMark(props: { status: PayerWaitStatus }) {
  if (props.status === PAYER_WAIT_STATUS.Success) {
    return (
      <span className="inline-flex size-[54px] items-center justify-center rounded-full bg-[#84a20f] shadow-[0_0_0_4px_rgba(132,162,15,0.2)]">
        <IconCheck2 className="size-5 text-white" />
      </span>
    );
  }
  if (props.status === PAYER_WAIT_STATUS.Failed) {
    return (
      <span className="inline-flex size-[54px] items-center justify-center rounded-full bg-danger shadow-[0_0_0_4px_rgba(255,86,86,0.2)]">
        <IconClose className="size-4 text-white" />
      </span>
    );
  }
  if (props.status === PAYER_WAIT_STATUS.Suspended) {
    return (
      <span className="inline-flex size-[54px] items-center justify-center rounded-full bg-[#AAA]">
        <IconAlert className="size-4 text-white" />
      </span>
    );
  }
  return <IconLoading className="size-[54px] animate-spin text-primary" />;
}
