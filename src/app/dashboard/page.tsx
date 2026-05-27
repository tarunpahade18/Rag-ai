"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Scale, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  documents: number;
  documentsReady: number;
  documentsPending: number;
  documentsFailed: number;
  chats: number;
  vaults: number;
}

interface Activity {
  type: "document" | "chat";
  title: string;
  action: string;
  time: string;
  id: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats);
          setActivity(data.recentActivity || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Documents",
      value: stats?.documents ?? "-",
      icon: FileText,
      description: `${stats?.documentsReady ?? 0} ready · ${stats?.documentsPending ?? 0} pending`,
      change: stats ? `${stats.documentsReady} indexed` : "",
    },
    {
      title: "Chats",
      value: stats?.chats ?? "-",
      icon: MessageSquare,
      description: "Total conversations",
      change: `${stats?.vaults ?? 0} vaults`,
    },
    {
      title: "Vaults",
      value: stats?.vaults ?? "-",
      icon: Scale,
      description: "Active document vaults",
      change: `${(stats?.documents ?? 0) > 0 ? `${stats?.documents} total docs` : "No documents yet"}`,
    },
    {
      title: "Status",
      value: stats ? `${Math.round((stats.documentsReady / Math.max(stats.documents, 1)) * 100)}%` : "-",
      icon: TrendingUp,
      description: "Documents indexed",
      change: stats?.documentsFailed ? `${stats.documentsFailed} failed` : "All healthy",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8c5c2b]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Welcome back{user?.username ? `, ${user.username}` : ""}
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Here&apos;s what&apos;s happening with your legal workspace
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-[#d4c4a8] bg-white/80 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#6d6258]">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[#8c5c2b]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#2b1d10]">{stat.value}</div>
              <p className="mt-1 text-xs text-[#6d6258]">{stat.description}</p>
              <p className="mt-2 text-xs font-medium text-[#8c5c2b]">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#6d6258]">
                No activity yet. Upload a document to get started.
              </p>
            ) : (
              activity.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-4 rounded-lg border border-[#e8dcc8] p-3"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      item.type === "document"
                        ? "bg-[#f4e7d5]"
                        : "bg-[#e8f4e8]"
                    }`}
                  >
                    {item.type === "document" ? (
                      <FileText className="h-5 w-5 text-[#8c5c2b]" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-[#4a7c59]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-[#2b1d10]">{item.title}</p>
                    <p className="text-sm text-[#6d6258]">{item.action}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[#6d6258]">{item.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/vault"
              className="flex items-center gap-3 rounded-lg border border-[#d4c4a8] p-4 transition hover:bg-[#fdfbf7]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b1d10]">
                <FileText className="h-5 w-5 text-[#f8f1e6]" />
              </div>
              <div>
                <p className="font-medium text-[#2b1d10]">Upload Document</p>
                <p className="text-sm text-[#6d6258]">
                  Add a new legal document to the vault
                </p>
              </div>
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-3 rounded-lg border border-[#d4c4a8] p-4 transition hover:bg-[#fdfbf7]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8c5c2b]">
                <MessageSquare className="h-5 w-5 text-[#f8f1e6]" />
              </div>
              <div>
                <p className="font-medium text-[#2b1d10]">Start New Chat</p>
                <p className="text-sm text-[#6d6258]">
                  Ask questions about your documents
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
