---
title: 'Nginx 安裝與設定檔解析：為什麼需要反向代理，root、location、directive 結構全拆解'
description: '安裝 Nginx 讓伺服器第一次真正回應請求，說明反向代理（reverse proxy）的用途，比較 Nginx 與 Apache 的差異，並拆解 sites-available 底下設定檔中 root、location block 與 directive 的結構，實際動手編輯出屬於自己的第一個網頁。'
date: 2026-08-15
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 22
chapter: 'Application Setup'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Nginx
    - WebServer
    - ReverseProxy
    - Apache
    - NginxConfig
    - SitesAvailable
---

# Nginx 安裝與設定檔解析：為什麼需要反向代理，root、location、directive 結構全拆解

> 從[[09-buying-a-vps|買下 VPS]]、[[13-setup-ssh-keys-for-login|設定 SSH 金鑰]]、[[19-buying-a-domain-name|買網域]]到[[21-file-permissions|鎖死伺服器安全性]]，前面做了這麼多準備，伺服器目前卻還完全不會回應任何請求。這一節終於要讓伺服器真正動起來：安裝 Nginx，讓它開始回應外部連線。

## 為什麼需要網頁伺服器：Nginx 與 Apache

市面上主流的網頁伺服器主要有兩套：Apache 與 Nginx。Apache 內建功能豐富，跟 Java、PHP 這類語言搭配起來開箱即用；Nginx 則是同時具備網頁伺服器、反向代理（reverse proxy）、正向代理（forward proxy）甚至郵件代理能力的多功能工具，而且是用 C 語言寫成的，效能通常比其他方案更快，在許多情境下甚至比 Node.js 本身還快。這門課選擇 Nginx，主要原因是它速度快、設定彈性高。

當一個請求從網際網路進來時，伺服器需要有某種機制知道該把這個請求導向哪裡，可能是資料庫、應用程式，甚至是另一台伺服器，這正是 Nginx 扮演的角色：接收進來的請求，判斷該把它路由到哪裡去。技術上其實可以讓請求直接從網際網路連到 Node.js 應用程式，跳過 Nginx，但這不是好的做法：Nginx 在路由與請求處理這類工作上經過高度最佳化，如果想在 Node.js 應用程式本身重新實作這些能力，只會徒增麻煩，而且無論如何，Nginx 處理這類工作的速度都會比 Node.js 快。

## 安裝並啟動 Nginx

安裝 Nginx 一樣透過 `apt`，因為[[21-file-permissions|前面]]已經不再以 `root` 身分操作，這裡需要加上 `sudo`：

```bash
sudo apt install nginx
sudo service nginx start
```

安裝完成、啟動服務後，用瀏覽器連到伺服器的 IP 位址，如果看到的不再是空白頁面、而是 Nginx 的歡迎頁面，就代表網頁伺服器已經成功運作起來了。網域這時候可能還沒完全連結上（DNS 傳播需要時間），但至少已經確認伺服器本身能正確回應請求。

## 認識 Nginx 設定檔的結構

Nginx 幾乎所有的設定檔都放在 `/etc/nginx/` 底下，可以進去看看目前的預設設定：

```bash
cd /etc/nginx/
ls
```

目錄裡會看到 `sites-available` 與 `sites-enabled` 這兩個資料夾，兩者的關係稍微有點繞，先不深入探討，之後會再回頭處理讓它更容易理解。先進到 `sites-available`，看看預設的伺服器設定檔內容：

```bash
less sites-available/default
```

Nginx 的設定檔語法乍看之下很陌生，像是另一套獨立的語言，但每一行都有它存在的用意，拆解開來看其實不難理解：

