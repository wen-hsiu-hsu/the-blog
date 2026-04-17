# CI/CD 部署流程

## 概覽

部署由 GitHub Actions 全程控制，**Cloudflare Pages 的自動 Git 部署已暫停**。
所有 push 到 `master` 都必須先通過測試，才會觸發部署。

---

## Workflows

### `deploy.yml`（測試 + 部署）

觸發條件：

- push 到 `master`
- PR 針對 `master`（只跑測試，不部署）

#### test job

1. checkout 程式碼
2. 安裝 Node.js 24 + npm cache
3. `npm install`
4. `npm test`（Vitest 單元測試）

#### deploy job

- **依賴**：`needs: test`，測試失敗則自動 skip，不會部署
- **條件**：只在 push 到 `master` 時執行（PR 不觸發）
- 步驟：`npm install` → `npm run build` → wrangler 部署到 Cloudflare Pages

```
push to master
  └─ test job
       ├─ PASS → deploy job → Cloudflare Pages 更新
       └─ FAIL → deploy job skipped，CF Pages 維持舊版
```

---

### `auto-publish.yml`（定時草稿發布）

每天台北時間 08:00 自動執行，把到期草稿從 `articles/drafts/` 移到對應 section，
並 commit & push 到 `master`。

這個 push 同樣會觸發 `deploy.yml`（先測試再部署）。

詳細說明見 [how-this-blog-works.md](./how-this-blog-works.md)「草稿與自動發布」章節。

---

## 所需 GitHub Secrets

在 repo Settings > Secrets and variables > Actions 設定：

| Secret                  | 說明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | CF My Profile > API Tokens，需要 Cloudflare Pages: Edit 權限 |
| `CLOUDFLARE_ACCOUNT_ID` | CF Dashboard 右側邊欄 Account ID                             |
| `CF_PAGES_PROJECT_NAME` | Cloudflare Pages 的 project 名稱                             |

---

## Cloudflare Pages 設定

CF Pages Dashboard > project > Settings > Builds & deployments > **Pause deployments**

必須暫停，否則 CF 會直接監聽 Git 自行 build，測試失敗也照樣部署。

---

## 注意事項

- `npm install` 而非 `npm ci`：因為 macOS 產生的 `package-lock.json` 不含 Linux 平台的 optional deps，
  在 Ubuntu runner 上 `npm ci` 會報錯（missing `@emnapi/core`、`@emnapi/runtime`）。
- build 產出在 `.vitepress/dist`（VitePress 預設路徑）。
