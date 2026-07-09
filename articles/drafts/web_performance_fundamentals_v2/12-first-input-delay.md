---
title: '已退役的指標：First Input Delay（FID）'
description: '回顧 2024 年退役的 Core Web Vitals 第三指標 FID（首次輸入延遲），說明其設計目的、量測邏輯，以及被 INP 取代的原因。'
date: 2026-07-21
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 12
chapter: 'Core Web Vitals & Others Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CoreWebVitals
---

# 已退役的指標：First Input Delay（FID）

> [[11-interaction-to-next-paint|上一篇]]詳細介紹了 INP 的量測範圍與分數計算方式。本篇回頭看 INP 所取代的前任指標 FID，了解它當初的設計目的與被替換的原因。

## FID 是什麼

FID（First Input Delay，首次輸入延遲）是 Core Web Vitals 在 2020 年推出時的第三個指標，於 2024 年正式退役，由 INP 取代。目前網路上仍有大量關於 FID 的內容，因為這是相對近期才發生的轉變。

FID 量測的是使用者**第一次**與頁面互動時，瀏覽器回應的延遲時間。

## FID 的設計邏輯

FID 關注的是頁面載入初期的互動回應能力。頁面剛開始載入時，JavaScript 仍在編譯與執行、圖片仍在下載，主執行緒往往非常忙碌。在這個時間點，如果使用者嘗試點擊或按鍵，主執行緒很可能來不及回應。

FID 想回答的問題是：你是否傳送了過多的 JavaScript 與資源，以至於在頁面載入初期就已經擋住了使用者的操作？

### 為什麼 FID 被取代

FID 偏重量測主執行緒被「阻塞」的時間，若 JavaScript 花費大量時間在實際運算（processing），FID 不一定能反映出以下問題：

1. 很多網站的 JavaScript 本身執行效率很差，但 FID 不一定能反映出來。
2. 使用者在一個頁面上通常會進行許多次互動，FID 只看第一次，完全忽略後續所有操作。一個網站在第一次點擊時感覺還好，但第三次、第五次、第一百次點擊時卻明顯卡頓，FID 完全無法捕捉這種情況。

INP 改為追蹤整個頁面生命週期內所有互動，並取最差的那一筆，因此能更全面地反映使用者真實感受到的互動流暢度。

## 複習

### 在 2024 年被取代之前，第三個 Core Web Vital 是什麼？

首次輸入延遲（First Input Delay，FID）

### 什麼指標取代了 FID 來量測使用者互動性？

互動到下一幀繪製（Interaction to Next Paint，INP）

### FID 主要量測頁面載入過程中的什麼事情？

使用者第一次互動的時間與回應速度，特別是在 JavaScript 仍在執行、主執行緒忙碌的頁面載入初期

### 為什麼 FID 被認為在量測使用者體驗方面效果較差？

它只著重阻塞時間而非處理時間，且無法捕捉頁面生命週期中多次使用者互動的效能表現

### FID 在網頁效能量測上沒有解決什麼問題？

它沒有量測第一次互動之後的後續互動回應速度，而這些後續互動同樣可能讓網站感覺緩慢

## 小測驗

<details>
<summary>在 2024 年被取代之前，第三個 Core Web Vital 是什麼？</summary>
首次輸入延遲（First Input Delay，FID）
</details>

<details>
<summary>FID 主要量測頁面載入過程中的什麼？</summary>
使用者第一次互動所花費的時間
</details>

<details>
<summary>FID 最終為什麼被取代？</summary>
它無法有效量測整體的使用者互動性
</details>

<details>
<summary>2024 年取代 FID 的指標是什麼？</summary>
互動到下一幀繪製（Interaction to Next Paint，INP）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記