---
title: '改善 INP：把工作切開，讓出主執行緒'
description: '示範如何用 requestAnimationFrame 與 setTimeout 把一個原本卡住 1200 毫秒的加入購物車按鈕，拆成多段讓出主執行緒的工作，將 INP 降到極短，同時保留使用者可見的即時回饋。'
date: 2026-08-04
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 41
chapter: 'Improving CLS & INP'
tags:
  - frontendMasters
  - webPerformanceFundamentals
  - INP
  - CoreWebVitals
  - JavaScript
---

# 改善 INP：把工作切開，讓出主執行緒

> [[11-interaction-to-next-paint|INP 篇]]提過，改善 INP 的核心手段是透過非同步操作讓主執行緒盡快釋出。本篇以一個電商網站的「加入購物車」按鈕為例，實際示範這件事怎麼做。

## 情境：一個卡住 1200 毫秒的加入購物車按鈕

假設有一個電商網站，商品格線上每個商品都有一顆「Add to Cart（加入購物車）」按鈕。使用者點擊後，網站要做三件事：記錄這次點擊的分析追蹤資料、透過 fetch 呼叫後端把商品加入購物車、以及在完成後更新畫面上的購物車數量。

實際量測這顆按鈕的互動，發現使用者點擊後畫面沒有任何立即回饋，要等上一陣子，購物車數量才會更新。用瀏覽器開發工具量測這次點擊的 INP，得到的結果是 **1200 毫秒**，遠遠超過 Google 「良好」門檻（200 毫秒以內），屬於非常差的分數。

原本的點擊處理器程式碼很單純：從按鈕的 `data-product-id` 屬性取出商品 ID，接著同步執行一段分析追蹤程式碼，然後 `await` 一個加入購物車的 fetch 請求。問題出在中間那段分析追蹤程式碼：它是同步執行的，而且跑得非常久，久到它整段跑完之後，瀏覽器才有機會繪製下一幀畫面。換句話說，使用者點擊按鈕後，必須等這段昂貴的分析追蹤運算全部執行完畢，才會看到任何視覺回饋，這就是 INP 高達 1200 毫秒的原因。分析追蹤本身是必要功能，不需要拿掉，但它不應該用「擋住畫面繪製」的方式執行。

## 核心觀念：yield 就是讓出主執行緒

主執行緒只有一個，同時負責處理所有 JavaScript、事件與版面計算。「yield（讓出）」聽起來是個高深的詞，實際上做法很單純：把工作往後排，先讓瀏覽器有機會去做其他事（包括繪製下一幀）。

有兩種常見手法：

- **`setTimeout`**：最古老、最熟悉的做法，把程式碼排到未來某個時間點執行，讓其他工作可以先跑
- **`requestAnimationFrame`**：可以視為更精準版的 `setTimeout`，它會在瀏覽器「下一次即將繪製畫面之前」呼叫回呼函式。這個 API 原本是為了動畫設計的（例如高更新頻率的遊戲畫面），但對管理 INP 同樣重要，因為它讓我們能精確控制「主執行緒工作」跟「下一次繪製」之間的時間點

## 重寫後的處理邏輯

改善後的點擊處理器分成好幾層：

1. 先做便宜的操作：從屬性取出商品 ID，這幾乎不花時間，不需要 yield
2. 呼叫 `requestAnimationFrame`，把接下來要做的事都排到「瀏覽器準備繪製下一幀」的那一刻才執行，暫停一切處理
3. 到了下一幀繪製前，做**使用者看得到的回饋**：把按鈕文字改成「Added」，並停用按鈕。這一步刻意做得很輕量，因為這就是 INP 要量測的「P（Paint）」發生的地方，不希望在這裡塞入昂貴運算
4. 用 `setTimeout` 把 `updateAnalytics` 這段昂貴運算再往後推一層，確保它不會擋在繪製之前
5. 加入購物車的 `await` 呼叫本身是非同步的，等同已經自動讓出主執行緒
6. 再用一個 `setTimeout`（約 1500 毫秒後）把按鈕文字改回「Add to Cart」並移除 disabled 屬性，讓使用者可以再次點擊；這一層單純是等待動畫效果的時間差，不是為了讓出主執行緒

