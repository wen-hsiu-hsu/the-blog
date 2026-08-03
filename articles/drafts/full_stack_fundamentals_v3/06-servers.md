---
title: '伺服器到底是什麼：從概念定義到寫一個最陽春的 Node.js Server'
description: '拆解「伺服器」這個詞的核心定義：任何能監聽並回應請求的電腦或程式都算伺服器，並說明正式伺服器為何需要專用硬體與 100% 可用性，最後用 Node.js 內建的 http 模組寫出一個最簡單的伺服器。'
date: 2026-08-07
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 6
chapter: 'Server'
tags:
  - frontendMasters
  - fullStackFundamentals
  - Server
  - NodeJs
  - CloudComputing
  - VPS
---

# 伺服器到底是什麼：從概念定義到寫一個最陽春的 Node.js Server

> [[05-shell-exercise|上一篇]]談完命令列與 shell 的基礎後，課程正式進入核心主題：伺服器。這一節先從「伺服器到底是什麼」這個看似基本、卻很少被講清楚的問題開始，再實際動手寫出第一個伺服器。

## 伺服器的核心定義

伺服器這個詞幾乎每個人都聽過，但講師先拋出一個問題：伺服器到底是什麼？現場學生給出的答案包括「一個監聽輸入、輸入可能來自網路的程式」「一台主機應用程式、監聽輸入的電腦」「一台伺服內容、回應請求的電腦」。講師認可了這些答案，並總結：伺服器做的事情就是回應請求，沒有更多了，這與其說是一種特定的硬體，不如說更接近一種概念。

實際上任何電腦都可以是伺服器，包括手機、筆電，只要能讓它針對某種格式化的請求做出回應，它就是伺服器。這呼應了前面幾篇談命令列與 Vim 時反覆出現的心態：工具與規則的本質往往比表面的名詞定義更單純，重點是理解背後在做什麼，而不是把名詞複雜化。

## 為什麼正式伺服器需要專用硬體

雖然任何電腦都能當伺服器，但講到「伺服器」時，大家聯想到的通常是專用硬體，這背後有幾個實際原因：

- **不同的晶片組**：伺服器用的晶片組跟一般家用電腦不同，其中一個原因是虛擬化（virtualization）的需求，這部分會在後面談雲端運算時進一步說明
- **效率**：伺服器晶片通常比家用電腦更有效率，但也因此價格高出許多，一顆伺服器晶片可能要價數千美元，比講師自己整台電腦的價格還高
- **100% 可用性**：伺服器必須隨時保持可連線狀態

最後一點是關鍵：如果只是把自己的筆電當伺服器用，一旦闔上筆電下班回家，網頁就會直接掛掉，這顯然不是理想的做法。所以「伺服器」之所以會跟「專用硬體」畫上等號，本質上是為了滿足「必須隨時可連線、回應其他裝置」這個需求，而不是因為伺服器有什麼硬體上的魔法。

## 動手練習：寫一個最簡單的 Node.js 伺服器

接下來的練習會用 Node.js 寫一個名為 simple server 的陽春伺服器，監聽 3000 這個 port。practice 的程式碼如下：

```js
const http = require("http");
const fs = require('fs');
const PORT = 3000;

const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'content-type': 'text/html'});
    fs.createReadStream('index.html').pipe(res);
});
server.listen(PORT);
console.log(`Server started on port ${PORT}`);
```

步驟是先用 `vi` 建立一個叫做 `simple-server.js` 的檔案，把上面這段程式碼打進去。這段程式碼做的事情很單純：用 Node.js 內建的 `http` 模組建立一個伺服器，當有請求進來時，回傳 HTTP 狀態碼 200 與內容型別 `text/html`，並把 `index.html` 這個檔案的內容以串流（stream）的方式傳回給發出請求的一方。最後 `server.listen(PORT)` 讓伺服器開始在 3000 這個 port 監聽請求。

講師也提醒，這段程式碼裡的 `console.log` 其實不是必要的，只是用來在啟動時印出提示訊息，方便確認伺服器有沒有成功啟動。真正要讓伺服器跑起來，可能還需要先透過 Homebrew 安裝 Node.js，這部分會在後續步驟接著處理。

## 複習

### 伺服器最根本的定義是什麼？

一個能伺服請求、監聽輸入，並針對格式化請求做出回應的程式或電腦，不限定於網路傳來的輸入。

### 為什麼正式環境的伺服器可能會用跟家用電腦不同的晶片組？

原因包括虛擬化、效率、可靠性，以及需要能夠持續運作並維持高可用性。

### 伺服器跟一般電腦回應請求有什麼不同？

伺服器需要專用硬體，能夠 100% 隨時保持可用狀態，並使用專為持續運作與處理網路請求設計的晶片組。

## 小測驗

<details>
<summary>伺服器最主要的功能是什麼？</summary>
伺服內容、回應請求
</details>

<details>
<summary>為什麼正式伺服器可能會使用專用硬體？</summary>
為了支援虛擬化、提升效率、確保可靠性與持續運作
</details>

<details>
<summary>伺服器必須維持什麼樣的關鍵特性？</summary>
對其他裝置保持 100% 可用
</details>

<details>
<summary>就伺服器的定義而言，決定一台裝置是不是伺服器的關鍵是什麼？</summary>
它是否能針對格式化的請求做出回應
</details>

<details>
<summary>用個人筆電當伺服器可能會遇到什麼問題？</summary>
筆電闔上後伺服器就會跟著關閉、無法連線
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
