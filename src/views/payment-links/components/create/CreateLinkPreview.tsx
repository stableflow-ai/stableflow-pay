import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { IconLink } from "@/components/icons/link";
import { Button } from "@/components/ui/button/Button";
import { BUTTON_SIZE, BUTTON_VARIANT } from "@/components/ui/button/config";
import useToast from "@/hooks/use-toast";
import {
  CREATE_LINK_QR_SIZE_PX,
  CREATE_PAYMENT_LINK_PATH,
  CREATE_PAYMENT_LINK_STEP,
  type CreatePaymentLinkPreviewState,
} from "../../config";
import { buildPaymentLinkUrl, downloadPaymentLinkQr, paymentLinkQrDataUrl } from "../../utils";
import { CreateLinkStepper } from "./CreateLinkStepper";

export function CreateLinkPreview() {
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const linkId = (location.state as CreatePaymentLinkPreviewState | null)?.linkId;
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  const url = linkId ? buildPaymentLinkUrl(window.location.origin, linkId) : "";

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    void paymentLinkQrDataUrl(url).then((dataUrl) => {
      if (!cancelled) setQrSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!linkId) {
    return <Navigate to={CREATE_PAYMENT_LINK_PATH} replace />;
  }

  const previewLinkId = linkId;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success({ title: "Copied" });
    } catch {
      toast.fail({ title: "Could not copy" });
    }
  }

  function saveQr() {
    if (!qrSrc) return;
    downloadPaymentLinkQr(qrSrc, previewLinkId);
  }

  return (
    <div>
      <CreateLinkStepper step={CREATE_PAYMENT_LINK_STEP.Preview} />
      <div className="mt-6 h-px w-full bg-[#e3e3e3]" />

      <p className="mt-8 text-center font-montserrat text-sm font-medium capitalize text-[#606060]">
        Payment Link
      </p>
      <p className="mt-3 break-all text-center font-montserrat text-lg font-medium text-black">
        {url}
      </p>

      <p className="mt-6 text-center font-montserrat text-sm font-medium capitalize text-[#606060]">
        QR code
      </p>
      <div
        className="mx-auto mt-3 overflow-hidden"
        style={{ width: CREATE_LINK_QR_SIZE_PX, height: CREATE_LINK_QR_SIZE_PX }}
      >
        {qrSrc ? (
          <img src={qrSrc} alt="Payment link QR code" className="size-full object-cover" />
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          variant={BUTTON_VARIANT.Normal}
          size={BUTTON_SIZE.Xl}
          className="w-full"
          onClick={() => navigate(CREATE_PAYMENT_LINK_PATH)}
        >
          Back
        </Button>
        <Button
          size={BUTTON_SIZE.Xl}
          className="w-full"
          disabled={!qrSrc}
          onClick={saveQr}
        >
          Save QR Code
        </Button>
        <Button size={BUTTON_SIZE.Xl} className="w-full" onClick={() => void copyLink()}>
          <IconLink className="size-3.5 shrink-0" />
          Copy Link
        </Button>
      </div>
    </div>
  );
}

export default CreateLinkPreview;
