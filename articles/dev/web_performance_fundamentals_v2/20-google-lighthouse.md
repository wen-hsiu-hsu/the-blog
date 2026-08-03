---
title: '效能測試工具：Chrome Lighthouse'
description: '介紹如何使用 Chrome Lighthouse 進行效能測試，包含響應式模式、網路節流與 CPU 節流的設定，以及如何讓測試結果更接近真實使用者的體驗。'
date: 2026-07-25
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 20
chapter: 'Testing & Tools'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - DevTools
    - Lighthouse
---

# 效能測試工具：Chrome Lighthouse

## 使用前的準備：把 DevTools 獨立成視窗

在使用 Chrome DevTools 進行效能測試之前，講師建議先把 DevTools 彈出成獨立視窗，而不是讓它停靠在瀏覽器底部或側邊。

原因是：DevTools 開著的時候會壓縮主要視窗的 viewport 大小，這會影響 LCP 和 CLS 等依賴 viewport 的指標計算。獨立視窗讓你可以在不干擾 viewport 的情況下操作工具。

## Lighthouse 的基本功能

Lighthouse 是 DevTools 頂部分頁中的一個工具，可以產生一份包含效能分數的綜合報告，也就是常見的那個大圓形分數。它除了效能之外也能測試 SEO 實踐與無障礙性，但本課程聚焦在效能部分。

直接開啟 Lighthouse 執行測試，得到的分數是基於你當前的電腦與網路環境，通常與真實使用者的情況差距很大，幾乎沒有參考價值。要讓結果有意義，需要做三件事：

## 讓測試結果更貼近真實的三個設定

### 1. 響應式模式（Responsive Mode）與裝置模擬

點擊 Lighthouse 左上角的響應式模式圖示，切換到裝置模擬狀態，然後從內建的裝置清單中選擇目標裝置。

講師習慣使用 **iPhone 12 Pro**，代表幾個世代前的常見行動裝置螢幕尺寸。他也自訂了一個名為「small laptop」的設定，解析度為 1366×768、像素密度比 1（非 Retina），用來模擬一般桌面使用者。

你可以在「Dimensions edit」中建立自己的裝置設定，根據你的目標使用者調整。

### 2. 網路節流（Network Throttling）

在 Network 分頁的 Throttling 選項下，可以設定模擬的網路速度。講師自訂了一個名為「USA Coffee Shop WiFi」的設定，依據他在咖啡廳實際測速的結果：下載約 10 Mbps、上傳約 4 Mbps、延遲約 50ms。

建議根據你的真實使用者可能處於的網路條件來設定，而不是使用預設值或忽略這個步驟。

### 3. CPU 節流（CPU Throttling）

在 Performance 分頁的設定齒輪中可以找到 CPU 節流選項。講師以 M 系列 MacBook Pro 為例，指出開發機的運算能力遠高於一般使用者的裝置，不節流的話測試結果會過於樂觀。

設定 6 倍減速並限制並行處理器數量，可以讓測試環境更接近一般使用者的裝置效能。這不是精確模擬，但能讓結果更有參考價值。

啟用節流後，DevTools 會顯示明顯的警告提示，提醒你目前正在節流模式下操作。

## Lighthouse 報告的內容

完成設定後執行測試，Lighthouse 會回傳：

- **FCP**（首次內容繪製）
- **LCP**（最大內容繪製）
- **CLS**（累積版面位移）
- 其他僅在 lab 測試中有意義的指標

需要注意的是，**Lighthouse 不會產生 INP 分數**，因為它不會與頁面互動，沒有點擊行為，INP 自然無法觸發。

報告還包含頁面載入過程的 film strip（逐幀截圖）以及一系列診斷建議，指出統計上可能值得優化的問題項目。

講師示範時，測試中的範例網站因為太慢，甚至無法在測試時間內完成 LCP，導致 Lighthouse 無法給出分數，直接回報錯誤。這本身就是一個清楚的問題訊號。

Lighthouse 報告中還有一個「View Trace」功能，可以直接跳轉到 Performance 分頁查看詳細的瀑布圖與火焰圖，這也是下一節要介紹的工具。

## 複習

### 讓 Lighthouse 效能測試更貼近真實的關鍵設定有哪些？

1. 使用響應式模式設定特定裝置的螢幕尺寸
2. 套用網路節流來模擬真實世界的連線速度
3. 啟用 CPU 節流來模擬典型使用者裝置的效能

### Lighthouse 主要回報哪些效能指標？

首次內容繪製（FCP）、最大內容繪製（LCP）、累積版面位移（CLS），以及可能的 INP（但通常無法在 Lighthouse 中取得）

### 為什麼在用 Chrome DevTools 量測網頁效能時，調整測試設定很重要？

為了盡可能模擬真實使用者的體驗，而不是使用測試環境的預設條件

### 在 Chrome DevTools 中自訂網路節流有哪些方式？

建立自訂的網路節流設定，模擬特定的真實網路狀況，例如設定下載速度、上傳速度與延遲，以代表咖啡廳 WiFi 等實際情境

## 小測驗

<details>
<summary>在效能測試中使用 Lighthouse 響應式模式的目的是什麼？</summary>
模擬特定裝置與網路環境，以進行更貼近真實的效能測試
</details>

<details>
<summary>Chrome DevTools 中的 CPU 節流旨在達成什麼目的？</summary>
人為降低處理器速度，以模擬使用者裝置的效能
</details>

<details>
<summary>執行 Lighthouse 效能測試時，如何讓結果更能代表真實使用者體驗？</summary>
設定特定的網路節流與裝置模擬參數
</details>

<details>
<summary>Lighthouse 通常會在報告中產生哪些效能指標？</summary>
首次內容繪製（FCP）、最大內容繪製（LCP）、累積版面位移（CLS）
</details>

<details>
<summary>進行效能測試時，為什麼建議把 Chrome DevTools 彈出成獨立視窗？</summary>
避免 DevTools 影響 viewport 大小，進而扭曲測試結果
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
