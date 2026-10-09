hsiu.soy · 持續！修鍊之路 · 2026-10-08

# SEO 與競爭力診斷報告

對象：`wen-hsiu-hsu/the-blog`（VitePress 1.6.4）｜目標讀者：全球華語讀者｜交付範圍：分析與優先級建議（未修改程式碼）

**分析方法與限制**

- 原始碼審閱（config、theme、transformHead、workflows）＋ 333 篇已發布文章的 front matter／內文統計
- 本機實際 build 後檢查輸出的 HTML、sitemap、RSS 與檔案大小；GitHub Actions 部署紀錄與 log
- 對照 Google Search Central、web.dev、VitePress 文件與 [Front-End-Checklist](https://github.com/thedaviddias/Front-End-Checklist)
- **限制：**我的執行環境無法連線 hsiu.soy（DNS／代理拒絕），也沒有 Search Console、GA 或 CrUX 實測數據。因此流量、排名、Core Web Vitals 實測值都**未知**，以下凡標示「推論」者需以實際數據驗證。

**10/02 起**正式站部署持續失敗，新文章沒有上線

**611 KB**每一頁 HTML 內嵌的站台資料（文章列表 ×3）

**326 / 333**篇是 Frontend Masters 課程系列筆記（98%）

**306**篇發布於 2026 年（約每天 1 篇，排程自動發布）

**0**頁有 canonical、og:image、twitter:card

## 進度追蹤

每個問題章節最後都有一段「TODO」checklist，記錄待辦事項與處理進度；做完一項就勾選，並在後面註記 commit。原本的證據、影響、修法都保留，讓後續開發知道這項工作的前因。

| 章節                                     | 優先級 | 狀態                                                          |
| ---------------------------------------- | ------ | ------------------------------------------------------------- |
| 建置失敗導致正式站停在舊版本             | P0     | 已修復，剩上線確認與失敗通知                                  |
| 每頁內嵌 611 KB 文章資料                 | P0     | 已修復（`f77096f`、`a74fbd2`），剩 PageSpeed 量測與瀏覽器實測 |
| 沒有 canonical；首頁 og:url 錯誤         | P1     | 已完成（`574a6d5`）                                           |
| Title 模板沒有品牌名，首頁標題是「首頁」 | P1     | 已完成（`574a6d5`）                                           |
| 社群分享卡與結構化資料不完整             | P1     | 進行中（`og:site_name` 已補，`574a6d5`）                      |
| CI 淺層 clone 讓「更新時間」失真         | P1     | 未開始                                                        |
| 內容高度集中在課程筆記，原創性不足       | P1     | 未開始                                                        |
| 標籤與分類頁無法被索引                   | P2     | 未開始                                                        |
| URL 大小寫混用與底線                     | P2     | 未開始                                                        |
| 中文網頁字型                             | P2     | 已查明，決定維持現狀                                          |
| 第三方資源與圖片                         | P2     | 進行中（GIF 已處理，`2e4d25b`）                               |
| 全球華語讀者：簡體中文的觸及             | P2     | 未開始                                                        |
| AI 搜尋                                  | P2     | 未開始                                                        |
| 零碎項目                                 | P3     | 未開始（新增 hydration mismatch）                             |
| 文件同步                                 | —      | 進行中（文章資料流已完成）                                    |

## 最優先的五件事

1. ✅ 已修復（`eda6f8a`、`57ddd15`）P0**修好部署。**2 篇文章的 `<details>` 區塊內含 `` `Promise<Type>` `` 之類的泛型語法，Vue 把它當成未閉合的 HTML 標籤，整站 build 失敗。我在本機暫時修正這 2 處後 build 即成功（已還原，未 commit）。
2. P0**把文章列表移出 `themeConfig`。**每一頁都夾帶 611 KB 的 JSON，文章頁 HTML 690 KB、首頁 980 KB，且會隨文章數線性成長。
3. ✅ 已完成 canonical／og:url／title（`574a6d5`），og:image 另案進行 P1**補齊 head 基本盤：**canonical、og:image／twitter:card、修正首頁 `og:url`、改 title 模板（目前品牌名完全沒出現在 title）。
4. P1**CI 改用完整 git 歷史（`fetch-depth: 0`）**，否則 lastUpdated、`dateModified`、sitemap `lastmod` 很可能全部是部署當下的時間（推論）。
5. P1**為內容加上「原創價值層」：**系列 hub 頁＋個人實作／比較／踩坑。98% 是公開課程筆記且以每日 1 篇的速度發布，是目前最大的競爭力與政策風險。

## 技術 SEO

P0

### 建置失敗導致正式站停在舊版本

證據

「Test & Deploy」workflow run #221–#225（2026-10-02 ～ 10-06）全部 `failure`，log 為 `Element is missing end tag`；#226、#227 為 skipped。本機重現相同錯誤，問題位置：

- `articles/dev/typescript_fundamentals_v4/28-generics-best-practices.md:101`：``<summary>…`makeTuple<T, U>(…)`…</summary>``
- `articles/dev/typescript_fundamentals_v4/22-explicit-function-return-types.md:112`：`<details>` 內緊接的 `` `Promise<Type>` ``（沒有空行，markdown-it 視為 raw HTML，不解析反引號）

影響

10/02 之後自動發布的文章都沒上線，sitemap 也沒更新。對 SEO 而言是最直接的損失。

修法

- 改成 `<code>Promise&lt;Type&gt;</code>`，或在 `<details>` 內容前後加空行讓 markdown 生效（已驗證前者可 build）。
- 預防：`validate-drafts.yml`／PR 的 test job 目前只跑 vitest，沒跑 build。建議在草稿驗證或 PR 檢查加上 `npm run build`，或在 `validate-drafts.js` 加一條規則：偵測 HTML 區塊內反引號包住的 `<X>`。
- 部署失敗目前沒有任何通知；可以讓 workflow 失敗時開 issue 或寄信。

TODO

- [x] 修正 2 篇文章的泛型語法，恢復 build（`eda6f8a`）
- [x] `validate-drafts.js` 新增規則，偵測未跳脫的 HTML 標籤（`57ddd15`，規則放在 `.github/scripts/html-tag-utils.js`）
- [ ] 確認正式站已重新部署成功，10/02 之後的文章與 sitemap 已上線
- [ ] workflow 失敗時開 issue 或寄信通知
- [ ] （選做）PR／草稿驗證加跑 `npm run build`，攔截驗證規則沒涵蓋的 build 錯誤

P0

### 每頁內嵌 611 KB 文章資料

效能 / CWV

證據

`.vitepress/config.mts` 把 `posts`、`devPosts`、`lifePosts`（含完整 front matter 與 description）放進 `themeConfig`。VitePress 會把 `themeConfig` 序列化進每一頁的 `window.__VP_SITE_DATA__`。實測：文章頁 HTML 690 KB（gzip 後 195 KB），首頁 980 KB；共 406 頁。

影響

增加下載與 JSON 解析時間，拖慢 LCP 與 INP（推論，需以 PageSpeed Insights／CrUX 驗證）。Front-End-Checklist 的建議是整頁重量 1500 KB 以內，HTML 本身就已用掉一大半，而且每多一篇文章就再加重所有頁面。

修法

改用 VitePress 的 `createContentLoader`（`posts.data.ts`），只在需要列表的元件 import；文章頁需要的「上下篇／推薦」只帶 `title`、`url`、`date`、`series`、`order` 這些欄位。專案裡的 `reading-time.data.ts` 已經是這個模式，可以沿用。依 CLAUDE.md 慣例，`getPosts` 應抽成共用邏輯，不要在 loader 再實作一份。

TODO

實際做法（2026-10-09）

沒有採用上面的 data loader，改用 `transformPageData` 逐頁注入。原因有兩個：

- data loader 的資料會被打包進 import 它的元件所在的 chunk。這個專案的 theme 元件都在 `theme/index.ts` 靜態註冊，資料會進主 bundle，每頁照樣下載（只是從 HTML 移到可快取的 JS），要再搭配 `defineAsyncComponent` 才能真正只在需要的頁面載入。
- `createContentLoader` 要重做一次 `getPosts` 的 pin／日期排序與 section 過濾，違反 CLAUDE.md 的共用邏輯原則。

做法：`config.mts` 只呼叫一次 `getPosts()`，`transformPageData` 呼叫 `.vitepress/theme/postPageData.ts` 的 `buildPostPageData()`，依頁面類型（文章頁、列表頁、`pages/` 彙整頁）只注入該頁需要的資料，元件改讀 `useData().page`。細節見 [how-this-blog-works.md](./how-this-blog-works.md#build-時資料流)。

本機 build 實測（gzip 前／後）：

| 頁面               | 改前           | 改後          |
| ------------------ | -------------- | ------------- |
| 文章頁             | 826 KB／195 KB | 55 KB／18 KB  |
| 首頁               | 980 KB／216 KB | 209 KB／40 KB |
| `pages/archives`   | 969 KB／211 KB | 198 KB／33 KB |
| `__VP_SITE_DATA__` | 約 611 KB      | 6 KB          |
| 全站 HTML 合計     | 356 MB         | 43 MB         |

列表頁剩下的大小主要是側欄分類樹：SSR 會把全部 333 篇文章的連結渲染進 HTML（首頁約 340 個 `<a>`）。這是另一個問題，見下方 TODO。

後續（`d9666ad`）：分類樹的子清單改用 `v-if`，收合時不渲染文章連結，首頁 HTML 未壓縮從 209 KB 降到 106 KB。

TODO

- [x] 記錄目前的 HTML 大小作為基準（見上表）
- [ ] 記錄 PageSpeed 分數作為基準（需在正式站量測）
- [x] `getPosts` 維持唯一資料來源，`calcPagesTotal` 抽成共用、`initTags`／`initCategory` 改泛型供 server 與 client 共用（`f77096f`）
- [x] ~~新增 `posts.data.ts`~~ 改用 `transformPageData` 逐頁注入（`postPageData.ts`，附單元測試）（`f77096f`）
- [x] 上下篇／推薦／側欄只帶精簡欄位（`PostLink`：`title`、`date`、`pin`）（`f77096f`）
- [x] 從 `themeConfig` 移除 `posts`、`devPosts`、`lifePosts`、`seriesMap` 與各分頁總數（`f77096f`）
- [x] 量測改動後的 HTML 大小（見上表）
- [ ] 上線後量測 PageSpeed 分數
- [x] 本地前後比較（`npm run perf:compare`，2026-10-09，記錄：[perf-log/2026-10-09-9962888](./perf-log/2026-10-09-9962888.md)）：
      HTML 傳輸量（brotli）減少 43–52 KB，但每頁的 page chunk 跟著變大：列表頁 0.5 KB → 73 KB、文章頁 1.5 KB → 22 KB（未壓縮）。
      首頁的 JS 增加 18 KB，預先抓取（prefetch）增加 45 KB，首頁總傳輸量反而多了約 18 KB；時間類指標大多在雜訊內（FCP、LCP 各僅 1 頁超出雜訊）
- [x] 縮小 page chunk：首頁 page chunk 的 73 KB 裡，`listSidebar`（側欄分類樹）佔 53 KB、`listPosts` 佔 6 KB。
      保留展開 UI，分類樹文章連結改成 data loader ＋ 第一次展開時動態 import（`a74fbd2`，記錄：[perf-log/2026-10-09-a74fbd2](./perf-log/2026-10-09-a74fbd2.md)）：
      列表頁 page chunk 16.3 KB → 2.2 KB（brotli 中位數）；和上一筆相比，各頁 JS 或 prefetch 約減 15 KB，`/dev/` 總傳輸量減 30 KB。
      首頁的 prefetch 仍比 base 多約 45 KB，推測來自列表上文章頁的 page chunk（`postNav`、`seriesPosts` 等），尚未查證
      做法見 [how-this-blog-works.md](./how-this-blog-works.md) 的「例外：側欄分類樹用 data loader ＋ 動態 import」
- [x] 列表頁側欄分類樹收合時不渲染文章連結（`BaseTreeview` 改 `v-if`）（`d9666ad`，記錄：[perf-log/2026-10-09-d9666ad](./perf-log/2026-10-09-d9666ad.md)）：
      和上一筆相比，列表頁 HTML 傳輸量 29.9 KB → 17.2 KB，總傳輸量約減 13–14 KB；JS 與 prefetch 不變，文章頁與 `pages/` 頁不受影響
- [ ] 查證首頁 prefetch 仍比 base 多約 45 KB 的來源（`a74fbd2` 記錄的「其他傳輸量」）：推測是首頁列出的文章頁 page chunk
      （每個約 3 KB brotli，含 `postNav`、`seriesPosts`／`suggestPosts`），確認後再決定要不要精簡 `seriesPosts` 的形狀
- [ ] 瀏覽器實測 hydration 與 SPA 切頁：上下篇、系列目錄、`/pages/tags`、分頁。
      已用 headless Chrome 驗過側欄分類樹展開與翻轉卡影片；其餘只驗過 SSR 輸出
- [ ] （選做）`reading-time.data.ts` 把全部文章的閱讀時間打包進主 bundle，可改在 `transformPageData` 逐頁計算

P1

### 沒有 canonical；首頁 og:url 錯誤

證據

所有輸出頁面都沒有 `<link rel="canonical">`。`transformHead.ts` 對根目錄 `index.md` 的處理會產生 `og:url = https://hsiu.soy/index`（`replace('/index.md','')` 對根目錄不成立）。

修法

在 `transformHead` 用同一個修正後的 URL 同時輸出 canonical 與 og:url。分頁頁面（`/dev/page/3`）使用**自我 canonical**，不要全部指回第 1 頁（Google 電商分頁指南的建議）。

TODO

- [x] 修正 `transformHead.ts` 對根目錄 `index.md` 的 URL 計算（`574a6d5`，改用共用的 `utils/pagePath.ts`）
- [x] 用同一個 URL 輸出 `<link rel="canonical">` 與 og:url（`574a6d5`，在 `transformPageData` 寫入 `frontmatter.head`，見 [seo.md](./seo.md)）
- [x] 分頁頁面使用自我 canonical（`574a6d5`）
- [x] 實作時另外發現：`/dev/`、`/life/` 的 og:url 少了結尾斜線，與 sitemap 不一致；404 頁也輸出了 og:url 和 `Article` JSON-LD。已一併修正（`574a6d5`）
- 效能記錄：[perf-log](./perf-log/2026-10-10-574a6d5.md)（全部在雜訊內；文章頁 JS +0.2 KB 來自 `frontmatter.head`）

P1

### Title 模板沒有品牌名，首頁標題是「首頁」

證據

`titleTemplate: '網頁前端 | 生活紀錄 | 攝影'`（沒有 `:title`，VitePress 會接在後面）→ 輸出 `首頁 | 網頁前端 | 生活紀錄 | 攝影`、`Dev | 網頁前端 | …`。所有分頁頁面標題相同；179／333 篇的標題本身已超過 32 字，再加 18 字的後綴。

影響

Google 建議 title 要具描述性、簡潔，避免「Home」這類泛用字，並謹慎使用品牌字串；過長或重複的 title 容易被改寫。品牌名「持續！修鍊之路」或「Wen-Hsiu's Blog」都沒出現，不利於品牌搜尋與辨識。

修法

- `titleTemplate: ':title | 持續！修鍊之路'`（或較短的品牌名）。
- 首頁 front matter 改成具描述性的標題，例如「前端工程師的技術筆記：JavaScript、TypeScript、Web 效能」。
- 分頁加「第 N 頁」到 title 與 description，避免重複。
- `pages/tags|archives|category` 的 description 目前是 `Tags`／`Archive`／`Category`，請改寫成中文描述。

TODO

- [x] `titleTemplate` 改成 `:title | Wen-Hsiu's Blog`（決定用英文品牌名，與 `config.title` 一致；`574a6d5`）
- [x] 首頁 front matter 改成具描述性的標題：「Wen-Hsiu's Blog｜前端工程師的技術筆記與生活紀錄」，`titleTemplate: false`（`574a6d5`）
- [x] 分頁的 title 與 description 加「第 N 頁」（`574a6d5`）；`/dev/`、`/life/` 也補了中文標題與 description
- [x] `pages/tags`、`archives`、`category` 的 title 與 description 改寫成中文描述（`574a6d5`）
- 效能記錄：[perf-log](./perf-log/2026-10-10-574a6d5.md)

P1

### 社群分享卡與結構化資料不完整

社群 / AI 搜尋

證據

沒有 `og:image`、`og:site_name`、`twitter:card`。JSON-LD `Article` 沒有 `image`、`description`、`author.url`；`WebSite` 沒有 `name`；`Person` 還是 TODO。front matter 也沒有封面欄位（333 篇中 0 篇）。

影響

分享到 Threads／LINE／Slack 時沒有預覽圖，點擊率低。Google Article 結構化資料把 `image`、`author.url` 列為建議屬性；作者實體（Person＋`sameAs` GitHub、Threads、履歷站）有助搜尋引擎與 AI 系統辨識「誰寫的」。

修法

- build 時自動產生 OG 圖：用 satori＋resvg 把標題、系列名、頭像畫成 1200×630 PNG，不必每篇手動做圖。
- `Article` 改為 `BlogPosting`，補 `image`、`description`、`author: { name, url, sameAs }`、`publisher`。
- 系列文章加 `BreadcrumbList`（首頁 › Dev › 系列 › 文章）。
- 部署後用 Rich Results Test 驗證。

TODO

- [x] 補 `og:site_name`（`574a6d5`）
- [ ] 補 `twitter:card`（與 OG 圖一起做，用 `summary_large_image`）
- [ ] build 時用 satori＋resvg 產生 1200×630 OG 圖，並輸出 `og:image`
- [ ] JSON-LD `Article` 改為 `BlogPosting`，補 `image`、`description`、`author: { name, url, sameAs }`、`publisher`
- [ ] `WebSite` 補 `name`；完成 `Person`（`sameAs` 連到 GitHub、Threads、履歷站）
- [ ] 系列文章加 `BreadcrumbList`
- [ ] 部署後用 Rich Results Test 驗證

P1

### CI 淺層 clone 讓「更新時間」失真（推論）

證據

`.github/workflows/deploy.yml` 的 `actions/checkout@v4` 沒有設定 `fetch-depth`，預設只抓最新 1 個 commit。VitePress 的 `lastUpdated` 取自 git log。

影響

頁面上的「最後更新時間」、`article:modified_time`、JSON-LD `dateModified`、sitemap `lastmod` 可能全部是同一個時間。Google 會忽略不可信的 lastmod。這是依機制推論；可以打開線上 sitemap.xml 看 lastmod 是否全部相同來確認。

修法

```
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

兩個 deploy job 都要改。

TODO

> 補充（2026-10-08）：`auto-publish.yml` 已經設定 `fetch-depth: 0`，只有 `deploy.yml` 需要改。

- [ ] `deploy.yml` 兩個 deploy job 的 `actions/checkout@v4` 加 `fetch-depth: 0`
- [ ] 部署後檢查線上 sitemap.xml 的 lastmod 是否不再全部相同
- [ ] 驗證 Search Console、提交 sitemap、確認索引涵蓋率（其他章節「依數據決定」的項目都需要這份數據）

P2

### 標籤與分類頁無法被索引

證據

`pages/tags.md` 用 `<ClientOnly>` 包住 `Tags.vue`（元件在 setup 讀 `location`，無法 SSR），輸出 HTML 只剩「標籤總覽」幾個字。所有標籤共用 `/pages/tags?tag=X` 一個 URL。

修法

用 `[tag].paths.ts` 產生靜態 `/tags/javascript` 頁面，每頁有專屬 title／description／文章清單。同時整理 tag 命名：`frontendMasters`、`javaScriptTheHardPartsV3` 這類 camelCase 識別字不適合當搜尋落地頁，參照 `rules/tags.md` 統一。

TODO

- [ ] 用 `[tag].paths.ts` 產生靜態 `/tags/<tag>` 頁面，各有 title／description／文章清單
- [ ] 依 `rules/tags.md` 整理 tag 命名

P2

### URL 大小寫混用與底線

證據

`/dev/javaScript_the_hard_part_v3/…`、`/dev/JS-Dungeon/…`。

建議

Google 的 URL 結構建議以連字號取代底線；Front-End-Checklist 建議全小寫。但改 URL 需要在 Cloudflare Pages `_redirects` 設 301，並承擔短期排名波動。**我的建議：新系列一律用小寫連字號；舊 URL 等 Search Console 有數據後再決定**，不要為了規範而搬遷已有排名的頁面。

TODO

- [ ] 新系列一律用小寫連字號 URL
- [ ] 等 Search Console 有數據後，決定舊 URL 是否改名（需在 Cloudflare Pages `_redirects` 設 301）

P2

### 中文網頁字型

效能

證據

`uno.config.ts` 的 `presetWebFonts` 載入 Google Fonts 的 Noto Serif TC 200／500／800 三個字重，
build 後內嵌進 `style.css`，每個字重各 108 個 `unicode-range` 子集（也讓 `style.css` 未壓縮達 466 KB）。
每頁會下載 17–18 個子集，約 1.4 MB，是全站傳輸量最大的一項。

但字型**不是** FCP／LCP 的瓶頸。2026-10-09 曾以為它把模擬 FCP 拉長到約 10 秒，
對照實驗推翻了這個推論：用 Lighthouse CLI 量 `vitepress preview`，擋掉 `fonts.gstatic.com` 後 FCP 反而是 12.3 秒（不擋為 9.8 秒）。
那個 10 秒只出現在「Lighthouse CLI 量 `vitepress preview`」的組合，原因未查明；
同一天用 `perf:compare`（arm64 Node）量同樣的 build，首頁 FCP 2.1 秒、LCP 3.5 秒、Performance 86
（記錄：[perf-log/2026-10-09-0b42033](./perf-log/2026-10-09-0b42033.md)）。
TBT 10 秒以上則是 x64 Node 的量測誤差（見 [performance-testing.md](./performance-testing.md)）。

決定（2026-10-09）

三個字重都有用到，維持現狀，不減字重、不改系統字型、不自行子集化。

P2

### 第三方資源與圖片

效能

證據

同時載入 GA4（gtag）、Cloudflare Web Analytics、AdSense、Giscus；首頁有 tenor 動態 GIF；文章頁從 buymeacoffee CDN 載圖；顯示為 104 px（`size-26`）的 `avatar-pixel-v2-mini.jpg` 檔案 112 KB，`avatar-pixel-v2.jpg` 580 KB。

本地 Lighthouse 實測（2026-10-09，`d9666ad`）：首頁圖片 1990 KB 中，tenor GIF 就佔了 1821 KB。這張 GIF 是 `Page.vue` 頭像翻轉卡（`BaseFlipCard`）的背面，
雖然加了 `loading="lazy"`，但它和正面疊在同一個位置、位於首屏內，所以頁面一載入就會下載。

修法

- 兩套分析工具擇一（Cloudflare 的較輕量、無 cookie）。
- 頭像輸出 WebP／AVIF 的實際顯示尺寸（2× 約 208 px）；GIF 改成 `<video>` 或靜態圖，或等使用者第一次翻轉卡片時才設定 `src`。
- Giscus 改成捲動到附近才載入。
- 若有歐洲讀者且使用 AdSense，需要 Consent Mode v2。

TODO

- [ ] GA4 與 Cloudflare Web Analytics 擇一
- [ ] 頭像輸出實際顯示尺寸的 WebP／AVIF
- [x] 首頁 tenor GIF（1.8 MB）轉成 208 px 的 mp4（21 KB，`articles/public/avatar-back.mp4`），並改成第一次 hover 翻轉卡時才載入（`2e4d25b`，記錄：[perf-log/2026-10-09-2e4d25b](./perf-log/2026-10-09-2e4d25b.md)：首頁與 `/dev/` 圖片傳輸量約減 1820 KB，總傳輸量減半）
- [ ] Giscus 捲動到附近才載入
- [ ] 確認是否有歐洲讀者；有的話 AdSense 加 Consent Mode v2
- [ ] 依 CrUX 實測決定是否需要進一步優化

P3

### 零碎項目

RSS

`feed.rss` 5 MB（全部文章、全文），部分閱讀器可能逾時；建議只放最新 20～50 篇。

無障礙

9 張 markdown 圖片沒有 alt；`PostSupports.vue` 頭像沒有 alt；VitePress 介面字串仍是英文（Skip to content、Return to top），可用 `skipToContentLabel`、`returnToTopLabel` 等設定中文。

描述

10 篇 description 少於 40 字、10 篇多於 160 字，2 篇重複。

關於頁

導覽列「關於我」連到外部 resume.hsiu.soy；站內 `life/about-me` 內容較短。站內有一個完整的作者頁（經歷、專長、聯絡方式）對 E-E-A-T 有幫助，並可作為 `author.url`。

TODO

- [ ] `feed.rss` 只放最新 20～50 篇
- [ ] 9 張 markdown 圖片補 alt；`PostSupports.vue` 頭像補 alt
- [ ] VitePress 介面字串改中文（`skipToContentLabel`、`returnToTopLabel` 等）
- [ ] 修正 description：10 篇少於 40 字、10 篇多於 160 字、2 篇重複
- [ ] 站內建立完整作者頁，作為 `author.url`
- [ ] 修正列表頁（`/`、`/dev/`）的 hydration mismatch：console 出現 `Hydration completed but contains mismatches.`。
      master（`cb87c47`）就有，文章頁與 `/pages/tags` 沒有；原因未查（2026-10-09 發現）

## 內容策略與競爭力

P1

### 內容高度集中在課程筆記，原創性不足

現況

326／333 篇屬於 8 個 Frontend Masters 課程系列（Deep JS Foundations 69、JS Hard Parts 50、Full Stack 47、Web Performance 41…），2026 年發布 306 篇，以排程每天 1 篇的速度上線。文章平均品質不差（中位數約 2,300 字、結構清楚、文末有 Q&A），但多數是「轉述課程內容」。

風險

- **競爭力：**同主題的搜尋結果有 MDN、官方文件與大量既有中文教學。Google 的「有用內容」自評問題第一條就是是否提供*原創*資訊、研究或分析；單純轉述來源的頁面很難勝出。
- **政策：**Google 的 scaled content abuse 政策針對「大量產生、以排名為主要目的、對使用者價值低的內容」，不論是人工或自動產生。Google 沒有公布任何數量門檻，所以我**無法判斷**這個網站是否會被認定，但「單一來源＋高頻率＋相似模板」正是這類政策關注的形態，值得主動降低風險。
- **授權：**Frontend Masters FAQ 允許在附上出處與連結的前提下分享課程專案，但不允許未經同意散布其內容。筆記與「散布」的界線我無法判定（非法律意見），建議讀完其 User Agreement 或直接寄信詢問，並在每篇明確標註來源與課程連結。

建議

- **系列 hub 頁**（目前沒有）：每個系列一頁，寫課程總覽、學習路徑、你的心得與適合誰，連到所有章節。這是最能累積連結與排名的頁面。
- 在既有文章加入課程沒有的東西：實務踩坑、與工作專案的連結、跟 MDN／規格的對照、效能數字、自製圖解。專案 `web-dev-quiz`、`JS-Dungeon` 這類自己出題、自己實作的系列，原創性就明顯較高。
- 放慢筆記發布頻率，把時間挪去寫少量的「旗艦文」（完整指南、比較文、實作案例），並從筆記內連過去。
- title 以搜尋意圖為主，例如「JavaScript 閉包是什麼？用執行環境與 Call Stack 圖解」，比把課程章節名稱完整搬過來好。

TODO

- [ ] 8 個 Frontend Masters 系列各做一個 hub 頁
- [ ] 確認 Frontend Masters 授權範圍（讀 User Agreement 或寄信詢問）
- [ ] 每篇筆記統一標註來源與課程連結
- [ ] 放慢筆記發布頻率，每月寫 1～2 篇原創旗艦文，並從相關筆記連過去
- [ ] 逐步在既有文章補上課程沒有的內容
- [ ] title 改以搜尋意圖為主

P2

### 全球華語讀者：簡體中文的觸及

現況

`lang="zh-TW"`、`og:locale=zh_TW`，只有繁體版本，用語是台灣慣用（函式、物件、程式）。

未知

Google 對簡體查詢與繁體頁面之間的比對程度，我沒有可靠資料，**不知道**實際損失多少。請先在 Search Console 看國家／查詢語言分布再決定。

選項

- **A. 維持單一繁體版**（成本最低）：在首段或術語旁補上常見對照（函式／函数、物件／对象）。
- **B. build 時用 OpenCC 產生 `/zh-hans/` 鏡像**，並加上 `hreflang="zh-Hant"`、`zh-Hans`、`x-default`。頁數加倍、詞彙轉換需校對，且 hreflang 必須雙向一致。
- 我的建議：先做 A 並蒐集數據；簡體流量明顯時再考慮 B。

TODO

- [ ] 選項 A：在首段或術語旁補上繁簡對照
- [ ] 依 Search Console 的國家／查詢語言分布，決定是否做選項 B

P2

### AI 搜尋（AI Overviews、ChatGPT、Perplexity）

重點

- Google 官方的說法是：既有 SEO 最佳實務同樣適用於 AI Overviews／AI Mode，不需要特殊標記。前面列的 canonical、結構化資料、作者實體、原創內容就是主要工作。
- `llms.txt`：Google 表示不需要，John Mueller 稱其「目前純屬推測」；但 Lighthouse 13.3 已有相關稽核項目。成本很低，可列為選做，不要期待成效。
- 文章已有清楚的定義段落與文末 Q&A，這種結構容易被引用；hub 頁可加上「一句話結論」。
- `robots.txt` 目前全開放。是否允許 GPTBot、Google-Extended 等爬蟲是取捨問題（被引用 vs. 內容被拿去訓練），建議明確決定後寫進 robots.txt。

TODO

- [ ] 決定是否允許 GPTBot、Google-Extended 等爬蟲，並寫進 `robots.txt`
- [ ] （選做）發布 `llms.txt`
- [ ] hub 頁加上「一句話結論」（與原創性章節的 hub 頁一起做）

## Front-End-Checklist 對照

只列出與部落格相關的 SEO／效能項目。✓ 符合，△ 部分符合，✗ 不符合。

| 項目                                     | 狀態 | 說明                                                  |
| ---------------------------------------- | ---- | ----------------------------------------------------- |
| Set canonical URLs for all pages         | ✗    | 完全沒有                                              |
| Use canonicals on paginated pages        | ✗    | 同上                                                  |
| OG URL Match                             | ✗    | 首頁輸出 `/index`                                     |
| Open Graph Tags / OG Image Size          | △    | 有 title、description、url、type，缺 image、site_name |
| Add Twitter Card meta tags               | ✗    | 無                                                    |
| Write a descriptive page title           | △    | 首頁為「首頁」，沒有品牌名                            |
| Keep page titles unique                  | △    | 分頁頁面標題重複                                      |
| Write a meta description for each page   | △    | 文章 100%；工具頁是佔位字                             |
| Avoid duplicate meta descriptions        | △    | 分頁共用站台描述；2 篇文章重複                        |
| Implement valid Article structured data  | △    | 缺 image、description                                 |
| Implement comprehensive author markup    | ✗    | 只有 name，無 url、sameAs                             |
| Implement valid BreadcrumbList schema    | ✗    | 系列文章很適合加                                      |
| Use a single descriptive H1              | ✓    | 輸出頁 H1 僅 1 個                                     |
| Create and submit an XML sitemap         | △    | 有；lastmod 可能失真                                  |
| Show published and updated dates         | △    | 有顯示；更新時間可能失真                              |
| Publish a robots.txt file                | ✓    | 有並指向 sitemap                                      |
| Make important pages indexable           | △    | 標籤頁只在客戶端渲染                                  |
| Use lowercase URLs / Use hyphens in URLs | ✗    | 部分系列目錄大小寫混用、用底線                        |
| Add internal links to key pages          | △    | 158／333 篇有站內連結；缺 hub 頁                      |
| Create a dedicated About page            | △    | 主要連到外部履歷站                                    |
| Provide meaningful alt text for images   | △    | 9 張文章圖片缺 alt                                    |
| Keep page weight under 1500KB            | △    | HTML 本身 690～980 KB                                 |
| Convert animated GIFs to video           | ✗    | 首頁 tenor GIF                                        |
| Optimize third-party scripts             | △    | 雙分析工具＋AdSense＋Giscus                           |
| Add hreflang tags for multilingual sites | —    | 目前單語；見簡體選項 B                                |
| Publish llms.txt                         | —    | 選做                                                  |

## 建議執行順序

### 第 1 週：止血

- ~~修正 2 篇文章的泛型語法並重新部署~~（已完成，`eda6f8a`）；在草稿驗證流程加入檢查（已加入 HTML 標籤驗證規則 `57ddd15`，build 檢查為選做）
- deploy job 加 `fetch-depth: 0`
- 驗證 Search Console，提交 sitemap，確認索引涵蓋率

### 第 2–3 週：head 與效能

- ~~canonical、修首頁 og:url、title 模板、分頁標題、工具頁描述~~（已完成，`574a6d5`）
- ~~文章列表改用 `createContentLoader`~~ 已改用 `transformPageData` 逐頁注入（`f77096f`），剩上線後量 PageSpeed 分數
- 自動產生 OG 圖、twitter:card、BlogPosting／Person／BreadcrumbList

### 第 1–2 個月：內容

- 8 個系列各做一個 hub 頁
- 靜態標籤頁、整理 tag 命名
- 確認 Frontend Masters 授權範圍並統一標註出處
- 每月 1～2 篇原創旗艦文，從相關筆記連過去

### 之後：依數據決定

- 依 Search Console 國家／查詢資料決定是否做簡體版
- 依 CrUX 實測決定第三方腳本與圖片的進一步優化
- 舊 URL 是否改小寫連字號

依專案的 CLAUDE.md 慣例，實作上述架構變更時應同步更新文件：`docs/how-this-blog-works.md`（文章資料流、標籤頁、hub 頁路由）、`docs/ci-cd.md`（fetch-depth、build 檢查、失敗通知）、`rules/frontmatter.md`（若新增 OG 圖或封面欄位），並可新增 `docs/seo.md` 記錄 head／結構化資料的設計決策。

### 文件同步 TODO

- [x] `docs/how-this-blog-works.md`：文章資料流（「Build 時資料流」，`f77096f`、`a74fbd2`）
- [ ] `docs/how-this-blog-works.md`：靜態標籤頁、hub 頁路由
- [ ] `docs/ci-cd.md`：fetch-depth、build 檢查、失敗通知
- [ ] `rules/frontmatter.md`：若新增 OG 圖或封面欄位
- [x] 新增 `docs/seo.md`，並補進 CLAUDE.md 的文件表格（head 的 URL 與 title 規則）

## 參考資料

1. [thedaviddias/Front-End-Checklist](https://github.com/thedaviddias/Front-End-Checklist)（SEO 94 條、Performance 44 條、Images 25 條）
2. Google Search Central：[Influencing your title links in search results](https://developers.google.com/search/docs/appearance/title-link)
3. Google Search Central：[Article (Article, NewsArticle, BlogPosting) structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
4. Google Search Central：[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
5. Google Search Central Blog：[What web creators should know about our March 2024 core update and new spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)
6. Google Search Central：[Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions)（hreflang）
7. Google 電商分頁建議（二手整理）：[GSQi – pagination and rel canonical](https://www.gsqi.com/marketing-blog/how-to-set-up-pagination-rel-next-prev/)
8. web.dev：[How the Core Web Vitals metrics thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds)（LCP ≤2.5s、INP ≤200ms、CLS ≤0.1，第 75 百分位）
9. VitePress：[Build-Time Data Loading](https://vitepress.dev/guide/data-loading)（createContentLoader）
10. Search Engine Journal：[Google says llms.txt is purely speculative for now](https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/)
11. Frontend Masters：[Course FAQ](https://frontendmasters.com/faq/courses/)、[User Agreement](https://frontendmasters.com/company/terms/)
12. helpful content 自評問題（二手整理）：[Search Engine Land – What is helpful content, according to Google](https://searchengineland.com/what-is-helpful-content-google-387360)
