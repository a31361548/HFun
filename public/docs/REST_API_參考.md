# REST API Reference — HealthFun Backend

> **基礎 URL**: `http://localhost:3000/api`  
> **時區**: Asia/Taipei  
> **認證**: NextAuth.js (Session-based JWT)

---

## TypeScript Types

```ts
export type ApiError = {
  error: string;
  code: "UNAUTHORIZED" | "FORBIDDEN" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL_ERROR";
};

export type WeightTrendPoint = { date: string; weight: number };
export type ActivityTrendPoint = { name: string; value: number; fill: string };
export type HydrationTrendPoint = { date: string; amount: number };

export type WeightTrendResponse = { data: WeightTrendPoint[] };
export type ActivityTrendResponse = { data: ActivityTrendPoint[] };
export type HydrationTrendResponse = { data: HydrationTrendPoint[] };
```

---

## 認證相關

### POST /api/auth/signin
使用者登入（由 NextAuth 使用，前端請透過 `signIn("credentials")` 呼叫）。

**Request Body**（NextAuth 內部使用）:
```json
{
  "username": "demo_user",
  "password": "demo_password"
}
```

**Response** (成功):
```json
{
  "user": {
    "id": "123",
    "name": "Administrator",
    "email": "a31361548",
    "image": "https://api.dicebear.com/7.x/avataaars/svg?seed=a31361548",
    "role": "Admin"
  }
}
```

---

### POST /api/auth/signout
使用者登出

**Request**: 無需 body

**Response**:
```json
{
  "url": "http://localhost:3000/login"
}
```

---

### GET /api/auth/session
取得目前 session

**Response**:
```json
{
  "user": {
    "id": "123",
    "name": "Administrator",
    "email": "a31361548",
    "image": "...",
    "role": "Admin"
  },
  "expires": "2026-02-28T12:00:00.000Z"
}
```

---

## 趨勢圖表相關

### GET /api/trends/weight
取得體重趨勢資料（X 軸會依 range 轉換：7/30 天為 `MM/DD`，月份區間為 `YYYY/MM`）。

**Query Parameters**:
| 參數 | 類型 | 說明 | 範例 |
|------|------|------|------|
| `range` | string | 預設範圍 | `7d`, `30d`, `month`, `year` |
| `year` | number | 自訂年份 | `2026` |
| `startMonth` | number | 起始月份 (1-12) | `1` |
| `endMonth` | number | 結束月份 (1-12) | `3` |

**Response**:
```json
{
  "data": [
    { "date": "01/29", "weight": 64.8 },
    { "date": "01/30", "weight": 64.5 }
  ]
}
```

---

### GET /api/trends/activity
取得活動分佈資料（依運動類型做簡單分類：有氧/重訓/伸展）。

**Query Parameters**: 同上

**Response**:
```json
{
  "data": [
    { "name": "有氧", "value": 45, "fill": "#8B5CF6" },
    { "name": "重訓", "value": 35, "fill": "#EC4899" },
    { "name": "伸展", "value": 20, "fill": "#F59E0B" }
  ]
}
```

---

### GET /api/trends/hydration
取得水分趨勢資料（依日期彙總當日喝水量）。

**Query Parameters**: 同上

**Response**:
```json
{
  "data": [
    { "date": "01/29", "amount": 1800 },
    { "date": "01/30", "amount": 2100 }
  ]
}
```

---

## 錯誤回應格式

所有錯誤回應遵循以下格式：

```json
{
  "error": "錯誤訊息",
  "code": "ERROR_CODE"
}
```

**常見錯誤碼**:
- `UNAUTHORIZED`: 未登入或 session 過期
- `FORBIDDEN`: 權限不足
- `VALIDATION_ERROR`: 參數驗證失敗
- `NOT_FOUND`: 資源不存在
- `INTERNAL_ERROR`: 伺服器錯誤
