---
title: '寫出 Nginx 虛擬伺服器設定檔，用 nginx -t 驗證，並用 PM2 讓 Node 應用程式永遠活著'
description: '實際寫出 Nginx 虛擬伺服器區塊，設定 listen 80、proxy_pass 轉給 3000 埠的 Node 應用程式，用 nginx -t 驗證設定、移除預設站台避免衝突，接著別忘了實際啟動 Node 伺服器，最後裝 PM2 讓應用程式在關閉終端機、伺服器重開機後依然自動存活，並設定當機自動重啟。'
date: 2026-08-16
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 24
chapter: 'Application Setup'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Nginx
    - VirtualServer
    - ProxyPass
    - PM2
    - ProcessManager
    - NodeJs
---

# 寫出 Nginx 虛擬伺服器設定檔，用 nginx -t 驗證，並用 PM2 讓 Node 應用程式永遠活著

> [[23-setup-proxy-pass|上一篇]]裝好 Node.js、寫好最陽春的伺服器，也在 `sites-enabled` 底下新開了一個空白設定檔準備寫虛擬伺服器區塊，但逐字稿在真正寫進內容之前就停住了。這一節就接著把這個虛擬伺服器區塊實際寫完，用 `proxy_pass` 把 Nginx 跟 Node.js 真正串起來，最後再用 PM2 讓應用程式能夠長期穩定運作。

## 什麼是虛擬伺服器

虛擬伺服器（virtual server，也叫 virtual host）對 Nginx 而言是一台「假的」伺服器：可以在同一台實體伺服器上建立任意數量的虛擬伺服器，而這台實體伺服器本身，其實也只是[[09-buying-a-vps|買下的那台 VPS]]上執行的一個服務而已，一層疊著一層。

## 寫出虛擬伺服器設定區塊

延續[[23-setup-proxy-pass|上一篇]]開好的設定檔，虛擬伺服器區塊用 `server` 這個關鍵字開頭。設定內容大致包含：

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www;
    index index.html;

    server_name jemstack.lol;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

逐項拆解這幾行設定：

- **`listen 80 default_server`**：監聽 80 埠（HTTP 的預設埠），並指定這是預設伺服器，代表所有進來的請求預設都會導向這個虛擬伺服器
- **`listen [::]:80 default_server`**：同樣監聽 80 埠，但這行對應的是 IPv6，確保 Nginx 也能正確處理透過 IPv6 進來的請求
- **`root` 與 `index`**：指定備援用的根目錄與預設首頁檔案，這裡雖然不是必要設定，但多加一層備援總是比較保險，一旦後面的代理設定出狀況，還有個保底頁面可以顯示
- **`server_name`**：這個欄位在有多個子網域、需要依網域名稱做不同路由時才會真正發揮作用；因為這裡設定的是預設伺服器，所有請求本來就會導向這裡，`server_name` 暫時不影響實際行為，可以留空，也可以直接填上自己的網域名稱
- **`location` 區塊搭配 `proxy_pass`**：這是這個設定檔真正的核心。`location /` 代表對應根路徑底下的所有請求，`proxy_pass http://127.0.0.1:3000` 則是把符合這個路徑的請求，全部轉送到本機 3000 埠，也就是[[23-setup-proxy-pass|上一篇]]寫的 Node.js 伺服器監聽的埠。設定好這一行，Nginx 就不再是單純的網頁伺服器，而是搖身一變成為代理伺服器（proxy），專門負責把請求轉送到正確的地方

## 驗證設定，並移除預設站台避免衝突

寫完設定檔後，先不要急著重啟 Nginx，可以先用 `nginx -t` 驗證設定內容有沒有問題：

```bash
sudo nginx -t
```

`nginx -t` 會把所有設定檔完整檢查一遍，在真正重啟 Nginx、可能搞砸現有服務之前先抓出問題。這個指令通常需要加上 `sudo`，因為它需要存取 `/var/log` 底下的紀錄檔案，一般使用者沒有權限讀取。

還有一件事容易被忽略：雖然在 `sites-enabled` 底下新增了設定檔，但 Nginx 本身的主設定檔（`/etc/nginx/nginx.conf`）裡，可能還連結著原本的預設站台，這時候需要進去把預設站台的連結移除，只保留剛剛新增的這個虛擬伺服器設定。這不是必要步驟，但可以避免預設站台與新設定互相干擾，之後遇到問題時也比較容易釐清是哪個設定在起作用。移除完成後，記得再跑一次 `nginx -t` 確認沒有問題。

驗證通過後，就可以重新載入 Nginx 讓新設定生效：

```bash
sudo service nginx reload
```

## 別忘了實際啟動 Node 伺服器

