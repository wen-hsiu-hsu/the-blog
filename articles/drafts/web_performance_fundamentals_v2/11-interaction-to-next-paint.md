---
title: 'Core Web Vitals：INP（互動到下一幀繪製）'
description: '介紹 Core Web Vitals 第三個指標 INP（互動到下一幀繪製）的量測範圍、互動定義、分數決定方式，以及裝置效能對結果的影響。'
date: 2026-07-21
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 11
chapter: 'Core Web Vitals & Others Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - INP
  - CoreWebVitals
---

# Core Web Vitals：INP（互動到下一幀繪製）

> [[10-flame-charts|上一篇]]介紹了火焰圖的結構與色彩代碼，說明瀏覽器主執行緒的單執行緒特性。本篇進入 Core Web Vitals 的第三個，也是最常被誤解的指標：INP。

## 什麼是 INP

INP（Interaction to Next Paint）量測的是：從使用者發出互動，到瀏覽器繪製出下一幀畫面，這中間經過了多少時間。它反映的是使用者在頁面上操作時，頁面的回應感受是否流暢。

與 LCP 和 CLS 相同，INP 不是一個固定數字，而是由真實使用者的實際操作所產生。一般的效能報告工具因為不會點擊頁面，通常不會產生 INP 分數；這個指標只有在真實使用者進行互動時才存在。

## 什麼算「互動」

INP 計入以下行為：

- 點擊（click）
- 拖曳（drag）
- 觸控（touch）
- 按鍵（key press）

**捲動（scroll）不算**，不計入 INP。

## INP 量測的時間範圍

以使用者點擊一個按鈕為例，INP 量測的是從點擊發生到畫面更新完成的整段時間，包含：

1. **Input delay**：瀏覽器主執行緒若正在忙碌，使用者的輸入會被延遲處理
2. **事件處理**：瀏覽器依序觸發 pointerup、mouseup、click 三個事件，並執行所有對應的 JavaScript 處理器
3. **DOM 更新與 Layout**：事件處理器執行完後，瀏覽器計算 layout 並繪製畫面
4. **繪製新的幀**：使用者看到畫面更新

這整段時間加總在一起，就是一次互動的 INP 值。

講師以「加入購物車」按鈕為例：使用者點擊後，事件處理器發送 fetch 請求、執行分析追蹤程式碼、更新購物車數量顯示，這些操作全部執行完並繪製完成才算結束。

## INP 不必等非同步操作完成

講師特別澄清一個重要觀念：**INP 只要求在事件發生後盡快繪製下一幀，不需要等待非同步操作完成**。

舉例來說，使用者點擊按鈕後，如果處理器只是顯示一個 spinner，然後發出一個 fetch 請求，接著讓出主執行緒，這樣的 INP 就是良好的，因為使用者很快看到了反應。fetch 完成可能需要數秒，但那不影響 INP。

**讓 INP 變差的情況是**：事件處理器執行了大量同步的昂貴運算，遲遲不讓出主執行緒，導致畫面完全凍結，使用者什麼回饋都看不到。

改善的核心手段是透過非同步操作（Promise、async/await、callback 等）讓主執行緒盡快釋出，允許瀏覽器繪製下一幀，具體策略會在課程後段的「改善效能」章節說明。

## INP 分數如何決定

INP 不是單次互動的結果，而是**整個頁面生命週期內所有互動中最慢的那一次**。

- 使用者每次互動都會產生一筆 INP 記錄
- 最終分數取最差的那一筆
- 若互動次數極多（例如數十次以上），根據講師的說明，每約 80 次互動中，Google 可能忽略最差的那一筆，改取第二差的，以降低資料雜訊（講師補充這是細節層面的機制）。

因此，INP 分數只有在使用者離開頁面時才能確定。若需要程式化收集這份資料，必須使用 Beacon API 在頁面卸載時傳送。

## 影響 INP 的重要因素：裝置效能

INP 的分數與使用者裝置的 CPU 效能高度相關。在高規格的開發機器上測試，JavaScript 執行極快，INP 可能看起來很好；但真實使用者若使用低規格的 Android 裝置，同樣的 JavaScript 執行時間可能慢上數倍。

評估 INP 時，必須考量目標使用者的裝置能力。

## Google 的評分標準

| 評分     | INP 時間        |
| -------- | --------------- |
| 良好     | 200 毫秒以內    |
| 需要改善 | 200 至 500 毫秒 |
| 差       | 超過 500 毫秒   |

值得注意的是，人機互動研究中「使用者會察覺到延遲」的門檻是 100 毫秒，Google 目前的標準定在 200 毫秒，代表部分互動仍可能讓使用者感到輕微的停頓。

## 複習

### 在 INP 的脈絡中，什麼定義為「互動」？

互動包含點擊、拖曳、觸控與按鍵，但不包含捲動。這些互動的回應速度與效能會被量測。

### INP 事件量測哪些關鍵組成部分？

INP 量測從使用者互動到下一幀繪製完成的總時間，包含輸入延遲、事件處理器執行、JavaScript 處理，以及更新後的幀繪製。

### Google 目前如何定義「良好」的 INP 分數？

目前 Google 將 200 毫秒以內的 INP 分數視為良好。超過 500 毫秒則視為差，使用者會感受到明顯的卡頓。

### 在多次互動中，INP 分數如何決定？

INP 分數取整個頁面生命週期內最差的那一次互動。若互動次數非常多，Google 可能略作調整，針對每 80 次互動忽略最差的一筆，以降低資料雜訊。

### 使用者感知互動回應速度的關鍵門檻是多少？

若互動超過 100 毫秒，使用者就會察覺到延遲，這是可感知效能的基準。

## 小測驗

<details>
<summary>INP（互動到下一幀繪製）中，什麼定義為互動？</summary>
點擊、拖曳、觸控或按鍵
</details>

<details>
<summary>Google 目前對「良好」INP 分數的標準是什麼？</summary>
低於 200 毫秒
</details>

<details>
<summary>在多次互動中，INP 如何決定最終分數？</summary>
取最差的那一次互動時間
</details>

<details>
<summary>根據討論內容，INP 分數在什麼情況下被視為「差」？</summary>
超過 500 毫秒
</details>

<details>
<summary>改善 INP 效能的主要方法是什麼？</summary>
使用非同步方式讓出主執行緒
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記