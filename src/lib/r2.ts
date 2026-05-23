import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "process";

const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = env.R2_BUCKET_NAME || "legalpdf";
const R2_PUBLIC_URL = env.R2_PUBLIC_URL || "";
const R2_ENDPOINT = env.R2_ENDPOINT || "";

console.log("🔧 R2 Config:", {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: R2_ACCESS_KEY_ID ? `${R2_ACCESS_KEY_ID.slice(0,8)}...` : "missing",
  R2_SECRET_SET: !!R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  R2_ENDPOINT
});

const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

console.log("✅ R2 Client initialized with endpoint:", R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);

export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  console.log("📤 === R2 UPLOAD START ===");
  console.log("📤 File:", fileName, "Size:", file.length, "Type:", contentType);
  console.log("📤 Bucket:", R2_BUCKET_NAME);
  console.log("📤 Endpoint:", R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  
  const key = `${Date.now()}-${fileName}`;
  console.log("📤 Key:", key);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  console.log("📤 Sending PutObjectCommand...");
  try {
    const response = await r2Client.send(command);
    console.log("📤 === R2 UPLOAD SUCCESS ===");
    console.log("📤 Response:", JSON.stringify(response));
    
    const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : "";
    console.log("📤 Public URL:", publicUrl);

    return { url: publicUrl, key };
  } catch (error) {
    console.error("📤 === R2 UPLOAD FAILED ===");
    console.error("📤 Error:", error);
    throw error;
  }
}

export function getR2PublicUrl(key: string): string {
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : "";
}
