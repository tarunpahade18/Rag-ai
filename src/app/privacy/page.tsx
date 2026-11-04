export const metadata = {
  title: "Privacy - llmlite",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
        Privacy Policy
      </h1>

      <div className="mt-8 space-y-6 text-[#4a3d31]">
        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">What we store</h2>
          <p className="mt-2">
            We store the account details you provide, the documents you upload
            or import, and the embeddings and metadata needed to search those
            documents. Plugin and OAuth access tokens are stored as hashes or
            signed tokens and can be revoked from Settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            How documents are used
          </h2>
          <p className="mt-2">
            Document text is chunked, embedded, and stored in a vector database
            so that you or a connected AI assistant can retrieve relevant
            passages. We do not sell your documents or use them to train public
            models.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            Connected assistants
          </h2>
          <p className="mt-2">
            When you connect ChatGPT, Claude, Grok, or Cursor, that assistant
            may send search queries and receive matching passages. Review the
            privacy policy of the assistant you connect before sharing
            sensitive documents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Deletion</h2>
          <p className="mt-2">
            You can delete documents, revoke access keys, or delete your account
            from the application. Deleting your account removes your vaults,
            documents, and search indexes associated with it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Contact</h2>
          <p className="mt-2">
            Privacy questions can be sent to{" "}
            <a className="underline" href="mailto:support@llmlite.xyz">
              support@llmlite.xyz
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
