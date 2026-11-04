# llmlite Assistant

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

## ChatGPT Plugin / GPT Action

This app ships a ChatGPT plugin manifest and an OpenAPI 3.0 spec.

- Manifest: `/.well-known/ai-plugin.json`
- OpenAPI: `/openapi.json`
- Logo: `/plugin-logo.png`
- Legal page: `/legal`

### 1. Configure

Add these environment variables (see `.env.example`):

```bash
PLUGIN_BASE_URL=https://your-public-domain.com
CHATGPT_PLUGIN_VERIFICATION_TOKEN=<token from OpenAI>
PLUGIN_CONTACT_EMAIL=support@llmlite.xyz
```

`PLUGIN_BASE_URL` must be a public HTTPS origin. For local testing, expose
`localhost:3000` with a tunnel (for example `ngrok http 3000`) and set
`PLUGIN_BASE_URL` to the tunnel URL.

### 2. Create a bearer key

Sign in, open **Settings**, and click **Generate plugin key**. Copy the
`sk_plugin_...` value immediately; it is only shown once. Revoke keys from the
same card.

### 3. Install / submit

1. Serve the app over HTTPS.
2. Verify `https://www.llmlite.xyz/.well-known/ai-plugin.json` and
   `https://www.llmlite.xyz/openapi.json` are reachable without auth.
3. In the ChatGPT plugin submission flow (or the GPT editor's **Actions**
   screen), point the manifest/spec at those URLs and use the bearer key as the
   service auth credential.
4. Paste the verification token from OpenAI into
   `CHATGPT_PLUGIN_VERIFICATION_TOKEN` before submitting.

> Note: OpenAI retired the public plugin directory in favor of GPT Actions. The
> same manifest and OpenAPI spec work as a GPT Action; you can import
> `/openapi.json` directly in the GPT editor.

### Plugin endpoints

| Operation | Endpoint |
| --- | --- |
| List vaults | `GET /api/vaults` |
| Create vault | `POST /api/vaults` |
| List folders | `GET /api/folders?vaultId=...` |
| Create folder | `POST /api/folders` |
| List documents | `GET /api/documents?folderId=...` |
| Retrieve memory passages | `POST /api/plugin/search` |
| Ask a question (server LLM) | `POST /api/plugin/ask` |
| Import text | `POST /api/plugin/documents/ingest` |

All plugin endpoints accept `Authorization: Bearer sk_plugin_...`. The search
and ask endpoints search every folder when `vaultId` and `folderId` are omitted.

### Use your own AI with our memory

The recommended flow is **memory only**: the host assistant (Claude, ChatGPT,
Grok, or Cursor) does the reasoning and this app only stores/retrieves the
user's documents.

- Call `search_documents` (MCP) or `POST /api/plugin/search` to get relevant
  passages, document names, page numbers, and scores.
- Answer with the host model using those passages. No OpenRouter call is made.
- `ask_documents` remains available as an optional server-side answer generator,
  but it is not required.

This means Claude/Grok/ChatGPT can use their own model and context while this
app acts as persistent private memory across sessions.

## Use from Claude, ChatGPT, Cursor, and Grok

The same tools are exposed in four formats:

| Client | Integration | URL |
| --- | --- | --- |
| ChatGPT | GPT Action / plugin | `https://www.llmlite.xyz/openapi.json` |
| Claude / Cursor | Remote MCP server | `https://www.llmlite.xyz/api/mcp` |
| Grok / xAI API | OpenAI-compatible tool schemas | `https://www.llmlite.xyz/api/plugin/tools` |
| Any HTTP client | REST | `https://www.llmlite.xyz/api/plugin/ask` |

MCP tools: `list_vaults`, `create_vault`, `list_folders`, `create_folder`,
`list_documents`, `search_documents`, `ask_documents`, `ingest_text_document`.

### Claude / Cursor MCP config

Add this to the MCP config (`mcp.example.json` is included):

```json
{
  "mcpServers": {
    "llmlite-legal": {
      "url": "https://www.llmlite.xyz/api/mcp",
      "headers": {
        "Authorization": "Bearer sk_plugin_REPLACE_ME"
      }
    }
  }
}
```

For Claude Desktop versions that only support stdio servers, bridge the remote
server with `mcp-remote`:

```json
{
  "mcpServers": {
    "llmlite-legal": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.llmlite.xyz/api/mcp",
        "--header",
        "Authorization: Bearer sk_plugin_REPLACE_ME"
      ]
    }
  }
}
```

### Grok / xAI

