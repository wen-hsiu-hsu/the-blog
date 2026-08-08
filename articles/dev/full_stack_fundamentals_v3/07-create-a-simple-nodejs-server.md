---
title: '從零把 Node.js 伺服器跑起來：Homebrew、NVM 與最陽春的 HTML 檔案'
description: '跑通一個陽春 Node.js 伺服器要拼齊哪些環節：逐行拆解 http 與 fs 兩個內建模組、port 3000 的取捨、狀態碼與 stream 的角色，並實際安裝 Node.js、建立 index.html，把伺服器跑起來看見畫面。'
date: 2026-08-08
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 7
chapter: 'Server'
tags:
    - frontendMasters
    - fullStackFundamentals
    - NodeJs
    - Server
    - HTTP
    - FileSystem
    - Streams
    - Homebrew
    - NVM
---

# 從零把 Node.js 伺服器跑起來：Homebrew、NVM 與最陽春的 HTML 檔案

> [[06-servers|上一篇]]從概念上定義了「伺服器」，並寫出了一段陽春的 Node.js 伺服器程式碼。不過那段程式碼其實還跑不起來，因為缺了執行環境跟它要讀取的檔案。這一節就是把上一篇留下的程式碼逐行拆解，並補齊 Node.js 與 `index.html` 這兩塊缺口，讓伺服器真正動起來。

## 逐行拆解伺服器程式碼

延續上一篇寫好的 `simple-server.js`：

```js
const http = require('http');
const fs = require('fs');
const PORT = 3000;
```

第一行 `require('http')` 引入的是 Node.js 內建的 `http` 模組，負責處理請求（request）與回應（response），完全不需要額外 `npm install`。第二行引入的 `fs`（file system）模組同樣是內建的，用來存取檔案系統。之所以在這個練習裡需要 `fs`，是因為伺服器要讀取並回傳一個實際的 HTML 檔案；如果不想額外建立檔案，其實也可以直接把內容寫進回應本身，只是用讀檔案的方式在初學階段比較容易理解伺服器與檔案之間的關係。

`PORT` 設為 3000，是因為它是開發環境中普遍公認「沒人在用」的 port。常見的保留 port 包括：

- `22`：SSH
- `80`：HTTP
- `443`：HTTPS

這些 port 都已經被佔用，而 3000（或常見的 8000、8080）則是留給本機開發用的慣例選擇。實務上頂多遇到 port 衝突，不太可能真的把六萬多個 port 用完。

```js
const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.createReadStream('index.html').pipe(res);
});
```

`http.createServer()` 接收一個函式作為參數，每次有請求進來時，伺服器就會呼叫這個函式來處理。不論是 Node、Tomcat，還是 Python 的 Django/Flask、Ruby on Rails，任何伺服器框架都建立在同一組基本概念上：一個請求（`req`）與一個回應（`res`）。伺服器要做的事情，就是針對進來的請求，寫出對應的回應。

函式裡先用 `res.writeHead(200, { 'content-type': 'text/html' })` 寫入回應的 head 部分。`200` 是狀態碼，代表「一切正常」，是最常見的狀態碼；`content-type` 則是一個標頭（header），用來告訴瀏覽器「我現在送回去的是什麼類型的內容」。標頭本身不算回應主體（body），而是附加在回應上的中繼資料，例如登入狀態、cookie、狀態碼等都屬於這個範疇。明確指定 content type，是為了讓瀏覽器不需要自己猜測內容型別。

`fs.createReadStream('index.html').pipe(res)` 建立一個可讀的檔案串流，直接把 `index.html` 的內容「接」到回應上。用 stream 而不是先把整個檔案讀進記憶體再送出去，是因為 stream 從檔案開頭開始就邊讀邊送，不需要等整個檔案載入記憶體才能開始回應。檔案很小的情況下差異不大，但如果檔案很大（例如一個好幾十 MB 的檔案），stream 就能省下大量記憶體與等待時間。這也呼應了[[06-servers|上一篇]]提到的「監聽請求、給出回應」這個伺服器最核心的行為，stream 只是讓這個回應過程更有效率的一種實作方式。

```js
server.listen(PORT);
console.log(`Server started on port ${PORT}`);
```

