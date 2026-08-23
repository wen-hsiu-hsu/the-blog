---
title: '前端建立 WebSocket 連線：wss/ws 協定判斷、onmessage 接收訊息、部署到正式伺服器'
description: '在 index.html 補上前端的 WebSocket 連線程式碼，用 window.location.protocol 判斷該用 wss 還是 ws，串接 host 建立連線，用 onmessage 印出伺服器傳來的訊息，最後把成果部署到正式伺服器，用 pm2 換掉舊的伺服器並排查過程中遇到的錯誤。'
date: 2026-08-23
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 38
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - WebSocket
    - PM2
    - Onmessage
    - Protocol
    - Deployment
---

# 前端建立 WebSocket 連線：wss/ws 協定判斷、onmessage 接收訊息、部署到正式伺服器

> [[37-websockets-overview|前面]]已經讓 Nginx 放行 WebSocket 連線，也用 Express 建好了伺服器端。但伺服器端能處理 WebSocket，不代表瀏覽器裡的使用者就知道怎麼連上去，因為目前還沒有送任何資料告訴前端該怎麼建立這個連線。這一節要在 `index.html` 補上前端的 WebSocket 連線程式碼，並把整個成果部署到正式伺服器上驗證。

## 為什麼還需要在前端寫程式碼

伺服器端設定完 Nginx 與 Express 之後，WebSocket 連線本身的基礎設施已經就緒，但瀏覽器並不會自動知道要跟哪個位址、用什麼協定建立 WebSocket 連線。這件事必須寫在 `index.html` 裡的 `<script>` 標籤中，讓瀏覽器載入頁面時主動發起連線。

## 判斷 WebSocket 協定：ws 還是 wss

WebSocket 連線跑在 HTTP 上時用 `ws://`，跑在 HTTPS 上則要用 `wss://`（WebSocket Secure）。因為同一份程式碼要能同時在兩種情況下運作，這裡用 `window.location.protocol` 動態判斷目前頁面是用 HTTP 還是 HTTPS，再決定要用哪個協定：

```javascript
let ws = null;
const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
```

`window.location.protocol` 會回傳目前頁面的協定字串，如果是 `https:` 就選用 `wss`，否則就用一般的 `ws`。這樣寫的好處是不論網站之後是跑在 80 埠（HTTP）還是 443 埠（HTTPS），同一段程式碼都能正確判斷。

## 建立 WebSocket 連線並接收訊息

判斷好協定後，接下來用瀏覽器內建的 `WebSocket` 物件建立連線，連線的位址就是目前頁面的 host（也就是網域名稱）：

```javascript
ws = new WebSocket(`${proto}://${window.location.host}`);

