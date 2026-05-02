# Front Matter 規格

撰寫或修改文章時，請依此規格填寫 front matter。

---

## 必填欄位

| 欄位          | 型別            | 說明                                                                                           |
| ------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `title`       | string          | 文章標題，用於列表、og:title、schema.org                                                       |
| `description` | string          | 文章摘要，用於 meta description、og:description                                                |
| `date`        | `YYYY-MM-DD`    | 發布日期，用於排序、草稿自動發布判斷、og:published_time                                        |
| `category`    | string          | 文章分類（如 `JavaScript`、`Life`），用於 article:section meta                                 |
| `section`     | `dev` \| `life` | 所屬頻道，決定文章出現在哪個列表；**必須明確填寫**，否則文章不會出現在任何列表中（見注意事項） |
| `tags`        | string[]        | 標籤列表，參見 `rules/tags.md`                                                                 |

## 選填欄位

| 欄位          | 型別   | 說明                                                                                                                                                                   |
| ------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pin`         | number | 置頂權重，數值越高越靠前（在日期排序之前生效）                                                                                                                         |
| `series`      | string | 系列文章的識別 slug（如 `javaScript_the_hard_part_v3`、`web-dev-quiz`、`JS-Dungeon`）。設定後文章會啟用系列導航，上/下一篇改為章節前後，「更多文章」改為系列章節目錄。 |
| `order`       | number | 在系列中的全域排序（如 `1`、`2`、`3`）。系列章節目錄與前後導航都依此排序。                                                                                             |
| `chapter`     | string | （可選）所屬章節名稱，用於系列目錄分組（如 `"Closures"`、`"Async"`）。設定後目錄會以章節分組顯示，badge 也會改顯示 `{chapter} · 第 X 節 / 共 Y 節`。未設定則維持平鋪。 |
| `seriesTitle` | string | 系列的人類可讀顯示名稱（如 `"JavaScript Hard Parts v3"`）。顯示在系列 badge 上。未設定時 fallback 順序為 `category → series slug`。                                    |

---

## 範例

```yaml
---
title: 用 CSS Grid 做響應式版型
description: 介紹 CSS Grid 的基本概念，並實作一個常見的三欄響應式佈局。
date: 2025-03-10
category: CSS
section: dev
tags:
    - CSS
    - Layout
---
```

---

## 注意事項

- `date` 必須是 `YYYY-MM-DD` 格式，例如 `2025-03-10`
- 草稿（放在 `articles/drafts/`）的 `date` 設為預計發布日；自動發布腳本會在當天將其移至正確目錄
- `section` 必須在 front matter 中**明確填寫**。草稿自動發布腳本雖然會在 `section` 缺少時以 `category` 推導，但那只影響**檔案放置目錄**，不會寫回 frontmatter。若 `section` 缺失，`getPosts({ section: 'dev' })` 篩選時會找不到該文章，導致文章在所有列表中消失。
- `page: true` 是 `/pages/` 下靜態工具頁專用的內部標記，一般文章不需要加
- Tags 規範詳見 [`rules/tags.md`](./tags.md)
