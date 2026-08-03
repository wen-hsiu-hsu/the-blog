---
title: '改善 LCP：Lazy Loading 與 Eager Loading'
description: '說明如何對非關鍵圖片使用 loading="lazy" 屬性，讓 LCP 圖片不再被其他資源搶占頻寬，縮短資源延遲。'
date: 2026-08-02
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 35
chapter: 'Improving Largest Contentful Paint'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - LCP
    - ImageOptimization
---

# 改善 LCP：Lazy Loading 與 Eager Loading

## 問題所在：非關鍵圖片搶占頻寬

在觀察瀑布圖時，會發現頁面上有很多圖片並不是 LCP 元素，例如 logo、商品縮圖、促銷橫幅的圖片等。這些圖片因為在 HTML 中出現的位置較早，往往比 LCP 圖片更早被瀏覽器發現並開始下載，佔用了有限的網路頻寬。

用 LCP 的術語來說，這延長了**資源延遲（resource delay）**：瀏覽器要等到這些較低優先級的圖片開始下載並佔用頻寬之後，才能輪到 LCP 圖片。

改善這個問題有兩個方向，可以雙管齊下：

### 策略一：Lazy Loading 非關鍵圖片

HTML 的 `loading="lazy"` 屬性可以套用在 `<img>` 和 `<iframe>` 上，告訴瀏覽器：「這個資源不急，等有空再載入。」

```html
<img src="sticker.jpg" loading="lazy" alt="..." />
```

這樣做的效果是把整個瀑布圖「壓平」，讓所有非關鍵圖片在更後面才開始，LCP 圖片不再需要和它們競爭頻寬。

#### 哪些圖片應該 lazy load，哪些不應該

**不應該 lazy load 的圖片**：LCP 元素。講師在範例網站中有 `hero-desktop` 和 `hero-mobile` 兩張 hero 圖片，透過 CSS 根據螢幕尺寸決定顯示哪一張。兩張都可能成為 LCP 元素，因此兩張都不應該加上 `loading="lazy"`。

**應該 lazy load 的圖片**：所有其他圖片，包含在 fold 以下的圖片，以及在 fold 以上但不是使用者來這個頁面主要目的的圖片。重點是教會瀏覽器「什麼才是最重要的」。

講師在程式碼中全域搜尋所有 `<img` 標籤（共 54 個，分佈在 9 個檔案），批次替換成 `<img loading="lazy"`，接著再把 `hero-desktop` 和 `hero-mobile` 這兩張圖的 `loading="lazy"` 移除。

### 策略二：Eager Loading LCP 圖片

知道哪些圖片不重要之後，反過來也可以明確告訴瀏覽器哪些圖片最重要，讓它們盡快開始下載。

#### fetchpriority 屬性

`fetchpriority="high"` 可以加在 `<img>`、`<script>` 和 `<link>` 上，明確告訴瀏覽器這個資源是高優先級，優先處理：

```html
<img src="hero-mobile.jpg" fetchpriority="high" alt="..." />
```

這和 lazy loading 是互補的概念，一個是告訴瀏覽器「這不重要，晚點再說」，另一個是告訴它「這很重要，快點去拿」。

#### link preload：更廣泛的支援

若需要跨瀏覽器支援，可以改用前面介紹過的 `link preload`：

```html
<link rel="preload" href="/images/hero-mobile.jpg" as="image" />
```

這樣瀏覽器在解析到 HTML 文件的圖片標籤之前，就已經開始下載圖片了，等於把 LCP 圖片的開始時間提前到頁面解析初期。圖片不需要加上 `crossorigin` 屬性（字型需要，圖片不用）。

講師在示範中同時使用了兩者：在 hero 圖片上加上 `fetchpriority="high"`，並在 `<head>` 中加入對應的 `<link rel="preload">`。

修改後的瀑布圖顯示，`hero-desktop` 和 `hero-mobile` 的下載起點已經盡可能往左移動，幾乎是頁面開始載入後就立刻開始。

## 複習

### 對圖片使用 loading="lazy" 的目的是什麼？

告訴瀏覽器延後載入非關鍵圖片，縮短頁面初始載入時間，讓 LCP 圖片能優先下載

### Lazy loading 如何影響頁面資源下載的瀑布圖？

Lazy loading 將圖片的下載時間推遲到頁面載入的後期，讓關鍵資源能夠優先下載，避免非必要圖片與高優先級內容競爭頻寬

### 哪些類型的元素可以使用 lazy loading？

圖片（img）和 iframe 可以使用 lazy loading，讓瀏覽器延後載入它們，直到更關鍵的資源下載完成

### 在 lazy loading 的考量上，「在 fold 以上」與「在 fold 以下」的圖片有什麼差異？

在 fold 以下的圖片應該一律使用 lazy loading；在 fold 以上但不是頁面核心內容的圖片，同樣可以使用 lazy loading 來優化效能

### 決定是否對一張圖片使用 lazy loading 時，主要考量是什麼？

以 LCP 圖片的載入優先，其他對初始頁面視圖較不重要的圖片則使用 lazy loading

## 小測驗

<details>
<summary>對圖片使用 loading="lazy" 屬性的目的是什麼？</summary>
告訴瀏覽器延後載入非關鍵圖片
</details>

<details>
<summary>在網頁效能術語中，資源延遲（resource delay）是什麼？</summary>
開始下載圖片之前所花費的時間
</details>

<details>
<summary>loading="lazy" 屬性可以套用在哪些元素上？</summary>
圖片（img）與 iframe
</details>

<details>
<summary>LCP 圖片應該如何處理？</summary>
不應該對 LCP 圖片套用 loading="lazy"
</details>

<details>
<summary>什麼因素決定一張圖片是否應該使用 lazy loading？</summary>
圖片的優先級與在頁面上的位置
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
