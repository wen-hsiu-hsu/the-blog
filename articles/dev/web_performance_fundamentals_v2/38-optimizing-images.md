---
title: '改善 LCP：圖片壓縮、格式轉換與響應式圖片實作'
description: '透過 Jimp 縮放、Imagemin 壓縮與 WebP 轉換三個步驟，將 1.5 MB 的圖片縮減至 70 KB，並整合 picture 元素與 fetchpriority，最終將 LCP 從 14 秒降至 454 毫秒。'
date: 2026-08-03
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 38
chapter: 'Improving Largest Contentful Paint'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - LCP
    - ImageOptimization
---

# 改善 LCP：圖片壓縮、格式轉換與響應式圖片實作

> 本篇進入實作階段，說明如何透過三個步驟的圖片處理流程，大幅縮減實際傳輸的圖片大小，並把一切整合進 HTML。

## 三個步驟的圖片優化流程

### 步驟一：產生多個尺寸版本

講師使用 **Jimp** 這個 Node.js 套件，對所有圖片自動產生 360、720、1024、1400、2800 像素寬的縮放版本，儲存在 `/assets/image/r`（responsive）目錄下。

以 `callout-1` 這張圖片為例，原始大小約 1.5 MB。縮放至 720px 寬後約 800 KB，縮放至 360px 寬約 250 KB，僅透過尺寸調整就已有顯著的大小差異。

### 步驟二：PNG 壓縮優化

使用 **Imagemin** 對所有尺寸版本進行 PNG 優化，移除多餘的 metadata 並壓縮調色板，結果儲存在 `/assets/image/min` 目錄下。

`callout-1-1024.png` 從 1.5 MB 壓縮至 470 KB（約三分之一），兩張圖片在視覺上完全看不出差異。

### 步驟三：轉換為 WebP

使用 Imagemin 的 WebP 外掛，將 min 目錄下的所有 PNG 轉換為 WebP 格式，儲存在 `/assets/image/webP` 目錄下。

`callout-1-1024.webp` 從 470 KB 進一步縮減至 **69 KB**。

三個步驟合計：同一張圖片從 1.5 MB 降至約 70 KB，且視覺品質完全相同。

## 更新 HTML 引用路徑

產生新圖片後，需要把 HTML 和 JavaScript 中原本指向 `.png` 的路徑全部替換為指向 WebP 目錄。講師使用 VS Code 的正規表示式搜尋取代，批次將所有 `/assets/image/*.png` 替換為 `/assets/image/webP/*.webp`，快速完成跨檔案的路徑更新。

## 整合 picture 元素

最關鍵的 LCP 圖片（hero 圖片）需要進一步改為使用 `<picture>` 元素搭配響應式 srcset，讓瀏覽器根據螢幕尺寸下載對應大小的圖片版本。

完成這個改動後，有一個需要注意的取捨：之前為了加速 LCP 圖片而添加的 `<link rel="preload">`，這時必須**移除**。原因是在解析到 `<picture>` 元素之前，瀏覽器不知道當前螢幕應該使用哪個版本的圖片，preload 會導致下載不需要的圖片版本，反而浪費頻寬。改以 `fetchpriority="high"` 取代 preload，確保 LCP 圖片仍然優先下載，但只下載正確尺寸的版本。

## 最終結果

完成全部優化並部署後，LCP 從原本的 14 秒大幅縮短至 **454 毫秒**，所有 Core Web Vitals 指標均進入綠色範圍。

## SVG 的處理方式

課堂上有學員詢問 SVG 的優化策略。講師說明：

- SVG 是向量格式（描述線條與形狀），本身就能被 HTTP 壓縮（Gzip、Brotli）有效處理，通常只有幾 KB，不是效能瓶頸
- 如果原始素材是向量（例如 Illustrator 繪製的 logo），應直接保持 SVG 格式，不要轉換為 PNG
- 若 SVG 檔案異常龐大，通常是因為有人把 PNG 的位元資料嵌入在 SVG 的 XML 中，這並不是真正的 SVG，只是偽裝
- 若需要進一步壓縮 SVG，可以使用線上工具 **SVGOMG**，透過移除冗餘資料可將 SVG 大小縮減約一半

## LCP 改善策略總結

課程針對 LCP 使用了三個主要策略：

1. **延遲載入（Lazy Loading）**：讓非關鍵圖片讓路，不阻擋 LCP 圖片的下載
2. **積極載入（Eager Loading）**：透過 `fetchpriority="high"` 提高 LCP 圖片的下載優先級
3. **圖片優化**：透過尺寸縮放、PNG 壓縮、WebP 轉換與響應式圖片，大幅縮減 LCP 圖片的傳輸大小

## 複習

### 課程中討論的三個主要圖片優化技術是什麼？

1. 將圖片縮放至多個較小的尺寸版本
2. 使用 Imagemin 進行 PNG 壓縮優化
3. 將圖片轉換為 WebP 格式

### 透過圖片優化達到的檔案大小縮減效果是多少？

一張原始 1.5 MB 的圖片，透過尺寸縮放、PNG 壓縮與 WebP 轉換，最終縮減至約 70 KB

### 對於 logo 和插圖等向量圖形，建議採用什麼做法？

若原始素材是向量格式，應保持為 SVG，而非轉換為 PNG 等點陣圖，因為 SVG 通常更小且可無限縮放

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
