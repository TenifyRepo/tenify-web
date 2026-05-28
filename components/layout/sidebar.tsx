import { Logo } from "@/components/layout/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-white md:flex">
      <div className="flex h-14 items-center bg-white px-4 sm:h-[3.75rem]">
        <Logo href="/dashboard" variant="icon" />
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks />
      </div>
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">
          Simple property management
        </p>
      </div>
    </aside>
  );
}
