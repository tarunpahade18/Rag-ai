import mammoth from "mammoth";

import { embedTexts } from "@/lib/mistral";
import {
  type VectorRecord,
  upsertVectors,
  queryVectors,
  getNamespace,
} from "@/lib/pinecone";

export type LegalSource = {
  id: string;
  chunkIndex: number;
  score: number;
  sourceName: string;
  sourceType: string;
  text: string;
  summary?: string;
  pageNumber?: number;
  totalPages?: number;
  paragraphNumber?: number;
  fileUrl?: string;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 200;

function normalizeText(text: string) {
  return text.replace(/\r/g, "").replace(/\t/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export async function extractTextWithPages(file: File): Promise<ExtractedPage[]> {
  console.log("📄 extractTextWithPages: START for", file.name, "size:", file.size);
  
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File is too large. Upload a file under 10 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("📄 Buffer created, size:", buffer.length);

  if (extension === "pdf") {
    throw new Error("PDF text extraction must be done client-side. Use extractPdfText() from @/lib/pdf-extract.");
  }

  if (extension === "docx") {
    console.log("📄 Parsing DOCX...");
    const result = await mammoth.extractRawText({ buffer });
    const text = normalizeText(result.value || "");
    console.log("📄 DOCX text length:", text.length);
    return [{ pageNumber: 1, text }];
  }

  if (extension === "txt" || extension === "md") {
    console.log("📄 Parsing TXT/MD...");
    const text = buffer.toString("utf8");
    console.log("📄 TXT text length:", text.length);
    return [{ pageNumber: 1, text: normalizeText(text) }];
  }

  throw new Error("Unsupported file type. Use PDF, DOCX, TXT, or MD.");
}

// Keep old function for backwards compatibility
export async function extractTextFromFile(file: File) {
  const pages = await extractTextWithPages(file);
  return pages.map(p => p.text).join("\n\n");
}

export interface ChunkWithMeta {
  text: string;
  pageNumber: number;
  paragraphStart: number;
}

export function splitIntoChunksWithMeta(pages: ExtractedPage[]): ChunkWithMeta[] {
  console.log("🔀 splitIntoChunksWithMeta: START processing", pages.length, "pages");
  
  const chunks: ChunkWithMeta[] = [];
  
  for (const page of pages) {
    console.log("🔀 Processing page", page.pageNumber, "with", page.text.length, "chars");
    
    // Split by double newlines (paragraphs)
    const paragraphs = page.text.split(/\n\n+/).filter(p => p.trim());
    console.log("🔀 Page", page.pageNumber, "has", paragraphs.length, "paragraphs");
    
    let paragraphIndex = 0;
    for (const paragraph of paragraphs) {
      const normalizedPara = paragraph.trim();
      if (normalizedPara.length < 50) {
        console.log("🔀 Skipping short paragraph:", normalizedPara.length, "chars");
        continue;
      }
      
      console.log("🔀 Page", page.pageNumber, "Paragraph", paragraphIndex + 1, "length:", normalizedPara.length);
      
      // Further split long paragraphs if needed
      if (normalizedPara.length > CHUNK_SIZE * 1.5) {
        console.log("🔀 Paragraph too long, splitting...");
        let start = 0;
        let subChunkIndex = 0;
        while (start < normalizedPara.length) {
          const slice = normalizedPara.slice(start, start + CHUNK_SIZE);
          const boundaryMatch = slice.match(/^([\s\S]{600,})(\n\n|[.?!]\s)/);
          const chunk = boundaryMatch?.[1]?.trim() || slice.trim();
          
          if (chunk) {
            chunks.push({
              text: chunk,
              pageNumber: page.pageNumber,
              paragraphStart: paragraphIndex
            });
            console.log("🔀   Sub-chunk", subChunkIndex + 1, "page", page.pageNumber, "para", paragraphIndex + 1);
            subChunkIndex++;
          }
          start += Math.max(chunk.length - CHUNK_OVERLAP, 1);
        }
      } else {
        chunks.push({
          text: normalizedPara,
          pageNumber: page.pageNumber,
          paragraphStart: paragraphIndex
        });
        console.log("🔀   Added chunk: page", page.pageNumber, "para", paragraphIndex + 1, "len", normalizedPara.length);
      }
      paragraphIndex++;
    }
  }

  console.log("🔀 splitIntoChunksWithMeta: FINAL chunks:", chunks.length);
  chunks.forEach((c, i) => console.log(`🔀 Chunk ${i+1}: page=${c.pageNumber}, para=${c.paragraphStart + 1}, len=${c.text.length}`));
  return chunks;
}

// Keep old function for backwards compatibility
export function splitIntoChunks(text: string) {
  return [text]; // Simplified - just return the text as single chunk
}

export interface IndexDocumentParams {
  vaultId: string;
  folderId: string;
  documentId: string;
  file: File;
  fileUrl?: string;
}

export interface IndexDocumentResult {
  documentId: string;
  documentName: string;
  documentType: string;
  chunkCount: number;
  status: "indexing" | "ready";
  fileUrl?: string;
}

export async function indexDocument({
  vaultId,
  folderId,
  documentId,
  file,
  fileUrl,
}: IndexDocumentParams): Promise<IndexDocumentResult> {
  console.log("🔍 indexDocument: START", { vaultId, folderId, documentId, fileName: file.name });
  
  console.log("🔍 indexDocument: extracting text with pages...");
  const pages = await extractTextWithPages(file);
  console.log("🔍 indexDocument: extracted", pages.length, "pages");

  if (!pages.length) {
    throw new Error("No text could be extracted from the uploaded document.");
  }

  console.log("🔍 indexDocument: splitting into chunks with page/paragraph tracking...");
  const chunks = splitIntoChunksWithMeta(pages);
  console.log("🔍 indexDocument: chunks created:", chunks.length);

  if (!chunks.length) {
    throw new Error("The document did not contain enough readable text to index.");
  }

  const documentType = file.name.split(".").pop()?.toLowerCase() || "txt";
  const uploadedAt = new Date().toISOString();
  const totalPages = pages.length;

  // Get just the text for embedding
  const chunkTexts = chunks.map(c => c.text);
  
  console.log("🔍 indexDocument: getting embeddings for", chunkTexts.length, "chunks...");
  const embeddings = await embedTexts(chunkTexts);
  console.log("🔍 indexDocument: embeddings received, length =", embeddings?.length);

  console.log("🔍 indexDocument: creating vector records with page/paragraph metadata...");
  const records: VectorRecord[] = embeddings.map((values, chunkIndex) => {
    const chunk = chunks[chunkIndex];
    const record = {
      id: `${documentId}-chunk-${chunkIndex}`,
      values,
      metadata: {
        vaultId,
        folderId,
        documentId,
        documentName: file.name,
        documentType,
        chunkIndex,
        chunkText: chunk.text,
        chunkCount: chunks.length,
        pageNumber: chunk.pageNumber,
        totalPages,
        paragraphNumber: chunk.paragraphStart + 1,
        uploadedAt,
        status: "ready" as const,
        ...(fileUrl && { fileUrl }),
      },
    };
    console.log("🔍 Record", chunkIndex, "pageNumber:", chunk.pageNumber, "paragraphNumber:", chunk.paragraphStart + 1, "totalPages:", totalPages);
    return record;
  });
  
  console.log("🔍 indexDocument: created", records.length, "vector records");

  console.log("🔍 indexDocument: upserting to Pinecone...", { vaultId, folderId });
  await upsertVectors(vaultId, folderId, records);
  console.log("🔍 indexDocument: upsert complete!");

  return {
    documentId,
    documentName: file.name,
    fileUrl,
    documentType,
    chunkCount: chunks.length,
    status: "ready",
  };
}

export interface IndexDocumentFromTextParams {
  vaultId: string;
  folderId: string;
  documentId: string;
  fileName: string;
  pages: ExtractedPage[];
  fileUrl?: string;
}

export async function indexDocumentFromText({
  vaultId,
  folderId,
  documentId,
  fileName,
  pages,
  fileUrl,
}: IndexDocumentFromTextParams): Promise<IndexDocumentResult> {
  console.log("🔍 indexDocumentFromText: START", { vaultId, folderId, documentId, fileName });

  if (!pages.length) {
    throw new Error("No text could be extracted from the uploaded document.");
  }

  const chunks = splitIntoChunksWithMeta(pages);
  console.log("🔍 indexDocumentFromText: chunks created:", chunks.length);

  if (!chunks.length) {
    throw new Error("The document did not contain enough readable text to index.");
  }

  const documentType = fileName.split(".").pop()?.toLowerCase() || "txt";
  const uploadedAt = new Date().toISOString();
  const totalPages = pages.length;

  const chunkTexts = chunks.map(c => c.text);
  const embeddings = await embedTexts(chunkTexts);

  const records: VectorRecord[] = embeddings.map((values, chunkIndex) => {
    const chunk = chunks[chunkIndex];
    return {
      id: `${documentId}-chunk-${chunkIndex}`,
      values,
      metadata: {
        vaultId,
        folderId,
        documentId,
        documentName: fileName,
        documentType,
        chunkIndex,
        chunkText: chunk.text,
        chunkCount: chunks.length,
        pageNumber: chunk.pageNumber,
        totalPages,
        paragraphNumber: chunk.paragraphStart + 1,
        uploadedAt,
        status: "ready" as const,
        ...(fileUrl && { fileUrl }),
      },
    };
  });

  await upsertVectors(vaultId, folderId, records);
  console.log("🔍 indexDocumentFromText: upsert complete!");

  return {
    documentId,
    documentName: fileName,
    fileUrl,
    documentType,
    chunkCount: chunks.length,
    status: "ready",
  };
}

export interface RetrieveSourcesParams {
  vaultId: string;
  folderId: string;
  query: string;
  topK?: number;
}

export async function retrieveSources({
  vaultId,
  folderId,
  query,
  topK = 6,
}: RetrieveSourcesParams): Promise<LegalSource[]> {
  console.log(vaultId, folderId, query);
  
  const [queryVector] = await embedTexts([query]);
  const matches = await queryVectors(vaultId, folderId, queryVector, topK);

  const sources: LegalSource[] = [];
  
  for (const match of matches) {
    const metadata = match.metadata as Record<string, unknown> | null;

    // Support both documentName/fileName and text/chunkText
    const sourceName = (metadata?.documentName || metadata?.fileName) as string | undefined;
    const chunkText = (metadata?.text || metadata?.chunkText) as string | undefined;
    
    if (!chunkText || !sourceName) {
      console.log("⚠️ Skipping match - missing text or sourceName", { 
        hasText: !!chunkText, 
        sourceName 
      });
      continue;
    }
    console.log("✅ Source found:", sourceName, "chunkIndex:", metadata?.chunkIndex);

    sources.push({
      id: match.id,
      chunkIndex: (metadata?.chunkIndex as number) ?? 0,
      score: match.score ?? 0,
      sourceName,
      sourceType: (metadata?.documentType as string) ?? "document",
      text: chunkText,
      summary: metadata?.summary as string | undefined,
      pageNumber: metadata?.pageNumber as number | undefined,
      totalPages: metadata?.totalPages as number | undefined,
      paragraphNumber: metadata?.paragraphNumber as number | undefined,
      fileUrl: metadata?.fileUrl as string | undefined,
    });
  }
  
  return sources;
}
