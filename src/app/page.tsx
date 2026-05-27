import Link from "next/link"
import { Check, FileText, MessageSquare, Shield, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: FileText,
    title: "Smart Document Analysis",
    description: "Upload legal documents and get instant AI-powered analysis of clauses, terms, and potential risks.",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Q&A",
    description: "Ask questions about your documents in natural language and receive accurate, source-cited answers.",
  },
  {
    icon: Shield,
    title: "Secure Vault",
    description: "Your documents are encrypted and stored securely. Role-based access control keeps data safe.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find relevant information across thousands of documents using AI-powered semantic search.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Documents are processed and indexed in real-time, ready for querying within seconds.",
  },
  {
    icon: Check,
    title: "Citation Accuracy",
    description: "Every answer includes precise source citations so you can verify the original context.",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out the platform",
    features: [
      "Up to 5 documents",
      "Basic Q&A",
      "Single vault",
      "Community support",
    ],
    cta: "Get Started",
    href: "/auth",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$20",
    period: "/month",
    description: "For legal professionals and small firms",
    features: [
      "Unlimited documents",
      "Advanced AI analysis",
      "Multiple vaults & folders",
      "Batch document processing",
      "Source-cited responses",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/auth",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large law firms and organizations",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise deployment",
      "24/7 premium support",
    ],
    cta: "Contact Sales",
    href: "/auth",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f1e6]">
      <header className="border-b border-[#e8dcc8] bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-[#8c5c2b]" />
            <span className="font-display text-xl font-semibold text-[#2b1d10]">
              Legal AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-medium text-[#6d6258] transition hover:text-[#2b1d10]"
            >
              Sign In
            </Link>
            <Link href="/auth">
              <Button className="bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <h1 className="font-display text-5xl font-bold leading-tight text-[#2b1d10] md:text-6xl">
          Your AI-Powered
          <br />
          <span className="text-[#8c5c2b]">Legal Document Assistant</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6d6258]">
          Upload, analyze, and query legal documents with AI. Get instant answers
          with precise source citations, manage document vaults, and streamline
          your legal research workflow.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/auth">
            <Button className="h-11 bg-[#2b1d10] px-8 text-base text-[#f8f1e6] hover:bg-[#402816]">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/auth">
            <Button
              variant="outline"
              className="h-11 border-[#d4c4a8] px-8 text-base text-[#2b1d10]"
            >
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-[#e8dcc8] bg-white/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-center text-3xl font-semibold text-[#2b1d10]">
            Everything you need for legal document management
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[#6d6258]">
            Powerful tools designed for legal professionals who need to process
            and analyze documents efficiently.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[#e8dcc8] bg-white/80 p-6 transition hover:border-[#d4c4a8] hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f4e7d5]">
                  <feature.icon className="h-6 w-6 text-[#8c5c2b]" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-[#2b1d10]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6d6258]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-center text-3xl font-semibold text-[#2b1d10]">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[#6d6258]">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 transition ${
                  plan.highlighted
                    ? "border-[#8c5c2b] bg-white shadow-lg"
                    : "border-[#e8dcc8] bg-white/80 hover:border-[#d4c4a8]"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full bg-[#f4e7d5] px-3 py-1 text-xs font-medium text-[#8c5c2b]">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-xl font-semibold text-[#2b1d10]">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#2b1d10]">{plan.price}</span>
                  {plan.period && (
                    <span className="text-[#6d6258]">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[#6d6258]">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#2b1d10]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4a7c59]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={`mt-8 w-full ${
                      plan.highlighted
                        ? "bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]"
                        : "border-[#d4c4a8] text-[#2b1d10]"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8dcc8] bg-[#2b1d10] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold text-[#f8f1e6]">
            Ready to transform your legal workflow?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#c4b4a8]">
            Join legal professionals who trust Legal AI to analyze, manage, and
            query their documents with unprecedented accuracy.
          </p>
          <Link href="/auth">
            <Button className="mt-8 h-12 bg-[#f8f1e6] px-10 text-base font-medium text-[#2b1d10] hover:bg-[#e8dcc8]">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e8dcc8] bg-white/60 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-sm text-[#6d6258]">
          <p>&copy; {new Date().getFullYear()} Legal AI Assistant. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="transition hover:text-[#2b1d10]">Sign In</Link>
            <Link href="/auth" className="transition hover:text-[#2b1d10]">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Scale(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v20" />
      <path d="M5 5h14" />
      <path d="M5 19h14" />
      <path d="M5 5L3 19h18L19 5" />
    </svg>
  )
}
