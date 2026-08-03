---
title: '改善 LCP：使用 picture 元素實作響應式圖片'
description: '介紹 HTML 原生 picture 元素的結構與運作方式，說明如何透過 source 與 srcset 根據螢幕寬度自動選擇合適的圖片大小。'
date: 2026-08-03
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 37
chapter: 'Improving Largest Contentful Paint'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - LCP
    - ImageOptimization
---

# 改善 LCP：使用 picture 元素實作響應式圖片

## `<picture>` 元素的結構

HTML 原生支援響應式圖片，主要透過 `<picture>` 元素搭配 `<source>` 與 `<img>` 組合使用：

```html
<picture class="illustration">
    <source
        media="(max-width: 720px)"
        srcset="/hero-mobile.png?width=720 720w, /hero-mobile.png?width=1440 1440w"
    />
    <source
        media="(min-width: 721px)"
        srcset="
            /hero-desktop.png?width=720   720w,
            /hero-desktop.png?width=1440 1440w,
            /hero-desktop.png?width=2800 2800w
        "
    />
    <img
        src="/hero-desktop.png?width=2800"
        alt="Developer Stickers Online"
        fetchpriority="high"
        height="1200"
        width="2800"
    />
</picture>
```

這個結構有三個層次：

**`<img>`（底層預設）**：放在最下方，作為後備選項。如果瀏覽器不支援 `<picture>` 或沒有符合任何 `<source>` 條件，就使用這張圖片。這裡同時加上了 `fetchpriority="high"`，確保這個 LCP 元素被優先下載。

**`<source>`（條件選擇器）**：用 `media` 屬性定義類似 CSS media query 的條件，告訴瀏覽器「在這個螢幕寬度下，使用這組圖片」。

**`srcset`（尺寸規則）**：在每個 `<source>` 內，用 `srcset` 列出不同寬度對應的圖片檔案，格式是「檔案路徑 寬度w」。瀏覽器會根據目前顯示空間的大小，自動選擇最合適的那一張。

## 瀏覽器如何選擇圖片

當瀏覽器渲染這段 HTML 時，它會評估每個 `<source>` 的 `media` 條件，找到第一個符合的選項，再從該選項的 `srcset` 中選擇最適合當前顯示寬度的圖片。

以行動裝置（max-width: 720px）為例：如果螢幕寬度是 701px，瀏覽器會看 srcset 中的選項，發現 360w 太小、720w 符合（因為 701 < 720），就選擇 720w 的版本下載。

對桌面裝置（min-width: 721px），瀏覽器同樣依照螢幕大小從 720w、1440w、2800w 三個選項中挑選最合適的，避免在小螢幕上傳輸 2800px 寬的超大圖片。

## 實際效益

這個機制讓你能夠精確控制在不同裝置上傳送的圖片大小，而不是對所有人都傳送最大版本。一個 300px 寬的手機不需要下載 2800px 的 hero 圖片，這樣的浪費在行動裝置上尤其明顯。

下一步是搭配圖片壓縮工具，實際產生這些不同尺寸的圖片版本並進行格式優化。

## 複習

### 哪個 HTML 元素允許為不同螢幕尺寸指定不同的圖片？

picture 元素支援根據類似媒體查詢的條件與螢幕尺寸，指定不同的圖片來源

### picture 標籤內的 source 元素在響應式圖片中如何運作？

source 元素允許為特定螢幕寬度指定不同的圖片檔案，讓瀏覽器能根據當前顯示尺寸自動選擇最合適的圖片

### source 元素中用來定義圖片選擇規則的屬性是什麼？

srcset 屬性用來指定根據螢幕寬度選擇不同圖片的規則

### 瀏覽器如何決定在 picture 元素中顯示哪張圖片？

瀏覽器評估螢幕寬度，根據指定的 source 元素規則選擇最合適的圖片，選擇符合當前顯示空間的最大適合版本

### 如果 picture 元素中沒有任何 source 條件符合，會發生什麼事？

picture 元素內 img 標籤指定的預設圖片將會被顯示

## 小測驗

<details>
<summary>哪個 HTML 元素允許為不同螢幕尺寸指定多個圖片來源？</summary>
picture
</details>

<details>
<summary>source 元素中用來根據螢幕寬度指定圖片顯示規則的屬性是什麼？</summary>
srcset
</details>

<details>
<summary>如果瀏覽器不符合其他 source 條件，哪個屬性用來指定預設圖片？</summary>
img 標籤本身
</details>

<details>
<summary>當有多個 source 元素時，瀏覽器會自動做什麼？</summary>
選擇符合螢幕寬度的圖片
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
