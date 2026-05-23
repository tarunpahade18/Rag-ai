# Legal AI Assistant

Next.js legal document chat application with:

- `Mistral` for embeddings
- `Pinecone` as the vector database
- `Groq` for answer generation
- document upload + chunking + RAG + visible sources

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in:

```bash
MISTRAL_API_KEY=...
GROQ_API_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=legal-rag
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

3. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Pinecone Notes

This app uses `mistral-embed`, which returns `1024`-dimension vectors. The server will try to create the Pinecone index automatically if it does not exist yet, using:

- metric: `cosine`
- dimension: `1024`
- cloud/region from `PINECONE_CLOUD` and `PINECONE_REGION`

## Supported Files

- `.pdf`
- `.docx`
- `.txt`
- `.md`

## App Flow

1. Upload a document.
2. The server extracts text, chunks it, creates Mistral embeddings, and stores the vectors in a dedicated Pinecone namespace.
3. Ask a question.
4. The server retrieves the most relevant chunks from Pinecone and sends them to Groq as grounding context.
5. The UI shows the answer and the source excerpts used for retrieval.
