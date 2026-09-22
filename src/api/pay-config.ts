import { PAY_API_PREFIX } from "@/api/config";
import { apiNumber, apiText, asRecord } from "@/api/map";
import { http } from "@/lib/http";
import type { PayConfig, PayConfigChain, PayConfigToken } from "@/types/pay-config";

function asBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }
  return fallback;
}

function mapConfigChain(raw: unknown): PayConfigChain {
  const row = asRecord(raw) ?? {};
  return {
    network: apiText(row.network),
    chainId: apiText(row.chain_id ?? row.chainId),
    chainName: apiText(row.chain_name ?? row.chainName),
    logo: apiText(row.logo),
    explorer: apiText(row.explorer),
  };
}

function mapConfigToken(raw: unknown): PayConfigToken {
  const row = asRecord(raw) ?? {};
  return {
    symbol: apiText(row.symbol),
    network: apiText(row.network),
    decimals: apiNumber(row.decimals) ?? 0,
    contractAddress: apiText(row.contract_address ?? row.contractAddress),
    price: apiText(row.price),
    supportPayment: asBoolean(row.support_payment ?? row.supportPayment),
    supportReceive: asBoolean(row.support_receive ?? row.supportReceive),
  };
}

export function mapPayConfig(raw: unknown): PayConfig {
  const row = asRecord(raw) ?? {};
  const chains = Array.isArray(row.chains) ? row.chains.map(mapConfigChain) : [];
  const tokens = Array.isArray(row.tokens) ? row.tokens.map(mapConfigToken) : [];
  return { chains, tokens };
}

export async function getPayConfig(): Promise<PayConfig> {
  return mapPayConfig(
    await http<unknown>(`${PAY_API_PREFIX}/config`, { auth: false }),
  );
}
