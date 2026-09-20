import type { ComponentType, CSSProperties, ReactNode } from "react";
import { IconLock, IconNode, IconShield } from "@/components/icons";
import { cn } from "@/lib/utils";
import { AUTH_BRAND_BG, AUTH_PANEL_BG, type AuthFeatureIconKey } from "./config";

const FEATURE_ICONS: Record<
  AuthFeatureIconKey,
  ComponentType<{ className?: string; style?: CSSProperties }>
> = {
  lock: IconLock,
  shield: IconShield,
  node: IconNode,
};

const FEATURES = [
  {
    icon: "lock" as AuthFeatureIconKey,
    title: "Confidential by default",
    body: "Reduce direct public sender recipient linkage.",
  },
  {
    icon: "shield" as AuthFeatureIconKey,
    title: "Payment Links & API",
    body: "Create payment links or integrate with simple APIs.",
  },
  {
    icon: "node" as AuthFeatureIconKey,
    title: "Cross-Chain Payments",
    body: "Accept payments across networks to your receiving address.",
  },
] as const;

export function AuthShell({
  children,
  panelTop,
  contentClassName,
}: {
  children: ReactNode;
  panelTop?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <main className="flex min-h-svh flex-col-reverse md:flex-row">
      <aside
        className={cn(
          "relative flex justify-center items-center w-full shrink-0 flex-col overflow-hidden px-6 py-8 md:w-[min(870px,57.5%)] md:min-h-svh md:px-16 md:py-14 lg:px-20 xl:px-30 2xl:px-38",
          "bg-[url('/auth/brand-mark-vector.svg')] bg-no-repeat bg-[position:left_10px] bg-[length:694px_auto]",
        )}
        style={{ backgroundColor: AUTH_BRAND_BG }}
      >
        <div className="relative z-10 flex flex-col pb-[50%]">
          <img
            src="/logo-white.svg"
            alt="Stableflow Pay"
            className="h-auto w-[112px]"
            width={112}
            height={34}
          />

          <h1 className="mt-7 font-montserrat text-[28px] font-semibold capitalize leading-tight text-white md:mt-7 md:text-[36px]">
            Built for Developers
          </h1>
          <p className="mt-1.5 font-montserrat text-[14px] font-normal leading-[1.5] text-white md:mt-1.5">
            Create payment links or integrate with a simple API. Accept confidential, cross-chain stablecoin payments.
          </p>

          <ul className="mt-8 flex-col gap-8 md:mt-9 flex">
            {FEATURES.map((feature) => {
              const Icon = FEATURE_ICONS[feature.icon];
              return (
                <li key={feature.title} className="flex items-start gap-3">
                  <span
                    className="grid size-8 shrink-0 place-items-center text-white bg-black/10 rounded-[8px]"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-montserrat text-[16px] font-semibold capitalize text-white">
                      {feature.title}
                    </p>
                    <p className="mt-1 font-montserrat text-[14px] font-normal leading-[1.5] text-white">
                      {feature.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <section
        className="relative flex flex-1 flex-col items-center justify-start px-4 sm:px-6 py-10 md:py-12 md:justify-center"
        style={{ backgroundColor: AUTH_PANEL_BG }}
      >
        <div className={cn("relative z-10 flex w-full flex-col items-center", contentClassName)}>
          {panelTop ? <div className="mb-5 flex justify-center">{panelTop}</div> : null}
          {children}
        </div>
      </section>
    </main>
  );
}
