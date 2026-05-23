import { Pinecone } from "@pinecone-database/pinecone";

import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

let pineconeClient: Pinecone | null = null;
let indexReadyPromise: Promise<void> | null = null;

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    vaultId: string;
    folderId: string;
    documentId: string;
    documentName: string;
    documentType: string;
    chunkIndex: number;
    chunkText: string;
    chunkCount: number;
    summary?: string;
    uploadedAt: string;
    status: "indexing" | "ready" | "failed";
  };
}

function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: getRequiredEnv("PINECONE_API_KEY"),
    });
  }

  return pineconeClient;
}

async function ensureIndex() {
  if (!indexReadyPromise) {
    indexReadyPromise = (async () => {
      const client = getPineconeClient();
      const indexName = getRequiredEnv("PINECONE_INDEX_NAME");

      try {
        await client.describeIndex(indexName);
        return;
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";
        const cloud = getOptionalEnv("PINECONE_CLOUD", "aws")!;
        const region = getOptionalEnv("PINECONE_REGION", "us-east-1")!;

        if (!message.includes("not found") && !message.includes("404")) {
          throw error;
        }

await client.createIndex({
          name: indexName,
          dimension: 1536,
          metric: "cosine",
          spec: {
            serverless: {
              cloud,
              region,
            },
          },
          deletionProtection: "disabled",
        });

        for (let attempt = 0; attempt < 30; attempt += 1) {
          const index = await client.describeIndex(indexName);

          if (index.status?.ready) {
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        throw new Error(
          `Pinecone index "${indexName}" was created but did not become ready in time.`,
        );
      }
    })();
  }

  return indexReadyPromise;
}

export async function getPineconeIndex() {
  await ensureIndex();
  return getPineconeClient().index({ name: getRequiredEnv("PINECONE_INDEX_NAME") });
}

export function getNamespace(vaultId: string, folderId: string): string {
  return `vault-${vaultId}-folder-${folderId}`;
}

export async function upsertVectors(
  vaultId: string,
  folderId: string,
  records: VectorRecord[],
) {
  console.log("📊 upsertVectors: START", { vaultId, folderId, recordCount: records.length });
  const namespace = getNamespace(vaultId, folderId);
  console.log("📊 upsertVectors: namespace =", namespace);
  
  const index = await getPineconeIndex();
  console.log("📊 upsertVectors: got index, calling namespace().upsert()...");

  await index.namespace(namespace).upsert({
    records: records.map((r) => ({
      id: r.id,
      values: r.values,
      metadata: r.metadata,
    }))
  });
  
  console.log("📊 upsertVectors: SUCCESS!");
}

export async function queryVectors(
  vaultId: string,
  folderId: string,
  vector: number[],
  topK: number = 6,
) {
  const index = await getPineconeIndex();
  const namespace = getNamespace(vaultId, folderId);

  console.log("🔎 QUERY namespace =", namespace);

  const response = await index
    .namespace(namespace)
    .query({
      vector,
      topK,
      includeMetadata: true,
    });

  console.log("🔎 Query matches =", response.matches.length,response.matches);

  return response.matches;
}

export async function deleteNamespace(vaultId: string, folderId: string) {
  const index = await getPineconeIndex();
  const namespace = getNamespace(vaultId, folderId);

  await index.namespace(namespace).deleteAll();
}

export async function listNamespaces(): Promise<string[]> {
  const index = await getPineconeIndex();
  const stats = await index.describeIndexStats();
  
  const namespaces: string[] = [];
  if (stats.namespaces) {
    for (const [name] of Object.entries(stats.namespaces)) {
      namespaces.push(name);
    }
  }
  return namespaces;
}