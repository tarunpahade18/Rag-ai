import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Vault } from "@/models/vault";
import { Folder } from "@/models/folder";
import { DocumentModel } from "@/models/document";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const vaults = await Vault.find({ userId: session.userId }).sort({ createdAt: -1 });

    const vaultsWithCounts = await Promise.all(vaults.map(async (vault) => {
      const folderCount = await Folder.countDocuments({ vaultId: vault._id });
      const docCount = await DocumentModel.countDocuments({ vaultId: vault._id });
      return {
        _id: vault._id,
        userId: vault.userId,
        name: vault.name,
        description: vault.description,
        createdAt: vault.createdAt,
        folderCount,
        documentCount: docCount,
      };
    }));

    return NextResponse.json({ vaults: vaultsWithCounts });
  } catch (error) {
    console.error("Get vaults error:", error);
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
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Vault name is required" }, { status: 400 });
    }

    await connectDB();
    const vault = await Vault.create({
      userId: session.userId,
      name: name.trim(),
      description: description?.trim() || "",
    });

    return NextResponse.json({ vault }, { status: 201 });
  } catch (error) {
    console.error("Create vault error:", error);
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
    const vaultId = searchParams.get("id");

    if (!vaultId) {
      return NextResponse.json({ error: "Vault ID is required" }, { status: 400 });
    }

    await connectDB();
    const vault = await Vault.findOneAndDelete({ _id: vaultId, userId: session.userId });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete vault error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}