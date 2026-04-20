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
- `workflow_run`：當 `Auto Publish Scheduled Posts` workflow 完成時觸發

#### test job

- **條件**：只在 `push` 或 `pull_request` 事件時執行（`workflow_run` 不執行）
- 步驟：checkout → Node.js 24 → `npm install` → `npm test`（Vitest 單元測試）

#### deploy job

- **依賴**：`needs: test`，測試失敗則自動 skip，不會部署
- **條件**：只在 push 到 `master` 時執行（PR 不觸發）
- 步驟：`npm install` → `npm run build` → wrangler 部署到 Cloudflare Pages

#### deploy-after-publish job

- **條件**：`workflow_run` 事件且 auto-publish 以 `success` 結束
- **用途**：解決 `GITHUB_TOKEN` push 無法觸發其他 workflow 的限制（見下方說明）
- 步驟：`checkout ref: master` → `npm install` → `npm run build` → wrangler 部署

```
# 一般 push 到 master
push to master
  └─ test job
       ├─ PASS → deploy job → Cloudflare Pages 更新
       └─ FAIL → deploy job skipped，CF Pages 維持舊版

# 定時 auto-publish
auto-publish.yml (completes with success)
  └─ deploy-after-publish job → Cloudflare Pages 更新
```

---

### `auto-publish.yml`（定時草稿發布）

每天台北時間 08:00 自動執行，把到期草稿從 `articles/drafts/` 移到對應 section，
並 commit & push 到 `master`。

**重要**：auto-publish 使用 `GITHUB_TOKEN` push，這種 push **無法觸發其他 workflow**
（GitHub 的防循環保護機制）。因此 `deploy.yml` 不會在 auto-publish push 後自動觸發。

解法：`deploy.yml` 加入 `workflow_run` 觸發器，在 auto-publish workflow 本身完成時觸發，
繞過 GITHUB_TOKEN push 的限制。

**不要**在 `auto-publish.yml` 裡直接加 build/deploy 步驟——那會跳過測試且重複部署邏輯。

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
- `deploy-after-publish` checkout 時需明確指定 `ref: master`，因為 `workflow_run` 事件預設 checkout 的是觸發 workflow 的 ref，不一定是最新的 master。
