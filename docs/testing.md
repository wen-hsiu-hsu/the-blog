# 測試

## 工具

[Vitest](https://vitest.dev/)，設定檔 `vitest.config.ts`。

執行：

```bash
npm test
```

---

## 測試範圍

| 測試檔                                  | 測試對象                                          |
| --------------------------------------- | ------------------------------------------------- |
| `.vitepress/theme/serverUtils.test.ts`  | 分頁計算、section 篩選、`convertDate()`、pin 排序 |
| `.github/scripts/publish-posts.test.ts` | `deriveSection()`：草稿發布時 section 推導邏輯    |

---

## 測試與部署的關係

測試是部署的前置條件。`deploy.yml` 的 deploy job 宣告 `needs: test`，
測試失敗時 deploy job 自動 skip，Cloudflare Pages 不會收到新版本。

詳見 [ci-cd.md](./ci-cd.md)。

---

## 新增測試

測試檔與被測模組放在同一目錄（co-located），命名為 `*.test.ts`。
Vitest 設定 `include: ['**/*.test.ts']` 會自動掃描，不需要額外設定。

> 注意：`.js` 測試檔不會被掃描，請一律使用 `.test.ts`。
