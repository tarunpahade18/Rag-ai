import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { DocumentModel } from "@/models/document";
import { Chat } from "@/models/chat";
import { Vault } from "@/models/vault";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = session.userId;

    const [documentCount, readyCount, pendingCount, failedCount, chatCount, vaultCount, recentDocuments, recentChats] =
      await Promise.all([
        DocumentModel.countDocuments({ userId }),
        DocumentModel.countDocuments({ userId, status: "ready" }),
        DocumentModel.countDocuments({ userId, status: "pending" }),
        DocumentModel.countDocuments({ userId, status: "failed" }),
        Chat.countDocuments({ userId }),
        Vault.countDocuments({ userId }),
        DocumentModel.find({ userId }).sort({ uploadedAt: -1 }).limit(5).lean(),
        Chat.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean(),
      ]);

    const recentActivity = [
      ...recentDocuments.map((d) => ({
        type: "document" as const,
        title: d.name,
        action: d.status === "ready" ? "Indexed successfully" : d.status === "failed" ? "Indexing failed" : "Processing",
        time: timeAgo(d.uploadedAt),
        id: d._id.toString(),
      })),
      ...recentChats.map((c) => ({
        type: "chat" as const,
        title: c.title,
        action: `${c.messages?.length || 0} messages`,
        time: timeAgo(c.updatedAt),
        id: c._id.toString(),
      })),
    ]
      .sort((a, b) => {
        const timeOrder = ["Just now", "Today", "Yesterday", "days ago", "week", "weeks"];
        const aIdx = timeOrder.findIndex((t) => a.time.includes(t));
        const bIdx = timeOrder.findIndex((t) => b.time.includes(t));
        return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
      })
      .slice(0, 8);

    return NextResponse.json({
      stats: {
        documents: documentCount,
        documentsReady: readyCount,
        documentsPending: pendingCount,
        documentsFailed: failedCount,
        chats: chatCount,
        vaults: vaultCount,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}
