import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { Vault } from "@/models/vault";
import { Folder } from "@/models/folder";
import { DocumentModel } from "@/models/document";
import { Chat } from "@/models/chat";
import { deleteNamespace } from "@/lib/pinecone";
import { createToken, getSession, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Send valid JSON.' },
      { status: 400 }
    );
  }
  try {
    const { username, email, password, action } = (body ?? {}) as {
      username?: string;
      email?: string;
      password?: string;
      action?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (action === "signup" && !username) {
      return NextResponse.json(
        { error: "Username is required for signup" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    if (action === "signup") {
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email or username already exists" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const token = await createToken({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
          token,
        },
        { status: 201 }
      );
      response.headers.set("Set-Cookie", setAuthCookie(token));
      return response;
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = await createToken({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token,
      });
      response.headers.set("Set-Cookie", setAuthCookie(token));
      return response;
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.userId;

    const folders = await Folder.find({ userId }).select("_id vaultId");
    await Promise.allSettled(
      folders.map((folder) =>
        deleteNamespace(String(folder.vaultId), String(folder._id))
      )
    );

    await DocumentModel.deleteMany({ userId });
    await Folder.deleteMany({ userId });
    await Vault.deleteMany({ userId });
    await Chat.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth-token", "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}