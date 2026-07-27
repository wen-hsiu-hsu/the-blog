---
title: '改善 FCP：資源預載（Preconnect 與 Preload）'
description: '說明 link preconnect 與 link preload 的用途與差異，以 Google Fonts 為例示範如何提前建立連線與提早取得字型資源，並說明自行托管字型的優勢。'
date: 2026-07-31
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 32
chapter: 'Improving First Contentful Paint'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - FCP
  - ResourceHints
---

# 改善 FCP：資源預載（Preconnect 與 Preload）

## 關鍵路徑（Critical Path）

要改善 FCP，核心問題是：哪些資源是瀏覽器在繪製第一個畫面之前**必須**取得的？這條路徑上的任何延遲都會直接推遲 FCP。

## link preconnect：提早建立連線

以 Google Fonts 為例，這是大多數人使用網路字型的方式。Google Fonts 提供的嵌入程式碼中，包含兩個 `link preconnect`：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

`preconnect` 告訴瀏覽器：「我之後會需要這個網域上的資源，請現在就開始進行 DNS 查詢、建立 TCP 連線、完成 TLS 握手。」這樣等到真正需要資源時，連線已經準備好，可以直接發出請求。

`preconnect` 只是提前建立連線，**不會實際取得任何檔案**。

## link preload：提早取得特定資源

若你已經知道某個資源是必要的，而且它目前要等到某個 CSS 或 JS 執行完才會被發現，可以用 `link preload` 直接告訴瀏覽器提前去取得它：

```html
<link rel="preload" href="/fonts/example.woff2" as="font" crossorigin>
```

`as` 屬性必須指定資源類型（font、style、script、image 等），讓瀏覽器知道如何優先排序這個請求。

預載字型和使用 fetch preload 時，**必須加上 `crossorigin` 屬性**，因為這些跨來源請求需要伺服器回傳正確的 CORS 標頭。

## 可以預載的資源類型

- CSS 樣式表（style）
- JavaScript（script）
- 圖片（image）
- 字型（font）
- fetch 呼叫（在 JavaScript 尚未執行前就可以預先發出請求，等 JS 醒來後直接使用結果）

## 更好的做法：自行托管字型

講師特別提到，雖然 preload 可以改善 Google Fonts 的載入順序，但更根本的建議是**把字型檔案放在自己的伺服器上**，而不是指向 Google 的 URL。

原因有兩個：

**穩定性**：Google 隨時可能更改其字型檔案的 URL，直接 hardcode 這些 URL 到 preload 中，未來可能會失效。

**速度**：如果你的網站已經針對 TTFB 做了優化並放在快速的 CDN 上，從自己的伺服器載入字型往往比依賴 Google Fonts 更快。講師從真實使用者資料中觀察到，Google Fonts 的回應時間在第三方資源中通常是最慢的一環。

## 複習

### 在網頁效能優化中，link preconnect 的用途是什麼？

提前對特定網域建立連線，執行 DNS 查詢與連線設定，在真正需要資源之前完成這些準備工作，減少後續請求時的額外開銷

### link preconnect 與 link preload 有什麼差異？

link preconnect 只是提前對某個網域建立連線，link preload 則是指示瀏覽器實際提早取得某個特定資源，早於它通常被發現的時間點

### 哪些類型的資源可以被預載？

樣式表、腳本、圖片、字型，以及 fetch 呼叫都可以使用 link preload 屬性進行預載

### 預載字型或使用 fetch preload 時，需要加上哪個特殊屬性？

需要加上 crossorigin 屬性，代表該資源必須支援跨來源資源共享（CORS）標頭

### 載入網路字型的最佳實踐建議是什麼？

自行托管字型，將所需的字型檔案放在自己的原始碼中，而非依賴 Google Fonts 等第三方服務，這樣通常能提升效能與可靠性

## 小測驗

<details>
<summary>link preload 屬性讓開發者能做什麼？</summary>
指示瀏覽器提早取得某個資源，早於它通常被發現的時間點
</details>

<details>
<summary>預載字型或使用 fetch 時，需要加上哪個額外屬性？</summary>
crossorigin 屬性
</details>

<details>
<summary>哪些類型的資源可以被預載？</summary>
樣式表、腳本、圖片、字型與 fetch 呼叫
</details>

<details>
<summary>處理網路字型的建議方式是什麼？</summary>
自行托管字型，而非使用外部服務
</details>

<details>
<summary>link preconnect 屬性的作用是什麼？</summary>
在需要資源之前，提前對某個網域建立連線
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記