import { NextResponse } from "next/server";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { Pinecone } from "@pinecone-database/pinecone";

import OpenAI from "openai";

import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

/* =========================================================
   R2 CONFIG
========================================================= */

const s3 = new S3Client({
  region: "auto",

  endpoint:
    "https://e75947cbdd8bea701dfeaee5b7bcdef8.r2.cloudflarestorage.com",

  credentials: {
    accessKeyId:
      "c9b253dbb24734280b58cb571a045ba0",

    secretAccessKey:
      "d5359d175cd51b7e2bc46a6188669ee087868afb67952affff22d32a87762ab4",
  },
});

/* =========================================================
   OPENAI
========================================================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* =========================================================
   PINECONE
========================================================= */

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.index(
  process.env.PINECONE_INDEX_NAME!
);

/* =========================================================
   CHUNKING
========================================================= */

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

/* =========================================================
   ROUTE
========================================================= */

export async function POST(request: Request) {
  try {
    console.log("🚀 Upload started");

    const formData = await request.formData();

    const file = formData.get("file") as File;

    const vaultId =
      (formData.get("vaultId") as string) ||
      "default-vault";

    const folderId =
      (formData.get("folderId") as string) ||
      "default-folder";

    const documentId =
      (formData.get("documentId") as string) ||
      crypto.randomUUID();

    if (!file) {
      return NextResponse.json(
        {
          error: "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================================
       FILE BUFFER
    ========================================================= */

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    /* =========================================================
       R2 UPLOAD
    ========================================================= */

    console.log("📤 Uploading to R2");

    const fileName = `${Date.now()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: "legalpdf",

        Key: fileName,

        Body: buffer,

        ContentType:
          file.type || "application/pdf",
      })
    );

    console.log("✅ Uploaded to R2");

    /* =========================================================
       PDF TEXT EXTRACTION
    ========================================================= */

    console.log("📄 Extracting PDF text");

    const parser = new PDFParse({
      data: buffer,
    });

    const parsed = await parser.getText();

    await parser.destroy();

    const text = parsed.text;

    console.log(
      "📄 Extracted text length:",
      text.length
    );

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            "No text could be extracted from PDF",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================================================
       CHUNKING
    ========================================================= */

    console.log("✂️ Chunking text");

    const chunks = chunkText(text);

    console.log(
      "✂️ Total chunks:",
      chunks.length
    );

    /* =========================================================
       EMBEDDINGS
    ========================================================= */

    console.log("🧠 Creating embeddings");

    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embeddingResponse =
        await openai.embeddings.create({
          model: "text-embedding-3-small",

          input: chunk,
        });

      const embedding =
        embeddingResponse.data[0].embedding;

      vectors.push({
        id: `${documentId}-${i}`,

        values: embedding,

        metadata: {
          text: chunk,

          chunkIndex: i,

          fileName: file.name,

          vaultId,

          folderId,

          documentId,
        },
      });

      console.log(
        `✅ Embedded chunk ${i + 1}/${
          chunks.length
        }`
      );
    }

    /* =========================================================
       PINECONE UPSERT
    ========================================================= */

    console.log("📦 Uploading to Pinecone");
const namespace =
  `vault-${vaultId}-folder-${folderId}`;

    await pineconeIndex.namespace(namespace).upsert({
      records: vectors
    });

    console.log("✅ Pinecone upsert complete");

    /* =========================================================
       RESPONSE
    ========================================================= */

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
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}