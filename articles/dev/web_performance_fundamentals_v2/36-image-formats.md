---
title: '改善 LCP：圖片格式與響應式圖片'
description: '比較 JPG、PNG、WebP、AVIF 四種圖片格式的大小差異，說明為何 HTTP 壓縮對圖片無效，以及響應式圖片如何進一步縮減傳輸量。'
date: 2026-08-02
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 36
chapter: 'Improving Largest Contentful Paint'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - LCP
    - ImageOptimization
---

# 改善 LCP：圖片格式與響應式圖片

## 為什麼 HTTP 壓縮對圖片沒有幫助

前面介紹的 Gzip 與 Brotli 壓縮對 HTML、CSS、JavaScript 效果極佳，因為這些都是純文字格式，有大量可壓縮的冗餘空間。

圖片不同。JPG、PNG、WebP 等圖片格式本身就已經是壓縮過的二進位格式，再用文字壓縮算法處理，幾乎沒有任何收益。要讓圖片更小，必須從圖片本身的格式與內容下手。

## 現代圖片格式的效果

講師以同一張圖片（Request Metrics 的 sloth 吉祥物）在四種格式下的大小進行比較：

| 格式 | 大小   |
| ---- | ------ |
| JPG  | 13 KB  |
| PNG  | 5.5 KB |
| WebP | 2.7 KB |
| AVIF | 2.6 KB |

四張圖片在視覺上完全看不出差異，但大小差距顯著。WebP 和 AVIF 相較於傳統格式，通常可以縮小至少一半，有時甚至更多。

對於高細節的照片類圖片，JPG 原本比 PNG 更有優勢，但 WebP 和 AVIF 對兩種類型都能有效處理，且都比 JPG 和 PNG 更小。WebP 與 AVIF 之間的差異則相對小，選擇任一種都能帶來大幅改善。

## 無法使用現代格式時：TinyPNG

如果因為某些原因無法使用 WebP 或 AVIF，講師推薦 **TinyPNG**（tinypng.com）這個工具。它可以在不損失視覺品質的情況下，對 PNG 及其他格式進行優化壓縮。講師示範的案例中，同一張圖片從 57 KB 壓縮至 15 KB，壓縮率相當可觀。

## 響應式圖片：根據裝置送出適合的大小

即使使用了最佳的圖片格式，如果你對所有裝置都送出同一張超大圖片，仍然在浪費頻寬。

以範例網站的 hero 圖片為例：

- 在配備 Retina 顯示器的桌面裝置上，可能需要 2800px 寬的高解析度圖片
- 在一般桌面或平板上，720px 就已足夠
- 在行動裝置上，可能只需要 600px 甚至 300px

目前範例網站只有 `hero-desktop` 和 `hero-mobile` 兩個版本，而且都是尺寸固定的大圖，對所有裝置一律傳送相同的大檔案。

響應式圖片的概念是：根據使用者裝置的螢幕尺寸與解析度，傳送最適合的圖片大小，避免在小螢幕上傳輸根本顯示不出來的多餘像素。這是縮短 LCP 資源時長最直接有效的手段之一，具體實作方式將在下一篇介紹。

## 複習

### 範例中比較的四種圖片格式分別是什麼，各自的檔案大小是多少？

四種格式分別是 JPG（13 KB）、PNG（5.5 KB）、WebP（2.7 KB）與 AVIF（2.6 KB）

### WebP 與 AVIF 圖片格式的主要優勢是什麼？

WebP 與 AVIF 相較於傳統的 JPG 和 PNG 格式，能提供更小的檔案大小，通常可縮小至少一半，同時維持相同的視覺品質

### 圖片優化在網頁效能上的主要目標是什麼？

在維持圖片品質的前提下，盡量減少需要傳輸的位元組數量，以提升頁面載入速度與整體效能

### 為什麼 HTTP 壓縮對圖片的效果不佳？

圖片本身就是已壓縮的格式，透過文字壓縮算法處理並不能有效縮減檔案大小

### 什麼是響應式圖片，為什麼它很重要？

響應式圖片是指根據裝置的螢幕尺寸與像素密度，傳送不同大小的圖片，這有助於減少不必要的資料傳輸，並提升不同裝置上的效能

## 小測驗

<details>
<summary>在圖片格式比較中，哪種格式的檔案最小？</summary>
AVIF
</details>

<details>
<summary>為什麼 HTTP 壓縮對圖片效果不佳？</summary>
圖片本身就已經是壓縮格式
</details>

<details>
<summary>WebP 與 AVIF 圖片格式提供了什麼優勢？</summary>
比 PNG 和 JPG 更小的檔案大小
</details>

<details>
<summary>提供響應式圖片的目的是什麼？</summary>
根據不同裝置顯示不同大小的圖片
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
