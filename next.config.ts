import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 只將原生模組標記為外部套件
  // 移除 next-auth 以避免 ESM 模組解析問題
  serverExternalPackages: [
    'bcrypt',
    'mongoose',
  ],
  
  // Turbopack 配置
  turbopack: {},
};

export default nextConfig;
