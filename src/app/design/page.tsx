"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { DesignBrief } from "@/lib/orders";

const FURNITURE_TYPES = [
  "Sofa / sectional",
  "Dining table",
  "Coffee table",
  "Bed frame",
  "Cabinet / storage",
  "Chair",
  "Desk",
  "Outdoor furniture",
  "Other",
];

export default function DesignPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [furnitureType, setFurnitureType] = useState(FURNITURE_TYPES[0]);
  const [dimensions, setDimensions] = useState("");
  const [materials, setMaterials] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [brief, setBrief] = useState<DesignBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handlePreviewBrief() {
    if (!description.trim()) {
      setBriefError("Add a description first.");
      return;
    }
    setBriefLoading(true);
    setBriefError(null);
    try {
      const res = await fetch("/api/ai/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description,
          category: furnitureType,
          dimensions,
          material: materials,
          budget,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setBrief(data.brief);
    } catch (err) {
      setBriefError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBriefLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.set("customerName", customerName);
    formData.set("customerEmail", customerEmail);
    formData.set("furnitureType", furnitureType);
    formData.set("dimensions", dimensions);
    formData.set("materials", materials);
    formData.set("budget", budget);
    formData.set("description", description);
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/orders", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/orders/${data.order.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Submit your furniture idea
      </h1>
      <p className="mt-2 text-neutral-600">
        The more detail you give us, the better the quote. You can also send
        rough sketches, photos, or inspiration images.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Your name">
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Furniture type">
          <select
            value={furnitureType}
            onChange={(e) => setFurnitureType(e.target.value)}
            className="input"
          >
            {FURNITURE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Dimensions (optional)" hint="e.g. 84in W x 36in D x 32in H">
            <input
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Materials / finish (optional)" hint="e.g. walnut, boucle fabric">
            <input
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Budget (optional)" hint="e.g. $1,500–$2,000">
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Describe what you want">
          <textarea
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="A low-slung, curved sofa in a warm boucle fabric, seats 3, walnut legs..."
          />
        </Field>

        <Field
          label="Sketches, photos, or inspiration images (optional)"
          hint="Images or PDFs, up to 15MB each"
        >
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm"
          />
        </Field>

        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">AI design brief (optional preview)</h3>
            <button
              type="button"
              onClick={handlePreviewBrief}
              disabled={briefLoading}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 disabled:opacity-50"
            >
              {briefLoading ? "Thinking..." : "Preview AI brief"}
            </button>
          </div>
          {briefError && <p className="mt-2 text-sm text-red-600">{briefError}</p>}
          {brief && (
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Summary" value={brief.summary} />
              <Row label="Category" value={brief.category} />
              <Row label="Style" value={brief.style} />
              <Row label="Materials" value={brief.suggestedMaterials.join(", ")} />
              <Row label="Est. dimensions" value={brief.estimatedDimensions} />
              <Row label="Complexity" value={brief.complexity} />
              {brief.clarifyingQuestions.length > 0 && (
                <Row
                  label="We'll likely ask"
                  value={brief.clarifyingQuestions.join(" • ")}
                />
              )}
            </dl>
          )}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit design request"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="ml-2 text-xs text-neutral-400">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 font-medium text-neutral-500">{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </div>
  );
}
