---
title: '如何閱讀瀑布圖（Waterfall Chart）'
description: '介紹瀑布圖的結構、色彩代碼與資源載入順序，作為後續效能指標分析的基礎工具。'
date: 2026-07-17
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 4
chapter: 'Importance of Web Performance'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - WaterfallChart
    - DevTools
    - NetworkPanel
---

# 如何閱讀瀑布圖（Waterfall Chart）

> 瀑布圖是分析網頁效能時最常用的視覺化工具。在深入各項效能指標之前，先理解如何讀懂它，能讓後續的數據分析更有脈絡。

## 什麼是瀑布圖

瀑布圖（Waterfall Chart）是用來呈現時間的圖表，量測單位通常是毫秒（milliseconds）或微秒（microseconds）。圖表中的每一行代表一個資源的請求過程，多行並排就能看出不同資源之間的載入順序與相互依賴關係。

## 單一資源的解剖

看懂瀑布圖，先從單一一行開始理解。一筆請求從開始到結束，會經過以下幾個階段：

![04-waterfall-charts](./04-waterfall-charts-01.png)

| 階段                | 說明                                                                     |
| ------------------- | ------------------------------------------------------------------------ |
| Queue / Connecting  | 瀏覽器知道需要發出請求，但尚未開始，可能因為忙碌、佇列已滿或其他任務插隊 |
| Request Waiting     | 請求已送出，等待伺服器回應                                               |
| Content Downloading | 資料開始傳入，瀏覽器串流接收並同步解析內容（色塊轉為較深顏色）           |
| Waiting on Main     | 資料已收到，但瀏覽器主執行緒忙碌，尚未能處理                             |

## 顏色代碼

在 DevTools 的瀑布圖中，不同資源類型以不同顏色區分：

| 顏色         | 資源類型                          |
| ------------ | --------------------------------- |
| 藍色         | HTML 文件                         |
| 紫色         | CSS 樣式表                        |
| 黃色         | JavaScript                        |
| 綠色         | 圖片                              |
| 青色（teal） | 字型（fonts）                     |
| 灰色         | 其他（fetch、iframe、媒體檔案等） |

## 真實範例：一個簡單頁面的載入順序

![04-waterfall-charts](./04-waterfall-charts-02.png)

講師展示了一個只有少量資源的頁面，其載入過程大致如下：

1. 瀏覽器因準備中略有延遲，接著下載 HTML 文件（藍色）
2. 解析 HTML 後，發現頁面引用了兩個 CSS、一個 JS 檔案與兩張圖片
3. 瀏覽器同時下載兩個 CSS（並行，紫色）
4. CSS 完成後，開始下載 JS 與第一張圖片
5. 此範例中瀏覽器的並行容量設定為 2（這是教學用的簡化值，並非實際上限），因此需等待前一個任務完成才能開始。

這個範例說明了一個重要事實：**瀏覽器的並行下載數量有上限**，無法同時取得所有資源。部分資源必須等待前面的任務釋出容量才能開始，這就是瀑布圖中「階梯狀」結構的來源。

透過瀑布圖，可以追蹤資源的相依關係、找出瓶頸所在，進而針對特定環節進行優化。後續介紹各項效能指標時，都會回到這個工具來說明背後發生了什麼事。

## 複習

### 什麼是瀑布圖，它主要量測什麼？

瀑布圖是網頁效能中用來量測時間的圖表，單位通常是毫秒或微秒，以多條串流呈現各資源（HTML、樣式表、JavaScript、圖片等）的載入順序與持續時間。

### 瀑布圖中不同顏色分別代表什麼？

- 藍色代表 HTML 文件
- 紫色代表樣式表（CSS）
- 黃色代表 JavaScript
- 綠色代表圖片
- 青色代表字型
- 灰色代表其他雜項資源，例如 fetch、iframe 及其他媒體檔案

### 瀑布圖中一個資源的載入過程通常包含哪些階段？

依序包含：佇列與連線時間、發出請求、等待伺服器回應、接收內容、串流與解析資料，以及在完成前可能出現的等待主執行緒階段。

### 為什麼瀏覽器無法同時下載所有資源？

瀏覽器的並行下載容量有限，只能同時處理一定數量的請求，因此部分資源必須等到前面的下載完成後才能開始。

### 分析瀑布圖能讓開發者獲得哪些資訊？

開發者可以追蹤資源的相依關係、找出瓶頸、理解載入順序，並透過觀察資源下載的時間與順序來優化網頁效能。

## 小測驗

<details>
<summary>瀑布圖在網頁效能中主要量測什麼？</summary>
以毫秒或微秒為單位的時間
</details>

<details>
<summary>在瀑布圖中，哪些因素可能導致網頁請求延遲開始？</summary>
瀏覽器正在處理其他任務而忙碌
</details>

<details>
<summary>瀑布圖範例中展示了瀏覽器的什麼限制？</summary>
瀏覽器的並行下載容量有限
</details>

<details>
<summary>瀑布圖中較深的顏色通常代表什麼？</summary>
內容開始串流與解析
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
