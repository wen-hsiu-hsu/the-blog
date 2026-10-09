# 效能比較（perf:compare）

在本地用 Lighthouse 比較「改動前」與「改動後」的 build，輸出 Markdown 差異表。
調整任何可能影響效能的東西（頁面資料、bundle、圖片、字型、head 標籤）時，
改完先跑這支，用數據確認改善，不要只憑推論。

---

## 用法

```bash
npm run perf:compare                      # 預設：merge-base(HEAD, master) vs 目前工作目錄，5 頁 × 3 輪
npm run perf:compare -- --skip-build      # head 直接用現有的 .vitepress/dist（剛 build 過時省 1 分鐘）
npm run perf:compare -- --base origin/master --runs 5
npm run perf:compare -- --pages /,/dev/,/pages/tags
```

| 參數           | 預設                       | 說明                                            |
| -------------- | -------------------------- | ----------------------------------------------- |
| `--base <ref>` | `merge-base(HEAD, master)` | 比較基準，任何 git ref 皆可                     |
| `--runs <n>`   | `3`                        | 每頁每邊執行次數，取中位數；少於 3 無法估計雜訊 |
| `--pages`      | 見 `DEFAULT_PAGES`         | 逗號分隔的路徑，採 cleanUrls 格式               |
| `--skip-build` | 關                         | 不重新 build head                               |

完整跑一次約 7–8 分鐘：兩次 build 各約 45 秒，Lighthouse 30 次每次約 10 秒。
base 的 build 依 commit sha 快取在 `.vitepress/cache/perf-compare/builds/`，同一個 base 第二次起不必重新 build。

報告印在 stdout，也存到 `.vitepress/cache/perf-compare/reports/<時間>.md`；
同名 `.json` 是每次執行的原始數據。

### 在 Claude Code 裡執行

Chrome 在 Claude Code 的 sandbox 內無法啟動，錯誤為
`waiting for dynamic debugging port in chrome-err.log`。
執行時必須關閉 sandbox（Bash 的 `dangerouslyDisableSandbox`）。

---

## 怎麼讀報告

| 判斷     | 意義                                                         |
| -------- | ------------------------------------------------------------ |
| ✅ 改善  | 差值超出雜訊，方向變好                                       |
| ⚠️ 退步  | 差值超出雜訊，方向變差                                       |
| ≈ 雜訊內 | 差值不大於兩邊多次執行的最大差距（max − min），不能下結論    |
| `=`      | 完全相同；傳輸量差距小於 100 bytes（例如 hash 檔名長度）也算 |

- **傳輸量與請求數幾乎是確定值**，不受機器負載影響，最適合用來驗證「資料搬家、拆 chunk」類的改動。
  圖片與總傳輸量在多次執行間會浮動 1–2 KB，所以傳輸量同樣套用雜訊判斷。
- **「其他傳輸量」主要是 VitePress 的連結預先抓取**：`usePrefetch` 會對畫面內的站內連結加上 `<link rel="prefetch">`，
  抓那些頁面的 page chunk。逐頁注入的資料（`transformPageData`）會寫進 page chunk，
  所以 page chunk 變大時，HTML 與 JS 之外，這一欄也會跟著增加。
- **時間類指標（FCP、LCP、TBT、Speed Index）只看差值**。絕對值跟 PageSpeed Insights 對不上，
  因為 Lighthouse 的模擬節流會依本機 CPU 推算。若結果多為「≈ 雜訊內」，加大 `--runs` 再跑。
- 單一指標出現 ⚠️ 時，先看同頁其他指標與其他頁是否一致，再判斷是不是真的退步。

---

## 運作方式

`scripts/perf-compare.js`（流程）＋ `scripts/perf-utils.js`（可測試的純函式）。

1. **base build**：`git worktree add --detach` 到系統暫存目錄，symlink 目前的 `node_modules` 後執行 `vitepress build`，
   把 dist 搬進快取，再移除 worktree。
2. **head build**：在 repo 根目錄 `vitepress build`，包含未 commit 的變更。兩邊都會移除 `VITE_INCLUDE_DRAFTS`，避免草稿混入。
3. **靜態伺服器**：兩份 dist 各起一個 Node http server，模擬 Cloudflare Pages 的 cleanUrls（`/pages/tags` → `pages/tags.html`）
   和文字檔 brotli 壓縮。只有這樣，傳輸量才接近正式站。
4. **Lighthouse**：共用一個 headless Chrome，base／head **交錯**執行，降低機器負載隨時間漂移造成的偏差。
   用 Lighthouse 預設設定：mobile、模擬節流，跟 PageSpeed Insights 一樣。
5. **彙總**：每個指標各自取中位數，並以 max − min 當雜訊範圍。

### 設計決策與踩坑

- **worktree 不能放在 `node_modules` 底下**（例如 `node_modules/.cache`）：Vite 的 plugin 會把該路徑下的檔案當成依賴，
  UnoCSS 也會跳過不掃，build 出來的結果會跟正式 build 不同。
- **base 共用 head 的 `node_modules`**：省掉 `npm ci`。如果兩邊的 `package.json` 依賴版本不同，量到的差異會混入依賴差異；
  這時改在乾淨的 checkout 上手動 build。
- **不用 `@lhci/cli` 的 `staticDistDir`**：它的伺服器不支援 cleanUrls，也不壓縮，量到的 HTML 傳輸量會比正式站大好幾倍。
- **預設 base 用 merge-base 而不是 `master`**：master 之後若多了新文章，首頁跟列表頁會因為內容不同而產生差異，跟這次改動無關。

---

## 本地量不到的東西

- Cloudflare CDN 的 HTTP/2、快取 header、實際的壓縮等級
- 真實使用者的 Core Web Vitals（CrUX）

這些要部署後用 [PageSpeed Insights](https://pagespeed.web.dev/) 量測正式站或 Cloudflare Pages 的 preview 網址。
