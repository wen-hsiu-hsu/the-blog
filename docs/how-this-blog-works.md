# 部落格架構說明

## 目錄結構

```
articles/               ← VitePress srcDir
├── index.md            → /（首頁，顯示全部文章第 1 頁）
├── page/
│   ├── [page].paths.ts → 產生 /page/2、/page/3 ... 路由
│   └── [page].md       → 分頁模板（全部文章）
├── dev/
│   ├── index.md        → /dev/（dev 文章第 1 頁）
│   ├── page/
│   │   ├── [page].paths.ts → /dev/page/2、/dev/page/3 ...
│   │   └── [page].md
│   ├── web-dev-quiz/   ← 系列文章子目錄
│   │   └── 01-script-async-vs-defer.md → /dev/web-dev-quiz/01-script-async-vs-defer
│   ├── JS-Dungeon/     ← 系列文章子目錄
│   │   └── 001-multiplication-table-with-javascript.md
│   └── handling-form-without-any-dependencies.md  ← 非系列，平坦放置
├── life/
│   ├── index.md        → /life/
│   ├── page/
│   │   ├── [page].paths.ts
│   │   └── [page].md
│   └── movies-1917.md
├── pages/              ← 靜態工具頁
│   ├── about.md        → /pages/about
│   ├── archives.md     → /pages/archives
│   ├── category.md     → /pages/category
│   └── tags.md         → /pages/tags
└── drafts/             ← 草稿（被 srcExclude 排除，不會被 build）
    ├── some-post.md
    └── web-dev-quiz/   ← 系列草稿也用子目錄（與發布後結構一致）
        └── 26-next-topic.md
```

---

## 文章 URL 規則

- **系列文章**：放在子目錄 → `/dev/{系列名}/{編號}-{描述性slug}`
- **非系列文章**：直接放 `dev/` 或 `life/` 根層 → `/dev/{slug}`
- VitePress 開啟 `cleanUrls: true`，URL 不帶 `.html`

---

## 文章列表如何產生（serverUtils.ts）

`getPosts()` 用 globby 掃描：

```
articles/dev/**/*.md    ← ** 包含子目錄
articles/life/**/*.md
排除：**/index.md、**/page/**
```

掃到的每個檔案讀取 frontmatter，產生 `{ frontMatter, regularPath }` 陣列，
依 `date` 降序排列，`pin` 置頂。

`getPosts({ section: 'dev' })` 會過濾 `frontMatter.section === 'dev'`，
所以每篇文章的 frontmatter 必須有 `section: dev` 或 `section: life`。

---

## 分頁機制

每頁 10 篇（`pageSize = 10`）。

- **第 1 頁**：由各 section 的 `index.md` 負責渲染
- **第 2 頁以後**：由 `[page].paths.ts` 動態產生路由，`[page].md` 負責渲染

`[page].paths.ts` 呼叫 `getPosts()` 取得 `pagesTotal`，產生 `{ page: 2 }、{ page: 3 } ...` 的 params 清單。

分頁連結由 `Page.vue` 產生，格式：

- 第 1 頁 → `/`（根）或 `/dev/`（section）
- 第 N 頁 → `${pageBase}${N}`，如 `/dev/page/3`

---

## Build 時資料流

`config.mts` 在 build 時呼叫一次 `getPosts()`，再透過 `transformPageData` 把**該頁需要的部分**注入各頁的 `pageData`。
計算邏輯在 `.vitepress/theme/postPageData.ts` 的 `buildPostPageData()`，依頁面類型決定注入哪些欄位：

| 頁面類型                                                   | 判斷方式                        | 注入欄位                                                     |
| ---------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| 文章頁                                                     | 路徑在 `getPosts()` 清單內      | `postNav`（上下篇）、`seriesPosts`（系列）或 `suggestPosts`  |
| 列表頁（`/`、`/dev/`、`/life/` 與各自的 `page/N`）         | `frontmatter.home`              | `listPosts`（當頁 10 篇）、`listMeta`、`listSidebar`（側欄） |
| 彙整頁（`pages/archives`、`pages/tags`、`pages/category`） | `relativePath` 以 `pages/` 開頭 | `allPosts`（全部文章的精簡欄位）                             |

