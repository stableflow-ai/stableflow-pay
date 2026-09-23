import { lazy, Suspense, type ReactNode } from "react";
import { getLogo } from "@/lib/logo";
import { cn } from "@/lib/utils";
import { AUTH_PANEL_BG } from "./config";

const PixelBlast = lazy(() => import("@/components/pixel-blast/PixelBlast"));

const STABLEFLOW_WORDMARK = getLogo("/stableflow/logos/logo-stableflow-full-light.svg");

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
          "relative flex w-full shrink-0 flex-col overflow-hidden bg-black px-6 py-8 md:w-[min(870px,57.5%)] md:min-h-svh md:px-16 md:py-14 lg:px-16 xl:px-30",
        )}
      >
        <div className="absolute inset-0" aria-hidden>
          <Suspense fallback={null}>
            <PixelBlast
              variant="triangle"
              pixelSize={3}
              color="#3B82F6"
              patternScale={4}
              patternDensity={0.8}
              pixelSizeJitter={0.95}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              speed={1.35}
              edgeFade={0.24}
              transparent
            />
          </Suspense>
        </div>

        <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="flex items-center gap-3">
            <img src={STABLEFLOW_WORDMARK} alt="StableFlow" className="h-10 w-auto" />
            <img src="/logo.svg" alt="Payment" className="h-[30px] w-auto" />
          </div>
          <h1 className="mt-7 font-montserrat text-[28px] font-normal leading-tight text-white md:text-[36px]">
            Pay Their Way. Get Paid Yours.
          </h1>
          <p className="mt-1.5 max-w-[460px] font-montserrat text-[14px] font-normal leading-[1.5] text-white">
            Accept stablecoin payments your customers’ way, and receive them yours.
          </p>
        </div>
      </aside>

      <section
        className="relative flex flex-1 flex-col items-center justify-start px-4 py-10 sm:px-6 md:justify-center md:py-12"
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
