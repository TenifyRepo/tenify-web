export function tenantDisplayName(tenant: {
  first_name: string;
  last_name: string;
}) {
  return [tenant.first_name, tenant.last_name].filter(Boolean).join(" ");
}
