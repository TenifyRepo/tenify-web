import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Wordmark — header / nav */
const HEADER_LOGO_SRC = "/tenify-header.png";
const HEADER_LOGO_WIDTH = 1024;
const HEADER_LOGO_HEIGHT = 222;

/** Full wordmark + tagline — landing hero */
const FULL_LOGO_SRC = "/tenify-logo.png";

type LogoProps = {
  className?: string;
  href?: string;
  /** Wordmark for nav chrome; full wordmark + tagline for hero/marketing */
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
      className={cn("inline-flex shrink-0 items-center bg-transparent", className)}
    >
      {variant === "icon" ? (
        <Image
          src={HEADER_LOGO_SRC}
          alt="Tenify"
          width={HEADER_LOGO_WIDTH}
          height={HEADER_LOGO_HEIGHT}
          priority={priority}
          unoptimized
          className="h-11 w-auto max-w-[9.5rem] object-contain object-left sm:h-14 sm:max-w-[11rem]"
        />
      ) : (
        <Image
          src={FULL_LOGO_SRC}
          alt="Tenify — Simplify Renting. Streamline Living."
          width={1024}
          height={384}
          priority={priority}
          unoptimized
          className="h-auto w-full max-w-[min(100%,28rem)] object-contain sm:max-w-lg"
        />
      )}
    </Link>
  );
}
