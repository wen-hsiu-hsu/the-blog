---
title: '改善 TTFB：HTTP 壓縮'
description: '介紹 HTTP 壓縮（Gzip 與 Brotli）的原理與實際效果，說明 Accept-Encoding 標頭的運作方式，以及如何透過壓縮改善 TTFB。'
date: 2026-07-29
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 28
chapter: 'Improving Time to First Byte'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - HTTP
  - NetworkPanel
---

# 改善 TTFB：HTTP 壓縮

## 為什麼從 TTFB 開始

TTFB 不是孤立存在的指標。TTFB 慢了，FCP 就慢；FCP 慢了，LCP 也必然更晚到來。即使你真正想改善的是 LCP，如果 TTFB 有問題，先解決它可以讓後續所有指標一起受益。

## 課程的起始基準

講師將範例網站 Developer Stickers Online 部署到阿姆斯特丹的伺服器，從明尼亞波利斯透過 USA Coffee Shop WiFi（10 Mbps 下載、4 Mbps 上傳、50ms 延遲）加上 6 倍 CPU 節流進行測試。

測試結果顯示 TTFB 為 1.775 秒，遠超過 Google 建議的 800ms 上限。這是一個未經任何優化的初始基準，後續的改善都從這裡出發。

## 改善 TTFB 的幾個方向

講師列出以下幾個可以改善 TTFB 的策略，本篇先介紹第一個：

- 壓縮 HTTP 資源（本篇）
- 使用更高效的網路協議
- 調整伺服器容量
- 調整伺服器的地理位置

## HTTP 壓縮：Gzip 與 Brotli

壓縮的目的是減少透過網路傳輸的位元組數量。HTML、CSS 與 JavaScript 都是純文字格式，以原始格式傳輸並不是最有效率的方式。

目前最主流的兩種壓縮算法是 **Gzip** 和 **Brotli**。根據課程展示的數據，以等級 6 壓縮為例：

| 檔案類型        | 未壓縮   | Gzip            | Brotli              |
| --------------- | -------- | --------------- | ------------------- |
| HTML 文件       | 1,112 KB | 282.9 KB（25%） | 20.6 KB（**1.7%**） |
| CSS 檔案        | 197.5 KB | 31.1 KB（16%）  | 28.4 KB（14%）      |
| JavaScript 檔案 | 89.5 KB  | 30.8 KB（34%）  | 30.1 KB（34%）      |

Brotli 是 Google 開發的較新算法，現已被所有主流瀏覽器廣泛支援。對大型 HTML 文件的壓縮效果極為顯著，可以把 1 MB 以上的 HTML 壓縮到不到 21 KB。

## 壓縮如何運作：HTTP 標頭

瀏覽器發出請求時，會在 request header 中帶上 `Accept-Encoding`，告知伺服器它能接受哪些壓縮格式：

```
Accept-Encoding: gzip, deflate, br, zstd
```

伺服器接收後，根據客戶端的支援情況選擇壓縮方式，並在回應的 header 中說明使用的格式：

```
Content-Encoding: gzip
```

這代表回應的 body 已被壓縮，瀏覽器收到後會自動解壓。

## 實際效果示範

講師在課堂上將 Gzip 壓縮啟用後，同一個頁面的 HTML 文件從 33 KB 降至 6 KB，只需要更改伺服器的一個設定。

關於 Brotli 在小型檔案上的表現：講師示範後發現，在範例網站這種頁面很小的情況下，Brotli 的壓縮效果略差於 Gzip。這是因為 Brotli 在大型檔案上的壓縮優勢才最明顯，對非常小的檔案，Gzip 可能就已經足夠。

此外，對於非常小的檔案（例如只有幾個 bytes），壓縮本身所需的運算資源可能超過傳輸節省的效益，這種情況下通常不值得壓縮。

## 複習

### 用來縮減 HTTP 資源大小的兩種主要壓縮協議是什麼？

Gzip 與 Brotli

### 客戶端發出 HTTP 請求時，如何表明自己支援哪些壓縮格式？

透過在請求中帶上 Accept-Encoding 標頭，列出支援的壓縮格式，例如 gzip、deflate 或 brotli

### 哪個回應標頭代表內容已被壓縮？

Content-Encoding 標頭

### 範例中啟用 Gzip 壓縮後，帶來了什麼效果？

檔案從 33 KB 縮小至 6 KB

### Brotli 壓縮算法在哪種檔案大小下最有效？

Brotli 對大型檔案的壓縮效果最顯著，對非常小的檔案效率可能不如 Gzip

## 小測驗

<details>
<summary>最常用於縮減檔案大小的兩種壓縮協議是什麼？</summary>
Gzip 與 Brotli
</details>

<details>
<summary>哪個 HTTP 標頭用來表示客戶端可以接受哪些壓縮格式？</summary>
Accept-Encoding
</details>

<details>
<summary>在範例中，Gzip 將 HTML 檔案壓縮到原始大小的多少比例？</summary>
原始大小的 25%
</details>

<details>
<summary>哪種壓縮算法對大型檔案特別有效？</summary>
Brotli
</details>

<details>
<summary>壓縮對非常小的檔案有什麼缺點？</summary>
壓縮所需的運算資源可能超過傳輸節省的效益
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記