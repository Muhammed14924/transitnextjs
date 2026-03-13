import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const shipmentId = parseInt(id);

    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const shipment = await prisma.transit_shipments.findUnique({
      where: { id: shipmentId },
      include: {
        sender_company: true,
        loading_port: true,
        discharge_port: true,
        carrier: true,
        documents: true,
        containers: true
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error("Shipment Detail API GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const shipmentId = parseInt(id);
    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // 1. Fetch current state for syncing
    const shipment = await prisma.transit_shipments.findUnique({
      where: { id: shipmentId },
      include: { documents: true }
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // 2. Delete existing containers (if we want to replace them all for simplicity)
    await prisma.shipment_containers.deleteMany({
      where: { shipment_id: shipmentId }
    });

    // 2. Sync Documents
    const incomingDocs = (body.documents || []) as Array<{ dbId?: number; document_type: string; document_number?: string; file_url: string; file_name: string }>;
    const currentDocs = shipment.documents || [];
    const currentDocIds = currentDocs.map(d => d.id);
    const incomingDocIds = incomingDocs
      .filter(d => d.dbId)
      .map(d => d.dbId as number);

    // Find documents to delete (in DB but not in incoming)
    const toDeleteIds = currentDocIds.filter(id => !incomingDocIds.includes(id));
    const toDeleteDocs = currentDocs.filter(d => toDeleteIds.includes(d.id));

    // Delete removed documents from DB and S3
    if (toDeleteIds.length > 0) {
      await prisma.shipment_documents.deleteMany({
        where: { id: { in: toDeleteIds } }
      });

      const bucketName = process.env.S3_BUCKET_NAME!;
      for (const doc of toDeleteDocs) {
        try {
          const parts = doc.file_url.split(`${bucketName}/`);
          const key = parts[parts.length - 1];
          if (key) {
            const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
            await s3Client.send(command).catch(e => console.error("S3 Cleanup failed:", e));
          }
        } catch (e) {
          console.error("Doc cleanup loop error:", e);
        }
      }
    }

    const updated = await prisma.transit_shipments.update({
      where: { id: shipmentId },
      data: {
        bl_number: body.bl_number || undefined,
        carrier: body.shipping_company ? { connect: { id: parseInt(body.shipping_company) } } : undefined,
        sender_company: body.sender_company_id ? { connect: { id: parseInt(body.sender_company_id) } } : undefined,
        loading_port: body.port_of_loading ? { connect: { id: parseInt(body.port_of_loading) } } : undefined,
        discharge_port: body.port_of_discharge ? { connect: { id: parseInt(body.port_of_discharge) } } : undefined,
        arrival_date: body.arrival_date ? new Date(body.arrival_date) : null,
        expected_discharge_date: body.expected_discharge_date ? new Date(body.expected_discharge_date) : null,
        free_time_days: (body.free_time_days !== undefined && body.free_time_days !== null)
          ? parseInt(body.free_time_days) 
          : 14,
        status: body.status || undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        containers: body.containers && body.containers.length > 0 ? {
          create: body.containers.map((c: { container_number: string; container_type?: string; weight?: string; empty_return_date?: string; customs_declaration_number?: string; item_count?: string; notes?: string }) => ({
            container_number: c.container_number,
            container_type: c.container_type || null,
            weight: c.weight ? parseFloat(c.weight) : null,
            empty_return_date: c.empty_return_date ? new Date(c.empty_return_date) : null,
            customs_declaration_number: c.customs_declaration_number || null,
            item_count: c.item_count ? parseInt(c.item_count) : null,
            notes: c.notes || null,
          }))
        } : undefined,
        documents: incomingDocs.length > 0 ? {
          create: incomingDocs
            .filter(d => !d.dbId) // Only create new ones (those without dbId)
            .map(d => ({
              document_type: d.document_type,
              document_number: d.document_number || null,
              file_url: d.file_url,
              file_name: d.file_name,
            }))
        } : undefined,
      },
      include: {
        containers: true,
        documents: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Shipment Detail API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating shipment: " + (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const shipmentId = parseInt(id);
    if (isNaN(shipmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 1. Fetch shipment with documents for S3 cleanup
    const shipment = await prisma.transit_shipments.findUnique({
      where: { id: shipmentId },
      include: { documents: true }
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "الشحنة غير موجودة أو تم حذفها مسبقاً" },
        { status: 404 },
      );
    }

    // 2. Delete from DB (will cascade delete documents)
    await prisma.transit_shipments.delete({
      where: { id: shipmentId },
    });

    // 3. Cleanup S3
    const bucketName = process.env.S3_BUCKET_NAME!;
    for (const doc of shipment.documents) {
      try {
        const parts = doc.file_url.split(`${bucketName}/`);
        const key = parts[parts.length - 1];
        if (key) {
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          await s3Client.send(command).catch(e => console.error(`S3 Delete failed for ${key}:`, e));
        }
      } catch (s3Err) {
        console.error("Error processing S3 cleanup for document:", s3Err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Shipment Detail API DELETE error:", error);
    return NextResponse.json(
      { error: `Error deleting shipment: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
