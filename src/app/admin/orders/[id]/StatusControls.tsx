"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  OrderStatus,
} from "@/lib/orderStatus";

export default function StatusControls({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: OrderStatus) {
    setSaving(next);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUS_FLOW.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            disabled={saving !== null || s === status}
            className={`rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-100 ${
              s === status
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {saving === s ? "Saving..." : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
