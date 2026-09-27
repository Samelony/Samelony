import { notFound } from "next/navigation";
import { getOrder, ORDER_STATUS_LABELS } from "@/lib/orders";
import QuoteForm from "./QuoteForm";
import StatusControls from "./StatusControls";
import ProductionUpdateForm from "./ProductionUpdateForm";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {order.customerName}
        </h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>
      <p className="text-sm text-neutral-500">{order.customerEmail}</p>

      <section className="mt-6 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-sm font-medium text-neutral-500">Status</h2>
        <div className="mt-3">
          <StatusControls orderId={order.id} status={order.status} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-sm font-medium text-neutral-500">Request details</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Furniture type" value={order.furnitureType} />
          {order.dimensions && <Row label="Dimensions" value={order.dimensions} />}
          {order.materials && <Row label="Materials" value={order.materials} />}
          {order.budget && <Row label="Budget" value={order.budget} />}
          <Row label="Description" value={order.description} />
        </dl>
        {order.referenceFileUrls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-medium text-neutral-500">Reference files</h3>
            <FileGrid urls={order.referenceFileUrls} />
          </div>
        )}
      </section>

      {order.aiBrief && (
        <section className="mt-6 rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500">AI design brief</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Summary" value={order.aiBrief.summary} />
            <Row label="Category" value={order.aiBrief.category} />
            <Row label="Style" value={order.aiBrief.style} />
            <Row label="Materials" value={order.aiBrief.suggestedMaterials.join(", ")} />
            <Row label="Est. dimensions" value={order.aiBrief.estimatedDimensions} />
            <Row label="Complexity" value={order.aiBrief.complexity} />
            {order.aiBrief.clarifyingQuestions.length > 0 && (
              <Row
                label="Ask customer"
                value={order.aiBrief.clarifyingQuestions.join(" • ")}
              />
            )}
          </dl>
        </section>
      )}

      {order.customerResponses.length > 0 && (
        <section className="mt-6 rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500">Customer responses</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.customerResponses.map((r, i) => (
              <li key={i}>
                <span className="font-medium">
                  {r.decision === "approved" ? "Approved" : "Requested changes"}
                </span>
                {r.message && <span className="text-neutral-600"> — {r.message}</span>}
                <span className="ml-2 text-xs text-neutral-400">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-sm font-medium text-neutral-500">
          {order.quote ? "Quote" : "Create a quote"}
        </h2>
        <div className="mt-3">
          <QuoteForm orderId={order.id} quote={order.quote} />
        </div>
        {order.quote && (
          <p className="mt-3 text-xs text-neutral-500">
            Deposit {order.quote.depositPaid ? "paid" : "not yet paid"}.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-sm font-medium text-neutral-500">Production updates</h2>
        {order.productionUpdates.length > 0 && (
          <ul className="mt-3 space-y-4">
            {order.productionUpdates.map((update) => (
              <li key={update.id} className="text-sm">
                <div className="text-xs text-neutral-400">
                  {new Date(update.createdAt).toLocaleString()}
                </div>
                {update.note && <p className="mt-1">{update.note}</p>}
                {update.photoUrls.length > 0 && <FileGrid urls={update.photoUrls} />}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <ProductionUpdateForm orderId={order.id} />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-40 shrink-0 font-medium text-neutral-500">{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </div>
  );
}

function FileGrid({ urls }: { urls: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block h-20 w-20 overflow-hidden rounded-md border border-neutral-200"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </a>
      ))}
    </div>
  );
}
