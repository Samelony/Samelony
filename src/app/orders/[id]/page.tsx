import { notFound } from "next/navigation";
import { getOrder, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/orders";
import OrderActions from "./OrderActions";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const currentStepIndex = ORDER_STATUS_FLOW.indexOf(
    order.status === "changes_requested" ? "quoted" : order.status
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Order {order.id.slice(0, 8)}
        </h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <ol className="mt-6 flex flex-wrap gap-2 text-xs">
        {ORDER_STATUS_FLOW.map((status, i) => (
          <li
            key={status}
            className={`rounded-full px-3 py-1 ${
              i <= currentStepIndex
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {ORDER_STATUS_LABELS[status]}
          </li>
        ))}
      </ol>

      {order.status === "changes_requested" && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          We received your requested changes and will follow up with an
          updated quote.
        </p>
      )}

      <section className="mt-8 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-sm font-medium text-neutral-500">Your request</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Furniture type" value={order.furnitureType} />
          {order.dimensions && <Row label="Dimensions" value={order.dimensions} />}
          {order.materials && <Row label="Materials" value={order.materials} />}
          {order.budget && <Row label="Budget" value={order.budget} />}
          <Row label="Description" value={order.description} />
        </dl>
        {order.referenceFileUrls.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-medium text-neutral-500">
              Reference files
            </h3>
            <FileGrid urls={order.referenceFileUrls} />
          </div>
        )}
      </section>

      {order.aiBrief && (
        <section className="mt-6 rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500">
            AI design brief
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Summary" value={order.aiBrief.summary} />
            <Row label="Style" value={order.aiBrief.style} />
            <Row
              label="Materials"
              value={order.aiBrief.suggestedMaterials.join(", ")}
            />
          </dl>
        </section>
      )}

      {order.quote && (
        <section className="mt-6 rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500">Quote</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Manufacturing" value={`$${order.quote.manufacturingCost.toFixed(2)}`} />
            <Row label="Materials" value={`$${order.quote.materialsCost.toFixed(2)}`} />
            <Row label="Labor" value={`$${order.quote.laborCost.toFixed(2)}`} />
            <Row label="Delivery" value={`$${order.quote.deliveryCost.toFixed(2)}`} />
            <Row
              label="Total"
              value={`$${order.quote.total.toFixed(2)}`}
            />
            <Row
              label="Est. production time"
              value={`${order.quote.estimatedProductionDays} days`}
            />
            <Row
              label="Deposit"
              value={`$${order.quote.depositAmount.toFixed(2)} ${
                order.quote.depositPaid ? "(paid)" : "(due)"
              }`}
            />
            {order.quote.notes && <Row label="Notes" value={order.quote.notes} />}
          </dl>
        </section>
      )}

      <div className="mt-6">
        <OrderActions order={order} />
      </div>

      {order.productionUpdates.length > 0 && (
        <section className="mt-6 rounded-lg border border-neutral-200 p-6">
          <h2 className="text-sm font-medium text-neutral-500">
            Production updates
          </h2>
          <ul className="mt-3 space-y-4">
            {order.productionUpdates.map((update) => (
              <li key={update.id} className="text-sm">
                <div className="text-xs text-neutral-400">
                  {new Date(update.createdAt).toLocaleString()}
                </div>
                {update.note && <p className="mt-1">{update.note}</p>}
                {update.photoUrls.length > 0 && (
                  <FileGrid urls={update.photoUrls} />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
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
