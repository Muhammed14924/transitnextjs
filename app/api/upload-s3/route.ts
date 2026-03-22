import { NextRequest, NextResponse } from "next/server";
import { uploadToS3, deleteFromS3 } from "@/app/lib/s3";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("fileUrl");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "رابط الملف مطلوب" },
        { status: 400 }
      );
    }

    await deleteFromS3(fileUrl);

    return NextResponse.json({ success: true, message: "تم حذف الملف من S3" });
  } catch (error: unknown) {
    console.error("Error deleting file from S3:", error);
    const message = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { error: "فشل في حذف الملف من S3: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "uploads";

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم العثور على ملف" },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { fileUrl } = await uploadToS3(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
      fileName: file.name,
    });
  } catch (error: unknown) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { error: "فشل في رفع الملف: " + message },
      { status: 500 },
    );
  }
}

