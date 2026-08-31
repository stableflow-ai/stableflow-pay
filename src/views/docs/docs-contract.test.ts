import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ADDITIONAL_FIELDS_TABLE,
  API_REFERENCE_TABLE,
  CHECKOUT_OPTIONS_TABLE,
  COMMON_ERRORS_TABLE,
  CONTRACT_NOTES_TABLE,
  CREATE_SESSION_BACKEND_CODE,
  CREATE_SESSION_CODE,
  DOCS_TOC_ITEMS,
  ENVIRONMENT_CODE,
  ENVIRONMENTS_TABLE,
  PAYMENT_STATUSES_TABLE,
  REQUIRED_FIELDS_TABLE,
  RESPONSE_PARSER_CODE,
  RETRY_GUIDANCE_TABLE,
  SESSION_STATUSES_TABLE,
  SESSION_STATUS_RESPONSE_CODE,
  VERIFY_WEBHOOK_CODE,
  WEBHOOK_EVENTS_TABLE,
  WEBHOOK_HANDLER_CODE,
} from "./config";

const TABLES = [
  CHECKOUT_OPTIONS_TABLE,
  ENVIRONMENTS_TABLE,
  REQUIRED_FIELDS_TABLE,
  ADDITIONAL_FIELDS_TABLE,
  SESSION_STATUSES_TABLE,
  PAYMENT_STATUSES_TABLE,
  WEBHOOK_EVENTS_TABLE,
  RETRY_GUIDANCE_TABLE,
  CONTRACT_NOTES_TABLE,
  API_REFERENCE_TABLE,
  COMMON_ERRORS_TABLE,
] as const;

describe("Developer Docs contract", () => {
  it("keeps the table of contents aligned with page sections", () => {
    const tocIds = DOCS_TOC_ITEMS.map((item) => item.id);
    const source = readFileSync(new URL("./DocsView.tsx", import.meta.url), "utf8");
    const sectionIds = [...source.matchAll(/<DocsSection id="([^"]+)"/g)].map((match) => match[1]);

    expect(new Set(tocIds).size).toBe(tocIds.length);
    expect(sectionIds).toEqual(tocIds);
    expect(source).toContain('title="Browse sections"');
    expect(source).toContain("side={DRAWER_SIDE.Bottom}");
  });

  it("keeps every documentation table structurally valid", () => {
    const labels = TABLES.map((table) => table.label);

    expect(new Set(labels).size).toBe(labels.length);
    for (const table of TABLES) {
      expect(table.label.trim()).not.toBe("");
      expect(table.headers.length).toBeGreaterThan(0);
      for (const row of table.rows) expect(row).toHaveLength(table.headers.length);
    }
  });

  it("preserves the server-side Checkout Session safety requirements", () => {
    expect(ENVIRONMENT_CODE).toContain("https://test-api.stableflow.ai");
    expect(ENVIRONMENT_CODE).toContain('SUCCESS_URL="https://your-domain.example/payment/success"');
    expect(CREATE_SESSION_CODE).toContain("x-api-key:");
    expect(CREATE_SESSION_CODE).toContain('"amount": "10.50"');
    expect(CREATE_SESSION_CODE).toContain('"success_url":');
    expect(CREATE_SESSION_CODE).not.toContain('"amount": 10.50');
    expect(CREATE_SESSION_BACKEND_CODE).toContain("json().catch(() => null)");
    expect(CREATE_SESSION_BACKEND_CODE).toContain("success_url: process.env.SUCCESS_URL");
    expect(RESPONSE_PARSER_CODE).toContain("json().catch(() => null)");
    expect(SESSION_STATUS_RESPONSE_CODE).toContain('"status": "created"');
  });

  it("preserves raw-body webhook verification and deduplication guidance", () => {
    expect(VERIFY_WEBHOOK_CODE).toContain('.update(".")');
    expect(VERIFY_WEBHOOK_CODE).toContain("timingSafeEqual");
    expect(WEBHOOK_HANDLER_CODE).toContain("express.raw");
    expect(WEBHOOK_HANDLER_CODE).toContain("processStableFlowEventOnce");
  });

  it("keeps the core Checkout API endpoints in the reference", () => {
    const endpoints = API_REFERENCE_TABLE.rows.map((row) => row[1].text);

    expect(endpoints).toEqual([
      "/tokens",
      "/checkout/sessions",
      "/checkout/sessions/{sessionId}",
      "/payments/{paymentId}",
    ]);
  });
});
