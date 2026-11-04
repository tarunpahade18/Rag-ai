import { NextRequest, NextResponse } from "next/server";

import type { ChatHistoryMessage } from "@/lib/answer";
import { getSession } from "@/lib/auth";
import {
  askDocuments,
  createFolder,
  createVault,
  ingestTextDocument,
  listDocuments,
  listFolders,
  listVaults,
  ToolError,
} from "@/lib/plugin-tools";
import { TOOL_SCHEMAS } from "@/lib/plugin-tool-schemas";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, mcp-session-id",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function rpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function toolResult(data: unknown) {
  return {
    content: [
      {
        type: "text",
        text:
          typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
    isError: false,
  };
}

function toolError(message: string) {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

async function callTool(
  userId: string,
  name: string,
  args: Record<string, unknown>,
) {
  switch (name) {
    case "list_vaults":
      return toolResult(await listVaults(userId));
    case "create_vault":
      return toolResult(
        await createVault(userId, {
          name: args.name as string | undefined,
          description: args.description as string | undefined,
        }),
      );
    case "list_folders":
      return toolResult(
        await listFolders(userId, args.vaultId as string | undefined),
      );
    case "create_folder":
      return toolResult(
        await createFolder(userId, {
          vaultId: args.vaultId as string | undefined,
          name: args.name as string | undefined,
          description: args.description as string | undefined,
        }),
      );
    case "list_documents":
      return toolResult(
        await listDocuments(userId, args.folderId as string | undefined),
      );
    case "ask_documents":
      return toolResult(
        await askDocuments(userId, {
          question: args.question as string | undefined,
          vaultId: args.vaultId as string | undefined,
          folderId: args.folderId as string | undefined,
          topK: args.topK as number | undefined,
          history: args.history as ChatHistoryMessage[] | undefined,
        }),
      );
    case "ingest_text_document":
      return toolResult(
        await ingestTextDocument(userId, {
          name: args.name as string | undefined,
          text: args.text as string | undefined,
          vaultId: args.vaultId as string | undefined,
          folderId: args.folderId as string | undefined,
          vaultName: args.vaultName as string | undefined,
          folderName: args.folderName as string | undefined,
        }),
      );
    default:
      throw new ToolError(`Unknown tool: ${name}`, 404);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    rpcError(null, -32000, "This MCP server uses the POST transport."),
    { status: 405, headers: { ...CORS_HEADERS, Allow: "POST, OPTIONS" } },
  );
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(rpcError(null, -32001, "Unauthorized"), {
      status: 401,
      headers: CORS_HEADERS,
    });
  }

  let body: JsonRpcRequest;

  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error"), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const { id, method, params } = body;

  if (!method) {
    return NextResponse.json(rpcError(id, -32600, "Invalid request"), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  if (id === undefined) {
    return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
  }

  try {
    switch (method) {
      case "initialize":
        return NextResponse.json(
          rpcResult(id, {
            protocolVersion:
              (params?.protocolVersion as string | undefined) ?? "2025-06-18",
            capabilities: { tools: {} },
            serverInfo: {
              name: "llmlite-legal-assistant",
              version: "1.0.0",
            },
          }),
          { headers: CORS_HEADERS },
        );
      case "ping":
        return NextResponse.json(rpcResult(id, {}), {
          headers: CORS_HEADERS,
        });
      case "tools/list":
        return NextResponse.json(rpcResult(id, { tools: TOOL_SCHEMAS }), {
          headers: CORS_HEADERS,
        });
      case "tools/call": {
        const name = params?.name as string | undefined;
        const args = (params?.arguments ?? {}) as Record<string, unknown>;

        if (!name) {
          return NextResponse.json(
            rpcError(id, -32602, "Tool name is required"),
            { status: 400, headers: CORS_HEADERS },
          );
        }

        try {
          const result = await callTool(session.userId, name, args);
          return NextResponse.json(rpcResult(id, result), {
            headers: CORS_HEADERS,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Tool execution failed.";
          return NextResponse.json(rpcResult(id, toolError(message)), {
            headers: CORS_HEADERS,
          });
        }
      }
      case "resources/list":
        return NextResponse.json(rpcResult(id, { resources: [] }), {
          headers: CORS_HEADERS,
        });
      case "prompts/list":
        return NextResponse.json(rpcResult(id, { prompts: [] }), {
          headers: CORS_HEADERS,
        });
      case "logging/setLevel":
        return NextResponse.json(rpcResult(id, {}), {
          headers: CORS_HEADERS,
        });
      default:
        return NextResponse.json(
          rpcError(id, -32601, `Method not found: ${method}`),
          { status: 200, headers: CORS_HEADERS },
        );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal error.";
    return NextResponse.json(rpcError(id, -32603, message), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
