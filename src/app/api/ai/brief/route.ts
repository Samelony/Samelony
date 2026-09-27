import { NextRequest, NextResponse } from "next/server";
import { generateDesignBrief, isAiConfigured } from "@/lib/ai";

export async function POST(req: NextRequest) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI assist is not configured on this deployment yet." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const { description, category, dimensions, material, budget } = body ?? {};

  if (!description || typeof description !== "string") {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 }
    );
  }

  try {
    const brief = await generateDesignBrief({
      description,
      category,
      dimensions,
      material,
      budget,
    });
    return NextResponse.json({ brief });
  } catch (err) {
    console.error("AI brief generation failed", err);
    return NextResponse.json(
      { error: "Failed to generate a design brief. Try again in a moment." },
      { status: 502 }
    );
  }
}
