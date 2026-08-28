"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";

function CancelContent() {
  const searchParams = useSearchParams();
  const drawId = searchParams.get("drawId");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border/30 bg-card p-8 text-center">
        <XCircle className="mx-auto mb-4 text-yellow" size={48} />
        <h1 className="mb-2 text-2xl font-black text-white">Payment Cancelled</h1>
        <p className="mb-6 text-sm text-muted">
          You cancelled Stripe Checkout. No charge was made and no tickets were issued.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {drawId ? (
            <Link
              href={`/draw/${drawId}`}
              className="flex-1 rounded-full bg-blue py-3 text-center font-bold text-white hover:bg-blue/80"
            >
              TRY AGAIN
            </Link>
          ) : (
            <Link
              href="/"
              className="flex-1 rounded-full bg-blue py-3 text-center font-bold text-white hover:bg-blue/80"
            >
              BROWSE DRAWS
            </Link>
          )}
          <Link
            href="/dashboard/tickets"
            className="flex-1 rounded-full border border-border py-3 text-center font-bold text-white hover:border-white/40"
          >
            MY TICKETS
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-muted">
          Loading...
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
