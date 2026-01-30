# HealthFun — 個人健康管理系統

互動式 Claymorphism 風格的健康管理儀表板，使用 Next.js 16 + MongoDB 建構。

## 環境需求

- Node.js 20+
- MongoDB（本地或雲端）
- npm / yarn / pnpm

## 快速開始

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設定環境變數**
   複製 `.env.example` 為 `.env.local`，並填入必要設定：
   ```env
   MONGODB_URI=mongodb://localhost:27017/healthfun
   AUTH_SECRET=your-secret-key
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. 開啟 [http://localhost:3000](http://localhost:3000)

## 預設帳號

系統會自動建立管理員帳號：
- **帳號**：a31361548
- **密碼**：myhealthyadmin1026

## 專案結構

```
src/
├── actions/        # Server Actions（dashboard, logs, members）
├── app/            # Next.js App Router 頁面
│   ├── api/        # REST API Routes（trends）
│   └── ...         # 各功能頁面
├── components/     # UI 元件
├── lib/
│   ├── auth.ts     # NextAuth 設定
│   └── db/         # MongoDB 連線與 Models
└── types/          # TypeScript 型別定義
```

## 技術堆疊

- **框架**：Next.js 16.1.6（App Router）
- **認證**：NextAuth.js v5 (JWT)
- **資料庫**：MongoDB + Mongoose
- **樣式**：Tailwind CSS v4
- **UI 元件**：Radix UI + shadcn/ui
- **圖表**：Recharts
- **動畫**：Framer Motion

## 功能模組

### 儀表板 (Dashboard)
- 每日喝水追蹤
- 水量設定管理
- 每日任務系統

### 日誌紀錄 (Logging)
- 飲食紀錄（含照片上傳）
- 運動紀錄（時間、熱量）
- 體重測量
- 心情記錄

### 歷史查詢 (History)
- 日曆檢視
- 日期篩選
- 紀錄時間軸

### 趨勢分析 (Trends)
- 體重變化趨勢圖
- 運動類型分布圖
- 每日飲水量圖表

### 會員管理 (Admin)
- 會員清單
- 新增/編輯/刪除會員
- 權限管理

## 架構說明

### 認證機制

本專案使用 **NextAuth.js v5** 搭配 **Client-side Route Protection** 進行身分驗證：

- **登入頁面** (`/login`)：公開訪問
- **其他頁面**：透過 `ProtectedRoute` 組件保護
- **Session 檢查**：使用 `useSession()` hook
- **登出功能**：呼叫 `signOut()` API

**為何不使用 Middleware？**
- NextAuth v5 beta middleware 與 Turbopack 存在相容性問題
- Client-side protection 提供更好的使用者體驗（載入狀態）
- 避免 `Cannot read properties of undefined (reading 'modules')` 錯誤

## 已知問題

### ~~Turbopack 與 NextAuth Middleware 相容性~~（已解決）

~~NextAuth v5 middleware 和 `bcrypt` 原生模組可能與 Turbopack 存在相容性問題。~~

**解決方案**：移除 middleware.ts，改用 Client-side Route Protection。

目前專案使用 `ProtectedRoute` 組件進行路由保護，完全相容 Turbopack。

## 詳細文件

- [API 參考文件](./public/docs/api-reference.md)
- [前端整合指南](./public/docs/frontend-integration.md)
- [後端架構說明](./public/docs/architecture.md)
- [資料庫結構](./public/docs/db-schema.md)
- [Server Actions 參考](./public/docs/actions-reference.md)

## 開發指令

```bash
# 開發模式（使用 Webpack）
npm run dev

# 建置專案
npm run build

# 啟動正式環境
npm run start

# 程式碼檢查
npm run lint
```

## 授權

MIT License
