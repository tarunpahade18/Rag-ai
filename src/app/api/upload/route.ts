import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { validateServerEnv } from "@/lib/env";
import { indexDocument } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    validateServerEnv();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Attach a document in the 'file' field." },
        { status: 400 },
      );
    }

    const vaultId = formData.get("vaultId") as string | null || "default-vault";
    const folderId = formData.get("folderId") as string || "default-folder";
    const documentId = formData.get("documentId") as string | null || randomUUID();

    const result = await indexDocument({
      vaultId,
      folderId,
      documentId,
      file,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Document upload failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}