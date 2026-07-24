---
title: '效能資料的來源：Lab、Synthetic 與 Field Data'
description: '介紹三種收集效能資料的方式，說明各自的準確度差異，以及為何 field data 才能真實反映使用者體驗。'
date: 2026-07-24
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 18
chapter: 'Testing & Tools'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - RealUserMonitoring
---

# 效能資料的來源：Lab、Synthetic 與 Field Data

> 效能數字的可信度，取決於資料從哪裡來。本篇介紹三種主要的效能資料來源，以及為何只有 field data 才能反映真實使用者體驗。

## 三種資料來源

在效能測試的實務中，有三種主要的資料收集方式，各有不同的準確度與適用情境。

### 1. Lab Data（實驗室資料）

在**測試裝置上**，對網站進行效能測試，測試環境通常非常靠近伺服器，網路條件理想。最常見的例子是開發者在自己的筆電上對本地端或接近本地的伺服器進行測試。

這類測試快速方便，適合開發過程中的快速診斷，但由於網路條件與裝置規格都與真實使用者差距甚大，結果可靠性有限。

### 2. Synthetic Data（合成資料）

由**部署在網際網路上的機器人或服務**定期造訪網站並回報效能數據。相較於 lab data，它至少經過真實的網路傳輸，準確度稍高。

但這些測試裝置通常也是高規格伺服器，連接在高品質網路上，同樣無法代表真實使用者的各種裝置與網路條件。

### 3. Field Data（現場資料）

直接**從真實使用者的瀏覽器**收集效能指標，並傳送到報告服務。這就是前面章節介紹的 PerformanceObserver 與 web-vitals 套件在實際產品中的應用情境。

這是最準確的方式，因為它反映的就是真實使用者的真實體驗，而不是模擬或近似。

## 同一個網站，兩種截然不同的結果

講師展示了一個對比案例：同一個網站，左側是 Chrome Lighthouse 產生的 lab data 報告，得分為滿分 100；右側是來自真實使用者的 Core Web Vitals field data，顯示有大量使用者的體驗很差。

這個對比直接說明了一件事：**lab data 只是一個數據點，field data 才是全貌**。Lab data 告訴你「有一次測試表現很好」，field data 告訴你「在所有真實使用者中，效能的分佈長什麼樣子」。

## 樣本數的重要性

Lab data 每次只產生一個分數，field data 則產生成千上萬個分數，每一位造訪使用者貢獻一筆。不同使用者的裝置、網路、地理位置都不同，效能體驗的差異可能極大。這就是為什麼解讀 field data 需要統計的概念，課程後續會進一步說明如何解讀這些資料分佈。

## 複習

### 測試網頁效能的三種主要方式是什麼？

1. Lab data（實驗室資料）：在靠近伺服器的測試裝置上進行測試
2. Synthetic data（合成資料）：由網際網路上的機器人或服務進行測試
3. Field data（現場資料）：從真實使用者身上收集效能指標

### Lab data 與 field data 在量測網頁效能上的關鍵差異是什麼？

Lab data 只提供一次模擬測試的單一效能分數，field data 則提供代表真實使用者實際效能體驗的大量資料點。

### 為什麼 field data 被認為是量測網頁效能最準確的方式？

Field data 捕捉的是真實使用者造訪網站的實際效能體驗，代表真實世界的狀況，而非模擬測試的近似值。

### Synthetic data 與 lab data 測試有什麼潛在的限制？

這兩種方式都無法準確呈現真實使用者的體驗，因為它們是模擬測試，省略了許多真實世界中的網路與裝置變數。

### 在網頁效能資料的脈絡中，樣本數代表什麼意義？

樣本數是指收集到的資料點數量。Field data 提供每位造訪使用者的個別效能分數，可能多達數千筆；Lab data 則只提供單次測試的一個結果。

## 小測驗

<details>
<summary>測試網頁效能的三種主要方式是什麼？</summary>
Lab data、synthetic data 與 field data
</details>

<details>
<summary>是什麼讓 field data 成為最準確的效能測試方式？</summary>
它從真實使用者身上收集指標
</details>

<details>
<summary>Lab data 與 field data 的關鍵差異是什麼？</summary>
Lab data 只提供單一效能分數，field data 則來自真實使用者的大量資料點
</details>

<details>
<summary>在網頁效能測試中，synthetic data 是如何定義的？</summary>
由機器人或服務透過真實網路對網站進行測試
</details>

<details>
<summary>分析效能資料時，為什麼樣本數很重要？</summary>
不同使用者可能有截然不同的效能體驗
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記