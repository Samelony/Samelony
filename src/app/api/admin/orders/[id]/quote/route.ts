import { NextRequest, NextResponse } from "next/server";
import { setOrderQuote } from "@/lib/orders";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const {
    manufacturingCost,
    materialsCost,
    laborCost,
    deliveryCost,
    margin,
    estimatedProductionDays,
    depositAmount,
    notes,
  } = body ?? {};

  const numbers = {
    manufacturingCost,
    materialsCost,
    laborCost,
    deliveryCost,
    margin,
    estimatedProductionDays,
    depositAmount,
  };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      return NextResponse.json(
        { error: `${key} must be a non-negative number` },
        { status: 400 }
      );
    }
  }

  try {
    const order = await setOrderQuote(id, {
      manufacturingCost,
      materialsCost,
      laborCost,
      deliveryCost,
      margin,
      estimatedProductionDays,
      depositAmount,
      notes,
    });
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save quote" },
      { status: 400 }
    );
  }
}
