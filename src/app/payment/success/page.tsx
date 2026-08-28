"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your Stripe payment...");
  const [tokenNumbers, setTokenNumbers] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing Stripe session ID. If you paid, check My Tickets.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          { credentials: "include", cache: "no-store" }
        );
        const data = await res.json().catch(() => null);

        if (cancelled) return;

        if (res.status === 401) {
          router.replace(
            `/auth/login?redirect=${encodeURIComponent(`/payment/success?session_id=${sessionId}`)}`
          );
          return;
        }

        if (!res.ok) {
          setStatus("error");
          setMessage(
            (data && typeof data === "object" && "error" in data
              ? String(data.error)
              : null) || "Payment could not be verified yet."
          );
          return;
        }

        setTokenNumbers(Array.isArray(data.tokenNumbers) ? data.tokenNumbers : []);
        setMessage(data.message || "Payment successful! Your tickets have been issued.");
        setStatus("success");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Could not verify payment. Please check My Tickets or try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border/30 bg-card p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-blue" size={48} />
            <h1 className="mb-2 text-2xl font-black text-white">Confirming payment</h1>
            <p className="text-sm text-muted">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-green-400" size={48} />
            <h1 className="mb-2 text-2xl font-black text-white">Payment Successful</h1>
            <p className="mb-6 text-sm text-muted">{message}</p>
            {tokenNumbers.length > 0 && (
              <div className="mb-6 space-y-2">
                {tokenNumbers.map((num) => (
                  <div
                    key={num}
                    className="rounded-xl bg-black px-4 py-2 font-mono text-pink"
                  >
                    {num}
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/tickets"
              className="inline-flex w-full items-center justify-center rounded-full bg-blue py-3 font-bold text-white hover:bg-blue/80"
            >
              VIEW MY TICKETS
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto mb-4 text-red" size={48} />
            <h1 className="mb-2 text-2xl font-black text-white">Verification issue</h1>
            <p className="mb-6 text-sm text-muted">{message}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/tickets"
                className="flex-1 rounded-full bg-blue py-3 text-center font-bold text-white hover:bg-blue/80"
              >
                CHECK TICKETS
              </Link>
              <Link
                href="/"
                className="flex-1 rounded-full border border-border py-3 text-center font-bold text-white hover:border-white/40"
              >
                HOME
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-muted">
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
