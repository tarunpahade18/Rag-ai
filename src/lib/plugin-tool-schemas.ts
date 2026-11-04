export const TOOL_SCHEMAS = [
  {
    name: "list_vaults",
    description:
      "List the user's legal document vaults with folder and document counts. Call this first.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "create_vault",
    description: "Create a new vault to organize related legal documents.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Short vault name." },
        description: {
          type: "string",
          description: "Optional description of the vault.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_folders",
    description:
      "List folders, optionally filtered by vaultId. Documents are indexed and searched per folder.",
    inputSchema: {
      type: "object",
      properties: {
        vaultId: {
          type: "string",
          description: "Only return folders inside this vault.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "create_folder",
    description: "Create a folder inside an existing vault.",
    inputSchema: {
      type: "object",
      required: ["vaultId", "name"],
      properties: {
        vaultId: { type: "string", description: "Parent vault ID." },
        name: { type: "string", description: "Folder name." },
        description: {
          type: "string",
          description: "Optional description of the folder.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_documents",
    description:
      "List indexed documents, optionally filtered by folderId. Use this to confirm coverage before answering.",
    inputSchema: {
      type: "object",
      properties: {
        folderId: {
          type: "string",
          description: "Only return documents in this folder.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "ask_documents",
    description:
      "Answer a question using the user's indexed documents. Returns an answer plus cited source passages. Omit vaultId and folderId to search everything.",
    inputSchema: {
      type: "object",
      required: ["question"],
      properties: {
        question: {
          type: "string",
          description: "The user's question about their documents.",
        },
        vaultId: {
          type: "string",
          description: "Optional vault ID to scope the search.",
        },
        folderId: {
          type: "string",
          description: "Optional folder ID to scope the search.",
        },
        topK: {
          type: "integer",
          minimum: 1,
          maximum: 12,
          description: "Maximum number of passages to retrieve.",
        },
        history: {
          type: "array",
          description: "Optional recent conversation turns.",
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["user", "assistant"] },
              content: { type: "string" },
            },
          },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "ingest_text_document",
    description:
      "Index plain text as a document. Creates a default vault/folder when IDs are omitted. Use for pasted contracts or text extracted from a file.",
    inputSchema: {
      type: "object",
      required: ["name", "text"],
      properties: {
        name: {
          type: "string",
          description: "File name including extension, e.g. lease.pdf.",
        },
        text: {
          type: "string",
          description: "Full plain-text contents of the document.",
        },
        vaultId: { type: "string", description: "Optional existing vault ID." },
        folderId: {
          type: "string",
          description: "Optional existing folder ID.",
        },
        vaultName: {
          type: "string",
          description: "Vault name to find or create when vaultId is omitted.",
        },
        folderName: {
          type: "string",
          description: "Folder name to find or create when folderId is omitted.",
        },
      },
      additionalProperties: false,
    },
  },
] as const;
