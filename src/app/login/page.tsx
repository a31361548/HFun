"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError(true);
      toast.error("請輸入帳號與密碼");
      return;
    }

    setIsSubmitting(true);
    setLoginError(false);

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (!result?.error) {
        toast.success("登入成功，歡迎回來！");
        router.push("/dashboard");
        return;
      }

      setLoginError(true);
      toast.error("登入失敗，請確認帳號或密碼");
    } catch (error) {
      setLoginError(true);
      toast.error("登入失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="clay-card border-none bg-background shadow-clay-out">
          <CardHeader className="text-center space-y-4 pt-10">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-8xl select-none"
            >
              👋
            </motion.div>
            <div>
              <h2 className="text-3xl font-black text-foreground">歡迎回來</h2>
              <p className="text-text-light font-bold">準備好今天的健康挑戰了嗎？</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6 mt-4">
              <Input
                placeholder="帳號 / Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="font-bold text-foreground"
                disabled={isSubmitting}
              />
              <Input
                type="password"
                placeholder="密碼 / Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
              {loginError && (
                <div className="clay-card bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-2xl font-bold">
                  帳號或密碼錯誤，請再試一次。
                </div>
              )}
              
              <Button type="submit" variant="primary" size="lg" className="w-full text-lg" disabled={isSubmitting}>
                {isSubmitting ? "登入中..." : "開始旅程 (Login)"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pb-8">
             <p className="text-xs text-text-light font-bold">HealthFun v1.0</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
