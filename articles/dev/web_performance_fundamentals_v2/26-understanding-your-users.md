---
title: '設定效能目標：認識你的真實使用者'
description: '從 StatCounter 全球統計數據出發，說明真實網路使用者的裝置、螢幕尺寸、作業系統與網路速度分佈，作為設定效能測試環境的參考依據。'
date: 2026-07-28
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 26
chapter: 'Setting Performance Goals'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - RealUserMonitoring
    - DevTools
---

# 設定效能目標：認識你的真實使用者

## 行動裝置佔主導地位

根據 StatCounter 2024 年 8 月的資料，全球網路流量中有 **62% 來自行動裝置**，桌面裝置只佔約三分之一。這也是 Google 採用行動優先索引（mobile-first indexing）的主要原因。

當然，這是全球平均值，不代表所有網站都是如此。講師以自己的網站為例，使用者有 98% 是桌面，因為目標受眾是在工作站上工作的開發者。理解你的使用者來自哪個裝置，比套用全球平均值更重要。

## 螢幕尺寸的多樣性

全球螢幕尺寸的分佈極為分散，沒有任何一種佔壓倒性的比例：

- 1920px 寬以上（大型桌面）：約 8%
- 360px 寬（小型 Android 裝置）：約 7%
- 390×844（小款 iPhone）、1366×768（小型筆電）也各有一定比例

講師特別指出，開發者使用的 MacBook 或工作站螢幕，通常比上面任何一個常見尺寸都還要大。你在自己螢幕上看到的頁面，很可能與真實使用者看到的完全不同。

## 作業系統：Android 佔壓倒性多數

在作業系統的份額上：

- 行動裝置：Android 71%、iOS 27%
- 桌面裝置：Windows 約 71%，macOS 次之

行動裝置佔整體流量的 62%，而行動裝置中 71% 是 Android。這意味著，**全球最典型的網路使用者是 Android 手機用戶**。

## Android 裝置的真實規格

全球 Android 手機的平均售價是 **286 美元**。這不是 Google Pixel 或高階三星旗艦，而是低階入門機，配備最少的記憶體與最低的處理器效能。

開發者口袋裡的手機，與全球大多數 Android 使用者手中的裝置，在效能上可能有數倍的差距。這也是為什麼在高規格裝置上測試得到的 INP 分數，往往無法反映真實使用者的感受。

## 網路速度

根據 Speedtest.net 的全球平均資料，行動網路的速度約為：

- 下載：60 Mbps
- 上傳：11 Mbps
- 延遲：27ms

這些數字可以作為設定 Chrome DevTools 網路節流的參考基準。但講師也提醒，這是全球平均值，各地差異極大：有些地方可以達到 250 Mbps 以上，有些地方則低於 10 Mbps。

## 了解你自己的使用者

全球統計是一個起點，但不能取代對自己使用者的直接了解。講師建議透過分析工具或 RUM 工具，查看你的訪客實際使用哪些作業系統、瀏覽器、裝置類型、螢幕尺寸與來自哪些國家，再根據這些資料設定測試環境，讓效能測試盡可能貼近真實使用者的情境。

## 複習

### 截至 2024 年 8 月，行動裝置佔全球網路流量的比例是多少？

62% 的網路流量來自行動裝置

### 全球最常見的行動作業系統是什麼？

Android，佔行動作業系統的 71%

### 全球 Android 手機的平均售價是多少？

286 美元

### 全球行動網路的平均速度是多少？

下載 60 Mbps、上傳 11 Mbps，延遲 27 毫秒

### 螢幕寬度為 360 像素的裝置佔所有螢幕尺寸的比例是多少？

7%

## 小測驗

<details>
<summary>截至 2024 年 8 月，全球有多少比例的網路使用是在行動裝置上？</summary>
62%
</details>

<details>
<summary>全球最常見的行動作業系統是什麼？</summary>
Android，佔 71%
</details>

<details>
<summary>全球 Android 手機的平均售價是多少？</summary>
286 美元
</details>

<details>
<summary>全球行動網路的平均下載速度是多少？</summary>
60 Mbps
</details>

<details>
<summary>螢幕寬度為 1920 像素的裝置佔所有螢幕尺寸的比例是多少？</summary>
8%
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
