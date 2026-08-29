import type { ReactNode } from "react";

export function CouponShell(props: { top: ReactNode; bottom: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="relative rounded-t-[20px] border border-b-0 border-white bg-[#fdfdfd] px-[30px] pt-8 pb-5 shadow-[0_0_20px_0_rgba(0,0,0,0.06)]">
        {props.top}
      </div>
      <img
        src="/pay/coupon-middle.png"
        alt=""
        aria-hidden
        draggable={false}
        className="block h-auto w-full"
      />
      <div className="rounded-b-[20px] border border-t-0 border-white bg-[#fdfdfd] px-[30px] pt-5 pb-8 shadow-[0_0_20px_0_rgba(0,0,0,0.06)]">
        {props.bottom}
      </div>
    </div>
  );
}
