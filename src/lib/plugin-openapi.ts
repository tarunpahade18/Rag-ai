export function buildOpenApiSpec(baseUrl: string) {
  const errorResponse = {
    description: "Request failed.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  };

  return {
    openapi: "3.0.1",
    info: {
      title: "llmlite Legal Assistant",
      description:
        "Search and question the user's private legal document vaults, and import plain-text documents for retrieval.",
      version: "1.0.0",
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/api/vaults": {
        get: {
          operationId: "listVaults",
          summary: "List document vaults",
          description:
            "Returns the user's vaults with document and folder counts. Call this first to discover available vault IDs.",
          responses: {
            "200": {
              description: "The user's vaults.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      vaults: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Vault" },
                      },
                    },
                  },
                },
              },
            },
            "401": errorResponse,
          },
        },
        post: {
          operationId: "createVault",
          summary: "Create a document vault",
          description:
            "Creates a vault to organize related documents. Use only when the user asks for a new vault or has none.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: {
                      type: "string",
                      description: "Short vault name, e.g. Contracts.",
                    },
                    description: {
                      type: "string",
                      description: "Optional description of the vault.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Vault created.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      vault: { $ref: "#/components/schemas/Vault" },
                    },
                  },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
          },
        },
      },
      "/api/folders": {
        get: {
          operationId: "listFolders",
          summary: "List folders in a vault",
          description:
            "Returns folders for the user, optionally filtered by vaultId. Use folderId when asking questions about a specific set of documents.",
          parameters: [
            {
              name: "vaultId",
              in: "query",
              required: false,
              description: "Only return folders inside this vault.",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Folders matching the request.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      folders: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Folder" },
                      },
                    },
                  },
                },
              },
            },
            "401": errorResponse,
            "404": errorResponse,
          },
        },
        post: {
          operationId: "createFolder",
          summary: "Create a folder in a vault",
          description:
            "Creates a folder inside an existing vault. Documents are indexed and searched per folder.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["vaultId", "name"],
                  properties: {
                    vaultId: {
                      type: "string",
                      description: "ID of the vault that will contain the folder.",
                    },
                    name: {
                      type: "string",
                      description: "Folder name, e.g. Employment Agreements.",
                    },
                    description: {
                      type: "string",
                      description: "Optional description of the folder.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Folder created.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      folder: { $ref: "#/components/schemas/Folder" },
                    },
                  },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "404": errorResponse,
          },
        },
      },
      "/api/documents": {
        get: {
          operationId: "listDocuments",
          summary: "List indexed documents",
          description:
            "Returns the user's indexed documents, optionally filtered by folderId. Use this to confirm which documents are available before answering.",
          parameters: [
            {
              name: "folderId",
              in: "query",
              required: false,
              description: "Only return documents in this folder.",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Documents matching the request.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      documents: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Document" },
                      },
                    },
                  },
                },
              },
            },
            "401": errorResponse,
            "404": errorResponse,
          },
        },
      },
      "/api/plugin/ask": {
        post: {
          operationId: "askDocuments",
          summary: "Ask a question about the user's documents",
          description:
            "Retrieves relevant passages from the user's vaults and returns a grounded answer with citations. Omit vaultId and folderId to search all documents.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AskRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Answer and the source passages used.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AskResponse" },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "404": errorResponse,
            "500": errorResponse,
          },
        },
      },
      "/api/plugin/documents/ingest": {
        post: {
          operationId: "ingestTextDocument",
          summary: "Import a plain-text document",
          description:
            "Indexes plain text supplied by the user into a vault and folder. Creates a default vault or folder when IDs are omitted. Supported names: .txt, .md, .pdf, .docx (text only).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/IngestRequest" },
              },
            },
          },
          responses: {
            "201": {
              description: "Document indexed.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/IngestResponse" },
                },
              },
            },
            "400": errorResponse,
            "401": errorResponse,
            "404": errorResponse,
            "413": errorResponse,
            "500": errorResponse,
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description:
            "Plugin API key generated in Settings. Send it as: Authorization: Bearer sk_plugin_...",
        },
      },
      schemas: {
        Vault: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Vault ID." },
            name: { type: "string", description: "Vault name." },
            description: { type: "string", description: "Vault description." },
            folderCount: { type: "integer", description: "Number of folders." },
            documentCount: {
              type: "integer",
              description: "Number of documents.",
            },
            createdAt: { type: "string", description: "Creation timestamp." },
          },
        },
        Folder: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Folder ID." },
            vaultId: { type: "string", description: "Parent vault ID." },
            name: { type: "string", description: "Folder name." },
            description: { type: "string", description: "Folder description." },
            documentCount: {
              type: "integer",
              description: "Number of documents.",
            },
            createdAt: { type: "string", description: "Creation timestamp." },
          },
        },
        Document: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Document ID." },
            vaultId: { type: "string", description: "Parent vault ID." },
            folderId: { type: "string", description: "Parent folder ID." },
            name: { type: "string", description: "File name." },
            type: { type: "string", description: "File extension." },
            size: { type: "string", description: "Human-readable size." },
            chunkCount: {
              type: "integer",
              description: "Number of indexed chunks.",
            },
            status: {
              type: "string",
              description: "Indexing status.",
              enum: ["pending", "indexing", "ready", "failed"],
            },
            uploadedAt: { type: "string", description: "Upload timestamp." },
          },
        },
        Source: {
          type: "object",
          properties: {
            sourceName: { type: "string", description: "Document name." },
            sourceType: { type: "string", description: "Document type." },
            pageNumber: { type: "integer", description: "Page number." },
            chunkIndex: { type: "integer", description: "Chunk index." },
            score: { type: "number", description: "Similarity score." },
            text: { type: "string", description: "Passage text." },
            fileUrl: { type: "string", description: "Source file URL." },
          },
        },
        AskRequest: {
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
                  role: {
                    type: "string",
                    enum: ["user", "assistant"],
                  },
                  content: { type: "string" },
                },
              },
            },
          },
        },
        AskResponse: {
          type: "object",
          properties: {
            answer: { type: "string", description: "Grounded answer." },
            sources: {
              type: "array",
              items: { $ref: "#/components/schemas/Source" },
            },
          },
        },
        IngestRequest: {
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
            vaultId: {
              type: "string",
              description: "Optional existing vault ID.",
            },
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
        },
        IngestResponse: {
          type: "object",
          properties: {
            documentId: { type: "string", description: "New document ID." },
            vaultId: { type: "string", description: "Vault ID used." },
            folderId: { type: "string", description: "Folder ID used." },
            vaultName: { type: "string", description: "Vault name." },
            folderName: { type: "string", description: "Folder name." },
            name: { type: "string", description: "Document name." },
            chunkCount: { type: "integer", description: "Chunks indexed." },
            status: { type: "string", description: "Indexing status." },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", description: "Error message." },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };
}
