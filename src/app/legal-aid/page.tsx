"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, BookOpen, Gavel, Landmark } from "lucide-react";

const resources = [
  {
    title: "Contract Law Basics",
    description: "Understanding fundamental contract principles and terminology",
    icon: BookOpen,
  },
  {
    title: "Litigation Process",
    description: "Step-by-step guide to civil litigation procedures",
    icon: Gavel,
  },
  {
    title: "Corporate Governance",
    description: "Legal frameworks for business entity management",
    icon: Landmark,
  },
  {
    title: "Legal Research",
    description: "Methods and tools for effective legal research",
    icon: Scale,
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
          Resources and guides to assist with legal research
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {resources.map((resource) => (
          <Card
            key={resource.title}
            className="border-[#d4c4a8] bg-white/80 shadow-sm transition hover:border-[#8c5c2b] hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2b1d10]">
                <resource.icon className="h-6 w-6 text-[#f8f1e6]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2b1d10]">{resource.title}</h3>
                <p className="mt-1 text-sm text-[#6d6258]">{resource.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-[#d4c4a8] bg-white/80 shadow-sm">
        <CardHeader className="border-b border-[#e8dcc8]">
          <CardTitle className="text-lg font-semibold text-[#2b1d10]">
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[#e8dcc8] p-4 text-center">
              <p className="text-sm font-medium text-[#2b1d10]">Statute of Limitations</p>
              <p className="mt-1 text-xs text-[#6d6258]">Varies by jurisdiction</p>
            </div>
            <div className="rounded-lg border border-[#e8dcc8] p-4 text-center">
              <p className="text-sm font-medium text-[#2b1d10]">Breach of Contract</p>
              <p className="mt-1 text-xs text-[#6d6258]">4-6 years typically</p>
            </div>
            <div className="rounded-lg border border-[#e8dcc8] p-4 text-center">
              <p className="text-sm font-medium text-[#2b1d10]">Personal Injury</p>
              <p className="mt-1 text-xs text-[#6d6258]">2-3 years typically</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}