import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { saveUploadedFiles } from "@/lib/uploads";
import { generateDesignBrief, isAiConfigured } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim();
  const furnitureType = String(formData.get("furnitureType") ?? "").trim();
  const dimensions = String(formData.get("dimensions") ?? "").trim();
  const materials = String(formData.get("materials") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!customerName || !customerEmail || !description || !furnitureType) {
    return NextResponse.json(
      {
        error:
          "customerName, customerEmail, furnitureType, and description are required",
      },
      { status: 400 }
    );
  }

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  // Save uploads under a temporary id, then let createOrder assign the real
  // order id (kept simple: we generate the id up front and reuse it).
  const orderId = randomUUID();

  let referenceFileUrls: string[] = [];
  try {
    referenceFileUrls = await saveUploadedFiles(orderId, files);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "File upload failed" },
      { status: 400 }
    );
  }

  let aiBrief;
  if (isAiConfigured()) {
    try {
      aiBrief = await generateDesignBrief({
        description,
        category: furnitureType,
        dimensions,
        material: materials,
        budget,
      });
    } catch (err) {
      console.error("AI brief generation failed", err);
    }
  }

  const order = await createOrder(
    {
      customerName,
      customerEmail,
      furnitureType,
      dimensions,
      materials,
      budget,
      description,
      referenceFileUrls,
      aiBrief,
    },
    orderId
  );

  return NextResponse.json({ order }, { status: 201 });
}