`server.listen(PORT)` 讓伺服器實際開始在指定的 port 上監聽請求。額外加上的 `console.log` 印出提示訊息，是為了讓自己知道伺服器有沒有成功啟動，不是必要步驟，但少了它的話，伺服器成功啟動時看起來就只是一個沒有任何輸出的空進程。

## 安裝 Node.js：Homebrew 與 NVM

寫完程式碼後，要讓它真正執行，還需要先確認機器上有沒有裝 Node.js，可以用 `node -v` 檢查版本。只要版本不要太舊（太舊的版本可能不支援 stream），版本號本身不是重點。

### 用 Homebrew 安裝 Node.js

如果還沒有裝 Node.js，可以透過 Homebrew 安裝：`brew install node`。Homebrew 是 macOS 上的套件管理工具，概念上類似 Node 生態系裡的 npm，但用來安裝作業系統層級的軟體。雖然不是蘋果官方的工具，但已經是 macOS 上安裝軟體的實質標準做法。

### 用 NVM 管理多個 Node 版本

另一個常見選擇是 NVM（Node Version Manager），可以讓同一台機器上快速切換不同的 Node 版本，例如用 `nvm use 19` 切換到指定版本。不一定要用 NVM，也可以透過 Homebrew 安裝它（`brew install nvm`）。重點是先確保機器上有一份堪用的 Node.js 就好，版本管理本身是額外的方便工具，不是這個練習的重點。

## 建立最陽春的 index.html

伺服器程式碼裡讀取的 `index.html` 檔案還沒建立，這一步只需要建立一個內容為 `hello world` 的檔案：

```html
hello world
```

即使這完全不是合法的 HTML 格式（沒有 `<html>`、`<body>` 等標籤），瀏覽器依然會正常顯示出來。這是因為瀏覽器對 HTML 的解析非常寬容：遇到看不懂或格式不正確的標籤，瀏覽器通常會直接忽略，而不是報錯中斷。這種高度容錯的特性，加上 JavaScript 本身強調向下相容（2002 年寫的網頁到現在通常還能正常運作），是網路生態能夠長期累積、不同世代技術能互相搭配運作的重要原因之一。

## 把伺服器跑起來

準備好 Node.js 與 `index.html` 後，用 `node simple-server.js` 執行伺服器程式碼，接著在瀏覽器打開 `http://localhost:3000`，就能看到剛剛建立的 `index.html` 內容顯示出來。

`localhost` 指的就是自己的電腦本身，也可以直接輸入 `127.0.0.1` 得到相同的結果，因為 `localhost` 其實只是 `127.0.0.1` 這個保留 IP 的一個別名。這是一個所有電腦都有的迴圈（loopback）位址，作用是「檢查我自己機器上開啟的 port」。

除此之外還有其他常見的保留位址：

- `192.168.0.1`：通常對應到家用路由器或數據機
- `192.168.1.1`：同樣常見的路由器預設位址

## 複習

### 這個範例中匯入了哪兩個 Node.js 內建函式庫？

http 與 fs（file system）這兩個函式庫。

### 這個範例中伺服器使用的是哪個 port，為什麼選這個 port？

3000 這個 port，因為它是開發環境中普遍公認的未使用 port。

### 伺服器回應中使用的是什麼 HTTP 狀態碼，代表什麼意思？

狀態碼 200，代表一切正常、請求成功處理。

### 伺服器回應標頭中設定的 content type 是什麼？

text/html。

### Node.js 中用什麼方法有效率地回傳 HTML 檔案？

使用檔案系統的 `createReadStream()` 建立可讀串流，再把它 pipe 到回應上，這種做法比一次把整個檔案讀進記憶體更省記憶體、也更快。

## 小測驗

<details>
<summary>Node.js 中用什麼方法建立伺服器？</summary>
http.createServer()
</details>

<details>
<summary>這個範例中，講師為開發用的伺服器選了哪個 port？</summary>
3000
</details>

<details>
<summary>Node.js 中用來存取檔案系統的模組是什麼？</summary>
fs
</details>

<details>
<summary>哪一個 HTTP 狀態碼代表請求成功？</summary>
200
</details>

<details>
<summary>用什麼方法讓伺服器開始監聽指定的 port？</summary>
server.listen()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
