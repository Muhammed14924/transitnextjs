import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const shipmentId = parseInt(id);

    const documents = await prisma.shipment_documents.findMany({
      where: { shipment_id: shipmentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const shipmentId = parseInt(id);
    const body = await req.json();

    const { document_type, document_number, file_url, file_name } = body;

    const document = await prisma.shipment_documents.create({
      data: {
        shipment_id: shipmentId,
        document_type,
        document_number,
        file_url,
        file_name,
      },
    });

    // --- Webhook Trigger to n8n ---
    try {
      const webhookUrl =
        "https://n8n.bifasyria.com/webhook-test/process-shipment-doc";

      const payload = {
        documentId: document.id,
        shipmentId: document.shipment_id,
        documentType: document.document_type,
        fileUrl: document.file_url,
        fileName: document.file_name,
      };

      // Fire and forget (don't await strictly, or do await but catch specifically)
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(
        `Webhook triggered successfully for document: ${document.id}`,
      );
    } catch (webhookError) {
      // Do not crash the app if n8n is down, just log the error
      console.error("n8n Webhook failed:", webhookError);
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document record:", error);
    return NextResponse.json(
      { error: "Failed to create document record" },
      { status: 500 },
    );
  }
}