- **`root`**：代表請求的根目錄。剛剛看到的 Nginx 歡迎頁面，實際上就是存放在 `/var/www/html` 底下的一個 HTML 檔案，如果只需要單純提供靜態 HTML 頁面，甚至不需要應用程式，Nginx 本身就能勝任
- **`location` 區塊**：定義不同路徑該對應到哪裡。根路徑一律是 `/`，概念上跟作業系統裡的根目錄很類似；如果想讓某個特定路徑（例如 `/gojemgo`）導向別的地方，就可以額外新增一個 `location` 區塊來處理
- **指令（directive）**：`location` 區塊裡可以放置各種指令，用來規定在這個區塊裡該執行什麼行為。例如 `try_files` 會嘗試依序尋找對應的檔案，找不到就回傳 404 頁面；之後會用到的 `proxy_pass` 則是把請求代理轉送到 Node.js，這正是稍後串接應用程式時會用到的關鍵指令

Nginx 本身路由能力很完整，不只是可以把請求代理到應用程式，也可以直接在應用程式層或伺服器本身做路由，實際怎麼分工並沒有固定答案。

## 動手編輯自己的第一個網頁

想真正感受自己對伺服器的掌控權，可以直接動手修改預設頁面。預設頁面存放在：

```bash
cd /var/www/html
```

這個目錄裡並沒有一般常見的 `index.html`，只有一個名字很長的 `index.nginx-debian.html`。這時候可以自己建立一個新的 `index.html`：

```bash
sudo vi index.html
```

要記得先加上 `sudo` 再進去編輯，這個目錄的檔案不屬於一般使用者，如果忘記加 `sudo` 就直接編輯，很容易卡在存檔階段動彈不得，最保險的做法還是先確認自己有寫入權限再開始編輯。編輯內容加上一行簡單的文字，例如 `Hello world`，這樣的內容雖然簡陋，但完全是合法有效的 HTML。存檔離開後回到瀏覽器重新整理，畫面會顯示 `Hello world`，因為 Nginx 會優先讀取 `index.html`，而不是原本那個檔名很長的 Debian 預設頁面。到這一步，網頁已經成功跟伺服器串接起來，只是網域的部分可能還在傳播中。

## 下一步：把 Node.js 接上來

Nginx 本身其實已經足以撐起一整個應用程式，但接下來要回到前端工程師比較熟悉的領域，改用 Node.js 來實際運作應用程式：請求會先進入伺服器，交給 Nginx，再由 Nginx 代理轉送給 Node.js 處理。

在安裝 Node.js 之前，需要先確保拿到的是最新版本的原始碼來源，因為直接用 `apt install nodejs` 通常只會裝到偏舊的版本（例如 10 或 12 版），這裡則需要更新的版本（例如 19 版）。做法是先用 `curl` 從 NodeSource 拉取對應 Debian 系統的安裝腳本，並透過 `sudo` 執行進 bash：

```bash
curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash -
```

這個腳本會下載並設定好最新版本的來源，之後再執行 `apt-get install nodejs`，安裝到的就會是連結到最新原始碼的版本，而不是套件管理工具原本內建、版本較舊的那份。

## 複習

### 課程中討論的兩套主要網頁伺服器是什麼？

Apache 與 Nginx。

### 像 Nginx 這樣的網頁伺服器，主要功能是什麼？

把進來的請求路由到正確的目的地，例如資料庫、應用程式，或是另一台伺服器。

### Nginx 預設的歡迎頁面存放在哪裡？

`/var/www/html`。

### 安裝 Nginx 要用什麼指令？

`sudo apt install nginx`。

### 設定 Nginx 時應該切換到哪個目錄？

`/etc/nginx/`。

## 小測驗

<details>
<summary>Nginx 是用什麼程式語言寫成的？</summary>
C
</details>

<details>
<summary>在 Debian 系統上安裝 Nginx 要用什麼指令？</summary>
sudo apt install nginx
</details>

<details>
<summary>Nginx 預設的歡迎頁面存放在哪裡？</summary>
/var/www/html
</details>

<details>
<summary>Nginx 在網頁應用架構中的主要功能是什麼？</summary>
路由與代理請求
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
