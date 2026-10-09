# SEO：head 標籤

這份文件說明每頁 `<head>` 裡的 SEO 標籤怎麼產生、為什麼這樣分工。問題背景與待辦見 [seo-diagnosis.md](./seo-diagnosis.md)。

## 分工

| 內容                                                                                           | 位置                                                                | 理由                                                                                          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `<link rel="canonical">`、`og:url`                                                             | `transformPageData` → `frontmatter.head`（`pageHead.ts`）           | VitePress 官方文件就是用這個方式加 canonical；`frontmatter.head` 在 client 端換頁時會跟著更新 |
| 分頁的 title／description（加「第 N 頁」）                                                     | `transformPageData` 改 `pageData.title`／`description`              | VitePress 用 `pageData.title` 套 `titleTemplate` 並輸出 `<meta name="description">`           |
| 其他 og 標籤（`og:title`、`og:description`、`og:type`、`og:site_name`、`article:*`）與 JSON-LD | `transformHead`（`transformHead.ts`；JSON-LD 見下方「結構化資料」） | 只在 build 時執行；官方文件也建議把 og:image 這類較耗時的標籤放這裡                           |
| `og:image*`、`twitter:card`、產生 OG 圖                                                        | `transformHead` 呼叫 `plugins/og-image`（見下方「OG 分享圖」）      | 產圖成功才輸出標籤                                                                            |
| 站台共用（favicon、analytics）                                                                 | `config.mts` 的 `head`                                              | 每頁都一樣                                                                                    |

注意：`transformHead` 的輸出只寫進 SSR 產出的 HTML，client 端換頁時**不會**更新。爬蟲每頁都直接抓 HTML，所以不影響 SEO；但換頁後瀏覽器裡看到的 og 標籤會停在第一個頁面的值。需要換頁後也正確的標籤，請放 `frontmatter.head`。

`transformHead` 收到的 `pageData` 已經過 `transformPageData`，所以 `og:title` 直接用 `pageData.title`，會帶到分頁頁碼。

## URL 規則（`utils/pagePath.ts`）

頁面路徑一律用 `toPagePath(relativePath)` 計算，canonical、og:url、JSON-LD 的 `url`／`@id`，以及 `getPosts()` 的 `regularPath` 都用它，避免各處各自 `replace('.md', '')` 而產生分歧。規則對齊 VitePress 在 `cleanUrls: true` 下產生的 sitemap：

| relativePath    | 路徑                    |
| --------------- | ----------------------- |
| `index.md`      | `/`                     |
| `dev/index.md`  | `/dev/`（保留結尾斜線） |
| `dev/foo.md`    | `/dev/foo`              |
| `dev/page/2.md` | `/dev/page/2`           |

踩過的坑：舊寫法 `replace('/index.md', '')` 對根目錄的 `index.md` 不成立（產生 `/index`），而 `/dev/` 被算成 `/dev`，與 sitemap 不一致。

404 頁（`relativePath === '404.md'`）不輸出 canonical、og 標籤與 JSON-LD。

## Title 規則

- `titleTemplate` 為 `:title | Wen-Hsiu's Blog`（`config.mts` 以 `config.title` 組出），品牌名與站台 title 相同。
- 首頁：`title` 寫完整的描述性標題，並設 `titleTemplate: false`，避免品牌名重複。
- 列表頁：`/dev/`、`/life/` 的 front matter 有中文 title 與 description；分頁（`*/page/[page].md`，`params.page > 1`）自動加「第 N 頁」。
- 分頁的 description 若 front matter 沒寫，會先用站台 description 再加頁碼。

## OG 分享圖（`.vitepress/plugins/og-image/`）

build 時用 satori 0.33.5 把版面畫成 SVG，再用 @resvg/resvg-js 2.6.2 轉成 1200×630 PNG。兩者版本鎖定（`--save-exact`），新版本至少要發布兩週才升級。版面以設計稿 <https://claude.ai/artifact/Dpao2gXrrt9L9JBsiCc3sz> 為準。

| 檔案          | 內容                                                                                    |
| ------------- | --------------------------------------------------------------------------------------- |
| `template.ts` | satori 元素樹（文章卡、預設卡）、標題移除 emoji、badge 取 `seriesTitle` 否則 `category` |
| `fonts.ts`    | 向 Google Fonts 取 Noto Serif TC 500／800 的 `text=` 子集，並快取                       |
| `index.ts`    | `createOgImageHead()`：產圖、快取、回傳 og:image 相關 head 標籤                         |