即使 Nginx 端的設定都正確無誤，這時候連到網域可能還是看不到預期的內容，因為忘記了最基本的一步：根本還沒啟動 Node.js 伺服器。前面只是寫好了 `app.js`，並沒有真的執行它。這種「步驟寫完了但忘記真正跑起來」的情況很容易發生，尤其是中間穿插了太多其他設定步驟的時候。回到伺服器上手動啟動一次：

```bash
node app.js
```

伺服器啟動後，回到瀏覽器重新整理，這時候網域終於能正確顯示 Node.js 應用程式回傳的內容。到這一步，等於是完全靠自己一步一步從零打造出一整套環境：買網域、接上伺服器、手寫 Nginx 設定、串接 Node.js 應用程式，沒有依賴任何一鍵部署的工具。接下來要做的事情，就會更接近前端工程師平常熟悉的領域，例如用 npm 安裝 Express、React 之類的套件，在這套基礎之上繼續搭建更完整的應用程式。

## 為什麼還需要 PM2

雖然 `node app.js` 這樣就能讓伺服器動起來，但這種做法有個明顯的問題：這個程序完全綁定在目前這個終端機連線上，只要關閉筆電、中斷這個 SSH 連線階段，這個 shell 就會跟著結束，Node.js 伺服器也會跟著一起停止運作。

為了讓應用程式即使在終端機關閉之後依然持續運行，需要一個程序管理工具，也就是 PM2。先全域安裝：

```bash
sudo npm i -g pm2
```

安裝完成後，先把手動啟動的那個 Node.js 程序關掉，改用 PM2 來啟動應用程式：

```bash
pm2 start app.js --watch
```

`--watch` 這個參數可以讓 PM2 在偵測到檔案變動時自動重新啟動應用程式，方便開發階段使用。啟動後可以用 `pm2 list` 查看目前由 PM2 管理的所有程序狀態，這時候即使關閉目前的終端機連線，這個 Node.js 程序依然會持續在背景運作，因為它已經交給 PM2 這個獨立的程序管理工具接管，而不再依附在原本那個終端機階段上。

## 讓 PM2 在伺服器重開機後自動接管

光是讓 PM2 目前接管程序還不夠：萬一伺服器重新開機，PM2 本身也需要重新啟動，並且記得要重新啟動哪些應用程式。PM2 提供了方便的指令來處理這個情境：

```bash
pm2 save
pm2 startup
```

`pm2 save` 會把目前的程序清單與設定儲存下來；`pm2 startup` 則會產生一段指令，內容是把 PM2 加進系統開機自動啟動的清單裡，把這段指令複製貼上執行即可。設定完成後，即使伺服器重新開機，PM2 也會自動啟動，並依照儲存下來的清單把 Node.js 應用程式重新啟動，不需要每次都手動介入。

## PM2 的自動重啟機制與潛在風險

PM2 另一個重要特性，是能在應用程式當機時自動把它重新拉起來，不需要人工介入。不過這個特性也帶著一個潛在風險：如果伺服器背後其實不斷發生錯誤、反覆當機重啟，PM2 的自動重啟機制可能會悄悄掩蓋這個問題，因為使用者不會直接感受到服務中斷。因此使用 PM2 時，最好還是搭配查看日誌紀錄，或是設定發生重啟時的通知機制（例如寄送 email），才能真正掌握伺服器背後是否正常運作，而不是誤以為「應用程式一直沒中斷」就代表一切穩定。

## 複習

### 使用 Nginx 作為代理伺服器的目的是什麼？

Nginx 可以作為集中的路由器，有效率地處理與導向請求，管理多台伺服器、實現負載平衡，比起在 Node.js 裡自行處理 SSL、壓縮、HTTP/2 等設定要容易得多，而且處理請求的速度與效率都遠勝 Node.js。

### 重啟服務前，用什麼指令驗證 Nginx 的設定內容？

`nginx -t`（通常需要搭配 `sudo`）。

### PM2 是什麼，它的主要功能有哪些？

PM2 是一套程序管理工具，可以讓 Node.js 應用程式持續在背景運作，在應用程式當機時自動重新啟動，並能儲存目前的程序設定，確保伺服器重新開機後應用程式也會自動啟動。

### 要讓應用程式在伺服器開機時自動啟動，PM2 該怎麼設定？

先執行 `pm2 save` 儲存目前的程序清單，再執行 `pm2 startup`，這個指令會產生一段系統指令，複製並執行後就能把 PM2 加進系統開機啟動清單。

## 小測驗

<details>
<summary>重啟服務前，用什麼指令驗證 Nginx 的設定內容？</summary>
nginx -t
</details>

<details>
<summary>在這個設定中，用 proxy_pass 把請求轉送給執行在 3000 埠的 Node.js 應用程式時，Nginx 主要扮演什麼角色？</summary>
反向代理
</details>

<details>
<summary>用什麼指令可以儲存目前的 PM2 程序設定？</summary>
pm2 save
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
