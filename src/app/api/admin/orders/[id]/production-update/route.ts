import { NextRequest, NextResponse } from "next/server";
import { addProductionUpdate, getOrder } from "@/lib/orders";
import { saveUploadedFiles } from "@/lib/uploads";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const note = String(formData.get("note") ?? "").trim();
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!note && files.length === 0) {
    return NextResponse.json(
      { error: "Add a note or at least one photo" },
      { status: 400 }
    );
  }

  let photoUrls: string[] = [];
  try {
    photoUrls = await saveUploadedFiles(id, files);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Photo upload failed" },
      { status: 400 }
    );
  }

  const updated = await addProductionUpdate(id, { note, photoUrls });
  return NextResponse.json({ order: updated });
}
