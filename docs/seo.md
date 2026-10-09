# SEO：head 標籤

這份文件說明每頁 `<head>` 裡的 SEO 標籤怎麼產生、為什麼這樣分工。問題背景與待辦見 [seo-diagnosis.md](./seo-diagnosis.md)。

## 分工

| 內容                                                                                           | 位置                                                      | 理由                                                                                          |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `<link rel="canonical">`、`og:url`                                                             | `transformPageData` → `frontmatter.head`（`pageHead.ts`） | VitePress 官方文件就是用這個方式加 canonical；`frontmatter.head` 在 client 端換頁時會跟著更新 |
| 分頁的 title／description（加「第 N 頁」）                                                     | `transformPageData` 改 `pageData.title`／`description`    | VitePress 用 `pageData.title` 套 `titleTemplate` 並輸出 `<meta name="description">`           |
| 其他 og 標籤（`og:title`、`og:description`、`og:type`、`og:site_name`、`article:*`）與 JSON-LD | `transformHead`（`transformHead.ts`）                     | 只在 build 時執行；官方文件也建議把 og:image 這類較耗時的標籤放這裡                           |
| 站台共用（favicon、analytics）                                                                 | `config.mts` 的 `head`                                    | 每頁都一樣                                                                                    |

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

## 待辦

OG 圖（satori 產圖）、`twitter:card`、`BlogPosting`／`Person`／`BreadcrumbList` 還沒做，進度見 [seo-diagnosis.md](./seo-diagnosis.md) 的「社群分享卡與結構化資料不完整」。
