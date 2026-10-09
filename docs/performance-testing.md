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
npm run perf:compare -- --record "側欄改為只列分類" --ref "docs/seo-diagnosis.md 側欄分類樹 TODO"
```

| 參數               | 預設                       | 說明                                               |
| ------------------ | -------------------------- | -------------------------------------------------- |
| `--base <ref>`     | `merge-base(HEAD, master)` | 比較基準，任何 git ref 皆可                        |
| `--runs <n>`       | `3`                        | 每頁每邊執行次數，取中位數；少於 3 無法估計雜訊    |
| `--pages`          | 見 `DEFAULT_PAGES`         | 逗號分隔的路徑，採 cleanUrls 格式                  |
| `--skip-build`     | 關                         | 不重新 build head                                  |
| `--record <說明>`  | 關                         | 把結果寫進 `docs/perf-log/` 長期追蹤，見下節       |
| `--ref <相關項目>` | —                          | 搭配 `--record`：這次改動對應的 TODO、issue 或文件 |

完整跑一次約 7–8 分鐘：兩次 build 各約 45 秒，Lighthouse 30 次每次約 10 秒。
base 的 build 依 commit sha 快取在 `.vitepress/cache/perf-compare/builds/`，同一個 base 第二次起不必重新 build。

報告印在 stdout，也存到 `.vitepress/cache/perf-compare/reports/<時間>.md`；
同名 `.json` 是每次執行的原始數據。

### 在 Claude Code 裡執行

Chrome 在 Claude Code 的 sandbox 內無法啟動，錯誤為
`waiting for dynamic debugging port in chrome-err.log`。
執行時必須關閉 sandbox（Bash 的 `dangerouslyDisableSandbox`）。

### 必須用 arm64 的 Node（Apple Silicon）

在 Apple Silicon 上用 x64 的 Node（例如 asdf 裝到 x86_64 版）啟動 Chrome，
Chrome 會經過 Rosetta 轉譯，CPU 類指標會嚴重失真。2026-10-09 實測同一個 build：
x64 Node 量到 TBT 10–21 秒、Performance 22–26 分；arm64 Node 量到 TBT 0 ms、54–56 分。
Lighthouse CLI 會直接拒絕執行並顯示 `Launching Chrome on Mac Silicon (arm64) from an x64 Node installation`，
但程式 API 不會檢查，所以 `perf:compare` 自己在開始時檢查（`isRosettaNode()`，判斷方式與 Lighthouse CLI 相同），
遇到 x64 Node 就報錯結束。這時改用 arm64 的 Node 直接執行腳本，例如
`/opt/homebrew/bin/node scripts/perf-compare.js --record "..."`。
用 `node -p process.arch` 確認，結果要是 `arm64`。在此之前的記錄（`docs/perf-log/` 中 2026-10-09 的兩筆）
是用 x64 Node 量的：傳輸量仍然準確，但時間類指標的絕對值不可信。

---

## 記錄效能變化（--record）

效能相關的改動都要留下記錄，用來長期追蹤效能改進。流程：

1. 先 commit 改動。`--record` 要求工作目錄是乾淨的，這樣記錄才能指向確切的 commit。
2. 執行 `npm run perf:compare -- --record "<改動說明>" --ref "<相關項目>"`。
3. 腳本會寫出 `docs/perf-log/<日期>-<head sha>.md`（完整報告），並在 `docs/perf-log/README.md` 索引最上方加一列。
4. commit `docs/perf-log/`（例如 `docs: record perf result for <改動>`），並回到相關項目加上這份記錄的連結。
   例如在 `docs/seo-diagnosis.md` 的 TODO 後面加 `（量測：[perf-log](./perf-log/<檔名>)）`。

每份記錄會寫進以下資訊：

- 改動範圍：`base...head` 的 GitHub compare 連結，以及範圍內每個 commit 的連結與標題
- 分支、日期、`--ref` 指定的相關項目
- 摘要：哪些指標在幾頁超出雜訊地改善或退步，同時寫進索引
- 每頁完整的指標表

為了讓記錄可信，`--record` 不能搭配 `--skip-build`，`--runs` 至少要 3。
直接在 master 上改時，merge-base 就是 HEAD，沒有可比較的範圍，要用 `--base HEAD~<n>` 指定改動前的 commit。

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