元件透過 `utils/usePostPageData.ts` 的 `usePostPageData()` 讀取（即 `useData().page` 加上型別）。

欄位依用途分三種形狀，都維持 `{ regularPath, frontMatter }` 結構：

- `PostLink`：`title`、`date`、`pin`。上下篇、推薦、側欄分類樹用
- `PostSummary`：再加 `category`、`tags`、`series`、`order`、`chapter`。系列目錄、彙整頁用
- `PostListItem`：再加 `description`。列表頁的文章列用

**不要把文章清單放回 `themeConfig`。** VitePress 會把 `themeConfig` 序列化進每一頁 HTML 的
`window.__VP_SITE_DATA__`，舊做法讓每頁都內嵌約 611 KB 的文章 JSON（文章頁 826 KB → 改後 55 KB）。
也不要改用 `.data.ts`（data loader）：資料會被打包進 import 它的元件所在的 chunk，而 theme 元件都在
`theme/index.ts` 靜態註冊，結果是進主 bundle、每頁照樣下載；而且 `createContentLoader` 需要重做一次
`getPosts` 的排序與過濾。詳見 [seo-diagnosis.md](./seo-diagnosis.md)。

> 注意：`getPosts()` 只在載入 config 時跑一次。`npm run dev` 時新增文章或改 frontmatter 的 `series`、`date` 等欄位，需重啟 dev server 才會反映在列表與上下篇。

---

## 草稿與自動發布

草稿放在 `articles/drafts/`，被 `srcExclude` 排除，不會出現在網站。

GitHub Actions（`.github/workflows/auto-publish.yml`）每天台北時間 08:00 執行：

1. 掃描 `drafts/**/*.md`
2. 讀取每篇的 `date` frontmatter
3. 若 `date <= today`，依 `section` frontmatter（預設 `dev`）移動到對應目錄
4. **保留相對子路徑**：`drafts/web-dev-quiz/26-xxx.md` → `dev/web-dev-quiz/26-xxx.md`
5. commit & push，觸發重新 deploy

發布前會檢查草稿中的 `[[wikilink]]` 是否都指向已存在的文章。若有 broken wikilink，該草稿會被跳過（不阻擋其他文章）。詳見 [obsidian-wikilinks.md](./obsidian-wikilinks.md)。

### 新增系列草稿

在 drafts 裡使用與發布目標相同的子目錄結構：

```
articles/drafts/web-dev-quiz/26-new-topic.md   → 發布後: dev/web-dev-quiz/26-new-topic.md
articles/drafts/JS-Dungeon/006-something.md    → 發布後: dev/JS-Dungeon/006-something.md
articles/drafts/flat-post.md                   → 發布後: dev/flat-post.md
```

---

## 草稿驗證（validate:drafts）

在草稿階段主動發現潛在問題，避免等到自動發布當天才知道有錯誤。

### 執行方式

```bash
npm run validate:drafts
```

### 驗證項目

| 類型    | 檢查內容                                                                      | 行為                      |
| ------- | ----------------------------------------------------------------------------- | ------------------------- |
| ERROR   | frontmatter 必填欄位缺少（title、description、date、category、section、tags） | 非零退出，validation 失敗 |
| ERROR   | tags 不是陣列                                                                 | 非零退出                  |
| ERROR   | date 格式非 YYYY-MM-DD                                                        | 非零退出                  |
| ERROR   | section 值非 dev / life                                                       | 非零退出                  |
| WARNING | broken wikilink（在已發布文章及其他草稿中均找不到）                           | 零退出，不阻擋            |

### 與 publish-posts.js 的差異

`validate:drafts` 的 wikilink 檢查**允許指向其他草稿**（因為兩篇文章可能一起發布），
而 `publish-posts.js` 在發布當下只允許指向已發布文章。

