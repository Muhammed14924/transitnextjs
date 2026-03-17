import { NextRequest, NextResponse } from "next/server";
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docId } = await params;
    const documentId = parseInt(docId);

    if (isNaN(documentId)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
    }

    // 1. Get document details for S3 deletion
    const document = await prisma.trip_documents.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 2. Delete from database
    await prisma.trip_documents.delete({
      where: { id: documentId },
    });

    // 3. Delete from S3
    try {
      const bucketName = process.env.S3_BUCKET_NAME!;
      const fileUrl = document.file_url;
      const parts = fileUrl.split(`${bucketName}/`);
      const key = parts[parts.length - 1];

      if (key) {
        const command = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        await s3Client.send(command).catch(e => console.error("S3 Delete failed:", e));
      }
    } catch (s3Error) {
      console.error("Cleanup S3 failed after DB delete:", s3Error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
