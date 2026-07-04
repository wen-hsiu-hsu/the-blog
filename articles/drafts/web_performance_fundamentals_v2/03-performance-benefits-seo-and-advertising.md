---
title: '網頁效能為什麼重要：SEO 與線上廣告篇'
description: '從搜尋引擎排名與線上廣告投報率出發，理解網頁效能對商業指標的直接影響。'
date: 2026-07-17
section: dev
category: Web Performance Fundamentals
series: web_performance_fundamentals
seriesTitle: 'Web Performance Fundamentals'
order: 3
chapter: 'Importance of Web Performance'
tags:
    - frontendMasters
    - webPerformanceFundamentals
    - SEO
    - CoreWebVitals
---

# 網頁效能為什麼重要：SEO 與線上廣告篇

> [[02-user-expectations-of-performance|上一篇]]從使用者體驗的角度說明了效能的重要性，介紹了人機互動研究中幾個關鍵的回應時間門檻。本篇繼續討論效能重要的另外兩個理由：搜尋引擎優化（SEO）與線上廣告。

## SEO：排名就是流量

對於公開上線的網站來說，搜尋結果的排名幾乎直接決定流量多寡。根據 [Backlinko](https://backlinko.com/google-ctr-stats) 的資料，搜尋結果第一名的點擊數遠高於其他名次，第二名大約只有第一名的 10%，第三名又是第二名的一半，往後遞減速度很快，超過第十名之後流量就極為稀少。

這和效能的關係，從 2020 年開始變得非常直接。Google 在 Search Central 部落格宣布，將「頁面體驗指標」納入搜尋排名訊號，其中核心指標就是 Core Web Vitals（核心網頁指標，後續章節會詳細介紹）。換句話說，**從 2020 年起，頁面的效能分數會影響搜尋排名**。

講師展示的資料也印證了這點：在常見關鍵字的搜尋結果中，排名第一的網站，其 Core Web Vitals 指標明顯優於後面的名次。當然，效能不是排名的唯一因素，內容品質、外部連結等 SEO 要素同樣重要。但若兩個網站在其他條件相近的情況下，速度較快的那個會勝出。

## 線上廣告：效能直接影響投報率

對於投放線上廣告的網站，效能問題會直接侵蝕廣告預算的效益。

講師用一個具體範例說明：假設花 1,000 美元購買展示廣告，大約可獲得 160,000 次曝光，其中約 1% 的人會點擊，帶來 1,600 位訪客。但如果網站的跳出率（bounce rate）高達 60%，代表有 960 人進站後馬上離開，實際留下來的只有 640 位潛在購買者，等於每獲得一位真正的訪客要花費約 1.56 美元。

跳出率和效能高度相關。講師引用了家具電商 Fernspace 的案例：在效能提升 65% 後，跳出率降低了 20%，頁面停留時間增加了 200%。若把同樣比例的改善套用到上面的廣告範例，跳出率從 60% 降至 48%，實際訪客數就從 640 人增加到 832 人，每位訪客的成本也從 1.56 美元降至 1.20 美元。

## 效能與營收：幾個真實案例

講師列舉了幾個將效能改善與商業數字直接連結的案例：

**Walmart**：載入時間每縮短 100 毫秒，網站營收增加 1%。Walmart 年營收約 6,650 億美元，1% 就是 66 億美元。

**Skill.co**（線上求職平台）：

| 載入時間 | 轉換率    |
| -------- | --------- |
| 2.4 秒   | 1.9%      |
| 3.3 秒   | 1.5%      |
| 5 秒以上 | 低於 0.6% |

載入時間愈長，轉換率愈低，可以非常直觀地看出兩者的關係。

講師也提到一個資源網站 [WPO Stats](https://wpostats.com/)，收錄了大量不同產業將效能改善與商業指標連結的案例研究，可以用來評估在自己的網站上投入效能工作的必要性。

至於「你的網站是否需要投入效能改善」這個問題，課程後續的「設定效能目標」章節會進一步討論。

## 複習

### 根據 Skill.co 的案例研究，頁面載入時間如何影響轉換率？

在 2.4 秒時，轉換率為 1.9%；在 3.3 秒時，下降至 1.5%；在 5 秒或更長時，低於 0.6%。

### Google 在 2020 年的搜尋排名變更與網頁效能有什麼關係？

Google 將頁面體驗指標與 Core Web Vitals 納入搜尋排名訊號，意味著網站效能直接影響搜尋引擎排名。

### 搜尋結果排名第一的網站可以獲得多少比例的搜尋流量？

排名第一的搜尋結果可獲得多達 7,500 萬次點擊，遠高於其他排名。第二名的流量大約只有第一名的 10%。

## 小測驗

<details>
<summary>根據 Google 2020 年的搜尋排名變更，什麼成為了新的排名訊號？</summary>
Core Web Vitals 效能分數
</details>

<details>
<summary>線上展示廣告的曝光中，通常有多少比例的人會點擊廣告？</summary>
1%
</details>

<details>
<summary>Fernspace 在效能提升 65% 後，觀察到了什麼結果？</summary>
跳出率降低了 20%
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Web Performance Fundamentals](https://frontendmasters.com/courses/web-perf-v2/) 課程筆記
