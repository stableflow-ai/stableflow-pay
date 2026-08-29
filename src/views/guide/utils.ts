import { checkoutSessionsUrl } from "@/api/config";
import {
  GUIDE_STEP,
  GUIDE_STEP_PATH,
  GUIDE_STEPS,
  GUIDE_TEST_SAMPLE,
  type GuideStepDef,
  type GuideStepId,
} from "./config";

export type GuideStepCompletion = {
  paymentLinkDone: boolean;
  apiKeyDone: boolean;
  webhookDone: boolean;
  testCompleted: boolean;
};

export function isGuideStepDone(step: GuideStepDef, completion: GuideStepCompletion): boolean {
  if (step.id === GUIDE_STEP.PaymentLink) return completion.paymentLinkDone;
  if (step.id === GUIDE_STEP.ApiKey) return completion.apiKeyDone;
  if (step.id === GUIDE_STEP.Webhook) return completion.webhookDone;
  return completion.testCompleted;
}

export function guideStepHref(step: GuideStepDef, completion: GuideStepCompletion): string {
  return isGuideStepDone(step, completion) ? step.previewPath : step.formPath;
}

export function nextGuideStepHref(
  stepId: GuideStepId,
  completion: GuideStepCompletion,
): string | null {
  const index = GUIDE_STEPS.findIndex((step) => step.id === stepId);
  if (index < 0) return null;
  const next = GUIDE_STEPS[index + 1];
  if (!next) return null;
  return guideStepHref(next, completion);
}

export function guideStepFromPath(pathname: string): GuideStepId | null {
  if (pathname.startsWith(GUIDE_STEP_PATH.paymentLink)) return GUIDE_STEP.PaymentLink;
  if (pathname.startsWith(GUIDE_STEP_PATH.apiKey)) return GUIDE_STEP.ApiKey;
  if (pathname.startsWith(GUIDE_STEP_PATH.webhook)) return GUIDE_STEP.Webhook;
  if (pathname.startsWith(GUIDE_STEP_PATH.test)) return GUIDE_STEP.Test;
  return null;
}

export function truncateEnd(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 3))}...`;
}

export function generateGuideOutOrderNo(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `guide_${Date.now()}_${rand}`;
}

export function guideSnippetApiKey(key: string): string {
  return key.trim() || "YOUR_API_KEY";
}

export function buildGuideTestSnippet(lang: "node" | "curl" | "python", apiKey: string): string {
  const key = guideSnippetApiKey(apiKey);
  const url = checkoutSessionsUrl();
  const sample = GUIDE_TEST_SAMPLE;

  if (lang === "curl") {
    return [
      `curl -X POST "${url}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -H "x-api-key: ${key}" \\`,
      `  -d '{`,
      `    "amount": "${sample.amount}",`,
      `    "network": "${sample.network}",`,
      `    "out_order_no": "${sample.outOrderNo}",`,
      `    "recipient": "${sample.recipient}",`,
      `    "success_url": "${sample.successUrl}",`,
      `    "symbol": "${sample.symbol}"`,
      `  }'`,
    ].join("\n");
  }

  if (lang === "python") {
    return [
      "import json",
      "import urllib.request",
      "",
      `STABLEFLOW_API_KEY = "${key}"`,
      "",
      "body = {",
      `    "amount": "${sample.amount}",`,
      `    "network": "${sample.network}",`,
      `    "out_order_no": "${sample.outOrderNo}",`,
      `    "recipient": "${sample.recipient}",`,
      `    "success_url": "${sample.successUrl}",`,
      `    "symbol": "${sample.symbol}",`,
      "}",
      "",
      "request = urllib.request.Request(",
      `    "${url}",`,
      "    data=json.dumps(body).encode(),",
      '    headers={"Content-Type": "application/json", "x-api-key": STABLEFLOW_API_KEY},',
      '    method="POST",',
      ")",
      "with urllib.request.urlopen(request) as response:",
      "    payload = json.load(response)",
      'print(payload["data"])',
    ].join("\n");
  }

  return [
    `const STABLEFLOW_API_KEY = "${key}";`,
    "",
    "const response = await fetch(",
    `  \`${url}\`,`,
    "  {",
    `      method: "POST",`,
    "      headers: {",
    `        "Content-Type": "application/json",`,
    `        "x-api-key": STABLEFLOW_API_KEY,`,
    "      },",
    "      body: JSON.stringify({",
    `        amount: "${sample.amount}", // human readable`,
    `        network: "${sample.network}",`,
    `        out_order_no: "${sample.outOrderNo}",`,
    `        recipient: "${sample.recipient}", // your near recipient address`,
    `        success_url: "${sample.successUrl}", // your success callback url`,
    `        symbol: "${sample.symbol}",`,
    "      }),",
    "    },",
    ");",
    "",
    "const payload = await response.json();",
    "console.log(payload.data)",
  ].join("\n");
}

export function formatGuideJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 4);
  } catch {
    return String(value);
  }
}

export function guideErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
