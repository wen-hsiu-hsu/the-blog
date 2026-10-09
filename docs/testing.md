# 測試

## 工具

[Vitest](https://vitest.dev/)，設定檔 `vitest.config.ts`。

執行：

```bash
npm test
```

---

## 測試範圍

| 測試檔                                         | 測試對象                                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `.vitepress/theme/serverUtils.test.ts`         | 分頁計算、section 篩選、`convertDate()`、pin 排序                                       |
| `.vitepress/theme/postPageData.test.ts`        | 逐頁注入的文章資料：上下篇、推薦、列表分頁、側欄統計                                    |
| `.vitepress/theme/utils/pageHead.test.ts`      | `toPagePath()` 與 sitemap 一致的 URL 規則、canonical／og:url、分頁 title 與 description |
| `.vitepress/plugins/og-image/og-image.test.ts` | OG 圖路徑、標題移除 emoji、badge 取值、字型子集切批                                     |
| `.github/scripts/publish-posts.test.ts`        | `deriveSection()`：草稿發布時 section 推導邏輯                                          |
| `.github/scripts/html-tag-utils.test.ts`       | `findInvalidHtmlTags()`：raw HTML 內未跳脫的 `<` 偵測                                   |
| `scripts/perf-utils.test.ts`                   | `perf:compare` 的 cleanUrls 解析、中位數／雜訊判斷、報告與 perf-log 記錄格式            |

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
