# CI/CD 部署流程

## 概覽

部署由 GitHub Actions 全程控制，**Cloudflare Pages 的自動 Git 部署已暫停**。
所有 push 到 `master` 都必須先通過測試，才會觸發部署。

在 push 之前，本機的 git hooks（見下方「本機 Git Hooks」）會先擋掉明顯會在 CI 失敗的問題，
避免每次都要等 GitHub Actions 跑完才發現格式或草稿驗證錯誤。

---

## 本機 Git Hooks（husky + lint-staged）

用 [husky](https://typicode.github.io/husky/) 管理 git hooks，設定隨 repo 一起 clone，
`npm install` 時會透過 `prepare` script 自動掛上，不需要額外手動設定。

### pre-commit

執行 `npx lint-staged`，只對本次 commit **staged 的檔案**跑 `prettier --write`
（設定於 `package.json` 的 `lint-staged` 欄位，範圍：`*.{js,ts,vue,md,json,yml,yaml}`）。
格式化後的結果會自動重新 staged，commit 內容永遠是已格式化的版本。

### pre-push

依序執行，任一步驟失敗就擋下 push：

```bash
npm run format:check   # 確認整個專案沒有未格式化的檔案（pre-commit 只處理 staged 檔案，這裡做全域把關）
npm run validate:drafts # 草稿 frontmatter / wikilink 驗證，邏輯與 validate-drafts.yml 相同
npm test                # Vitest 單元測試，邏輯與 deploy.yml 的 test job 相同
```

**設計理由**：這三項檢查最終都會在 GitHub Actions 上再跑一次（`deploy.yml`、`validate-drafts.yml`），
在本機 push 前先擋，是為了更快拿到回饋、減少「push 後才發現壞掉」的往返。CI 端的檢查**仍然保留**，
不因為有本機 hook 就移除——本機 hook 可能被 `--no-verify` 跳過，CI 才是真正的把關。

### Hook 腳本位置

- `.husky/pre-commit`
- `.husky/pre-push`

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

### `validate-drafts.yml`（草稿驗證）

觸發條件：

- push 含有 `articles/drafts/**` 變更的 commit
- PR 修改草稿時

執行 `npm run validate:drafts`（`.github/scripts/validate-drafts.js`）。

**設計決策：**

- frontmatter 錯誤（缺少必填欄位、格式錯誤）：非零退出，**block PR**（防止明顯錯誤進入 drafts）
- broken wikilink：零退出，**不 block**（草稿階段連結目標可能尚未發布）
- 在 GitHub Actions Annotations 以 `::error` / `::warning` 格式顯示，可在 PR 的 Files 頁面看到標記

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
