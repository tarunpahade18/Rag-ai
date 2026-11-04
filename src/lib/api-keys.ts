import { createHash, randomBytes } from "node:crypto";

import { connectDB } from "@/lib/db";
import { ApiKey } from "@/models/api-key";
import { User } from "@/models/user";

export const API_KEY_PREFIX = "sk_plugin_";

export interface ApiKeySession {
  userId: string;
  email: string;
  username: string;
}

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function isPluginApiKey(token: string) {
  return token.startsWith(API_KEY_PREFIX);
}

export async function createApiKey(userId: string, name: string) {
  await connectDB();

  const rawKey = `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
  const key = await ApiKey.create({
    userId,
    name: name.trim() || "ChatGPT Plugin",
    keyHash: hashKey(rawKey),
    prefix: `${rawKey.slice(0, 16)}...`,
  });

  return { key, rawKey };
}

export async function verifyApiKey(token: string): Promise<ApiKeySession | null> {
  try {
    await connectDB();

    const key = await ApiKey.findOne({ keyHash: hashKey(token) });
    if (!key) return null;

    const user = await User.findById(key.userId);
    if (!user) return null;

    ApiKey.updateOne({ _id: key._id }, { lastUsedAt: new Date() }).catch(() => {});

    return {
      userId: String(user._id),
      email: user.email,
      username: user.username,
    };
  } catch {
    return null;
  }
}
