# Blog Project – Claude Instructions

## 規則檔（按需查閱）

以下規則檔**不需要在對話開始時主動讀取**，
只有在執行相關任務時才去讀取對應檔案。

| 檔案                    | 何時讀取                                         |
| ----------------------- | ------------------------------------------------ |
| `/rules/tags.md`        | 被要求產生、修改、或確認文章 tag 時              |
| `/rules/frontmatter.md` | 新增或修改文章時，確認 front matter 欄位是否正確 |

## 開發文件（按需查閱）

以下文件描述專案架構與慣例，**不需要在對話開始時主動讀取**。
遇到相關任務時再讀，避免浪費 token。

| 檔案                          | 內容摘要                                                                                                       | 何時讀取                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `docs/how-this-blog-works.md` | 目錄結構、URL 規則、分頁機制、文章列表產生方式（getPosts）、草稿自動發布                                       | 修改文章路由、分頁邏輯、新增 section、需要了解整體架構時 |
| `docs/ci-cd.md`               | GitHub Actions workflows、部署流程、Cloudflare Pages 設定、所需 Secrets、已知限制                              | 修改 CI/CD、排查部署問題、設定新環境時                   |
| `docs/testing.md`             | 測試工具（Vitest）、目前測試涵蓋範圍、如何新增測試                                                             | 新增或修改測試、排查測試失敗時                           |
| `docs/obsidian-wikilinks.md`  | Obsidian wikilink 支援說明、語法對照、publish 前檢查機制                                                       | 使用或修改 wikilink 功能時                               |
| `docs/seo-diagnosis.md`       | SEO 與競爭力診斷報告（2026-10-08）：各問題的證據、修法與 TODO 進度追蹤                                         | 處理 SEO、head／結構化資料、效能、內容策略相關任務時     |
| `docs/seo.md`                 | head 標籤的產生方式：URL 規則（`pagePath.ts`）、canonical／og:url 放 `transformPageData`、title 模板與分頁標題 | 修改 head、title、canonical、og 標籤或結構化資料時       |
| `docs/performance-testing.md` | `npm run perf:compare`：本地 Lighthouse 比較改動前後的 build、`--record` 記錄流程、報告判讀、sandbox 限制      | 任何可能影響效能的改動完成後，用它驗證改善或退步         |
| `docs/perf-log/README.md`     | 歷次效能改動的量測記錄索引（新的在上），每筆指向 commit 範圍與相關項目                                         | 想知道某項優化的實際成效、或規劃下一個效能改動時         |

## 程式碼格式化

修改或新增任何 `.ts`、`.js`、`.vue`、`.md` 程式碼檔案後，必須執行：

```
npm run format
```

確保程式碼符合 Prettier 設定。

## 文件維護慣例

執行任務後，若產生了值得保留的知識（新的架構決策、踩過的坑、重要設定），
應主動在 `docs/` 新增或更新對應文件，並將新檔案補入上方表格（填寫摘要與觸發時機）。

## 效能改動流程（重要）

任何可能影響效能的改動（頁面資料、bundle、圖片、字型、head 標籤、第三方 script），完成後必須：

1. commit 改動
2. 執行 `npm run perf:compare -- --record "<改動說明>" --ref "<相關項目>"`（需關閉 sandbox）
3. commit `docs/perf-log/`，並在相關項目（如 `docs/seo-diagnosis.md` 的 TODO）加上記錄的連結

細節見 `docs/performance-testing.md`。

**原因**：效能優化常有副作用（例如 HTML 變小但 JS chunk 變大）。只靠推論很容易誤判，
而沒有留下記錄的話，日後也追不到哪個改動帶來了什麼變化。

## 共用邏輯原則（重要）

當多個腳本或模組需要相同的功能（例如：slug 解析、wikilink 提取、檔案掃描），
**必須抽取成共用模組**，禁止在各處重複實作。

- 共用工具函式放在合適的共用檔案（例如 `.github/scripts/wikilink-utils.js`）
- 各腳本透過 `import` 引用，不各自維護一份副本
- 新增腳本前，先確認是否有可重用的現有工具函式

**原因**：重複實作會導致邏輯分歧（例如其中一個漏了 inline code stripping），
且只有修改其中一處時，另一處會悄悄落後，造成難以追蹤的 bug。

## 規劃階段文件計畫（重要）

規劃任何會影響架構、流程或慣例的任務時，必須在規劃階段明確列出：

- 哪些 `docs/` 文件需要新增或更新
- 各文件需要補充的內容為何（設計決策、注意事項、流程說明等）

**原因**：文件若留到開發完才補寫，關鍵的設計邏輯和踩坑細節可能已因 context 壓縮而消失，
導致文件無法忠實呈現實際的開發決策。在規劃時就鎖定文件範圍，確保資訊在任務完成前仍完整可用。
