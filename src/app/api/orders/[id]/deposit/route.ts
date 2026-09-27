import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrder, markDepositPaid } from "@/lib/orders";

function getBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (!order.quote) {
    return NextResponse.json({ error: "No quote on this order yet" }, { status: 400 });
  }
  if (order.quote.depositPaid) {
    return NextResponse.json({ error: "Deposit already paid" }, { status: 400 });
  }
  if (order.status !== "approved" && order.status !== "manufacturing") {
    return NextResponse.json(
      { error: "Approve the quote before paying the deposit." },
      { status: 400 }
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const baseUrl = getBaseUrl(req);

  if (!stripeKey) {
    // Demo mode: no payment processor configured, so we simulate a
    // successful deposit. Wire up STRIPE_SECRET_KEY to take real payments.
    const updated = await markDepositPaid(id);
    return NextResponse.json({ order: updated, demoMode: true });
  }

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(order.quote.depositAmount * 100),
          product_data: {
            name: `Deposit — ${order.furnitureType} (order ${order.id.slice(0, 8)})`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${baseUrl}/orders/${order.id}?deposit=success`,
    cancel_url: `${baseUrl}/orders/${order.id}?deposit=cancelled`,
  });

  return NextResponse.json({ checkoutUrl: session.url });
}