### 預覽草稿（dev:with-drafts）

```bash
npm run dev:with-drafts
```

以 dev server 預覽草稿內容。設定 `VITE_INCLUDE_DRAFTS=true` 會讓 VitePress 移除 `drafts/**` 的 srcExclude，
讓草稿出現在本地 dev server 中（不影響 build 與 production）。

**注意：** 草稿的 wikilink 若找不到對應文章，會在頁面上以 broken link 樣式顯示（`data-wikilink-broken`）。

---

## 新增系列的方式

要新增一個系列（如 `css-notes`）：

1. 建立目錄 `articles/dev/css-notes/` 與 `articles/drafts/css-notes/`（兩邊都要有，各放一個 `.gitkeep` 才能 commit 空資料夾）。可用 `npm run new:series -- css-notes` 自動完成，見下方「建立系列資料夾（new:series）」。
2. 文章命名：`01-{描述性slug}.md`
3. frontmatter 填寫系列必要欄位：
    - `series: css-notes` — 識別 slug，對應 seriesMap key
    - `order: 1` — 章節排序鍵（顯示的「第 X 節」序號由陣列 index 計算，非 `order` 值，故 `order` 可跳號）
    - `seriesTitle: "CSS Notes"` — badge 顯示名稱（省略時 fallback 為 `category → slug`）
    - `section: dev`
4. 不需要改任何設定，glob 自動掃到

---

## 建立系列資料夾（new:series）

本機用的輔助腳本，一次建立系列在 `dev` 與 `drafts` 兩邊對稱的空資料夾（各含 `.gitkeep`），避免手動建立時漏建其中一邊或打錯字。**純本地操作，不屬於 CI/CD 流程**，因此放在專案根目錄的 `scripts/`，而非 `.github/scripts/`。

### 執行方式

```bash
npm run new:series -- <slug>
```

例如：`npm run new:series -- css-notes` 會建立：

```
articles/dev/css-notes/.gitkeep
articles/drafts/css-notes/.gitkeep
```

### 行為

- slug 僅允許英數字、底線、連字號（`[a-zA-Z0-9_-]+`），拒絕 `/`、`..`、空白等字元，避免建到非預期路徑。
- 若某一邊的資料夾已存在，只補建缺的那一邊（不視為錯誤）；兩邊都存在則兩邊都印出「已存在，略過」。
- 不會產生任何 `.md` 文章骨架或 frontmatter 模板，只建立空資料夾。

實作見 `scripts/new-series.js`。

---

## 關鍵檔案

| 檔案                                        | 用途                                 |
| ------------------------------------------- | ------------------------------------ |
| `.vitepress/config.mts`                     | VitePress 設定、build 時注入文章資料 |
| `.vitepress/theme/serverUtils.ts`           | `getPosts()` 文章掃描與排序          |
| `.vitepress/theme/postPageData.ts`          | 逐頁計算注入 `pageData` 的文章資料   |
| `.vitepress/theme/components/page/Page.vue` | 文章列表 + 分頁元件                  |
| `articles/dev/page/[page].paths.ts`         | 動態分頁路由產生                     |
| `.github/scripts/publish-posts.js`          | 草稿自動發布腳本                     |
| `.github/workflows/deploy.yml`              | 測試 + 部署 workflow                 |
| `.github/workflows/auto-publish.yml`        | 定時草稿發布 workflow                |
| `.vitepress/plugins/obsidian-wikilinks.ts`  | Obsidian wikilink 轉換 plugin        |
| `scripts/new-series.js`                     | 本機建立系列資料夾（dev + drafts）   |

---

## 相關文件

- [ci-cd.md](./ci-cd.md) — 部署流程、Secrets 設定、Cloudflare Pages 注意事項
- [testing.md](./testing.md) — 測試工具與執行方式
- [../rules/frontmatter.md](../rules/frontmatter.md) — 文章 front matter 必填／選填欄位規格
