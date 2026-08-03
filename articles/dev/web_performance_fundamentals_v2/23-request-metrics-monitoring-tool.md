---
title: '效能測試工具：Real User Monitoring（RUM）'
description: '介紹 Real User Monitoring（RUM）的概念與工具分類，說明它與 CrUX 的差異，以及 RUM 資料在篩選、個別請求鑽取與自訂指標追蹤上的實際應用。'
date: 2026-07-27
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 23
chapter: 'Testing & Tools'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - RealUserMonitoring
    - CoreWebVitals
---

# 效能測試工具：Real User Monitoring（RUM）

## CrUX 的限制

前面介紹的工具，不論是 Lighthouse、Performance 面板還是 Web Vitals 擴充功能，本質上都是 lab data，或是透過 CrUX 取得的匿名 field data。CrUX 有幾個明顯的限制：

- 只收錄已登入 Chrome 的使用者，Safari 與 Firefox 使用者不在其中
- 只涵蓋流量夠大的公開網站（前 100 萬名）
- 資料是匿名的，你的競爭對手也能查到
- 是 28 天滾動平均，沒有即時性
- 無法鑽取到個別使用者的請求細節

如果網站是你自己的，你需要的是能讓你**完整掌握自家使用者資料**的工具，這就是 RUM 的用途。

## 什麼是 RUM

Real User Monitoring（RUM，真實使用者監控）是一類工具，透過在你的網站上安裝一段代理程式（agent），讓瀏覽器在真實使用者造訪時收集效能資料，並回傳到你指定的報告服務。

底層實作與前面章節介紹的 PerformanceObserver 模式相同，各家工具在此基礎上加入不同的分析與視覺化能力。

RUM 工具與 CrUX 的對照：

| 面向       | CrUX                   | RUM                    |
| ---------- | ---------------------- | ---------------------- |
| 資料來源   | 已登入 Chrome 的使用者 | 所有造訪你網站的瀏覽器 |
| 網站範圍   | 前 100 萬公開網站      | 任何網站（含私有）     |
| 資料所有權 | 匿名公開               | 你自己的資料           |
| 即時性     | 28 天滾動平均          | 可即時查看             |
| 分析深度   | 分數層次               | 可鑽取到個別請求       |

## 兩種 RUM 工具類型

### 企業級工具

適合預算充足、有大型工程團隊的組織。代表性工具包含 Akamai mPulse（講師認為是最完整的選擇）、Dynatrace、AppDynamics、Datadog、Sentry 等。

講師補充，Akamai mPulse 背後的 Boomerang 開源 agent 是業界標準，Dynatrace 和 Datadog 底層實際上也使用它。

### 專案型工具

適合預算有限、針對特定網站進行優化的團隊。代表性工具包含 Request Metrics（講師自己建立的工具）、SpeedCurve、RUMVision、Pingdom、Raygun 等。

## RUM 資料能做什麼

講師以 Request Metrics 為例，展示 RUM 資料的分析能力：

**篩選與分群**：可以只看特定地區（例如美國）、特定網路條件（快速寬頻或慢速行動網路）的使用者子集，了解不同情境下的效能表現。

**按 URL 分析**：可以把 LCP 等指標依 URL 拆解，找出哪個頁面的問題最嚴重，並進一步查看該 URL 上最常被標記為 LCP 元素的是什麼。

**鑽取到個別請求**：可以看到某個特定使用者的完整時序，包含他們的瀏覽器、作業系統、地理位置、DNS 時間、SSL 時間，以及每一個資源請求的載入細節，甚至可以分析 LCP 圖片的 HTTP headers。

這等同於對每一個真實使用者的每一次造訪都執行了一次 WebPageTest，而不是只有你自己的一次測試。

## 安裝與自訂指標

RUM 工具的安裝通常只需要在網站中引入一段 agent 腳本，網站不需要是公開的，只要訪客的瀏覽器能夠把資料傳送到 RUM 服務即可。

若需要追蹤自訂指標，有兩種方式：

- 透過 Performance API 的 `performance.mark()` / `performance.measure()` 建立自訂計時事件，多數 RUM 工具會自動識別
- 透過工具的 JavaScript SDK 手動傳送事件（例如 `RUM.sendEvent(...)`），具體 API 因工具而異

## 複習

### 使用 RUM 工具與 CrUX 相比有哪些主要優勢？

RUM 工具允許詳細的資料篩選、鑽取到特定使用者群體、存取個別請求的細節、依 URL 分析效能指標，並能在不同使用者情境下提供更細緻的效能洞察。

### RUM 工具通常可以查看哪些效能指標？

常見指標包含 LCP（最大內容繪製）、CLS（累積版面位移）、INP（互動到下一幀繪製）、DNS 時間、SSL 時間、客戶端時間，以及資源載入細節。

### 如何將自訂指標加入 RUM 工具？

可以透過 Performance API 建立自訂的 measure 事件，許多 RUM 工具會自動識別；或者透過工具的 JavaScript SDK 明確傳送事件資料。

### 設定 RUM 工具進行效能監控時，有哪些關鍵考量？

確保終端使用者有網路可以傳送資料、工具可以收集公開或私有網站的資料、安裝封裝了 PerformanceObserver 的 agent，並選擇用於資料分析的報告服務。

### RUM 工具能提供個別使用者會話的哪些詳細效能資料？

可以提供使用者的瀏覽器、作業系統、地理位置、資源載入的完整時序、特定 URL 的效能表現，以及圖片和 CSS 等效能元素的細節分析。

## 小測驗

<details>
<summary>RUM 工具讓你能對網頁效能資料做什麼？</summary>
依地理位置與連線類型篩選資料
</details>

<details>
<summary>使用 RUM 工具時，通常可以存取個別使用者請求的哪些層次的細節？</summary>
包含 DNS、SSL 與資源請求的詳細時序
</details>

<details>
<summary>如何在 RUM 工具中收集自訂指標？</summary>
透過 RUM 工具的 SDK 傳送自訂事件
</details>

<details>
<summary>擁有自己的效能資料與使用 CrUX 相比有什麼優勢？</summary>
能以更細緻的方式切割與分析資料
</details>

<details>
<summary>收集網站 RUM 資料的關鍵需求是什麼？</summary>
終端使用者必須有網路能夠把資料傳送到 RUM 工具
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
