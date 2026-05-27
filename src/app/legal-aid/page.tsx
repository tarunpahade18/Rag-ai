"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Scale, Gavel, Library, ArrowRight } from "lucide-react";
import Link from "next/link";

const resources = [
  {
    title: "Contract Analysis",
    description: "Upload contracts and get AI-powered clause analysis, risk detection, and compliance checks.",
    icon: BookOpen,
    link: "/vault",
    action: "Go to Vault",
  },
  {
    title: "Legal Q&A",
    description: "Ask questions about your documents and get instant answers with precise source citations.",
    icon: Gavel,
    link: "/chat",
    action: "Start Chatting",
  },
  {
    title: "Document Management",
    description: "Organize legal documents into vaults and folders with full-text search capabilities.",
    icon: Library,
    link: "/documents",
    action: "View Documents",
  },
  {
    title: "Secure Research",
    description: "End-to-end encrypted document storage with role-based access control for sensitive legal materials.",
    icon: Scale,
    link: "/security",
    action: "Security Settings",
  },
];

export default function LegalAidPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Legal Aid
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Tools and features to streamline your legal workflow
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {resources.map((resource) => (
          <Card
            key={resource.title}
            className="border-[#d4c4a8] bg-white/80 shadow-sm transition hover:border-[#c4b4a8]"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4e7d5]">
                  <resource.icon className="h-5 w-5 text-[#8c5c2b]" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                    {resource.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#6d6258]">{resource.description}</p>
              <Link
                href={resource.link}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#8c5c2b] hover:text-[#2b1d10]"
              >
                {resource.action}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-[#e8dcc8] p-3">
              <p className="font-medium text-[#2b1d10]">1. Create a Vault</p>
              <p className="text-sm text-[#6d6258]">Organize your documents into secure vaults and folders</p>
            </div>
            <div className="rounded-lg border border-[#e8dcc8] p-3">
              <p className="font-medium text-[#2b1d10]">2. Upload Documents</p>
              <p className="text-sm text-[#6d6258]">Upload PDF, DOCX, or TXT files for AI-powered analysis</p>
            </div>
            <div className="rounded-lg border border-[#e8dcc8] p-3">
              <p className="font-medium text-[#2b1d10]">3. Ask Questions</p>
              <p className="text-sm text-[#6d6258]">Query your documents in natural language and get cited answers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}