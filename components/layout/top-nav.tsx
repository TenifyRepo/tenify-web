import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <MobileNav />
      <div className="md:hidden">
        <Logo href="/dashboard" variant="icon" />
      </div>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" render={<Link href="/login" />}>
        Account
      </Button>
    </header>
  );
}
