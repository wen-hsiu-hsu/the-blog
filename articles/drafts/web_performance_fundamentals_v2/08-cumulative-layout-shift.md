---
title: 'Core Web Vitals：CLS（累積版面位移）'
description: '說明 CLS（累積版面位移）的計算方式，包含影響比例與距離比例的乘積公式、桌面版與行動版的差異，以及 Google 的評分門檻與豁免規則。'
date: 2026-07-19
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 8
chapter: 'Core Web Vitals & Others Performance Metrics'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - CLS
  - CoreWebVitals
---

# Core Web Vitals：CLS（累積版面位移）

> [[07-largest-contentful-paint|上一篇]]介紹了 Core Web Vitals 的第一個指標 LCP，說明瀏覽器如何判定頁面上「最大可見元素」完成繪製的時間點。本篇進入第二個指標 CLS，量測的是頁面載入過程中視覺穩定性的問題。

## 什麼是 CLS

CLS（Cumulative Layout Shift，累積版面位移）量測的是頁面在載入過程中，元素是否以可預期的方式出現，還是不斷移動、跳動，讓使用者感到不穩定。

最常見的情境是：廣告、圖片或橫幅在非同步載入後插入頁面，把原本已經在那裡的內容往下推，使用者可能在這瞬間點錯按鈕或連結。講師提到，有些網站似乎刻意利用這個模式讓使用者誤點廣告，而 Google 將 CLS 納入排名懲罰，正是在制衡這種反模式。

## 單次版面位移的分數計算

一次版面位移的分數由兩個數字相乘得出：

```
版面位移分數 = 影響比例（impact fraction）× 距離比例（distance fraction）
```

兩者都以**使用者的 viewport**（螢幕上可見的區域）為基準，而非整個頁面。

### 影響比例（impact fraction）

viewport 中有多少比例的面積受到這次位移影響。

以課程範例為例：viewport 高度為 768px，頁首橫幅插入後，下方 708px 的內容全部移動，影響比例為 708 ÷ 768 ≈ **0.922**。

### 距離比例（distance fraction）

元素在 viewport 中移動了多遠，以 viewport 尺寸的比例表示。

同一個範例中，橫幅高度為 180px，距離比例為 180 ÷ 768 ≈ **0.234**。

### 最終分數

```
0.922 × 0.234 ≈ 0.215
```

## 行動版與桌面版的差異

Google 會分別收集桌面版與行動版的 CLS 資料。由於行動裝置的 viewport 通常較小，同樣的移動距離在行動版上會產生更高的距離比例，因此相同的版面位移在行動版上往往得到更高（更差）的分數。

講師以同一個橫幅為例，行動版的影響比例為 0.929，距離比例為 0.308，兩者相乘後得到比桌面版更高的分數。

CLS 的計算原則上同時適用於垂直與水平方向的位移，只是水平方向的計算更複雜，講師表示實際實作在 Blink 引擎原始碼中長達約 600 行，課程中不展開說明。

## Cumulative（累積）的意義

CLS 的「累積」代表它是**所有版面位移分數的加總**，不是只看一次最嚴重的位移。頁面載入過程中可能發生數十次甚至上百次位移，每一次都會加進總分。

### 哪些位移不計入

使用者主動操作（點擊、鍵盤輸入）後 **500 毫秒以內**發生的位移不計入 CLS。這類位移被認為是頁面行為的正常反應，例如點擊展開手風琴選單後內容區域移動，不應被視為問題。

注意：捲動（scroll）本身不觸發 CLS 計算，但點擊可以，且點擊後 500ms 以內的位移是豁免的。

## Google 的評分標準

| 評分     | CLS 分數    |
| -------- | ----------- |
| 良好     | 0.1 以下    |
| 需要改善 | 0.1 至 0.25 |
| 差       | 超過 0.25   |

## 複習

### 什麼是累積版面位移（CLS），它量測什麼？

CLS 量測頁面在載入過程中元素是否以流暢且可預期的方式出現，具體追蹤的是初始載入期間元素是否移動或重新排列，這會影響使用者的互動體驗與對頁面穩定性的感受。

### 版面位移分數如何計算？

版面位移分數的計算方式是：影響比例（viewport 中受位移影響的面積比例）乘以距離比例（元素在 viewport 中移動的距離比例），且桌面版與行動版的 viewport 都會分別計算。

### 什麼樣的 CLS 分數算是良好？

CLS 分數需在 0.1 以下才算良好。高於此門檻的網站可能受到 Google 的 SEO 懲罰，代表頁面效能與使用者體驗不佳。

### 哪些版面位移不計入 CLS 的計算？

使用者操作（例如點擊或鍵盤輸入）後 500 毫秒以內發生的位移不計入。此外，捲動也不會觸發版面位移的計算。

### 是什麼造成版面位移，為什麼它是個問題？

廣告、圖片或橫幅等元素在非同步載入後插入頁面，把其他內容推移，這就是版面位移的成因。它讓頁面感覺不可預測，也可能讓使用者不小心點到非預期的元素，造成挫敗感。

## 小測驗

<details>
<summary>CLS（累積版面位移）主要量測什麼？</summary>
頁面元素載入時是否以可預期的方式出現
</details>

<details>
<summary>CLS 分數如何計算？</summary>
影響比例乘以距離比例
</details>

<details>
<summary>CLS 在量測版面位移時，以哪個範圍作為基準？</summary>
僅限使用者可見的螢幕區域（viewport）
</details>

<details>
<summary>什麼情況下的版面位移不計入 CLS？</summary>
使用者操作後 500 毫秒以內發生的位移
</details>

<details>
<summary>什麼樣的 CLS 分數算是良好？</summary>
0.1 以下
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記