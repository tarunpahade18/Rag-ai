"use client"

import Link from "next/link"
import { Check, FileText, MessageSquare, Shield, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: FileText,
    title: "Smart Document Analysis",
    description: "Upload any documents and get instant AI-powered analysis of key clauses, terms, and potential risks.",
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
    action: "free" as const,
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$20",
    period: "/month",
    description: "For power users and small teams",
    features: [
      "Unlimited documents",
      "Advanced AI analysis",
      "Multiple vaults & folders",
      "Batch document processing",
      "Source-cited responses",
      "Priority support",
    ],
    cta: "Start Free Trial",
    action: "pro" as const,
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
      "On-premise deployment",
      "24/7 premium support",
    ],
    cta: "Contact Sales",
    action: "enterprise" as const,
    highlighted: false,
  },
]

export default function LandingPage() {
  const handleCheckout = () => {
    window.location.href = "https://checkout.dodopayments.com/buy/pdt_0Nfv3lgHiPe5x0mlylFoO?quantity=1"
  }

  const handlePlanClick = (action: string) => {
    if (action === "free") {
      window.location.href = "/auth"
    } else if (action === "pro") {
      handleCheckout()
    } else if (action === "enterprise") {
      window.location.href = "mailto:support@llmlite.com"
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f1e6]">
      <header className="border-b border-[#e8dcc8] bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <BrainIcon className="h-6 w-6 text-[#8c5c2b]" />
            <span className="font-display text-xl font-semibold text-[#2b1d10]">
              llmlite
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
          RAG your documents
          <span className="text-[#8c5c2b]">?</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6d6258]">
          Upload, analyze, and query any documents with AI. Get instant answers
          with precise source citations, manage document vaults, and streamline
          your research workflow.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/auth">
            <Button className="h-11 bg-[#2b1d10] px-8 text-base text-[#f8f1e6] hover:bg-[#402816]">
              Start Free
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
            Everything you need for document intelligence
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-[#6d6258]">
            Powerful tools designed for anyone who needs to process
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
                <Button
                  onClick={() => handlePlanClick(plan.action)}
                  className={`mt-8 w-full ${
                    plan.highlighted
                      ? "bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]"
                      : "border-[#d4c4a8] text-[#2b1d10]"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8dcc8] bg-[#2b1d10] py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold text-[#f8f1e6]">
            Ready to transform your document workflow?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#c4b4a8]">
            Join users who trust llmlite to analyze, manage, and
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
          <p>&copy; {new Date().getFullYear()} llmlite. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="transition hover:text-[#2b1d10]">Sign In</Link>
            <Link href="/auth" className="transition hover:text-[#2b1d10]">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BrainIcon(props: React.ComponentProps<"svg">) {
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
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  )
}
