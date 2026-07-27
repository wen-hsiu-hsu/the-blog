---
title: '改善回訪使用者體驗：瀏覽器快取策略'
description: '介紹 ETag 驗證式快取與 Cache-Control 強制快取的運作原理，說明兩者的差異與快取失效的處理方式，以及 bundler 在檔案命名上的設計邏輯。'
date: 2026-08-04
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 39
chapter: 'Improving Largest Contentful Paint'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - HTTP
  - Caching
---

# 改善回訪使用者體驗：瀏覽器快取策略

## 兩種快取的層次

講師先區分了兩種快取：

**伺服器端快取**：把原始伺服器的內容快取在 CDN 上，讓使用者的請求不需要一路打到遠端伺服器。這在前幾篇部署 CDN 時已經實作。

**瀏覽器回應快取**：讓使用者的瀏覽器把資源儲存在本地，下次造訪時直接使用，完全不需要再次向伺服器請求。這是本篇的主題。

## 方式一：驗證式快取（ETag 與 Last-Modified）

伺服器或 CDN 在回傳資源時，可以帶上兩個 header：

- `ETag`：代表這份資源內容的識別碼（類似 hash）
- `Last-Modified`：這份資源最後一次被修改的時間

瀏覽器會把這些資訊記下來。下次使用者回來請求同一個資源時，瀏覽器會在 request 中帶上：

- `If-None-Match`：上次收到的 ETag 值
- `If-Modified-Since`：上次收到的修改時間

伺服器接到請求後，比對資源是否有更新。如果沒有，就回傳一個**空的 304 Not Modified 回應**，告訴瀏覽器繼續使用它已經有的版本，不需要重新傳輸資料。

這樣做的好處是大幅縮小回應的大小，但請求本身仍然需要發出去，包含 DNS 查詢、TCP 連線等固定成本還是存在。

## 方式二：強制快取（Cache-Control 與 Expires）

如果你知道某個資源在一段時間內不會改變，可以更進一步，直接告訴瀏覽器「這個檔案你可以用到某個日期，不用再來問我」：

- `Cache-Control: max-age=秒數`：資源可以快取的秒數
- `Expires: 日期`：資源的到期時間

設定這些 header 後，在到期日之前，瀏覽器根本不會發出任何請求，直接從本地磁碟（disk cache）取用資源。網路開銷完全消失。

## 強制快取的陷阱：檔案名稱不變就無法更新

強制快取帶來了一個問題：如果你把 `scripts.js` 快取到 2025 年底，但中途需要更新這個檔案，使用者的瀏覽器不會知道有新版本，會繼續使用舊的，直到快取到期。

解決方式是**每次更新時改變檔案名稱**，例如在檔名中加入內容的 hash 或版本號：`scripts.abc123.js`。這樣舊版本繼續被快取，新版本因為名稱不同，瀏覽器會視為全新資源重新下載。

這也是為什麼幾乎所有 JavaScript bundler（Webpack、Vite 等）都會在輸出的檔案名稱中自動加入一段獨特的字串，這個設計就是為了安全地使用長期強制快取，同時保留隨時更新的能力。

## 複習

### 課程中討論的兩種主要瀏覽器回應快取機制是什麼？

1. ETag 與 Last-Modified 標頭（304 Not Modified 驗證式快取）
2. Cache-Control 與 Expires 標頭（強制快取）

### 當瀏覽器送出 If-None-Match 與 If-Modified-Since 請求時，會發生什麼事？

如果內容與瀏覽器已快取的版本相符，伺服器會回傳 304 Not Modified 回應，讓瀏覽器繼續使用本地快取的版本

### JavaScript bundler 如何解決長期強制快取可能帶來的問題？

在檔案名稱中加入一段獨特的字串，讓瀏覽器把更新後的檔案視為新資源，從而強制下載最新版本

### 瀏覽器快取的效能收益有哪些？

減少請求的固定開銷、省略 DNS 查詢與 TCP 連線、縮小請求大小，甚至在強制快取的情況下完全省略網路請求

### 對 JavaScript 等檔案設定非常長的快取到期時間，可能會出現什麼問題？

即使伺服器上的檔案已更新，使用者的瀏覽器仍會繼續使用舊版本，直到快取到期為止

## 小測驗

<details>
<summary>課程中討論的兩種主要快取機制是什麼？</summary>
伺服器端快取與瀏覽器回應快取
</details>

<details>
<summary>哪個 HTTP 標頭用來驗證快取資源是否已被修改？</summary>
ETag 標頭
</details>

<details>
<summary>CDN 回傳 304 Not Modified 回應代表什麼？</summary>
客戶端可以繼續使用其快取的版本
</details>

<details>
<summary>JavaScript bundler 為什麼通常會在檔案名稱中加入獨特字串？</summary>
為了讓快取失效並強制瀏覽器下載更新版本
</details>

<details>
<summary>當瀏覽器使用 Cache-Control 與 Expires 標頭時，會發生什麼事？</summary>
請求直接從磁碟快取取用，不會向伺服器發出請求
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記