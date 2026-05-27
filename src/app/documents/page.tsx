"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function DocumentsPage() {
  const [stats, setStats] = useState<{
    documents: number;
    documentsReady: number;
    documentsPending: number;
    documentsFailed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Documents
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Overview of all your legal documents
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#6d6258]">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-[#8c5c2b]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2b1d10]">
              {loading ? "-" : stats?.documents ?? 0}
            </div>
            <p className="mt-1 text-xs text-[#6d6258]">All uploaded documents</p>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#6d6258]">
              Indexed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#4a7c59]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2b1d10]">
              {loading ? "-" : stats?.documentsReady ?? 0}
            </div>
            <p className="mt-1 text-xs text-[#6d6258]">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#6d6258]">
              Processing
            </CardTitle>
            <Clock className="h-4 w-4 text-[#8c5c2b]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2b1d10]">
              {loading ? "-" : stats?.documentsPending ?? 0}
            </div>
            <p className="mt-1 text-xs text-[#6d6258]">Currently being indexed</p>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#6d6258]">
              Failed
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-[#842029]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#2b1d10]">
              {loading ? "-" : stats?.documentsFailed ?? 0}
            </div>
            <p className="mt-1 text-xs text-[#6d6258]">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Document List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="py-8 text-center text-[#6d6258]">
              Upload documents from the Vault to see them listed here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}