---
title: '網頁效能是什麼？課程架構與範例應用總覽'
description: '介紹 Web Performance Fundamentals 課程的整體架構與五大主題，並透過範例電商應用 Developer Stickers Online 直觀呈現網頁效能問題的多個面向。'
date: 2026-07-16
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 1
chapter: 'Introduction'
tags:
    - JavaScript
    - frontendMasters
    - webPerformanceFundamentals
    - WebPerformance
    - DevTools
---

# 網頁效能是什麼？課程架構與範例應用總覽

## 課程結構

整門課分為五個主要部分，依序進行：

1. **Importance**：為什麼網站效能值得關注
2. **Measuring**：各種效能指標的定義、資料收集方式與解讀
3. **Tests and Tools**：常用的效能測試工具
4. **Setting Goals**：如何為自己的網站設定合理的效能目標
5. **Improving**：針對各項指標的具體改善策略

此外，課程途中穿插三個補充主題：如何閱讀 Waterfall Chart（瀑布圖）、如何閱讀 Flame Chart（火焰圖），以及理解效能資料所需的基礎統計概念。這三個主題雖然不是效能本身，但有助於理解工具輸出與數據判讀。

## 什麼是網頁效能

講師給出的定義是：網站以多快的速度、多有效率地載入、渲染，並回應使用者的操作。

重點在於，「效能」不只是頁面初始載入的速度，而是涵蓋使用者整個體驗過程中所有可感知的層面。講師列舉了幾種常見的「感覺慢」的情境：

- 頁面花很長時間才讓使用者感覺到「載入完成」或「可以操作」
- 頁面載入過程中，元素位置跳動，讓使用者感到不可預測
- 使用者點擊後有明顯的延遲回應
- 圖片或影片載入緩慢
- 捲動或動畫不流暢

即使頁面主要內容很快出現，只要點擊按鈕時感覺卡頓，使用者仍然會認為這個網站「很慢」。效能是整體感受，不是單一數字。

## 範例應用程式：Developer Stickers Online

課程全程使用一個虛構的電商網站作為實作範例，名稱是 Developer Stickers Online，販售講師自己設計的貼紙（實際上不真的販售，只是範例用途）。

講師在課堂上直接示範了這個網站目前的問題狀態：

- 圖片載入緩慢，肉眼可見逐漸填入的過程
- 有廣告橫幅在載入數秒後才彈出，造成版面跳動
- DevTools 的 Console 顯示明顯偏低的效能分數
- Network 面板顯示總資源量達 20 MB，頁面完成載入耗時約 17.8 秒
- Performance 面板的時間軸從 0 秒延伸到約 24 秒，佈滿警告與提示

這個應用程式刻意保留了大量問題，目的是讓後續課程中的每一項改善都有明確的對象可以操作。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
