import { Card } from "@/components/ui/card/Card";
import { SIGNATURE_VERIFICATION_CODE } from "../config";

export function SignatureVerification() {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-montserrat text-base font-medium text-black">Signature Verification</h2>
        <p className="font-montserrat text-sm font-medium text-[#606060]">
          Verify webhook signatures to ensure requests are from Ping:
        </p>
      </div>
      <pre className="overflow-x-auto rounded-[12px] bg-[#111] px-4 py-4 font-mono text-xs leading-5 text-white md:text-sm">
        <code>{SIGNATURE_VERIFICATION_CODE}</code>
      </pre>
    </Card>
  );
}
