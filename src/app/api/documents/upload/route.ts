import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { Pinecone } from "@pinecone-database/pinecone";

import OpenAI from "openai";

import "@/lib/pdf-polyfill";
import { PDFParse } from "pdf-parse";

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.index(
  process.env.PINECONE_INDEX_NAME!
);

function chunkText(
  text: string,
  chunkSize = 4000,
  overlap = 400
) {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(request: Request) {
  try {
    console.log("🚀 Upload started");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const vaultId = (formData.get("vaultId") as string) || "default-vault";
    const folderId = (formData.get("folderId") as string) || "default-folder";
    const documentId = (formData.get("documentId") as string) || crypto.randomUUID();

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

    /* PDF EXTRACTION */
    console.log("📄 Extracting PDF text");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const parsed = await parser.getText();
    await parser.destroy();

    const fullText = parsed.text;
    if (!fullText || fullText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text could be extracted from PDF" },
        { status: 400 }
      );
    }
    console.log(`📄 Extracted text length: ${fullText.length}`);

    /* CHUNKING */
    console.log("✂️ Chunking text");
    const chunks = chunkText(fullText);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No readable text found in document" },
        { status: 400 }
      );
    }
    console.log(`✂️ Total chunks: ${chunks.length}`);

    /* BATCH EMBEDDINGS */
    console.log("🧠 Creating embeddings");
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });

    const vectors = embeddingResponse.data.map((entry, i) => ({
      id: `${documentId}-${i}`,
      values: entry.embedding,
      metadata: {
        text: chunks[i],
        chunkIndex: i,
        fileName: file.name,
        vaultId,
        folderId,
        documentId,
        documentName: file.name,
        chunkText: chunks[i],
        chunkCount: chunks.length,
        pageNumber: 1,
        totalPages: 1,
        paragraphNumber: i + 1,
      },
    }));

    console.log(`🧠 Embedded ${vectors.length} chunks in one batch`);

    /* PINECONE UPSERT (batched to stay under 2MB) */
    console.log("📦 Uploading to Pinecone");
    const namespace = `vault-${vaultId}-folder-${folderId}`;
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await pineconeIndex.namespace(namespace).upsert({ records: batch });
      console.log(`📦 Upserted batch ${Math.min(i + batchSize, vectors.length)}/${vectors.length}`);
    }
    console.log("✅ Pinecone upsert complete");

    return NextResponse.json({
      success: true,
      fileName,
      documentId,
      chunks: chunks.length,
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