- **哪些頁有專屬圖**：`getPosts()` 的文章（`dev/`、`life/`）。圖片路徑是 `toOgImagePath()`：`dev/foo.md` → `/og/dev/foo.png`。其他頁（首頁、列表、分頁、工具頁、草稿）共用 `/og/default.png`。404 不輸出。
- **在 `transformHead` 產圖**：它只在 build 執行。每頁 render 時順便產圖，並直接寫進 `outDir`，成功才輸出 `og:image`、`og:image:type／width／height／alt` 與 `twitter:card=summary_large_image`。因此產圖失敗時不會指向不存在的檔案。這些標籤和其他 og 標籤一樣，client 端換頁時不會更新（見上方「分工」）。
- **失敗不擋 build**：字型下載失敗或 resvg 載入失敗時，只發出 `[og-image] ⚠` 警告，整個 build 都不輸出 og:image；單頁產圖失敗只影響該頁。
- **並行上限 4**：VitePress 會同時 render 很多頁，不限制的話記憶體會暴增。nolebase plugin 一次渲染全部，build 峰值多了 3GB。
- **快取**：`node_modules/vitepress_cache/og/`。字型的 key 是 hash(字重, 該批字)，圖片的 key 是 hash(模板版本, 頭像內容, 標題, badge)。**改版面時要調高 `template.ts` 的 `TEMPLATE_VERSION`**，否則會沿用舊圖。CI 不做快取，每次全量產圖，因為全量也只多約 15 秒。
- **耗時與記憶體**（M 系列 Mac，x64 Node，2026-10-10）：無快取時 build 45 秒，基準約 29 秒；有快取時 30 秒。記憶體峰值 2.27GB，和沒產圖時差不多。

### 踩過的坑（都不會報錯，只會靜默產出壞圖或變慢）

- Google Fonts `css2` 的 `text=` 超過約 600 字時，會**直接回傳完整字型（約 9.7MB）**。所以 `fonts.ts` 每批最多 400 字；字會先排序，讓批次穩定、快取能命中。不帶瀏覽器 UA 請求時拿到的是 TTF。
- satori 0.33.5 遇到多份**同名**字型時，只會在其中幾份之間 fallback。全站 888 字中有 488 字變成豆腐框。每批要註冊成不同 family（`og0`、`og1`…），再在 `fontFamily` 寫成清單。satori 把文字轉成 path，name 不必對上 TTF 內部的名稱。
- resvg-js 預設每次 render 都會載入系統字型，每張圖多花約 280ms。satori 已經把文字轉成 path，所以設 `font: { loadSystemFonts: false }`。
- 全形「…」會被 satori 量錯寬度，被 `overflow: hidden` 切到只剩一點，所以標題截斷用 `lineClamp: '3 "..."'`（三個半形句點）。
- 標題保留 markdown 反引號（例如 `` `Object.prototype` ``），照原標題呈現。
- `@resvg/resvg-js` 的 native binding 依執行 npm 的 Node 架構安裝。本機的 node_modules 是 x64（asdf 的 Node），所以 build 一律用 x64 Node。`perf:compare` 也透過 `npx vitepress build` 執行，同樣是 x64，不受影響。

## 結構化資料（`utils/structuredData.ts`）

每頁輸出一段 JSON-LD，內容是一個 `@graph`，由 `transformHead` 呼叫 `buildStructuredData()` 產生。404 頁不輸出。

| 節點             | 哪些頁面          | 重點                                                                                                           |
| ---------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `Person`         | 每頁              | `@id` 固定為 `https://hsiu.soy/#person`；`sameAs` 來自 `themeConfig.author.sameAs`（GitHub、Threads、履歷站）  |
| `WebSite`        | 每頁              | `url` 一律是首頁，不是當頁網址；`publisher` 參照 Person                                                        |
| `BlogPosting`    | 文章（非 `page`） | `author`／`publisher` 用 `@id` 參照 Person，作者資料只寫一份；`articleSection` 用 category，`keywords` 用 tags |
| `BreadcrumbList` | 文章              | 首頁 › Dev（或 Life）› 文章；中間層取自 `themeConfig.nav` 裡的站內連結，路徑對不到任何 nav 就不輸出            |

設計決策：

- **`image` 跟著 og-image 走**：`config.mts` 的 `transformHead` 先跑 `ogImageHead()`，從結果取出 `og:image` 再傳給 `transformHead`。產圖失敗時兩邊都不輸出，不會出現指向不存在圖片的 `image`。
- **麵包屑不放系列層**：系列沒有自己的頁面（`/dev/<系列>/` 是 404）。Google 要求最後一層以外的每一層都要有可索引的 `item` URL；指向第一章語意不對，不放 URL 又會被判為無效。之後如果做了系列目錄頁，再在 `buildBreadcrumb()` 補上這層。
- **日期用完整 ISO 8601**（含時區），和 `article:published_time`／`article:modified_time` 用同一個值。
- **序列化時把 `<` 轉成 `\u003c`**，避免標題或描述裡的 `</script>` 提前結束標籤。VitePress 已經會移除 `pageData.title` 裡的 HTML 標籤（例如標題中的 `<li>` 會消失，og:title 也一樣），但 description 不會。

部署後還要用 Rich Results Test 驗證，進度見 [seo-diagnosis.md](./seo-diagnosis.md) 的「社群分享卡與結構化資料不完整」。
