import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Folder } from "@/models/folder";
import { Vault } from "@/models/vault";
import { DocumentModel } from "@/models/document";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vaultId = searchParams.get("vaultId");

    await connectDB();

    if (vaultId) {
      const vault = await Vault.findOne({ _id: vaultId, userId: session.userId });
      if (!vault) {
        return NextResponse.json({ error: "Vault not found" }, { status: 404 });
      }
      const folders = await Folder.find({ userId: session.userId, vaultId }).sort({ createdAt: 1 });
      
      const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
        const docCount = await DocumentModel.countDocuments({ folderId: folder._id.toString() });
        return {
          _id: folder._id,
          userId: folder.userId,
          vaultId: folder.vaultId,
          name: folder.name,
          description: folder.description,
          createdAt: folder.createdAt,
          documentCount: docCount,
        };
      }));
      
      return NextResponse.json({ folders: foldersWithCounts });
    }

    const folders = await Folder.find({ userId: session.userId }).sort({ createdAt: 1 });
    
    const foldersWithCounts = await Promise.all(folders.map(async (folder) => {
      const docCount = await DocumentModel.countDocuments({ folderId: folder._id.toString() });
      return {
        _id: folder._id,
        userId: folder.userId,
        vaultId: folder.vaultId,
        name: folder.name,
        description: folder.description,
        createdAt: folder.createdAt,
        documentCount: docCount,
      };
    }));
    
    return NextResponse.json({ folders: foldersWithCounts });
  } catch (error) {
    console.error("Get folders error:", error);
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
    const { vaultId, name, description } = body;

    if (!vaultId || !name?.trim()) {
      return NextResponse.json({ error: "Vault ID and folder name are required" }, { status: 400 });
    }

    await connectDB();

    const vault = await Vault.findOne({ _id: vaultId, userId: session.userId });
    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    const folder = await Folder.create({
      userId: session.userId,
      vaultId,
      name: name.trim(),
      description: description?.trim() || "",
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    console.error("Create folder error:", error);
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
    const folderId = searchParams.get("id");

    if (!folderId) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    await connectDB();
    const folder = await Folder.findOneAndDelete({ _id: folderId, userId: session.userId });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}