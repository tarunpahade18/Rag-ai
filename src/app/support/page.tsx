export const metadata = {
  title: "Support - llmlite",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
        Support
      </h1>

      <div className="mt-8 space-y-6 text-[#4a3d31]">
        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Contact us</h2>
          <p className="mt-2">
            Email{" "}
            <a className="underline" href="mailto:support@llmlite.xyz">
              support@llmlite.xyz
            </a>{" "}
            for help with accounts, document imports, or AI assistant
            connections. We usually respond within two business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            Connecting an assistant
          </h2>
          <p className="mt-2">
            Sign in, open Settings, and create a plugin key for Cursor or Grok.
            For ChatGPT and other OAuth clients, use the MCP server URL{" "}
            <code>https://www.llmlite.xyz/api/mcp</code> and approve the
            connection when prompted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            Importing documents
          </h2>
          <p className="mt-2">
            Use the web app to upload PDF, DOCX, TXT, or MD files, or let a
            connected assistant call the import tool with plain text. Indexing
            may take a few moments for large documents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            Security and access
          </h2>
          <p className="mt-2">
            Revoke plugin keys from Settings at any time. OAuth connections can
            be removed from the assistant that created them. Contact support if
            you believe your account or documents were accessed without
            permission.
          </p>
        </section>
      </div>
    </div>
  );
}
