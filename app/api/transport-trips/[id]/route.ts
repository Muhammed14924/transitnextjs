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
    const trip = await prisma.transport_trips.findUnique({
      where: { id: parseInt(id) },
      include: {
        gate: {
          select: { id: true, gate_name: true, gate_code: true, location: true },
        },
        transport_company: {
          select: { id: true, trans_name: true, phone: true },
        },
        waybills: {
          include: {
            sender_company: {
              select: { id: true, company_name: true, company_code: true },
            },
            trader: {
              select: { id: true, trader_name: true, trader_code: true },
            },
            destination: {
              select: { id: true, destination_name: true, destination_type: true },
            },
            container: {
              select: { id: true, container_number: true, container_type: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        documents: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Transport Trip API GET error:", error);
    return NextResponse.json(
      { error: "Error fetching transport trip" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    const {
      trip_number,
      loading_date,
      driver_name,
      driver_phone,
      plate_front,
      plate_back,
      gate_id,
      transport_company_id,
      sort_num,
      discharge_date,
      truck_fare,
      notes,
      status,
      isActive,
    } = body;

    // Recalculate allocated_fare for all waybills if truck_fare changed
    if (truck_fare !== undefined) {
      const tripId = parseInt(id);
      const trip = await prisma.transport_trips.findUnique({
        where: { id: tripId },
        include: {
          waybills: true,
        },
      });

      if (trip && trip.waybills.length > 0) {
        const totalWeight = trip.waybills.reduce(
          (sum, w) => sum + (Number(w.weight) || 0),
          0,
        );

        if (totalWeight > 0) {
          const newTruckFare = parseFloat(truck_fare);
          
          // Update each waybill's allocated_fare proportionally
          for (const waybill of trip.waybills) {
            const weightRatio = (Number(waybill.weight) || 0) / totalWeight;
            const allocatedFare = newTruckFare * weightRatio;
            
            await prisma.trip_waybills.update({
              where: { id: waybill.id },
              data: { allocated_fare: allocatedFare },
            });
          }
        }
      }
    }

    const trip = await prisma.transport_trips.update({
      where: { id: parseInt(id) },
      data: {
        ...(trip_number !== undefined && { trip_number }),
        ...(loading_date !== undefined && { loading_date: loading_date ? new Date(loading_date) : null }),
        ...(driver_name !== undefined && { driver_name }),
        ...(driver_phone !== undefined && { driver_phone }),
        ...(plate_front !== undefined && { plate_front }),
        ...(plate_back !== undefined && { plate_back }),
        ...(gate_id !== undefined && { gate_id: gate_id ? parseInt(gate_id) : null }),
        ...(transport_company_id !== undefined && { transport_company_id: transport_company_id ? parseInt(transport_company_id) : null }),
        ...(sort_num !== undefined && { sort_num: sort_num ? parseInt(sort_num) : null }),
        ...(discharge_date !== undefined && { discharge_date: discharge_date ? new Date(discharge_date) : null }),
        ...(truck_fare !== undefined && { truck_fare: truck_fare ? parseFloat(truck_fare) : null }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        gate: {
          select: { id: true, gate_name: true },
        },
        transport_company: {
          select: { id: true, trans_name: true },
        },
        waybills: true,
      },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Transport Trip API PATCH error:", error);
    return NextResponse.json(
      { error: "Error updating transport trip" },
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
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tripId = parseInt(id);

    // 1. Fetch trip and its documents for S3 cleanup
    const trip = await prisma.transport_trips.findUnique({
      where: { id: tripId },
      include: {
        documents: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // 2. Perform S3 cleanup for all associated documents
    const bucketName = process.env.S3_BUCKET_NAME!;
    for (const doc of trip.documents) {
      try {
        const fileUrl = doc.file_url;
        const parts = fileUrl.split(`${bucketName}/`);
        const key = parts[parts.length - 1];

        if (key) {
          const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          await s3Client.send(command).catch(e => console.error(`S3 Delete failed for document ${doc.id}:`, e));
        }
      } catch (s3Error) {
        console.error(`Cleanup S3 failed for document ${doc.id}:`, s3Error);
      }
    }

    // 3. Delete from database (waybills and documents will be deleted via Cascade)
    await prisma.transport_trips.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transport Trip API DELETE error:", error);
    return NextResponse.json(
      { error: "Error deleting transport trip" },
      { status: 500 },
    );
  }
}
