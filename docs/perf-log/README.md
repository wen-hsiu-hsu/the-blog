# 效能記錄

每一次效能相關改動的前後量測，由 `npm run perf:compare -- --record "<改動說明>"` 自動寫入。
新的在最上面。每份記錄都會指向改動的 commit 範圍與相關項目，用來長期追蹤效能變化。

用法與判讀方式見 [performance-testing.md](../performance-testing.md)。

| 日期       | 改動                                                                                              | 相關項目                                        | 摘要（超出雜訊的頁數）                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-10-09 | [Replace avatar flip-card GIF with hover-loaded mp4](./2026-10-09-2e4d25b.md)                     | docs/seo-diagnosis.md: 第三方資源與圖片         | TBT ⚠️1；HTML 傳輸量 ✅5；JS 傳輸量 ⚠️5；圖片傳輸量 ✅2；其他傳輸量（fetch 等） ⚠️5；總傳輸量 ✅4 ⚠️1；請求數 ✅2（共 5 頁）               |
| 2026-10-09 | [Re-measure branch with arm64 Node (previous records ran under Rosetta)](./2026-10-09-0b42033.md) | docs/performance-testing.md: arm64 Node         | FCP ✅1；TBT ⚠️1；Speed Index ✅1；HTML 傳輸量 ✅5；JS 傳輸量 ⚠️5；圖片傳輸量 ✅1；其他傳輸量（fetch 等） ⚠️5；總傳輸量 ✅2 ⚠️3（共 5 頁） |
| 2026-10-09 | [Sidebar category tree renders article links only when expanded (v-if)](./2026-10-09-d9666ad.md)  | o4 / seo-diagnosis: list page sidebar           | Speed Index ✅1；HTML 傳輸量 ✅5；JS 傳輸量 ⚠️5；字型傳輸量 ✅1；其他傳輸量（fetch 等） ⚠️5；總傳輸量 ✅2 ⚠️3（共 5 頁）                   |
| 2026-10-09 | [文章列表移出 themeConfig，改逐頁注入](./2026-10-09-9962888.md)                                   | docs/seo-diagnosis.md：每頁內嵌 611 KB 文章資料 | FCP ✅1；LCP ✅1；HTML 傳輸量 ✅5；JS 傳輸量 ⚠️5；圖片傳輸量 ✅1；其他傳輸量（fetch 等） ⚠️5；總傳輸量 ✅2 ⚠️3（共 5 頁）                  |
