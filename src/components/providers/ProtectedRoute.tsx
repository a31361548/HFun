"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 等待載入
    
    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // 載入中或未登入時顯示空白
  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-light font-bold">載入中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
