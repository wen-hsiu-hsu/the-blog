# Obsidian Wikilink 支援說明

## 功能概述

本部落格支援在文章中使用 Obsidian 風格的 `[[wikilink]]` 語法撰寫內部連結。
Build 時由 `.vitepress/plugins/obsidian-wikilinks.ts` 自動轉換為標準 HTML 連結。

---

## 語法對照表

| Obsidian 寫法        | 轉換結果                               | 說明                                   |
| -------------------- | -------------------------------------- | -------------------------------------- |
| `[[slug]]`           | `<a href="/dev/slug">slug</a>`         | 連結到文章，顯示 slug                  |
| `[[slug\|自訂文字]]` | `<a href="/dev/slug">自訂文字</a>`     | 自訂顯示文字                           |
| `[[slug#heading]]`   | `<a href="/dev/slug#heading">slug</a>` | 連結到特定標題                         |
| `[[path/slug]]`      | `<a href="/dev/path/slug">slug</a>`    | 含路徑的連結（取最後一段作為顯示文字） |

---

## 不支援的語法

| 語法                | 說明                                                        |
| ------------------- | ----------------------------------------------------------- |
| `![[image.png]]`    | 圖片嵌入。前綴 `!` 的 wikilink 會被忽略（不轉換、不報錯）。 |
| `![[embed-page]]`   | 頁面嵌入。同上，降級為不處理。                              |
| `[[slug^block-id]]` | Block reference。目前不支援，保留原文。                     |

---

## 發布前 Broken Wikilink 檢查

auto-publish 腳本（`.github/scripts/publish-posts.js`）在移動草稿前，
會掃描草稿中所有 `[[wikilink]]`，確認對應的 slug 是否已存在於已發布文章中。

**規則：**

- 若草稿包含 broken wikilink（指向不存在的文章），該草稿**跳過本次發布**，其他草稿不受影響。
- 跳過原因會顯示在 GitHub Actions Step Summary 及 console log 中。
- 等被連結的文章發布後，下一次排程執行時會自動補發。

---

## Build 產出：wikilink-report.json

Build 過程中，plugin 會收集所有 wikilink 轉換資訊，寫入 `wikilink-report.json`（gitignored）。

內容範例：

```json
{
    "resolved": ["slug-a", "slug-b"],
    "unresolved": ["missing-slug"]
}
```

可用於 debug，確認哪些 wikilink 在 build 時找不到對應文章。

---

## 相關檔案

| 檔案                                       | 用途                          |
| ------------------------------------------ | ----------------------------- |
| `.vitepress/plugins/obsidian-wikilinks.ts` | Build 時 wikilink 轉換 plugin |
| `.github/scripts/publish-posts.js`         | 發布前 broken wikilink 檢查   |
