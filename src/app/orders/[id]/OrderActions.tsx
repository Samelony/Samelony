"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/orders";

export default function OrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(decision: "approved" | "changes_requested") {
    setLoading(decision);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function payDeposit() {
    setLoading("deposit");
    setError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/deposit`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  const canRespond = order.status === "quoted" || order.status === "changes_requested";
  const canPayDeposit =
    (order.status === "approved" || order.status === "manufacturing") &&
    order.quote &&
    !order.quote.depositPaid;

  if (!canRespond && !canPayDeposit) return null;

  return (
    <div className="rounded-lg border border-neutral-200 p-6">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {canRespond && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Notes for us (optional if approving)
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="input mt-1"
              placeholder="Could we get it 4 inches shorter?"
            />
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => respond("approved")}
              disabled={loading !== null}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {loading === "approved" ? "Approving..." : "Approve quote"}
            </button>
            <button
              onClick={() => respond("changes_requested")}
              disabled={loading !== null}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              {loading === "changes_requested" ? "Sending..." : "Request changes"}
            </button>
          </div>
        </div>
      )}

      {canPayDeposit && (
        <div className={canRespond ? "mt-6 border-t border-neutral-200 pt-6" : ""}>
          <p className="text-sm text-neutral-600">
            Pay your deposit of{" "}
            <strong>${order.quote!.depositAmount.toFixed(2)}</strong> to start
            production.
          </p>
          <button
            onClick={payDeposit}
            disabled={loading !== null}
            className="mt-3 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading === "deposit" ? "Redirecting..." : "Pay deposit"}
          </button>
        </div>
      )}
    </div>
  );
}
