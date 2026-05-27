"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, Smartphone, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SecurityPage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-[#2b1d10]">
          Security
        </h1>
        <p className="mt-2 text-[#6d6258]">
          Manage your account security and authentication
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <Lock className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Password
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Change your password
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#2b1d10]">Current password</p>
              <div className="flex rounded-lg border border-[#d4c4a8] px-3 py-2">
                <input
                  type="password"
                  defaultValue="********"
                  className="flex-1 bg-transparent outline-none"
                />
                <Eye className="h-4 w-4 text-[#6d6258]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#2b1d10]">New password</p>
              <div className="flex rounded-lg border border-[#d4c4a8] px-3 py-2">
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="flex-1 bg-transparent outline-none"
                />
                <EyeOff className="h-4 w-4 text-[#6d6258]" />
              </div>
            </div>
            <Button className="bg-[#2b1d10] text-[#f8f1e6] hover:bg-[#402816]">
              Update Password
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <Key className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Add an extra layer of security
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-[#e8dcc8] p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-[#6d6258]" />
                <div>
                  <p className="font-medium text-[#2b1d10]">Authenticator App</p>
                  <p className="text-sm text-[#6d6258]">Use an app to generate codes</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#d4c4a8] text-[#6d6258]">
                Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7d5]">
                <Shield className="h-5 w-5 text-[#8c5c2b]" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#2b1d10]">
                  Active Sessions
                </CardTitle>
                <CardDescription className="text-sm text-[#6d6258]">
                  Manage your active login sessions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-[#e8dcc8] p-3">
              <div>
                <p className="font-medium text-[#2b1d10]">Current Session</p>
                <p className="text-sm text-[#6d6258]">
                  {user?.email || "Authenticated user"} &bull; Active now
                </p>
              </div>
              <span className="rounded-full bg-[#4a7c59]/10 px-2 py-1 text-xs font-medium text-[#4a7c59]">
                Current
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d4c4a8] bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#2b1d10]">
              Account Info
            </CardTitle>
            <CardDescription className="text-sm text-[#6d6258]">
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e8dcc8] pb-2">
              <div>
                <p className="text-sm text-[#2b1d10]">Username</p>
                <p className="text-xs text-[#6d6258]">{user?.username || "-"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#e8dcc8] pb-2">
              <div>
                <p className="text-sm text-[#2b1d10]">Email</p>
                <p className="text-xs text-[#6d6258]">{user?.email || "-"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2b1d10]">Account created</p>
                <p className="text-xs text-[#6d6258]">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}