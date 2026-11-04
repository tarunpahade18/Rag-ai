export function getPluginBaseUrl(request?: Request) {
  const configured =
    process.env.PLUGIN_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (request) {
    const url = new URL(request.url);
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      url.protocol.replace(":", "");
    const host =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      url.host;

    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

const DESCRIPTION_FOR_MODEL = `You are the llmlite memory plugin. Use it whenever the user asks about their own legal documents, contracts, policies, or case files. This plugin supplies the user's private document memory; you supply the reasoning.

Workflow:
1. Call listVaults to see the user's document vaults.
2. Call listFolders with the relevant vaultId, then listDocuments if you need to confirm what is covered.
3. Call searchDocuments with the query and, when known, vaultId and folderId. Omit those fields to search all of the user's documents. This returns passages only and does not use a server-side model.
4. Answer the user yourself from the returned passages. Cite them as [1], [2], matching the source order, and mention the document name and page number when available. If no passages are returned, say so instead of guessing.
5. Use askDocuments only when the user explicitly asks for the server's own generated answer.
6. To add a document, call ingestTextDocument with the full plain text and a file name such as "lease.pdf". Create a vault or folder first only when the user wants a specific location.
7. Never invent statutes, clauses, dates, or citations. Do not use this plugin for general legal advice unrelated to the user's uploaded documents.`;

export function buildPluginManifest(baseUrl: string) {
  const verificationToken =
    process.env.CHATGPT_PLUGIN_VERIFICATION_TOKEN?.trim();
  const contactEmail =
    process.env.PLUGIN_CONTACT_EMAIL?.trim() || "support@llmlite.xyz";
  const legalUrl =
    process.env.PLUGIN_LEGAL_URL?.trim() || `${baseUrl}/legal`;

  return {
    schema_version: "v1",
    name_for_human: "llmlite Legal Assistant",
    name_for_model: "llmlite_legal_assistant",
    description_for_human:
      "Ask questions across your legal document vaults and get answers with cited sources.",
    description_for_model: DESCRIPTION_FOR_MODEL,
    auth: {
      type: "service_http",
      authorization_type: "bearer",
      ...(verificationToken
        ? { verification_tokens: { openai: verificationToken } }
        : {}),
    },
    api: {
      type: "openapi",
      url: `${baseUrl}/openapi.json`,
      is_user_authenticated: false,
    },
    logo_url: `${baseUrl}/plugin-logo.png`,
    contact_email: contactEmail,
    legal_info_url: legalUrl,
  };
}
