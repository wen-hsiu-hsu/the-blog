# 測試

## 工具

[Vitest](https://vitest.dev/)，設定檔 `vitest.config.ts`。

執行：

```bash
npm test
```

---

## 測試範圍

目前測試涵蓋分頁邏輯（`serverUtils.ts`）：

| 測試檔 | 測試對象 |
|--------|----------|
| `__tests__/pagination.test.ts` | `getPaginationRange()`：分頁範圍計算 |

---

## 測試與部署的關係

測試是部署的前置條件。`deploy.yml` 的 deploy job 宣告 `needs: test`，
測試失敗時 deploy job 自動 skip，Cloudflare Pages 不會收到新版本。

詳見 [ci-cd.md](./ci-cd.md)。

---

## 新增測試

測試檔放在 `__tests__/` 目錄，命名為 `*.test.ts`。
Vitest 會自動掃描，不需要額外設定。
