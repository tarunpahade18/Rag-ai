import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import mammoth from "mammoth";

import { indexDocumentFromText, type ExtractedPage } from "@/lib/rag";

export const runtime = "nodejs";
export const maxDuration = 300;

const R2_ENDPOINT = process.env.R2_ENDPOINT || process.env.R2_API || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || process.env.ACCOUNT_ID_KEY || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || process.env.SECERET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "legalpdf";

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function normalizeText(text: string) {
  return text.replace(/\r/g, "").replace(/\t/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractServerSide(file: File): Promise<ExtractedPage[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return [{ pageNumber: 1, text: normalizeText(result.value || "") }];
  }

  if (ext === "txt" || ext === "md") {
    return [{ pageNumber: 1, text: normalizeText(buffer.toString("utf8")) }];
  }

  throw new Error("Server-side extraction only supports DOCX, TXT, MD. PDFs must be extracted client-side.");
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Upload started");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const vaultId = (formData.get("vaultId") as string) || "default-vault";
    const folderId = (formData.get("folderId") as string) || "default-folder";
    const documentId = (formData.get("documentId") as string) || crypto.randomUUID();
    const pagesJson = formData.get("pages") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    /* R2 UPLOAD */
    console.log("📤 Uploading to R2");
    const fileName = `${Date.now()}-${file.name}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "application/pdf",
      })
    );
    console.log("✅ Uploaded to R2");

    /* TEXT EXTRACTION */
    let pages: ExtractedPage[];

    if (pagesJson) {
      pages = JSON.parse(pagesJson) as ExtractedPage[];
      console.log("📄 Using client-extracted pages:", pages.length);
    } else {
      pages = await extractServerSide(file);
      console.log("📄 Server-extracted pages:", pages.length);
    }

    if (!pages.length) {
      return NextResponse.json(
        { error: "No text could be extracted from the document." },
        { status: 400 }
      );
    }

    /* INDEX TO PINECONE */
    const fileUrl = `https://legalpdf.eastus.cloudapp.azure.com/${fileName}`;
    const result = await indexDocumentFromText({
      vaultId,
      folderId,
      documentId,
      fileName: file.name,
      pages,
      fileUrl,
    });

    console.log("✅ Indexing complete:", result.chunkCount, "chunks");

    return NextResponse.json({
      success: true,
      fileName,
      documentId,
      chunks: result.chunkCount,
      uploaded: true,
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
