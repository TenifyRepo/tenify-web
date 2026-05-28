import { ArrowRight, Building2, FileText, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Building2,
    title: "Properties & units",
    description: "Add buildings and units in seconds. No spreadsheets.",
  },
  {
    icon: Users,
    title: "Tenants",
    description: "Keep tenant details in one place, ready when you need them.",
  },
  {
    icon: FileText,
    title: "Leases & documents",
    description: "Track leases today. Invoices and payments coming soon.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo variant="icon" priority />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/dashboard" />}>
              Open app
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="mb-10 w-full">
              <Image
                src="/tenify-logo.png"
                alt="Tenify — Simplify Renting. Streamline Living."
                width={1024}
                height={384}
                priority
                className="mx-auto h-auto w-full max-w-md object-contain sm:max-w-xl"
              />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight">
              Manage rentals without the admin headache
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Tenify helps landlords and property managers track properties,
              tenants, and leases — with a calm, minimal interface anyone can
              use.
            </p>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/properties/new" />}>
                Add your first property
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-card"
                render={<Link href="/dashboard" />}
              >
                Go to dashboard
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <feature.icon className="mb-3 size-5 text-foreground" />
                <h3 className="font-medium">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo variant="icon" href="/" />
          <p>© {new Date().getFullYear()} Tenify. Built for landlords.</p>
        </div>
      </footer>
    </div>
  );
}
