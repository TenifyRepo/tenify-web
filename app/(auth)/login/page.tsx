import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-10 w-full max-w-sm">
        <Logo variant="full" className="mx-auto justify-center" priority />
      </div>
      <Card className="w-full max-w-sm border-border/80 shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to manage your properties. Supabase Auth will be connected
            in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" disabled>
            Continue with email
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            For now, use{" "}
            <code className="rounded bg-muted px-1 py-0.5">DEV_LANDLORD_ID</code>{" "}
            in <code className="rounded bg-muted px-1 py-0.5">.env.local</code>{" "}
            for local development.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Continue to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
