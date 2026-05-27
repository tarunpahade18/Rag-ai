"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Palette, Database } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();

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
      </div>
    </div>
  );
}