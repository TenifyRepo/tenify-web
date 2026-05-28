import {
  AlertCircle,
  Building2,
  DoorOpen,
  FileText,
  FolderOpen,
  Plus,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { getInvoiceDashboardStats } from "@/actions/invoices";
import { getDashboardCounts } from "@/actions/leases";
import {
  getDocumentDashboardStats,
  getRecentDocuments,
} from "@/actions/documents";
import {
  getPaymentDashboardStats,
  getRecentPayments,
} from "@/actions/payments";
import { DocumentCard } from "@/components/documents/document-card";
import { PaymentCard } from "@/components/payments/payment-card";
import { getProperties } from "@/actions/properties";
import { formatZar } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  let properties: Awaited<ReturnType<typeof getProperties>> = [];
  let counts = { properties: 0, units: 0, tenants: 0, activeLeases: 0 };
  let invoiceStats = {
    totalInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
    outstandingBalance: 0,
  };
  let paymentStats = {
    totalPaymentsReceived: 0,
    outstandingBalance: 0,
  };
  let recentPayments: Awaited<ReturnType<typeof getRecentPayments>> = [];
  let documentStats = { totalDocuments: 0 };
  let recentDocuments: Awaited<ReturnType<typeof getRecentDocuments>> = [];
  let loadError: string | null = null;

  try {
    const [props, stats, invoices, payments, recent, docs, docStats] =
      await Promise.all([
        getProperties(),
        getDashboardCounts(),
        getInvoiceDashboardStats(),
        getPaymentDashboardStats(),
        getRecentPayments(5),
        getRecentDocuments(5),
        getDocumentDashboardStats(),
      ]);
    properties = props;
    counts = stats;
    invoiceStats = invoices;
    paymentStats = payments;
    recentPayments = recent;
    recentDocuments = docs;
    documentStats = docStats;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load dashboard";
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick overview of your portfolio."
      >
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="size-4" />
            Add property
          </Link>
        </Button>
      </PageHeader>

      {loadError ? (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Setup required</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal space-y-1 pl-4">
              <li>Run migrations 003–008 in Supabase</li>
              <li>Copy <code>.env.example</code> to <code>.env.local</code></li>
              <li>Set your Supabase URL and anon key</li>
              <li>
                Create a landlord row, set <code>DEV_LANDLORD_ID</code>, and
                add it to <code>_dev_landlord_access</code>
              </li>
            </ol>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Properties"
              value={counts.properties}
              icon={Building2}
            />
            <StatCard label="Units" value={counts.units} icon={DoorOpen} />
            <StatCard label="Tenants" value={counts.tenants} icon={Users} />
            <StatCard
              label="Active leases"
              value={counts.activeLeases}
              icon={FileText}
            />
          </div>

          <div className="mb-4 grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total invoices"
              value={invoiceStats.totalInvoices}
              icon={Receipt}
            />
            <StatCard
              label="Unpaid"
              value={invoiceStats.unpaidInvoices}
              icon={Wallet}
            />
            <StatCard
              label="Overdue"
              value={invoiceStats.overdueInvoices}
              icon={AlertCircle}
            />
            <StatCard
              label="Outstanding"
              value={formatZar(invoiceStats.outstandingBalance) ?? "R 0"}
              icon={Receipt}
            />
          </div>

          <div className="mb-4 grid gap-4 grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Payments received"
              value={formatZar(paymentStats.totalPaymentsReceived) ?? "R 0"}
              icon={Wallet}
            />
            <StatCard
              label="Outstanding balances"
              value={formatZar(paymentStats.outstandingBalance) ?? "R 0"}
              icon={AlertCircle}
            />
            <StatCard
              label="Total documents"
              value={documentStats.totalDocuments}
              icon={FolderOpen}
            />
          </div>

          {recentDocuments.length > 0 ? (
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Recent uploads
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/documents">View all</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentDocuments.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </section>
          ) : null}

          {recentPayments.length > 0 ? (
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Recent payments
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/payments">View all</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} />
                ))}
              </div>
            </section>
          ) : null}

          {properties.length > 0 ? (
            <section>
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">
                Recent properties
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {properties.slice(0, 4).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </section>
          ) : (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Building2 className="mb-3 size-8 text-muted-foreground" />
                <p className="font-medium">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add one in under a minute.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/properties/new">
                    <Plus className="size-4" />
                    Add property
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {Icon ? <Icon className="size-4" /> : null}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
