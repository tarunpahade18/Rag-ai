import { Types } from "mongoose";

import { generateGroundedAnswer, type ChatHistoryMessage } from "@/lib/answer";
import { connectDB } from "@/lib/db";
import { validateServerEnv } from "@/lib/env";
import {
  indexDocumentFromText,
  retrieveSourcesAcrossFolders,
  type FolderScope,
} from "@/lib/rag";
import { DocumentModel } from "@/models/document";
import { Folder, type IFolder } from "@/models/folder";
import { Vault } from "@/models/vault";

export class ToolError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ToolError";
    this.status = status;
  }
}

export type AskToolArgs = {
  question?: string;
  vaultId?: string;
  folderId?: string;
  topK?: number;
  history?: ChatHistoryMessage[];
};

export type IngestToolArgs = {
  name?: string;
  text?: string;
  vaultId?: string;
  folderId?: string;
  vaultName?: string;
  folderName?: string;
};

const MAX_TEXT_CHARS = 2_000_000;

function normalizeHistory(history: AskToolArgs["history"]) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(
      (message): message is ChatHistoryMessage =>
        !!message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .slice(-6);
}

export async function listVaults(userId: string) {
  await connectDB();

  const vaults = await Vault.find({ userId }).sort({ createdAt: -1 });

  return Promise.all(
    vaults.map(async (vault) => ({
      _id: String(vault._id),
      name: vault.name,
      description: vault.description ?? "",
      createdAt: vault.createdAt,
      folderCount: await Folder.countDocuments({ vaultId: vault._id }),
      documentCount: await DocumentModel.countDocuments({
        vaultId: vault._id,
      }),
    })),
  );
}

export async function createVault(
  userId: string,
  args: { name?: string; description?: string },
) {
  const name = args.name?.trim();

  if (!name) {
    throw new ToolError("Vault name is required");
  }

  await connectDB();

  const vault = await Vault.create({
    userId,
    name,
    description: args.description?.trim() || "",
  });

  return {
    _id: String(vault._id),
    name: vault.name,
    description: vault.description ?? "",
    createdAt: vault.createdAt,
    folderCount: 0,
    documentCount: 0,
  };
}

export async function createFolder(
  userId: string,
  args: { vaultId?: string; name?: string; description?: string },
) {
  const vaultId = args.vaultId?.trim();
  const name = args.name?.trim();

  if (!vaultId || !name) {
    throw new ToolError("vaultId and folder name are required");
  }

  await connectDB();

  const vault = await Vault.findOne({ _id: vaultId, userId });
  if (!vault) {
    throw new ToolError("Vault not found", 404);
  }

  const folder = await Folder.create({
    userId,
    vaultId: vault._id,
    name,
    description: args.description?.trim() || "",
  });

  return {
    _id: String(folder._id),
    vaultId: String(folder.vaultId),
    name: folder.name,
    description: folder.description ?? "",
    createdAt: folder.createdAt,
    documentCount: 0,
  };
}

async function foldersWithCounts(folders: IFolder[]) {
  return Promise.all(
    folders.map(async (folder) => ({
      _id: String(folder._id),
      vaultId: String(folder.vaultId),
      name: folder.name,
      description: folder.description ?? "",
      createdAt: folder.createdAt,
      documentCount: await DocumentModel.countDocuments({
        folderId: String(folder._id),
      }),
    })),
  );
}

export async function listFolders(userId: string, vaultId?: string) {
  await connectDB();

  if (vaultId?.trim()) {
    const vault = await Vault.findOne({
      _id: vaultId.trim(),
      userId,
    });

    if (!vault) {
      throw new ToolError("Vault not found", 404);
    }

    const folders = await Folder.find({
      userId,
      vaultId: vault._id,
    }).sort({ createdAt: 1 });

    return foldersWithCounts(folders);
  }

  const folders = await Folder.find({ userId }).sort({ createdAt: 1 });
  return foldersWithCounts(folders);
}

export async function listDocuments(userId: string, folderId?: string) {
  await connectDB();

  if (folderId?.trim()) {
    const folder = await Folder.findOne({
      _id: folderId.trim(),
      userId,
    });

    if (!folder) {
      throw new ToolError("Folder not found", 404);
    }
  }

  const documents = await DocumentModel.find({
    userId,
    ...(folderId?.trim() ? { folderId: folderId.trim() } : {}),
  }).sort({ uploadedAt: -1 });

  return documents.map((document) => ({
    _id: String(document._id),
    vaultId: String(document.vaultId),
    folderId: document.folderId,
    name: document.name,
    type: document.type,
    size: document.size,
    chunkCount: document.chunkCount,
    status: document.status,
    uploadedAt: document.uploadedAt,
  }));
}

