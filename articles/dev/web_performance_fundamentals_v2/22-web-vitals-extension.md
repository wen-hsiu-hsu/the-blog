---
title: '效能測試工具：Web Vitals Chrome 擴充功能'
description: '介紹 Google Web Vitals Chrome 擴充功能的安裝與使用方式，說明如何即時查看 Core Web Vitals 分數與 LCP 元素細節，以及同時呈現 lab data 與 field data 的功能。'
date: 2026-07-26
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 22
chapter: 'Testing & Tools'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CoreWebVitals
  - DevTools
---

# 效能測試工具：Web Vitals Chrome 擴充功能

## 安裝與基本設定

Web Vitals 擴充功能可以在 Chrome 擴充功能商店搜尋「web vitals」找到，由 Google 效能分析團隊開發。安裝後建議將它釘選到工具列，方便隨時查看。

安裝後點擊擴充功能圖示，進入齒輪設定，開啟「console logging」選項，這樣在開啟 DevTools 的 Console 時，效能資料也會同步輸出詳細資訊。

## 即時查看 Core Web Vitals

重新載入頁面後，擴充功能會在頁面載入的過程中即時顯示各項 Core Web Vitals 的分數，不需要等到載入完成。

以課程範例網站為例，LCP 達到 7.29 秒，被 Google 評為 Poor。點擊擴充功能可以進一步查看：

- **LCP 是哪個元素**：確認是頁面上那張大型行動版圖片
- **LCP 的時間組成**：Time to First Byte、Time to First Paint、到 LCP 完成各階段分別花了多少時間
- **完整的 LCP entry 物件**：與你自己用 PerformanceObserver 監聽所能取得的資料相同，但這裡完全自動呈現

這個工具把原本需要手動撰寫監聽程式碼才能取得的資料，整合成一個可以隨時開關的擴充功能，適合日常診斷使用。

## 同時顯示 Lab Data 與 Field Data

擴充功能的另一個實用之處，是在瀏覽**公開網站**時，除了你自己當下的測試結果（lab data）之外，還會顯示來自其他真實使用者的 field data。

講師以 MDN 文件為例，頁面幾乎瞬間載入，擴充功能顯示：

- 99% 的使用者有良好（Good）的體驗
- 1% 的使用者體驗尚可（Okay）
- 0% 的使用者體驗差（Poor）

這讓你在自己測試一個網站的同時，也能立刻看到整體使用者群體的體驗分佈，不需要等待或另外查詢報告。

## 複習

### Web Vitals Chrome 擴充功能的主要用途是什麼？

透過即時顯示 Core Web Vitals 分數與詳細的效能資訊，協助診斷網頁效能問題

### Web Vitals 擴充功能在本地測試之外，還能提供什麼額外資訊？

來自其他曾造訪該網站的真實使用者的 field data，包含良好、尚可、差等各種效能體驗的比例分佈

### Web Vitals 擴充功能追蹤哪些效能指標？

Core Web Vitals 分數，包含最大內容繪製（LCP）、首次繪製時間（Time to First Paint）、首位元組時間（TTFB）以及互動到下一幀繪製（INP）

### 開發者如何快速在 Web Vitals Chrome 擴充功能中開啟 console logging？

點擊擴充功能的齒輪設定圖示，開啟「console logging」選項

## 小測驗

<details>
<summary>哪個 Google 效能指標代表頁面上最大內容元素的載入速度？</summary>
LCP（最大內容繪製）
</details>

<details>
<summary>Web Vitals 擴充功能除了 lab data 之外，還能提供什麼額外資料？</summary>
來自其他網站訪客的 field data
</details>

<details>
<summary>Web Vitals 擴充功能能幫助開發者識別頁面效能的什麼問題？</summary>
造成效能瓶頸的具體元素
</details>

<details>
<summary>Web Vitals 擴充功能如何記錄效能資訊？</summary>
透過瀏覽器 console logging 輸出
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記