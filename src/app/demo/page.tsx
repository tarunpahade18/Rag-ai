export const metadata = {
  title: "Demo - llmlite Memory",
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
        llmlite Memory — Demo Walkthrough
      </h1>
      <p className="mt-3 text-[#6d6258]">
        A short walkthrough of the MCP connection and the document-memory flow.
      </p>

      <div className="mt-8 space-y-6 text-[#4a3d31]">
        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">1. Connect</h2>
          <p className="mt-2">
            Add the MCP server at{" "}
            <code>https://www.llmlite.xyz/api/mcp</code>. Sign in at{" "}
            <a className="underline" href="/auth">
              /auth
            </a>{" "}
            and approve the OAuth connection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            2. List memory
          </h2>
          <p className="mt-2">
            Ask: <strong>“List my legal vaults.”</strong> The assistant calls{" "}
            <code>list_vaults</code> and returns the account’s vaults, folders,
            and document counts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            3. Import a document
          </h2>
          <p className="mt-2">
            Ask: <strong>“Save this as sample.txt: This Agreement may be
            terminated by either party with thirty (30) days written
            notice.”</strong> The assistant calls{" "}
            <code>ingest_text_document</code> and returns a document ID and
            chunk count.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            4. Retrieve with citations
          </h2>
          <p className="mt-2">
            Ask: <strong>“What is the notice period in sample.txt?”</strong>{" "}
            The assistant calls <code>search_documents</code>, receives the
            passage containing “thirty (30) days”, and answers with a citation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            5. Negative test
          </h2>
          <p className="mt-2">
            Ask about a document that does not exist. The assistant should say
            that no supporting passages were found instead of inventing an
            answer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Video</h2>
          <p className="mt-2">
            A recorded walkthrough can be added here before review. The steps
            above cover the same flow.
          </p>
        </section>
      </div>
    </div>
  );
}