ws.onmessage = function (event) {
    console.log(event.data);
};
```

`new WebSocket()` 只需要一個字串參數，組合 `proto`（協定）與 `window.location.host`（目前的網域），就能連到跟目前頁面同一個網域的 WebSocket 伺服器，不需要另外指定 IP 或埠號。連線建立後，光是能傳送訊息還不夠，如果沒有處理接收端，瀏覽器就會直接把伺服器傳來的資料丟掉。這裡用 `onmessage` 這個事件處理器接住每一筆從伺服器傳來的訊息，透過 `event.data` 取得實際內容，並用 `console.log` 印出來確認連線是否正常運作。`onmessage` 只是簡寫，效果等同於 `ws.addEventListener('message', ...)`。

這個範例只是把收到的訊息印在 console 裡，用來驗證連線是否成功；實務上收到訊息後也可以直接觸發頁面更新、重新渲染畫面等動作，不一定要讓使用者直接看到這些資料。

## 部署到正式伺服器

程式碼在本機測試沒問題後，要 push 到 Git 讓正式伺服器上的自動化腳本拉取更新。推送前先建立 `.gitignore`，排除不需要進版本控制的 `node_modules`：

```bash
git add .
git commit -am "Created a WebSocket server and clients"
git push
```

伺服器上原本就有[[32-cron-for-ci|排程]]會定期自動 pull 最新的程式碼，所以推送完不用手動登入伺服器拉取，過一兩分鐘程式碼就會自動同步過去。

拉到新程式碼之後，伺服器上目前運作的還是舊版沒有 WebSocket 的簡易伺服器，需要用[[24-virtual-server-and-pm2|前面用過]]的 PM2 換成新的 `index-ws.js`：

```bash
pm2 stop app.js
pm2 start index-ws.js --watch
pm2 save
```

- **`pm2 stop app.js`**：先停掉原本那支手寫的簡易伺服器
- **`pm2 start index-ws.js --watch`**：改用新的 Express 伺服器啟動，並加上 `--watch`，這樣之後只要程式碼有更新，PM2 會自動偵測檔案變動並重新啟動
- **`pm2 save`**：把目前的行程清單存起來，讓伺服器重開機時這個行程也會一併自動回復

## 排查部署過程的常見錯誤

換版之後，如果瀏覽器出現 Bad Gateway，通常代表 Express 伺服器沒有正常啟動起來，需要用 `pm2 status` 檢查該行程是否處於錯誤狀態。常見的原因是拉取新程式碼後忘記重新執行 `npm install`，導致伺服器缺少 `express` 套件而啟動失敗。為了避免每次都手動處理這個問題，可以直接把 `npm install` 加進伺服器上拉取程式碼的自動化腳本裡，讓它在每次 pull 完之後自動安裝相依套件，之後就不會再遇到同樣的錯誤。

修好相依套件的問題、PM2 偵測到檔案異動自動重啟服務之後，再重新整理網頁，就能在瀏覽器主控台看到伺服器傳來的訊息，確認整條 WebSocket 連線從前端、Nginx 到 Express 伺服器都串接成功。多開幾個分頁或請別人同時連上同一個網域，也能在訊息裡看到目前連線人數即時增加，這正是 WebSocket 即時、雙向的特性，伺服器可以主動推送資料給所有連線中的客戶端，不需要客戶端重新整理頁面或發起新的請求。

## 複習

### 要讓前端的 WebSocket 連線同時支援 HTTP 與 HTTPS，該怎麼判斷要用的協定？

檢查 `window.location.protocol`，如果值是 `https:`，就使用 `wss://`（WebSocket Secure）；否則使用一般的 `ws://`。接著用 `new WebSocket(protocol + '://' + window.location.host)` 建立連線，這樣同一段程式碼就能同時適用於 HTTP 與 HTTPS 網站。

### 要接收 WebSocket 傳來的訊息，該用什麼方法處理？

使用 `onmessage` 事件處理器，它會接收一個 `event` 參數，透過 `event.data` 取得伺服器傳來的實際內容，通常會用 `console.log(event.data)` 把收到的訊息印出來確認連線是否正常。

### WebSocket 主要有哪兩種協定，分別在什麼情況下使用？

`ws://` 用於一般 HTTP 連線，通常跑在 80 埠；`wss://`（WebSocket Secure）則用於 HTTPS 連線，通常跑在 443 埠。

### 在瀏覽器裡怎麼動態判斷該用哪一種 WebSocket 協定？

透過 `window.location.protocol` 檢查目前頁面是 HTTP 還是 HTTPS，再依結果選擇使用 `ws://` 或 `wss://`。

### 在瀏覽器建立 WebSocket 連線的關鍵步驟有哪些？

依序是：判斷要用的協定（`ws://` 或 `wss://`）、建立一個新的 `WebSocket` 物件、指定要連線的 host，以及設定 `onmessage` 事件處理器來處理接收到的訊息。

## 小測驗

<details>
<summary>在 JavaScript 裡要怎麼取得目前網站使用的協定？</summary>
使用 window.location.protocol
</details>

<details>
<summary>WebSocket 連線中，用來處理接收到的訊息的方法是什麼？</summary>
onmessage 事件處理器
</details>

<details>
<summary>在 JavaScript 中建立 WebSocket 連線的正確語法是什麼？</summary>
new WebSocket(url)
</details>

<details>
<summary>相較於傳統的 HTTP 連線，WebSocket 有什麼優勢？</summary>
即時、雙向的通訊，不需要重新整理頁面
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
