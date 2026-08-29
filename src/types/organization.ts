export interface PayOrganization {
  orgId: string;
  name: string;
  slug: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayOrganizationBody {
  logo: string;
  name: string;
  slug: string;
}
