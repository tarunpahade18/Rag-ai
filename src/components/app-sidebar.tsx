"use client";

import {
  BookOpen,
  Bot,
  FolderOpen,
  Home,
  LogOut,
  Scale,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Vault",
    url: "/vault",
    icon: FolderOpen,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: Bot,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: BookOpen,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
    router.refresh();
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-[#d4c4a8] bg-[#fdfbf7]">
      <div className="border-b border-[#d4c4a8] py-5">
        <div className="flex items-center gap-3 px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b1d10]">
            <Scale className="h-5 w-5 text-[#f8f1e6]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#2b1d10]">Legal AI</span>
            <span className="text-xs text-[#6d6258]">Assistant</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-[#2b1d10] !text-white"
                  : "text-[#6d6258] hover:bg-[#f4e7d5] hover:text-[#2b1d10]"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-[#d4c4a8] space-y-1 p-3">
        {user && (
          <div className="mb-2 rounded-lg bg-[#f4e7d5] p-3">
            <p className="text-sm font-medium text-[#2b1d10] truncate">{user.username}</p>
            <p className="text-xs text-[#6d6258] truncate">{user.email}</p>
          </div>
        )}
        {menuItems.length === 0 ? null : (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              pathname === "/settings"
                ? "bg-[#2b1d10] text-[#f8f1e6]"
                : "text-[#6d6258] hover:bg-[#f4e7d5] hover:text-[#2b1d10]"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#842029] transition-all hover:bg-[#f4e7d5]"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}