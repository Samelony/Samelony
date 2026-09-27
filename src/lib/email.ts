import type { Order } from "./orders";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export async function sendNewOrderNotification(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const orderUrl = baseUrl ? `${baseUrl}/admin/orders/${order.id}` : `/admin/orders/${order.id}`;

  const rows: [string, string][] = [
    ["Customer", `${order.customerName} <${order.customerEmail}>`],
    ["Furniture type", order.furnitureType],
    ["Dimensions", order.dimensions || "—"],
    ["Materials", order.materials || "—"],
    ["Budget", order.budget || "—"],
    ["Description", order.description],
  ];
  if (order.referenceFileUrls.length > 0) {
    rows.push(["Reference files", `${order.referenceFileUrls.length} attached`]);
  }
  if (order.aiBrief) {
    rows.push(["AI summary", order.aiBrief.summary]);
    rows.push(["AI style", order.aiBrief.style]);
  }

  const html = `
    <h2>New design request from ${escapeHtml(order.customerName)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color:#666;vertical-align:top"><strong>${escapeHtml(
              label
            )}</strong></td><td>${escapeHtml(value)}</td></tr>`
        )
        .join("")}
    </table>
    <p><a href="${orderUrl}">Open in admin dashboard</a></p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: order.customerEmail,
      subject: `New design request: ${order.furnitureType} from ${order.customerName}`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error (${res.status}): ${text}`);
  }
}
