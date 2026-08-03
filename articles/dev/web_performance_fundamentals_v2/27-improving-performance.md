---
title: '改善效能的核心思維'
description: '介紹改善網頁效能的核心思維：以真實資料為依據、優先處理最差指標的最容易修正，以及「做更少的事」的底層原則。'
date: 2026-07-29
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 27
chapter: 'Improving Time to First Byte'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - WebPerformance
---

# 改善效能的核心思維

## 從真實資料出發，而非 Lighthouse 分數

改善效能的第一步是確認你在改善什麼。如果你只依賴 Lighthouse 分數，你不知道那個數字是否反映真實使用者的體驗。

應該從 CrUX 或 RUM 工具取得真實的 field data，再根據這些資料決定優先順序。

## 優先處理最差的指標，從最容易的修正開始

如果你剛開始做效能優化，可能不只一個指標是差的。這時候的策略很直接：

1. **找出最差的那個指標**，集中火力在那裡
2. **從最容易實施的修正開始**，而不是最完整或最理想的方案

講師坦言自己是完美主義者，但明確指出你不需要做所有的事。如果你的所有指標都已經是綠色，但你從來沒有用過 CDN，那也許你根本不需要 CDN。**用你的資料來決定做什麼，而不是把所有可能的優化都做一遍。**

## 讓事情更快的底層原則

講師分享了一個他用來思考效能問題的核心概念：電腦的運算發生在接近光速的層次，你沒辦法讓光速更快。因此，**讓事情更快的唯一方法，就是在起點和終點之間做更少的事**。

實際應用上，這意味著：

- 頁面上放更少的東西
- 讓這些東西佔用更少的位元組
- 在合適的地方使用快取，減少重複的工作

不論是哪個效能指標，背後的改善邏輯都圍繞著這個原則。

## 複習

### 改善網頁效能的主要建議方法是什麼？

優先從真實使用者資料（CrUX 或 RUM 工具）出發，針對最差的指標做最容易的修正，而非依賴 Lighthouse 分數

### 根據效能優化的原則，如何實現效能提升？

減少指標起點與終點之間發生的事情，可以透過減少頁面上的資源數量、降低位元組大小，或在合適的地方使用快取來達成

### 決定優先處理哪些效能改善時，關鍵考量是什麼？

以真實使用者資料為依據，優先處理最差的指標，並根據自己網站的結構選擇最容易實施的修正

### 大多數電腦效能優化背後的基本原則是什麼？

由於運算發生在接近光速的層次，讓事情更快的主要方式就是減少兩個時間點之間的操作數量

### 面對網頁效能改善時，建議採取什麼心態？

不要追求完美；認識到「夠快就好」是可以接受的，並非所有可能的優化都有必要實施

## 小測驗

<details>
<summary>改善網頁效能時，應該優先處理什麼？</summary>
根據真實使用者資料，針對最差的指標做最容易的修正
</details>

<details>
<summary>讓電腦運算更快的基本原則是什麼？</summary>
減少起點與終點之間需要做的事情
</details>

<details>
<summary>改善效能指標時，建議使用哪種資料來源？</summary>
來自 CrUX 或 RUM 工具的真實使用者資料
</details>

<details>
<summary>哪些策略有助於縮短頁面載入時間？</summary>
減少頁面上的資源數量、降低位元組大小，以及使用快取
</details>

<details>
<summary>應該如何規劃效能優化的工作？</summary>
優先處理最差的指標，從最容易的修正開始
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
