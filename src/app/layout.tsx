import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/app-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "llmlite Assistant",
  description: "Upload legal documents, retrieve sources, and chat over them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f6f1e8]">
        <TooltipProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}