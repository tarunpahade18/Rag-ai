"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Scale, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Documents",
    value: "12",
    icon: FileText,
    description: "Legal documents indexed",
    change: "+2 this week",
  },
  {
    title: "Chats",
    value: "47",
    icon: MessageSquare,
    description: "Conversations this month",
    change: "+12 this week",
  },
  {
    title: "Legal Cases",
    value: "5",
    icon: Scale,
    description: "Active matters",
    change: "2 pending review",
  },
  {
    title: "Accuracy",
    value: "94%",
    icon: TrendingUp,
    description: "Source citation accuracy",
    change: "+3% improvement",
  },
];

const recentActivity = [
  {
    type: "document",
    title: "Contract Agreement - Smith Corp",
    time: "2 hours ago",
    action: "Indexed successfully",
  },
  {
    type: "chat",
    title: "Question about liability clauses",
    time: "4 hours ago",
    action: "Answered with 3 sources",
  },
  {
    type: "document",
    title: "NDA - Confidential",
    time: "1 day ago",
    action: "Processing",
  },
  {
    type: "chat",
    title: "Terms review for partnership",
    time: "2 days ago",
    action: "Answered with 5 sources",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Welcome back
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Here&apos;s what&apos;s happening with your legal workspace
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg border border-[#e8dcc8] p-3"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    activity.type === "document"
                      ? "bg-[#f4e7d5]"
                      : "bg-[#e8f4e8]"
                  }`}
                >
                  {activity.type === "document" ? (
                    <FileText className="h-5 w-5 text-[#8c5c2b]" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-[#4a7c59]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#2b1d10]">{activity.title}</p>
                  <p className="text-sm text-[#6d6258]">{activity.action}</p>
                </div>
                <span className="text-xs text-[#6d6258]">{activity.time}</span>
              </div>
            ))}
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