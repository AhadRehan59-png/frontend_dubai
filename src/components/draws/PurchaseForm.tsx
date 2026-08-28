"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, CreditCard } from "lucide-react";

interface PurchaseFormProps {
  drawId: string;
  tokenPrice: number;
  maxTokens: number;
  title: string;
}

export default function PurchaseForm({
  drawId,
  tokenPrice,
  maxTokens,
  title,
}: PurchaseFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = tokenPrice * quantity;

  const handlePayWithStripe = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ drawId, quantity }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/login?redirect=/draw/${drawId}`);
          return;
        }
        throw new Error(
          (data && typeof data === "object" && "error" in data
            ? String(data.error)
            : null) || "Failed to start Stripe Checkout"
        );
      }

      if (!data?.checkoutUrl) {
        throw new Error("Stripe Checkout URL missing from server response");
      }

      // Redirect to Stripe-hosted Checkout (card details never touch our site)
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-[#111] p-6">
      <div className="mb-4 text-center">
        <span className="text-2xl font-bold text-pink">{formatCurrency(tokenPrice)}</span>
        <span className="text-sm text-muted"> per token</span>
      </div>

      <div className="mb-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-white hover:border-pink"
          disabled={quantity <= 1 || loading}
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="w-12 text-center text-2xl font-bold">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(Math.min(maxTokens, quantity + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-white hover:border-pink"
          disabled={quantity >= maxTokens || loading}
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mb-6 text-center text-sm text-muted">
        Total: <span className="font-bold text-white">{formatCurrency(total)}</span>
        {" · "}
        {maxTokens} tokens remaining
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red/10 p-3 text-center text-sm text-red">{error}</div>
      )}

      <button
        type="button"
        onClick={handlePayWithStripe}
        disabled={maxTokens === 0 || loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-blue py-4 text-sm font-black text-white transition hover:bg-blue/80 disabled:opacity-50"
      >
        <CreditCard size={18} />
        {loading ? "REDIRECTING TO STRIPE..." : "PAY WITH STRIPE"}
      </button>

      <p className="mt-3 text-center text-xs text-muted">
        Secure card payment via Stripe Checkout · Entering: {title}
      </p>
    </div>
  );
}