一個原本很小的函式，因為加了好幾層 yield 而變大了不少，但這種「包裝層」正是事件處理器改善 INP 時常見的樣子。

用執行順序來看，click 事件觸發後，點擊處理器現在只做一件很輕的事：呼叫 `requestAnimationFrame`，然後立刻結束，把主執行緒交還給瀏覽器。等到瀏覽器準備繪製下一幀時，才會呼叫剛剛排定的回呼函式，去改按鈕內容，並在裡面排入 `setTimeout` 跟 `addToCart`，接著再次把主執行緒讓出來，讓繪製真正發生。**INP 到這裡就已經測量完畢**，因為使用者的互動與瀏覽器繪製之間，只做了改按鈕文字這件輕量的事。至於 `updateAnalytics` 這段昂貴運算，要等到之後計時器觸發才會執行，但那已經是繪製完成之後的事，不再計入 INP。

## 實際效果

套用這個寫法後，使用者點擊按鈕會立刻看到按鈕文字變成「Added」，回饋明顯更即時。重新量測這次互動的 INP，時間從原本的 1200 毫秒大幅縮短到僅剩幾毫秒等級，遠低於 Google「良好」的 200 毫秒門檻。

值得注意的是：**JavaScript 執行的總工作量並沒有減少**，`updateAnalytics` 依然是那個跑幾萬次迴圈的昂貴運算，執行時間長到 DevTools 會標示為「long task」警告。改善的地方只在於這段昂貴運算不再擋在點擊與繪製之間，INP 因此大幅改善。如果要讓這段運算本身變快，那是另一個層次的問題，需要拆解、優化實際的 JavaScript 邏輯（這類技巧屬於另一門課程的範疇）。就 INP 而言，關鍵永遠只有一件事：不要擋住主執行緒的繪製時機。

## 複習

### 為什麼原本的加入購物車按鈕 INP 高達 1200 毫秒？

因為點擊處理器在繪製下一幀之前，同步執行了一段耗時很長的分析追蹤程式碼（`updateAnalytics`），把繪製時機硬生生往後拖延。

### `requestAnimationFrame` 在這個改善方案中扮演什麼角色？

它把使用者可見的回饋（改變按鈕文字、停用按鈕）安排在瀏覽器準備繪製下一幀的時間點執行，並把這一步跟繪製之前不必要的工作隔開。

### 為什麼要用 `setTimeout` 包住 `updateAnalytics`？

因為這段運算很昂貴，如果留在繪製之前執行會拖慢 INP；用 `setTimeout` 排到之後執行，可以讓繪製先完成，INP 測量結束後這段運算再慢也不影響分數。

### 改善後，`updateAnalytics` 實際執行的時間變短了嗎？

沒有，它依然是同樣昂貴的運算，DevTools 甚至會標示為 long task。改變的只是它的執行時機被移到繪製之後，不再阻擋 INP。

### 這個改善方案背後唯一的核心目標是什麼？

不要讓任何工作擋在使用者互動與瀏覽器繪製下一幀之間，也就是持續為主執行緒讓路。

## 小測驗

<details>
<summary>原本的加入購物車按鈕，INP 為什麼高達 1200 毫秒？</summary>
點擊處理器在繪製前同步執行了耗時很長的分析追蹤程式碼
</details>

<details>
<summary>requestAnimationFrame 在改善方案中的作用是什麼？</summary>
把使用者可見的回饋安排在瀏覽器準備繪製下一幀時執行
</details>

<details>
<summary>為什麼要用 setTimeout 延後執行 updateAnalytics？</summary>
避免這段昂貴運算擋在繪製之前，拖慢 INP
</details>

<details>
<summary>改善後，updateAnalytics 本身的執行時間有變短嗎？</summary>
沒有，只是執行時機被移到繪製之後
</details>

<details>
<summary>改善 INP 唯一的核心目標是什麼？</summary>
不讓任何工作擋在互動與下一幀繪製之間
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
