import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
  /** Y mark for nav chrome; full wordmark + tagline for hero/marketing */
  variant?: "icon" | "full";
  priority?: boolean;
};

export function Logo({
  className,
  href = "/",
  variant = "icon",
  priority = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {variant === "icon" ? (
        <Image
          src="/tenify-icon.png"
          alt="Tenify"
          width={1024}
          height={384}
          priority={priority}
          className="size-14 object-contain object-left sm:size-[4.5rem]"
        />
      ) : (
        <Image
          src="/tenify-logo.png"
          alt="Tenify — Simplify Renting. Streamline Living."
          width={1024}
          height={384}
          priority={priority}
          className="h-auto w-full max-w-[min(100%,28rem)] object-contain sm:max-w-lg"
        />
      )}
    </Link>
  );
}
