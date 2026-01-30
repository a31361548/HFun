# Task Plan: 管理後台權限控管

## Goal
非管理員不應在 UI 出現管理後台入口，若手動輸入 `/admin` 則顯示權限不足。

## Phases
- [x] Phase 1: 對齊需求與驗收標準
- [x] Phase 2: 找出管理後台入口與頁面保護位置
- [x] Phase 3: 落地修改（隱藏入口與權限提示）

## Key Questions
1. 管理後台入口在哪些元件/頁面出現？
2. `/admin` 頁面目前是否有權限檢查？

## Decisions Made
- 非管理員不顯示入口。
- 手動輸入 `/admin` 顯示權限不足。

## Errors Encountered
- None

## Status
**Currently in Phase 3** - 修改完成，待驗收
