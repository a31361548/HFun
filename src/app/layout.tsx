import type { Metadata } from "next";
import { Noto_Sans_TC, Nunito } from "next/font/google";
import "./globals.css";
import ClayLayout from "@/components/layout/ClayLayout";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { seedAdminUser } from "@/lib/db/seed";

const notoSans = Noto_Sans_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
});

export const metadata: Metadata = {
  title: "HAVA",
  description: "Interactive Claymorphism Health Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auto-seed admin user on startup
  await seedAdminUser();

  return (
    <html lang="zh-Hant-TW" suppressHydrationWarning>
      <body
        className={`${notoSans.variable} ${nunito.variable} antialiased`}
      >
        <AuthSessionProvider>
          <ClayLayout>
            {children}
          </ClayLayout>
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