export async function askDocuments(userId: string, args: AskToolArgs) {
  validateServerEnv();

  const question = args.question?.trim();
  const vaultId = args.vaultId?.trim();
  const folderId = args.folderId?.trim();
  const topK = Math.min(Math.max(Number(args.topK) || 6, 1), 12);

  if (!question) {
    throw new ToolError("question is required");
  }

  await connectDB();

  let scopes: FolderScope[] = [];

  if (folderId) {
    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
      throw new ToolError("Folder not found", 404);
    }

    scopes = [
      {
        vaultId: String(folder.vaultId),
        folderId: String(folder._id),
      },
    ];
  } else {
    let folders: IFolder[];

    if (vaultId) {
      const vault = await Vault.findOne({ _id: vaultId, userId });

      if (!vault) {
        throw new ToolError("Vault not found", 404);
      }

      folders = await Folder.find({
        userId,
        vaultId: vault._id,
      })
        .sort({ createdAt: 1 })
        .limit(25);
    } else {
      folders = await Folder.find({ userId })
        .sort({ createdAt: 1 })
        .limit(25);
    }

    scopes = folders.map((folder) => ({
      vaultId: String(folder.vaultId),
      folderId: String(folder._id),
    }));
  }

  if (!scopes.length) {
    return {
      answer:
        "No indexed documents were found for this account. Add a document first, then ask again.",
      sources: [],
    };
  }

  const sources = await retrieveSourcesAcrossFolders(scopes, question, topK);

  if (!sources.length) {
    return {
      answer:
        "I could not find supporting passages in the uploaded documents for that question.",
      sources: [],
    };
  }

  const answer = await generateGroundedAnswer({
    question,
    sources,
    history: normalizeHistory(args.history),
  });

  return { answer, sources };
}

export async function ingestTextDocument(
  userId: string,
  args: IngestToolArgs,
) {
  validateServerEnv();

  const name = args.name?.trim();
  const text = typeof args.text === "string" ? args.text.trim() : "";

  if (!name) {
    throw new ToolError("name is required, for example lease.pdf");
  }

  if (!text) {
    throw new ToolError("text is required");
  }

  if (text.length > MAX_TEXT_CHARS) {
    throw new ToolError(
      "text is too large. Split the document into smaller parts.",
      413,
    );
  }

  await connectDB();

  let vault: Awaited<ReturnType<typeof Vault.findOne>> = null;

  if (args.vaultId?.trim()) {
    vault = await Vault.findOne({
      _id: args.vaultId.trim(),
      userId,
    });

    if (!vault) {
      throw new ToolError("Vault not found", 404);
    }
  } else {
    const vaultName = args.vaultName?.trim() || "ChatGPT Imports";
    vault = await Vault.findOne({ userId, name: vaultName });

    if (!vault) {
      vault = await Vault.create({
        userId,
        name: vaultName,
        description: "Documents imported through an AI agent.",
      });
    }
  }

  let folder: Awaited<ReturnType<typeof Folder.findOne>> = null;

  if (args.folderId?.trim()) {
    folder = await Folder.findOne({
      _id: args.folderId.trim(),
      userId,
      vaultId: vault._id,
    });

    if (!folder) {
      throw new ToolError("Folder not found in that vault", 404);
    }
  } else {
    const folderName = args.folderName?.trim() || "Imported Documents";
    folder = await Folder.findOne({
      userId,
      vaultId: vault._id,
      name: folderName,
    });

    if (!folder) {
      folder = await Folder.create({
        userId,
        vaultId: vault._id,
        name: folderName,
        description: "Documents imported through an AI agent.",
      });
    }
  }

  const vaultId = String(vault._id);
  const folderId = String(folder._id);
  const documentId = new Types.ObjectId();
  const normalizedText = text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  let result;

  try {
    result = await indexDocumentFromText({
      vaultId,
      folderId,
      documentId: String(documentId),
      fileName: name,
      pages: [{ pageNumber: 1, text: normalizedText }],
    });
  } catch (error) {
    throw new ToolError(
      error instanceof Error ? error.message : "Indexing failed.",
    );
  }

  const extension = name.split(".").pop()?.toLowerCase() || "txt";
  const sizeKb = Math.max(
    1,
    Math.round(Buffer.byteLength(normalizedText, "utf8") / 1024),
  );

  const document = await DocumentModel.create({
    _id: documentId,
    userId,
    vaultId: vault._id,
    folderId,
    name,
    type: extension,
    size: `${sizeKb} KB`,
    chunkCount: result.chunkCount,
    status: "ready",
  });

  return {
    documentId: String(document._id),
    vaultId,
    folderId,
    vaultName: vault.name,
    folderName: folder.name,
    name,
    chunkCount: result.chunkCount,
    status: "ready" as const,
  };
}
