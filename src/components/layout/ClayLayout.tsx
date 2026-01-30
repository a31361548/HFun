"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, PlusCircle, TrendingUp, Users, LogOut, CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import ProtectedRoute from "@/components/providers/ProtectedRoute";

const NAV_ITEMS = [
  { id: "dashboard", label: "儀表板", href: "/dashboard", icon: LayoutGrid },
  { id: "logging", label: "快速記錄", href: "/logging", icon: PlusCircle },
  { id: "history", label: "歷史紀錄", href: "/history", icon: CalendarDays },
  { id: "trends", label: "數據趨勢", href: "/trends", icon: TrendingUp },
  { id: "settings", label: "個人設定", href: "/settings", icon: Settings },
  { id: "admin", label: "後台管理", href: "/admin", icon: Users },
];

export default function ClayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const navItems = role === "Admin" ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.id !== "admin");

  // Hide layout on login page
  if (pathname === "/login") {
    return <main className="h-screen w-screen bg-background overflow-hidden">{children}</main>;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[280px] flex-col gap-10 p-10 fixed top-0 bottom-0 left-0 z-50">
          <div className="clay-card h-full flex flex-col items-stretch p-6">
              {/* Logo */}
              <div className="flex items-center gap-3 text-2xl font-black text-primary mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl grid place-items-center text-white shadow-[4px_4px_8px_rgba(255,140,148,0.5)]">
                  H
                </div>
                HealthFun
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-4 flex-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-text-light transition-all duration-200 hover:text-primary",
                        isActive && "text-primary shadow-clay-active bg-background"
                      )}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-destructive mt-auto hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={20} />
                  登出
                </button>
              </nav>
          </div>
        </aside>

        {/* Mobile Nav */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-[70px] bg-background rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-2 border-white/50 flex justify-around items-center z-50 px-2">
          {navItems.filter((item) => item.id !== "trends").map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "p-3 rounded-xl text-text-light transition-all",
                  isActive && "text-primary shadow-clay-active"
                )}
              >
                <item.icon size={isActive ? 28 : 24} strokeWidth={isActive ? 3 : 2} />
              </Link>
            );
          })}
          <button onClick={handleLogout} className="p-3 text-destructive">
               <LogOut size={24} />
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-[280px] h-screen overflow-y-auto p-6 pb-[120px] md:p-10 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  );
}
