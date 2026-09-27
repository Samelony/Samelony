"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Quote } from "@/lib/orders";

const FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "manufacturingCost", label: "Manufacturing cost ($)" },
  { key: "materialsCost", label: "Materials cost ($)" },
  { key: "laborCost", label: "Labor cost ($)" },
  { key: "deliveryCost", label: "Delivery cost ($)" },
  { key: "margin", label: "Margin ($)" },
  { key: "estimatedProductionDays", label: "Est. production time (days)" },
  { key: "depositAmount", label: "Deposit amount ($)" },
];

type FormState = {
  manufacturingCost: string;
  materialsCost: string;
  laborCost: string;
  deliveryCost: string;
  margin: string;
  estimatedProductionDays: string;
  depositAmount: string;
  notes: string;
};

function toFormState(quote?: Quote): FormState {
  return {
    manufacturingCost: quote ? String(quote.manufacturingCost) : "",
    materialsCost: quote ? String(quote.materialsCost) : "",
    laborCost: quote ? String(quote.laborCost) : "",
    deliveryCost: quote ? String(quote.deliveryCost) : "",
    margin: quote ? String(quote.margin) : "",
    estimatedProductionDays: quote ? String(quote.estimatedProductionDays) : "",
    depositAmount: quote ? String(quote.depositAmount) : "",
    notes: quote?.notes ?? "",
  };
}

export default function QuoteForm({
  orderId,
  quote,
}: {
  orderId: string;
  quote?: Quote;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(quote));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const numericValues = FIELDS.reduce((acc, { key }) => {
    acc[key] = Number(form[key]);
    return acc;
  }, {} as Record<string, number>);
  const total =
    (numericValues.manufacturingCost || 0) +
    (numericValues.materialsCost || 0) +
    (numericValues.laborCost || 0) +
    (numericValues.deliveryCost || 0) +
    (numericValues.margin || 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/quote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...numericValues, notes: form.notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save quote");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quote");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="block text-sm">
            <span className="font-medium">{label}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="input mt-1"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        <span className="font-medium">Notes (optional)</span>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="input mt-1"
        />
      </label>
      <p className="text-sm text-neutral-600">
        Total: <strong>${total.toFixed(2)}</strong>
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : quote ? "Update quote" : "Send quote"}
      </button>
    </form>
  );
}
