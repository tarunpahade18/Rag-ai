import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createApiKey } from "@/lib/api-keys";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ApiKey } from "@/models/api-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getCookieSession() {
  const cookieStore = await cookies();
  if (!cookieStore.get("auth-token")?.value) {
    return null;
  }

  return getSession();
}

export async function GET() {
  try {
    const session = await getCookieSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const keys = await ApiKey.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .select("name prefix lastUsedAt createdAt");

    return NextResponse.json({
      keys: keys.map((key) => ({
        id: String(key._id),
        name: key.name,
        prefix: key.prefix,
        lastUsedAt: key.lastUsedAt ?? null,
        createdAt: key.createdAt,
      })),
    });
  } catch (error) {
    console.error("List plugin keys error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCookieSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const existing = await ApiKey.countDocuments({ userId: session.userId });
    if (existing >= 10) {
      return NextResponse.json(
        { error: "You can have at most 10 plugin keys. Revoke one first." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
    };

    const { key, rawKey } = await createApiKey(
      session.userId,
      body.name?.trim() || "ChatGPT Plugin",
    );

    return NextResponse.json(
      {
        key: rawKey,
        id: String(key._id),
        name: key.name,
        prefix: key.prefix,
        createdAt: key.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create plugin key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCookieSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Key ID is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const deleted = await ApiKey.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete plugin key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
