import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

/**
 * Sanitizes a filename to be safe for S3 and URLs
 */
function sanitizeFileName(fileName: string): string {
  // Remove special characters and replace spaces with underscore
  return fileName
    .split(".")
    .map((part, index, array) => {
      if (index === array.length - 1) return part.toLowerCase(); // keep extension
      return part.replace(/[^a-zA-Z0-9]/g, "_");
    })
    .join(".");
}

export async function uploadToS3(file: Buffer, fileName: string, contentType: string, folder: string = "") {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const sanitized = sanitizeFileName(fileName);
  const uniqueFileName = `${uuidv4()}_${sanitized}`;
  
  // Create the full key with folder if provided
  const key = folder ? `${folder.replace(/^\/+|\/+$/g, "")}/${uniqueFileName}` : uniqueFileName;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3Client.send(command);
  
  // Construct the final URL
  const fileUrl = `${process.env.S3_ENDPOINT}/${bucketName}/${key}`;
  return { fileUrl, uniqueFileName: key };
}

export async function deleteFromS3(fileUrl: string) {
  try {
    if (!fileUrl) return;

    // Check if it's a local file URL (e.g., /uploads/...)
    if (fileUrl.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), "public", fileUrl);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log("Deleted local file:", localPath);
      }
      return;
    }

    const bucketName = process.env.S3_BUCKET_NAME!;
    
    // Only delete from S3 if it's an S3 URL
    if (!fileUrl.includes(bucketName) || !fileUrl.startsWith(process.env.S3_ENDPOINT!)) {
      console.log("Not a recognized URL for deletion:", fileUrl);
      return;
    }

    // Extract Key from URL: endpoint/bucket/key
    const parts = fileUrl.split(`${bucketName}/`);
    const key = parts[parts.length - 1];

    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log("Deleted from S3:", key);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export { s3Client };


