"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ProductionUpdateForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("note", note);
      photos.forEach((p) => formData.append("photos", p));
      const res = await fetch(`/api/admin/orders/${orderId}/production-update`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to post update");
      setNote("");
      setPhotos([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Frame is cut, moving to upholstery next week."
        className="input"
      />
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
        className="block w-full text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
      >
        {saving ? "Posting..." : "Post update"}
      </button>
    </form>
  );
}
