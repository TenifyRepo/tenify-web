import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 sm:h-[3.75rem]">
      <MobileNav />
      <div className="md:hidden">
        <Logo href="/dashboard" variant="icon" />
      </div>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Account</Link>
      </Button>
    </header>
  );
}
