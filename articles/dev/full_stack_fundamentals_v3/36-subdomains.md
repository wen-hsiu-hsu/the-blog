---
title: '建立子網域：新增 A 記錄、寫 Nginx 虛擬伺服器區塊指定 server_name，串接不同應用程式'
description: '示範子網域的實際用途（例如 Netflix 開發環境不會直接架在正式網域上），幫網域新增 blog 子網域的 A 記錄，寫一個新的 Nginx 虛擬伺服器區塊指定 server_name 與 proxy_pass，更新 nginx.conf 的 include 設定，讓同一網域串接多個獨立應用程式。'
date: 2026-08-22
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 36
chapter: 'Continuous Integration & Deployment'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Subdomain
    - Nginx
    - ARecord
    - ServerName
    - NginxConf
    - VirtualServer
    - ProxyPass
---

# 建立子網域：新增 A 記錄、寫 Nginx 虛擬伺服器區塊指定 server_name，串接不同應用程式

> [[24-virtual-server-and-pm2|前面]]寫過的 Nginx 虛擬伺服器區塊，處理的一直是主網域本身的請求。這一節要示範子網域（subdomain）的用途與設定方式：新增一個 `blog` 子網域，讓它可以獨立指向另一個完全不同的應用程式。

## 子網域的實際用途

子網域是主網域底下的一個子集合，好處是不必為了區分不同用途而另外註冊一整個新網域。以 Netflix 為例，實際開發時並不會直接在 netflix.com 上進行，而是使用像 `dev.netflix.com` 這樣的開發環境網域，這個網域當然不對外公開。使用子網域的好處是不需要重新建立一整套獨立的網址系統，也就不需要重新處理 cookie 等隨網域綁定的機制，子網域是主網域的一部分，處理起來比另外申請一個全新網域簡單得多。

這一節要建立的子網域叫做 `blog`，最終會變成 `blog.jemstack.lol` 這樣的網址。

## 新增子網域的 A 記錄

第一步跟[[19-buying-a-domain-name|前面新增網域 A 記錄]]的做法一樣，回到 DigitalOcean 的網域管理頁面（Networking → Domains），新增一筆記錄，主機名稱填入 `blog`，其餘欄位會自動帶入對應的內容。

不過光是新增這筆 A 記錄，目前還不會有任何效果，因為 Nginx 還不知道該怎麼處理指向這個子網域的請求，需要額外建立一個新的虛擬伺服器來處理。

## 為什麼要用獨立的虛擬伺服器來處理子網域

用獨立的虛擬伺服器來處理子網域，最大的好處是可以讓同一個網域底下的不同部分，各自指向完全不同的應用程式。舉例來說，如果 `blog` 這個子網域打算改用 Django（Python）架設，而不是沿用現有的 Node.js 應用程式，透過 Nginx 就能把不同子網域的請求，分別導向完全不同的系統或服務，彼此互不影響。

## 建立新的 Nginx 虛擬伺服器設定檔

跟[[24-virtual-server-and-pm2|前面建立虛擬伺服器]]的做法一樣，新設定檔一樣放在 `/etc/nginx/sites-enabled/` 底下。檔名本身其實不影響設定內容，但如果是要建立子網域專用的設定，用子網域的名稱當作前綴會讓人比較容易辨識：

```bash
sudo vi /etc/nginx/sites-enabled/blog.fullstackfrontend
```

設定內容大致如下：

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name blog.jemstack.lol;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

這裡有幾個地方跟原本的預設虛擬伺服器不一樣：

- **`server_name`**：這次一定要明確填上完整的子網域名稱（`blog.jemstack.lol`），因為這個虛擬伺服器不是預設伺服器（沒有 `default_server` 這個設定），Nginx 需要靠 `server_name` 才能判斷該把哪些請求導向這個區塊
- **`proxy_pass`**：這裡示範用 `localhost` 取代原本寫的 `127.0.0.1`，兩者效果相同，只是寫法上的選擇；同一台伺服器上可以視需要把不同子網域代理到完全不同的埠、甚至完全不同的服務

## 更新 nginx.conf，讓新設定檔生效

因為[[24-virtual-server-and-pm2|前面]]已經把主設定檔設定得很精確、只載入指定的站台設定，而不是自動載入 `sites-enabled` 底下的所有內容，所以每新增一個虛擬伺服器設定檔，都要記得手動去更新主設定檔，加上對應的 `include` 這一行：

```bash
sudo vi /etc/nginx/nginx.conf
```

加入類似這樣的一行：

```nginx
include /etc/nginx/sites-enabled/blog.fullstackfrontend;
```

這一步是最容易被忽略、卻也最容易導致設定不生效的地方，如果發現子網域怎麼設定都連不上，很可能就是漏了這一步。

## 驗證設定並重新啟動 Nginx

修改任何正在運作中的服務設定檔之後，都要記得重新啟動該服務，Nginx 才會真正套用新的設定內容。在重新啟動之前，一樣可以先用 `nginx -t` 驗證設定內容是否正確：

```bash
sudo nginx -t
sudo service nginx restart
```

設定生效後，DNS 記錄的傳播可能還需要一點時間，稍等片刻後連到 `blog.jemstack.lol`，就能看到這個子網域已經正確代理到指定的應用程式。

## 熟能生巧

第一次接觸 Nginx 虛擬伺服器設定時，這些設定項目看起來相當陌生、難以理解，但反覆操作過幾次之後，就能清楚看懂每一行設定實際在做什麼、整套系統是怎麼從名稱伺服器一路串接到 Nginx 設定、再到重新啟動服務生效的。

## 複習

### 什麼是子網域，它的用途是什麼？

子網域是主網域底下的一個子集合，可以在不需要建立全新網址的情況下，切分出獨立的環境或應用程式，這樣既能簡化開發流程（不需要重新處理 cookie 等機制），也讓管理網站的不同部分變得更容易。

### Nginx 虛擬主機設定通常放在哪裡？

`/etc/nginx/sites-enabled` 目錄底下。

### 幫子網域設定新的 Nginx 伺服器區塊時，需要哪些關鍵設定？

包含監聽 80 埠的 `listen` 指令（同時涵蓋 IPv6）、指定子網域名稱的 `server_name`、`location` 區塊，以及負責轉送請求的 `proxy_pass` 指令；此外還要在 `nginx.conf` 裡加上對應的 `include`，並重新啟動 Nginx 服務才會生效。

### 修改 Nginx 設定之後，該執行哪兩個指令來確保設定正確生效？

`sudo nginx -t`（驗證設定內容是否正確）與 `sudo service nginx restart`（讓變更的設定真正生效）。

### 在網域設定的脈絡下，A 記錄是什麼？

A 記錄是一種 DNS 記錄類型，用來把網域名稱對應到一個 IP 位址，讓使用者可以透過特定的子網域存取對應的網站。

## 小測驗

<details>
<summary>子網域在網頁開發中的主要用途是什麼？</summary>
在同一個網域底下建立獨立的區塊或環境
</details>

<details>
<summary>Nginx 伺服器區塊中，通常需要包含哪兩個指令來處理進來的請求？</summary>
listen 與 server_name
</details>

<details>
<summary>Nginx 虛擬主機設定通常存放在哪裡？</summary>
/etc/nginx/sites-enabled
</details>

<details>
<summary>Nginx 處理 HTTP 流量時，通常監聽哪個連接埠？</summary>
80 埠
</details>

<details>
<summary>修改 Nginx 設定檔之後，要讓變更生效必須做什麼？</summary>
重新啟動 Nginx 服務
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
