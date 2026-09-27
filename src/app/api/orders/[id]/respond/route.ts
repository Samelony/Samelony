import { NextRequest, NextResponse } from "next/server";
import { addCustomerResponse, getOrder } from "@/lib/orders";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "quoted" && order.status !== "changes_requested") {
    return NextResponse.json(
      { error: "This order does not have a pending quote to respond to." },
      { status: 400 }
    );
  }

  const { decision, message } = await req.json();
  if (decision !== "approved" && decision !== "changes_requested") {
    return NextResponse.json(
      { error: "decision must be 'approved' or 'changes_requested'" },
      { status: 400 }
    );
  }

  const updated = await addCustomerResponse(id, { decision, message });
  return NextResponse.json({ order: updated });
}
