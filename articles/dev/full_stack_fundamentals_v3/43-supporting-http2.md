---
title: '在 Nginx 開啟 HTTP/2：一個關鍵字換來 Multiplexing，用 Network 面板驗證協定'
description: '解釋 HTTP/1.1 每個檔案獨立開連線、HTTP/2 用 multiplexing 共用單一連線的差異，示範在 Nginx 的 443 埠 listen 區塊加上 http2 關鍵字即可啟用，並用瀏覽器 Network 面板的 Protocol 欄位驗證連線從 h1 換成 h2，附上重啟前的驗證指令。'
date: 2026-08-26
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 43
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - HTTP2
    - Nginx
    - Multiplexing
    - NetworkInspector
---

# 在 Nginx 開啟 HTTP/2：一個關鍵字換來 Multiplexing，用 Network 面板驗證協定

> [[42-implementing-https-with-certbot|前面]]用 Certbot 幫網站裝上 HTTPS 之後，這一節要做的事情非常小：升級到 HTTP/2。因為前面已經走在 Ubuntu 加 Nginx 這條標準路線上，這一步只需要改一個關鍵字就能完成，是這門課裡最簡單的一次修改。

## HTTP/1.1 與 HTTP/2 的差異

HTTP/1.1 是目前網路上最普遍使用的版本，運作方式是每個檔案都各自建立一條獨立連線：瀏覽器要拿 `app.js` 就開一次請求與回應，要拿 `index.html` 又另外開一次，每個檔案都是獨立的一來一往。

HTTP/2 則引入了 multiplexing（多工），讓多個檔案的請求與回應可以共用同一條連線，不需要為每個檔案重新建立連線。這讓 HTTP/2 在很多情境下比 HTTP/1.1 快上不少，但也不是沒有代價：因為要處理多工的邏輯，HTTP/2 需要消耗更多 CPU 資源，所以並不是所有情境都適合直接切換過去。不過對於這裡的簡單網站來說，直接啟用是合理的選擇。

## 在 Nginx 開啟 HTTP/2

啟用方式非常單純，只要在 443 埠的 `listen` 區塊裡加上 `http2` 這個關鍵字：

```bash
sudo vi /etc/nginx/sites-enabled/fsfe
```

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

改完之後，跟每次修改 Nginx 設定一樣，要先驗證語法再重新啟動服務：

```bash
sudo nginx -t
sudo service nginx restart
```

## 用 Network 面板驗證連線協定

啟用前，可以先打開瀏覽器開發者工具的 Network 面板，如果沒有看到 Protocol 這一欄，右鍵點欄位標題把它加進來，就能看到目前每個連線實際使用的協定。切換前會看到 `http/1.1` 的連線，以及[[38-creating-a-websocket-connection|前面建立]]的那條 WebSocket 連線；[[41-https-overview|前面提過]]狀態碼 `101` 代表的就是這種「升級」請求，這裡對應到的正是 WebSocket 從 HTTP 升級成持久連線的那個過程，schema 顯示的是 `https`，WebSocket 則顯示 `wss`（也就是加密過的 WebSocket 連線）。

改完設定重新整理網站後，Protocol 欄位就會顯示成 `h2`，代表現在使用的是 HTTP/2，多個請求已經共用同一條多工連線，不再是一堆各自獨立的 HTTP/1 連線。

## 複習

### HTTP/1.1 與 HTTP/2 在連線處理上的關鍵差異是什麼？

HTTP/1.1 會替每個檔案請求建立一條獨立連線，而 HTTP/2 使用 multiplexing（多工），讓多個請求與回應可以共用同一條連線，效率更高。

### 要在 Nginx 開啟 HTTP/2，需要做什麼設定變更？

在 Nginx 設定檔（例如 `/etc/nginx/sites-enabled/[站台設定檔]`）裡，443 埠的 `listen` 區塊加上 `http2` 這個關鍵字即可。

### 相較於 HTTP/1.1，HTTP/2 有什麼潛在的缺點？

因為要處理多工連線的複雜度，HTTP/2 可能需要消耗更多 CPU 資源，所以不一定是每種情境下的最佳選擇。

### 要怎麼確認目前連線用的是哪個協定？

用瀏覽器開發者工具的 Network 面板，加上 Protocol 欄位，就能看到每個連線實際使用的協定（例如 `http/1`、`h2`）。

### 修改完 Nginx 設定之後，應該執行什麼指令來確保設定正確？

執行 `sudo nginx -t` 驗證設定語法是否正確，沒有問題再重新啟動服務讓設定生效。

## 小測驗

<details>
<summary>HTTP/1.1 與 HTTP/2 最主要的差異是什麼？</summary>
HTTP/2 使用 multiplexing，能讓多個請求共用同一條連線
</details>

<details>
<summary>要在 Nginx 開啟 HTTP/2 需要做什麼設定變更？</summary>
在 listen 區塊加上 http2 這個關鍵字
</details>

<details>
<summary>相較於 HTTP/1.1，HTTP/2 有什麼潛在缺點？</summary>
因為多工連線的處理，可能需要消耗更多 CPU 資源
</details>

<details>
<summary>要用視覺化方式確認瀏覽器連到某個網站時使用的 HTTP 協定版本，最簡單的方法是什麼？</summary>
使用瀏覽器 Network 面板裡的 Protocol 欄位
</details>

<details>
<summary>依照最佳實務，修改完 Nginx 設定之後應該依序執行哪兩個指令？</summary>
先執行 sudo nginx -t 驗證設定，再執行 sudo service nginx restart 讓變更生效
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
