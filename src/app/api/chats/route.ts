import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Chat } from "@/models/chat";
import { DocumentModel } from "@/models/document";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");
    const vaultId = searchParams.get("vaultId");

    await connectDB();

    if (chatId) {
      const chat = await Chat.findOne({ _id: chatId, userId: session.userId });
      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }
      return NextResponse.json({ chat });
    }

    const query: Record<string, unknown> = { userId: session.userId };
    if (vaultId) {
      query.vaultId = vaultId;
    }

    const chats = await Chat.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vaultId, folderId, question, messages } = body;

    if (!vaultId || !folderId || !question) {
      return NextResponse.json(
        { error: "Vault ID, folder ID, and question are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const documents = await DocumentModel.find({
      userId: session.userId,
      folderId,
      status: "ready",
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No indexed documents in this folder" },
        { status: 400 }
      );
    }

    const chat = await Chat.findOneAndUpdate(
      { userId: session.userId, vaultId, folderId },
      {
        $push: {
          messages: {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
            createdAt: new Date(),
          },
        },
        $setOnInsert: {
          userId: session.userId,
          vaultId,
          folderId,
          title: question.slice(0, 50) + (question.length > 50 ? "..." : ""),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ chat, documents });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, messageId, content, sources } = body;

    if (!chatId || !messageId || !content) {
      return NextResponse.json(
        { error: "Chat ID, message ID, and content are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId: session.userId },
      {
        $push: {
          messages: {
            id: messageId,
            role: "assistant",
            content,
            sources: sources || [],
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Update chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await connectDB();
    const chat = await Chat.findOneAndDelete({ _id: chatId, userId: session.userId });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}