Fetch the OpenAI-compatible tool definitions and pass them to the xAI chat
completions call:

```ts
const tools = await fetch("https://www.llmlite.xyz/api/plugin/tools").then(
  (response) => response.json(),
);

const response = await fetch("https://api.x.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.XAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "grok-4",
    messages,
    tools: tools.tools,
  }),
});
```

When Grok returns a `tool_calls` entry, send the arguments to the matching REST
endpoint with the `sk_plugin_...` bearer key, then return the JSON result as the
tool message. The agent can list vaults, create folders, ingest text, and ask
grounded questions without any client-specific code.

## Testing Instructions

Use these checks for the plugin submission form or for local verification.

### 1. Public discovery URLs

```bash
curl -s https://www.llmlite.xyz/.well-known/ai-plugin.json
curl -s https://www.llmlite.xyz/openapi.json
curl -s https://www.llmlite.xyz/api/plugin/tools
```

All three must return `200` without a session cookie.

### 2. Create a key

Sign in at `/auth`, open `/settings`, click **Generate plugin key**, and copy
the `sk_plugin_...` value.

### 3. MCP smoke test

```bash
curl -s https://www.llmlite.xyz/api/mcp \
  -H "Authorization: Bearer sk_plugin_REPLACE_ME" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}'

curl -s https://www.llmlite.xyz/api/mcp \
  -H "Authorization: Bearer sk_plugin_REPLACE_ME" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

curl -s https://www.llmlite.xyz/api/mcp \
  -H "Authorization: Bearer sk_plugin_REPLACE_ME" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_vaults","arguments":{}}}'
```

### 4. Memory-only retrieval test (recommended)

```bash
curl -s https://www.llmlite.xyz/api/plugin/search \
  -H "Authorization: Bearer sk_plugin_REPLACE_ME" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the notice period in these documents?"}'
```

Expected result: a `sources` array with document names, page numbers, excerpts,
and scores. No generated answer is returned, because the host AI is responsible
for reasoning.

### 5. Optional server-side ask test

```bash
curl -s https://www.llmlite.xyz/api/plugin/ask \
  -H "Authorization: Bearer sk_plugin_REPLACE_ME" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the notice period in these documents?"}'
```

Expected result: an `answer` string plus a `sources` array. If the account has no
documents, the answer explains that no supporting passages were found.

### 6. ChatGPT

1. Open the GPT editor and add an Action.
2. Import `https://www.llmlite.xyz/openapi.json`.
3. Set authentication to **API Key / Bearer** and paste the `sk_plugin_...` key.
4. Test with: "List my legal vaults" and then "What is the notice period?"

### 7. Claude / Cursor

Add the MCP config above, restart the client, and ask it to list vaults. The
client should call `list_vaults` and then `ask_documents` when you ask a
document question.

### 8. Grok

Fetch `/api/plugin/tools`, pass the tools to xAI, and confirm a `tool_calls`
response for a prompt such as "List my legal vaults". Return the REST endpoint
result as the tool message.

## OpenAI Plugin Directory Submission

OpenAI's plugin portal does **not** support API-key/bearer MCP connections. It supports no-auth, OAuth, or mixed auth. This repo includes an OAuth flow for the MCP server.

### OAuth endpoints

- `/.well-known/oauth-authorization-server` (discovery)
- `/.well-known/oauth-protected-resource` (resource metadata)
- `POST /api/oauth/register` (dynamic client registration)
- `GET /api/oauth/authorize` (authorization code + PKCE)
- `POST /api/oauth/token` (authorization_code + refresh_token)

Set `OPENAI_APPS_CHALLENGE_TOKEN` to the exact token shown in the portal. It is served at:

```text
https://www.llmlite.xyz/.well-known/openai-apps-challenge
```

### Build the plugin ZIP

The package lives in `plugin-package/`:

```text
plugin-package/
+-- plugin.json
+-- mcp.json
+-- skills/get-started/SKILL.md
+-- assets/logo.png, icon.png
```

Create the ZIP:

```bash
npm run plugin:zip
```

Upload `llmlite-plugin.zip` in the OpenAI Plugins dashboard, connect the MCP server, complete domain verification, run the tool scan, then submit for review.

### Review materials

- 5 positive and 3 negative test cases are in `plugin.json`.
- Replace the placeholder `demo_recording_url` with a real walkthrough video.
- Enter reviewer credentials separately in **Review details**.
- Keep `https://www.llmlite.xyz/support`, `/privacy`, and `/terms` reachable.
