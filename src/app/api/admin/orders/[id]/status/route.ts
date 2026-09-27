import { NextRequest, NextResponse } from "next/server";
import { ORDER_STATUS_LABELS, OrderStatus, setOrderStatus } from "@/lib/orders";

const VALID_STATUSES = new Set(Object.keys(ORDER_STATUS_LABELS));

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const order = await setOrderStatus(id, status as OrderStatus);
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update status" },
      { status: 400 }
    );
  }
}
