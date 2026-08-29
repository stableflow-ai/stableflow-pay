import { http } from "@/lib/http";
import { PAY_API_PREFIX } from "@/api/config";
import { apiText, asRecord } from "@/api/map";
import type { PayOrganization, PayOrganizationBody } from "@/types/organization";

function mapOrganization(raw: unknown): PayOrganization {
  const row = asRecord(raw) ?? {};
  return {
    orgId: apiText(row.org_id ?? row.orgId),
    name: apiText(row.name),
    slug: apiText(row.slug),
    logo: apiText(row.logo),
    createdAt: apiText(row.created_at ?? row.createdAt),
    updatedAt: apiText(row.updated_at ?? row.updatedAt),
  };
}

export async function getOrganization(): Promise<PayOrganization> {
  return mapOrganization(await http<unknown>(`${PAY_API_PREFIX}/organization`));
}

export async function updateOrganization(body: PayOrganizationBody): Promise<PayOrganization> {
  return mapOrganization(
    await http<unknown>(`${PAY_API_PREFIX}/organization`, { method: "POST", body }),
  );
}
