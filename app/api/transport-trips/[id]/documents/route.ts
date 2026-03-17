import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 });
    }

    const body = await req.json();
    const { document_type, document_number, file_url, file_name } = body;

    if (!file_url || !file_name) {
      return NextResponse.json(
        { error: "file_url and file_name are required" },
        { status: 400 }
      );
    }

    const document = await prisma.trip_documents.create({
      data: {
        trip_id: tripId,
        document_type: document_type || "البيان الجمركي",
        document_number: document_number || null,
        file_url,
        file_name,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Trip Documents POST error:", error);
    return NextResponse.json(
      { error: "Error adding document to trip" },
      { status: 500 }
    );
  }
}
