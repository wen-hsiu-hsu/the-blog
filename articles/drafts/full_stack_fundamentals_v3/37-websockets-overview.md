---
title: 'WebSocket 與 HTTP 連線方式的差異、Nginx 加 Upgrade 標頭、建立 Express 伺服器'
description: 'WebSocket 跟 HTTP 在連線方式上的根本差異：一個是持久雙向連線，一個請求完就立刻關閉，示範在 Nginx 虛擬伺服器設定裡加上 Upgrade 與 Connection 標頭讓反向代理放行升級請求，並改用 Express 重新建立伺服器架構，為後續實作 WebSocket 連線做好準備。'
date: 2026-08-23
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 37
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - WebSocket
    - Nginx
    - Express
    - ProxyPass
    - UpgradeHeader
    - PersistentConnection
---

# WebSocket 與 HTTP 連線方式的差異、Nginx 加 Upgrade 標頭、建立 Express 伺服器

> 前面幾節分別處理過子網域、[[35-nginx-redirection-and-gzip|路徑重導向與 Gzip 壓縮]]，都還是在 Nginx 這一層打轉。這一節開始進入新章節，要動手寫程式碼實作 WebSocket，先從 WebSocket 跟 HTTP 的差異，以及讓 Nginx 放行 WebSocket 連線的設定開始。

## WebSocket 跟 HTTP 的差異

WebSocket 是一種即時通訊協定，在客戶端與伺服器之間建立一個持久、雙向的連線。HTTP 連線則是單向的，請求一完成就立刻關閉。WebSocket 連線建立後會持續保持開啟狀態，讓客戶端與伺服器可以隨時互相傳送資料，不必每次都重新發起請求。

WebSocket 底層其實還是跑在 HTTP 之上，只是在連線建立時多做了一次「升級」，把原本一次性的 HTTP 請求升級成持久的雙向連線。也因為這個升級的動作，Nginx 反向代理才需要額外設定去告知它這是一個 WebSocket 連線，而不是一般的 HTTP 請求。

## 修改 Nginx 設定放行 WebSocket 連線

延續[[24-virtual-server-and-pm2|前面]]寫過的預設虛擬伺服器設定，這裡要在 `location` 區塊裡加兩行 `proxy_set_header` 指令：

```bash
sudo vi /etc/nginx/sites-enabled/fsfe
```

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection upgrade;
}
```

- **`proxy_set_header Upgrade $http_upgrade`**：代理連線時附加一個 `Upgrade` 標頭，告知後端這是一個要升級連線類型的請求
- **`proxy_set_header Connection upgrade`**：針對連線本身（而不只是單一 HTTP 請求）也設定成升級狀態，這樣 Node.js 那端才知道要把這個連線當成 WebSocket 處理

改完後一樣要驗證設定並重新啟動 Nginx：

```bash
sudo nginx -t
sudo service nginx restart
```

這兩行只是讓 Nginx 有能力把 WebSocket 連線正確代理過去，伺服器本身還沒有任何處理 WebSocket 的邏輯，接下來要建立一個新的 Node.js 伺服器來實際處理這個連線。

## 改用 Express 建立新的伺服器

[[07-create-a-simple-nodejs-server|前面]]寫過一個沒有任何額外套件、純手寫的 Node.js 伺服器。這一節開始改用 Express，因為接下來要處理的邏輯比純手寫伺服器複雜一些，Express 能讓串接 WebSocket 的過程更輕鬆。Express 是目前最普遍使用的 Node.js 伺服器框架，文件齊全、歷史悠久，學起來遇到問題也比較容易在網路上找到現成解法。

先切換回本機，把之前建立的專案 clone 下來，在專案目錄下新增一個檔案 `index-ws.js`：

```javascript
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.on('request', app);

server.listen(3000, () => {
    console.log('Server started on port 3000');
});
```

逐行拆解這段程式碼：

- `require('express')` 載入 Express，`require('http')` 載入 Node.js 內建的 http 模組
- `express()` 建立 Express 應用程式實體，`http.createServer(app)` 建立底層的 HTTP 伺服器
- `app.get('/', ...)` 註冊一個處理根目錄請求的路由，收到請求時用 `res.sendFile()` 回傳一個靜態的 `index.html` 檔案；`__dirname` 是 Node.js 內建變數，代表目前檔案所在的目錄路徑，用來組出檔案的完整路徑
- `server.on('request', app)` 把 Express 應用程式接上底層的 HTTP 伺服器，讓所有進來的請求都交給 Express 處理
- `server.listen(3000, ...)` 讓伺服器開始監聽 3000 埠，並在啟動成功時印出訊息

因為 `res.sendFile()` 需要一個實際存在的檔案，這裡也順手建立一個簡單的 `index.html`：

```html
<!DOCTYPE html>
<html>
    <body>
        WebSocket example
    </body>
</html>
```

啟動伺服器前記得先安裝 Express，這是常見的漏裝套件錯誤：

```bash
npm install express
node index-ws.js
```

安裝完成後執行 `node index-ws.js`，打開瀏覽器連到 `localhost:3000`，就能看到剛剛建立的 `index.html` 內容。到這裡伺服器本身還沒有處理任何 WebSocket 邏輯，只是把 Nginx 設定跟 Express 伺服器的基礎架起來，為下一節實際建立 WebSocket 連線做準備。

## 複習

### HTTP 與 WebSocket 在連線方式上的關鍵差異是什麼？

HTTP 連線是單向的，請求一結束就立刻關閉；WebSocket 則會在客戶端與伺服器之間維持一個持久、雙向的連線，讓兩端可以隨時互相傳送資料。

### 要讓 Nginx 支援 WebSocket 連線，需要在設定裡加上哪兩個標頭？

`proxy_set_header Upgrade $http_upgrade`，告知 Nginx 要把 `Upgrade` 標頭加到代理請求裡；以及 `proxy_set_header Connection upgrade`，把連線本身也設定成升級狀態，表示這是一個 WebSocket 升級請求。

### 用 Express 建立一個基本的 Node.js 伺服器時，會用到哪些關鍵方法？

包含 `require('express')` 載入 Express、`require('http')` 搭配 `http.createServer()` 建立底層 HTTP 伺服器、用 `express()` 建立應用程式實體、用 `.get()` 設定路由、用 `sendFile()` 搭配 `__dirname` 回傳靜態 HTML 檔案、用 `server.on('request')` 把 Express 接上 HTTP 伺服器，以及用 `.listen()` 讓伺服器開始監聽指定的埠。

### 什麼是 WebSocket？

WebSocket 是一種即時通訊協定，能在客戶端與伺服器之間建立持久、雙向的連線。跟請求一結束就立刻關閉的 HTTP 不同，WebSocket 連線會持續保持開啟，讓資料可以在兩端之間持續雙向交換。

### WebSocket 跟 HTTP 連線相比有什麼不同？

WebSocket 會在客戶端與伺服器之間維持一個持久雙向的連線，而 HTTP 連線一旦請求完成就會立刻關閉。這種持久連線的特性讓客戶端與伺服器之間能夠即時通訊。

## 小測驗

<details>
<summary>Nginx 設定裡，用來設定 WebSocket 連線 Upgrade 標頭的是哪個指令？</summary>
proxy_set_header Upgrade $http_upgrade
</details>

<details>
<summary>為什麼建立 WebSocket 伺服器時選擇使用 Express？</summary>
因為 Express 能讓實作 WebSocket 的過程更輕鬆
</details>

<details>
<summary>範例中的 WebSocket 伺服器預設監聽哪個連接埠？</summary>
3000
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
