"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Filter } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Documents
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Browse and manage all your indexed legal documents
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e7d5]">
              <FileText className="h-6 w-6 text-[#8c5c2b]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b1d10]">24</p>
              <p className="text-sm text-[#6d6258]">Total Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f4e8]">
              <FileText className="h-6 w-6 text-[#4a7c59]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b1d10]">18</p>
              <p className="text-sm text-[#6d6258]">Indexed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3cd]">
              <FileText className="h-6 w-6 text-[#b66d0d]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b1d10]">4</p>
              <p className="text-sm text-[#6d6258]">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8d7da]">
              <FileText className="h-6 w-6 text-[#842029]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2b1d10]">2</p>
              <p className="text-sm text-[#6d6258]">Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-[#d4c4a8] bg-white/80 shadow-sm">
        <CardHeader className="border-b border-[#e8dcc8]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              All Documents
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-[#6d6258]">
              <Filter className="h-4 w-4" />
              <span>Filter and sort</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center text-[#6d6258]">
          <FileText className="mx-auto h-12 w-12 text-[#d4c4a8]" />
          <p className="mt-4">View all documents with advanced filtering</p>
          <p className="text-sm text-[#8c7359]">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}