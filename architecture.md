# llmlite Assistant - Architecture

## Overview

The llmlite Assistant is a RAG (Retrieval Augmented Generation) system designed for legal document management, chunking, and intelligent Q&A over legal documents.

## Technology Stack

- **Frontend**: Next.js 16 with React 19, shadcn/ui components
- **Backend**: Next.js API routes
- **Embedding**: Mistral AI (embed-multilingual-v3.0)
- **Vector Database**: Pinecone (serverless, cosine similarity)
- **LLM**: Groq (Llama 3.3 70B)
- **File Processing**: PDF (pdf-parse), DOCX (mammoth)

---

## Data Schema

### Pinecone Vector Schema

Each document is stored with the following metadata structure:

```
Namespace: vault-{vaultId}-folder-{folderId}

Vector Record:
├── id: string           // "{vaultId}-{folderId}-{documentId}-{chunkIndex}"
├── values: float[]      // 1024-dimensional embedding vector
└── metadata:
    ├── vaultId: string       // UUID of the vault
    ├── folderId: string      // UUID of the folder
    ├── documentId: string    // UUID of the document
    ├── documentName: string  // Original file name
    ├── documentType: string  // File extension (pdf, docx, txt, md)
    ├── chunkIndex: number    // Index of chunk in document (0-based)
    ├── chunkText: string     // Actual text content of chunk
    ├── chunkCount: number    // Total chunks in document
    ├── summary: string       // LLM-generated document summary
    ├── uploadedAt: string   // ISO timestamp
    └── status: string        // "indexing" | "ready" | "failed"
```

### Document Metadata Schema

```typescript
interface Vault {
  id: string;              // UUID
  name: string;            // User-defined vault name
  description?: string;   // Optional description
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
  folderCount: number;    // Number of folders
  documentCount: number; // Total documents across folders
}

interface Folder {
  id: string;             // UUID
  vaultId: string;       // Parent vault ID
  name: string;          // Folder name
  description?: string;  // Optional description
  createdAt: string;     // ISO timestamp
  documentCount: number; // Documents in this folder
}

interface Document {
  id: string;            // UUID
  folderId: string;      // Parent folder ID
  name: string;          // Original file name
  type: string;          // File extension
  size: number;          // File size in bytes
  summary?: string;      // LLM-generated summary
  chunkCount: number;    // Total chunks indexed
  status: "pending" | "indexing" | "ready" | "failed";
  uploadedAt: string;   // ISO timestamp
  indexedAt?: string;   // When indexing completed
  error?: string;       // Error message if failed
}
```

---

## Pinecone Configuration

### Environment Variables

```
PINECONE_API_KEY=<your-api-key>
PINECONE_INDEX_NAME=legal-ai-assistant
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

### Index Specifications

- **Dimension**: 1024 (Mistral v3 embeddings)
- **Metric**: Cosine similarity
- **Spec**: Serverless (AWS us-east-1)
- **Deletion Protection**: Disabled

### Namespace Strategy

Namespaces separate data by vault and folder:
- Format: `vault-{vaultId}-folder-{folderId}`
- Allows filtering queries to specific folders
- Enables multi-tenant isolation

---

## Chunking Strategy

### Parameters
- **Chunk Size**: 1200 characters
- **Overlap**: 200 characters
- **Boundary Detection**: Splits at natural boundaries (paragraphs, sentences)

### Process
1. Extract text from file (PDF/DOCX/TXT/MD)
2. Normalize whitespace and formatting
3. Split into overlapping chunks
4. Preserve context with overlap
5. Generate embeddings for each chunk

### Text Normalization
- Remove carriage returns
- Replace tabs with spaces
- Collapse excessive newlines (3+ → 2)
- Trim leading/trailing whitespace

---

## API Endpoints

### Document Upload
```
POST /api/documents/upload
Content-Type: multipart/form-data

Fields:
- file: File (required)
- folderId: string (required)

Response:
{
  documentId: string,
  name: string,
  type: string,
  chunkCount: number,
  status: "indexing"
}
```

### Vault Management
```
POST /api/vaults          // Create vault
GET  /api/vaults         // List vaults
GET  /api/vaults/:id     // Get vault details
PUT  /api/vaults/:id     // Update vault
DELETE /api/vaults/:id   // Delete vault
```

### Folder Management
```
POST /api/folders        // Create folder
GET  /api/folders       // List folders
GET  /api/folders/:id    // Get folder details
PUT  /api/folders/:id    // Update folder
DELETE /api/folders/:id // Delete folder
```

### Chat
```
POST /api/chat
{
  folderId: string,
  question: string,
  history: Message[]
}

Response:
{
  answer: string,
  sources: Source[]
}
```

---

## File Size Limits

- **Maximum File Size**: 10 MB
- **Supported Formats**: PDF, DOCX, TXT, MD

---

## Processing Flow

1. **Upload** → Client uploads file to `/api/documents/upload`
2. **Extract** → Server extracts text from file
3. **Chunk** → Text split into overlapping chunks
4. **Embed** → Each chunk sent to Mistral for embedding
5. **Store** → Embeddings + metadata stored in Pinecone
6. **Summarize** → LLM generates document summary
7. **Query** → Chat queries use semantic search over chunks

---

## Security Considerations

- File type validation (PDF, DOCX, TXT, MD only)
- File size limit (10 MB max)
- Namespace isolation between vaults/folders
- No sensitive data in Pinecone metadata
- API keys stored in environment variables