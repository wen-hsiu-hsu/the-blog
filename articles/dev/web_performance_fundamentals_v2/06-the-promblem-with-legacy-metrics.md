---
title: '傳統指標的局限與 Core Web Vitals 的誕生'
description: '說明 DOMContentLoaded 與 load 事件在客戶端渲染架構下為何失去意義，以及這個問題如何促使 Google 建立以使用者感知為基準的 Core Web Vitals。'
date: 2026-07-18
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 6
chapter: 'Importance of Web Performance'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CoreWebVitals
  - DOMContentLoaded
---

# 傳統指標的局限與 Core Web Vitals 的誕生

> [[05-measuring-domcontentloaded-and-load-events|上一篇]]介紹了 DOMContentLoaded 與 load 這兩個傳統效能指標的定義與用法。本篇說明這兩個指標在現代網頁架構下為何逐漸失去意義，以及這個問題如何促使 Google 建立新的衡量標準。

## 傳統指標曾經夠用

在客戶端渲染（client-side rendering）出現之前，網頁的運作方式相對單純：伺服器回傳完整的 HTML，瀏覽器解析後呈現給使用者。在這個時代，DOMContentLoaded 和 load 是量測效能的主要手段，兩者都能反映使用者實際等待的時間。

當時常見的 JavaScript 寫法長這樣：

```javascript
$(document).ready(function () {
  $.ajax("/cart").then(updateCartIcon);
});
```

頁面載入完成後，再執行非同步任務，例如從伺服器取得購物車資料。這個模式在當時很直觀，load 事件代表的「頁面準備好了」和使用者感受到的「頁面好了」是同一件事。

## 2010 年：客戶端渲染改變了一切

大約從 2010 年開始，Backbone、Knockout、jQuery UI 等框架引入了客戶端渲染的概念，後來演變成現代的 React、Vue 等框架。這類應用程式的 HTML 結構通常長這樣：

```html
<div id="app"></div>
```

HTML 本身幾乎是空的，真正的內容由 JavaScript 在執行後動態產生：

```javascript
$(document).ready(function () {
  App.start();
});
```

這個模式下，DOMContentLoaded 和 load 幾乎在瀏覽器一收到 HTML 就立刻觸發，因為文件本身什麼都沒有。但使用者真正看到內容，可能是在一秒、十秒甚至更久之後。

結果就是：**指標顯示網站極快，使用者體驗卻可能極差**。兩者之間不再有任何連結。

## Google 的問題：如何客觀比較網站速度

Google 需要一個方法，能夠不論網站使用何種框架或技術，都能客觀地比較兩個網站的速度。如果依賴 DOMContentLoaded 和 load，客戶端渲染的網站看起來永遠最快，這顯然無法反映真實情況。

Google 的核心需求是：**以使用者感知到的效能為基準**，而不是以瀏覽器事件觸發的時間點為基準。能做到這一點，才能公平地在搜尋排名中獎勵真正快的網站。

這個需求推動了 Core Web Vitals 的誕生，這是一組全新的效能指標，設計目的就是反映使用者的實際體驗，後續章節會詳細介紹。

## 複習

### 在客戶端渲染出現之前，量測網頁效能的兩個主要指標是什麼？

DOMContentLoaded 事件與 load 事件

### 客戶端渲染如何改變了 DOMContentLoaded 與 load 這類傳統效能指標的意義？

這些事件幾乎在瞬間觸發，與使用者實際體驗到的效能失去了有意義的連結

### 是什麼促使 Google 開發新的效能衡量標準？

為了能夠客觀比較網站效能、在搜尋排名中獎勵速度較快的網站，並提升使用者的搜尋體驗

### 早期客戶端渲染的常見模式是什麼？

HTML 頁面幾乎是空的，只有一個帶有 app 之類 ID 的 div，文件本身很快載入完成，之後才由應用程式開始渲染內容

### 傳統效能指標在客戶端渲染網站上造成了什麼問題？

指標可能顯示網站速度很快，即使使用者實際體驗到的速度很慢，導致效能評估失準

## 小測驗

<details>
<summary>客戶端渲染在傳統效能指標方面造成了什麼問題？</summary>
DOMContentLoaded 與 load 事件幾乎瞬間觸發，與使用者體驗失去有意義的連結
</details>

<details>
<summary>Google 為什麼有興趣開發新的效能量測方法？</summary>
為了根據使用者體驗客觀比較網站效能
</details>

<details>
<summary>網站轉向客戶端渲染後，效能指標發生了什麼變化？</summary>
DOMContentLoaded 與 load 事件幾乎立即觸發
</details>

<details>
<summary>使用 DOMContentLoaded 與 load 事件量測效能的主要限制是什麼？</summary>
無法反映使用者的實際體驗
</details>

<details>
<summary>Google 推出了什麼方案來解決效能量測的挑戰？</summary>
Core Web Vitals
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記