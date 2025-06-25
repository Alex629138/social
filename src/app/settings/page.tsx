"use client";

import { Construction, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnderConstruction() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-br from-muted/40 to-background">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Construction className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Page Under Construction</h1>
          <p className="text-muted-foreground">
            We&#39;re still building this page. Check back soon!
          </p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/">
            <Button variant="default" className="flex items-center gap-2">
              Go Home
            </Button>
          </Link>
          <Button variant="outline" disabled className="gap-2">
            <Clock className="h-4 w-4" />
            Coming Soon
          </Button>
        </div>
      </div>
    </main>
  );
}
