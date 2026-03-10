import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// تهيئة الاتصال بسيرفر SeaweedFS الخاص بك
const s3Client = new S3Client({
  region: "auto", // SeaweedFS لا يحتاج منطقة محددة
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // مهم جداً للخوادم الخاصة (MinIO / SeaweedFS)
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم العثور على ملف" },
        { status: 400 },
      );
    }

    // تحويل الملف إلى Buffer ليتمكن السيرفر من قراءته
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إنشاء اسم فريد للملف لتجنب التكرار
    const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const bucketName = process.env.S3_BUCKET_NAME!;

    // أمر الرفع إلى السيرفر
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
      // لجعل الملف قابلاً للقراءة (الرؤية) من المتصفح مباشرة
      ACL: "public-read",
    });

    await s3Client.send(command);

    // بناء رابط الملف النهائي
    const fileUrl = `${process.env.S3_ENDPOINT}/${bucketName}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "فشل في رفع الملف: " + error.message },
      { status: 500 },
    );
  }
}
