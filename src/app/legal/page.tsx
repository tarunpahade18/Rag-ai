export const metadata = {
  title: "Legal - llmlite Legal Assistant",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
        Legal Information
      </h1>

      <div className="mt-8 space-y-6 text-[#4a3d31]">
        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Service</h2>
          <p className="mt-2">
            llmlite Legal Assistant is a retrieval-augmented research tool. It
            searches documents that you upload and returns answers with cited
            source excerpts. It is not a law firm and does not provide legal
            advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Your data</h2>
          <p className="mt-2">
            Uploaded documents are stored in your account and indexed so that
            you can search them. Plugin access keys can be revoked at any time
            from the Settings page. Do not upload documents that you are not
            authorized to process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            Answers and citations
          </h2>
          <p className="mt-2">
            Answers are generated from retrieved excerpts and may be incomplete
            or incorrect. Always verify important information against the
            original document and consult a qualified professional before acting
            on it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Contact</h2>
          <p className="mt-2">
            Questions about the plugin or this policy can be sent to{" "}
            <a
              className="underline"
              href="mailto:support@llmlite.xyz"
            >
              support@llmlite.xyz
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
