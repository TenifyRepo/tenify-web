import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DocumentCategoryBadge({ category }: { category: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("max-w-full truncate font-normal")}
    >
      {category}
    </Badge>
  );
}
