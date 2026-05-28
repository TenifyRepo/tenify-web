import {
  Banknote,
  Building2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Properties", href: "/properties", icon: Building2 },
  { title: "Tenants", href: "/tenants", icon: Users },
  { title: "Leases", href: "/leases", icon: FileText },
  { title: "Invoices", href: "/invoices", icon: Receipt },
  { title: "Payments", href: "/payments", icon: Banknote },
  { title: "Documents", href: "/documents", icon: FolderOpen },
];
