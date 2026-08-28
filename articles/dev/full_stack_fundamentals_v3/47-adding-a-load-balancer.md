---
title: '實作 Nginx 負載平衡：upstream 放在 nginx.conf、自訂 log format 驗證流量分配'
description: '實際把前面講的 upstream 概念寫進 nginx.conf，列出兩台後端伺服器、把 proxy_pass 改指向伺服器叢集，並額外加一段自訂 log format，用 tail -f 即時觀察 access.log，驗證請求確實輪流分配到不同埠號的伺服器實例上，親眼看到負載平衡實際運作。'
date: 2026-08-28
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 47
chapter: 'Containers'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Nginx
    - LoadBalancing
    - Upstream
    - AccessLog
    - LogFormat
    - ProxyPass
---

# 實作 Nginx 負載平衡：upstream 放在 nginx.conf、自訂 log format 驗證流量分配

> [[46-orchestration-and-load-balancing|前面]]講完 `upstream` 的概念跟排程演算法的取捨，這一節要實際把它寫進設定檔，讓 Nginx 真的在兩個伺服器實例之間分配流量，並用一段自訂的紀錄格式親眼確認流量真的有被分散出去。

## upstream 要寫在 nginx.conf，不是虛擬伺服器設定檔

一開始很容易誤把 `upstream` 寫進個別網站的虛擬伺服器設定檔（例如 `/etc/nginx/sites-enabled/fsfe`），但 `upstream` 屬於整個 Nginx 的層級，應該寫在主設定檔 `nginx.conf` 裡的 `http` 區塊：

```bash
sudo vi /etc/nginx/nginx.conf
```

```nginx
http {
    upstream nodebackend {
        server localhost:3000;
        server localhost:3001;
    }

    # ...原本的其他設定...
}
```

`upstream` 後面接一個自訂名稱（這裡叫 `nodebackend`），刻意不直接叫 `backend`，是為了在未來如果有其他語言或服務加入時，名稱還能清楚區分這是 Node.js 這一組後端伺服器。裡面列出的兩個 `server` 對應到[[45-creating-a-docker-container|前面]]用不同埠號跑起來的兩個容器實例。

## 把 proxy_pass 指向伺服器叢集

定義好 `upstream` 之後，回到虛擬伺服器設定檔，把原本直接指向單一埠號的 `proxy_pass`，改成指向這個叢集名稱：

```bash
sudo vi /etc/nginx/sites-enabled/fsfe
```

```nginx
location / {
    proxy_pass http://nodebackend;
}
```

不再寫死某個特定埠號，而是交給 Nginx 自己決定要把請求轉給叢集裡的哪一台伺服器。跟每次修改 Nginx 設定一樣，改完要先驗證再重啟：

```bash
sudo nginx -t
sudo service nginx restart
```

如果設定沒有錯誤，網站應該會照常運作，感覺不出任何變化，因為負載平衡本來就是在背後默默運作的機制。

## 加一段自訂紀錄格式，親眼驗證流量分配

光是設定完成，沒辦法直觀地確認流量真的有分散到不同伺服器上。這一步是額外的驗證，不是必要步驟，但能清楚看到 Nginx 實際上在做什麼。做法是在 `nginx.conf` 裡加一段自訂的 `log_format`，紀錄每個請求實際被轉發到哪個上游伺服器：

```nginx
http {
    log_format upstreamlog '$remote_addr - $upstream_addr [$time_local] '
                            '"$request" $status $body_bytes_sent';

    # ...
}
```

接著在虛擬伺服器設定檔裡指定 `access_log` 使用這個格式：

```nginx
access_log /var/log/nginx/access.log upstreamlog;
```

`access_log` 沿用原本預設存放紀錄檔的路徑 `/var/log/nginx/access.log`，只是額外指定要用剛剛定義的 `upstreamlog` 格式輸出，裡面關鍵的欄位是 `$upstream_addr`，會直接記下這個請求最後被轉發到叢集裡的哪一台伺服器。存檔後一樣要驗證並重啟 Nginx。

## 用 tail -f 即時觀察流量分配

改完設定後，用 `tail -f` 即時盯著紀錄檔：

```bash
sudo tail -f /var/log/nginx/access.log
```

`-f` 讓 `tail` 持續追蹤檔案的新內容，只要有新的一行寫入，就會立刻顯示出來，不需要重複手動執行指令。接著重新整理網站幾次，就能在終端機裡看到每次請求分別被導向 `localhost:3000` 或 `localhost:3001`，如果叢集裡有更多伺服器，這裡也會看到請求依序被分配到各台伺服器上。

到這裡，整個負載平衡的迴路就完整了：現在可以視需要建立任意數量的伺服器實例，只要把它們加進 `upstream` 的清單裡，Nginx 就會自動把流量分配過去，不需要再手動決定該把哪個請求送到哪一台伺服器。

## 複習

### 建立 Nginx upstream 區塊的目的是什麼？

用來在多台後端伺服器之間設定負載平衡，讓 Nginx 可以把流量分散到跑在不同埠號上的多個伺服器實例。

### 重新啟動服務前，用來測試 Nginx 設定的指令是什麼？

`sudo nginx -t`。

### 在 Nginx 的 upstream 區塊裡，每個後端伺服器需要提供哪些資訊？

每個伺服器都需要一行 `server` 指令，指定該應用程式實例所在的主機（或 `localhost`）與埠號，例如 `server localhost:3000;` 與 `server localhost:3001;`。

### 要怎麼驗證 Nginx 的負載平衡是否正常運作？

可以加上一段自訂的紀錄格式，追蹤每個請求實際使用了哪個埠號的伺服器，再用像 `sudo tail -f /var/log/nginx/access.log` 這樣的指令即時監看紀錄檔。

### 修改完設定後，用來重新啟動 Nginx 服務的指令是什麼？

`sudo service nginx restart`。

## 小測驗

<details>
<summary>當 Nginx 定義了 upstream 設定時，預設使用的負載平衡方式是什麼？</summary>
在設定的伺服器之間依序輪詢（round-robin）分配
</details>

<details>
<summary>重新啟動服務前，用來測試 Nginx 設定的指令是什麼？</summary>
sudo nginx -t
</details>

<details>
<summary>Nginx 的 access log 預設存放在哪裡？</summary>
/var/log/nginx/access.log
</details>

<details>
<summary>在 Nginx 中建立自訂 log format 的目的是什麼？</summary>
用來追蹤並分析更詳細的請求資訊
</details>

<details>
<summary>upstream 的後端設定應該定義在哪裡？</summary>
nginx.conf 裡的 http 區塊中
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
