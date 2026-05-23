import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { DocumentModel } from "@/models/document";
import { Folder } from "@/models/folder";
import { Vault } from "@/models/vault";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");

    await connectDB();

    if (folderId) {
      const folder = await Folder.findOne({ _id: folderId, userId: session.userId });
      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      const documents = await DocumentModel.find({ userId: session.userId, folderId }).sort({ uploadedAt: -1 });
      return NextResponse.json({ documents });
    }

    const documents = await DocumentModel.find({ userId: session.userId }).sort({ uploadedAt: -1 });
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Get documents error:", error);
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
    const { folderId, name, type, size, chunkCount, status, fileUrl } = body;

    if (!folderId || !name?.trim()) {
      return NextResponse.json({ error: "Folder ID and document name are required" }, { status: 400 });
    }

    await connectDB();

    const folder = await Folder.findOne({ _id: folderId, userId: session.userId });
    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const document = await DocumentModel.create({
      userId: session.userId,
      vaultId: folder.vaultId,
      folderId,
      name: name.trim(),
      type: type || "PDF",
      size: size || "0 MB",
      chunkCount: chunkCount || 0,
      status: status || "pending",
      fileUrl,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
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
    const { documentId, status, chunkCount, fileUrl } = body;

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    await connectDB();
    const document = await DocumentModel.findOneAndUpdate(
      { _id: documentId, userId: session.userId },
      { status, chunkCount, fileUrl },
      { new: true }
    );

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Update document error:", error);
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
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    await connectDB();
    const document = await DocumentModel.findOneAndDelete({ _id: documentId, userId: session.userId });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}