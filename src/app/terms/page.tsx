export const metadata = {
  title: "Terms - llmlite",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
        Terms of Service
      </h1>

      <div className="mt-8 space-y-6 text-[#4a3d31]">
        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Use of the service</h2>
          <p className="mt-2">
            llmlite provides document storage, retrieval, and search tools. You
            may use the service only with documents you are authorized to
            process. You are responsible for your account and for the access
            keys and OAuth connections you approve.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            No legal advice
          </h2>
          <p className="mt-2">
            The service is not a law firm and does not provide legal advice.
            Answers and retrieved passages may be incomplete or incorrect.
            Verify important information against the original document and
            consult a qualified professional before acting on it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">
            Availability and changes
          </h2>
          <p className="mt-2">
            We may update, suspend, or discontinue parts of the service. We aim
            to keep the API and plugin tools stable, but features may change as
            the product evolves.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#2b1d10]">Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to{" "}
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
