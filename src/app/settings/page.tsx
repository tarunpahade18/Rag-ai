"use client";

import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Palette, Database, KeyRound, Copy, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type PluginKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<PluginKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    try {
      const response = await fetch("/api/plugin/keys");
      if (!response.ok) return;
      const data = await response.json();
      setKeys(data.keys ?? []);
    } catch {
      // Ignore key listing failures in the settings UI.
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadKeys();
    }
  }, [user, loadKeys]);

  const generateKey = async () => {
    setKeyLoading(true);
    setKeyError(null);

    try {
      const response = await fetch("/api/plugin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "ChatGPT Plugin" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create a plugin key.");
      }

      setNewKey(data.key);
      await loadKeys();
    } catch (error) {
      setKeyError(
        error instanceof Error ? error.message : "Could not create a plugin key.",
      );
    } finally {
      setKeyLoading(false);
    }
  };

  const revokeKey = async (id: string) => {
    try {
      await fetch(`/api/plugin/keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      await loadKeys();
    } catch {
      // Ignore revoke failures in the settings UI.
    }
  };

  const copyKey = async () => {
    if (!newKey) return;

    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Settings
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <User className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Profile
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Manage your personal information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Username</Label>
              <Input id="name" defaultValue={user?.username || ""} className="border-[#d4c4a8]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} className="border-[#d4c4a8]" />
            </div>
            <Button className="bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <Bell className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Notifications
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Configure notification preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#e8dcc8] p-3">
              <div>
                <p className="font-medium text-[#2b1d10]">Email notifications</p>
                <p className="text-sm text-[#6d6258]">Receive updates via email</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e8dcc8] p-3">
              <div>
                <p className="font-medium text-[#2b1d10]">Document indexing alerts</p>
                <p className="text-sm text-[#6d6258]">Notify when indexing completes</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <Palette className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Appearance
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Customize the interface
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button variant="outline" className="border-[#d4c4a8]">Light</Button>
                <Button variant="outline" className="border-[#d4c4a8] bg-[#2b1d10] text-[#f8f1e6]">Dark</Button>
                <Button variant="outline" className="border-[#d4c4a8]">System</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <Database className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Data & Storage
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Manage your data and storage
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-[#e8dcc8] p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[#2b1d10]">Storage Used</p>
                <p className="text-sm text-[#6d6258]">- / 10 GB</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#e8dcc8]">
                <div className="h-2 w-0 rounded-full bg-[#8c5c2b]" />
              </div>
            </div>
            <Button variant="outline" className="border-[#d4c4a8] text-[#842029]">
              Clear Cache
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <KeyRound className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  ChatGPT Plugin Access
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Generate a bearer key for the ChatGPT plugin or a GPT Action.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {newKey ? (
              <div className="space-y-2 rounded-lg border border-[#e8dcc8] bg-[#faf5ec] p-3">
                <p className="text-sm font-medium text-[#2b1d10]">
                  Copy this key now. It will not be shown again.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input readOnly value={newKey} className="border-[#d4c4a8] font-mono text-xs" />
                  <Button
                    type="button"
                    onClick={copyKey}
                    className="bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            ) : null}

            {keyError ? (
              <p className="text-sm text-[#842029]">{keyError}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={generateKey}
                disabled={keyLoading}
                className="bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]"
              >
                {keyLoading ? "Generating..." : "Generate plugin key"}
              </Button>
              <p className="text-xs text-[#6d6258]">
                Use it as the Bearer token when installing the plugin.
              </p>
            </div>

            {keys.length ? (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between rounded-lg border border-[#e8dcc8] p-3"
                  >
                    <div>
                      <p className="font-mono text-sm text-[#2b1d10]">{key.prefix}</p>
                      <p className="text-xs text-[#6d6258]">
                        {key.name} - created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => revokeKey(key.id)}
                      className="border-[#d4c4a8] text-[#842029]"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6d6258]">
                No plugin keys yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}