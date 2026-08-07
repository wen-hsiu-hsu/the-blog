---
title: '安裝 Node.js、初始化專案，並用 Nginx proxy_pass 把請求轉給 Node 伺服器'
description: '用 NodeSource 安裝最新版 Node.js，比較 apt 與 apt-get 差異，用 chown 取回目錄擁有權避免每次 sudo，跑一遍 git init、npm init 建立陽春 Node.js 伺服器，並在 Nginx 新增虛擬伺服器設定檔，用 proxy_pass 轉送請求給 Node。'
date: 2026-08-16
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 23
chapter: 'Application Setup'
tags:
    - frontendMasters
    - fullStackFundamentals
    - NodeJs
    - NodeSource
    - Chown
    - Git
    - Npm
    - Nginx
    - ProxyPass
---

# 安裝 Node.js、初始化專案，並用 Nginx proxy_pass 把請求轉給 Node 伺服器

> [[22-setup-nginx-web-server|上一篇]]裝好 Nginx 之後，末尾提到接下來要換成前端工程師更熟悉的 Node.js 來實際運作應用程式，請求會先進 Nginx、再由 Nginx 代理轉送給 Node.js。這一節就把這條路徑實際打通：安裝 Node.js、建立最陽春的伺服器，並設定 Nginx 的 `proxy_pass` 把兩者串起來。

## 用 NodeSource 安裝最新版 Node.js

延續[[22-setup-nginx-web-server|上一篇]]末尾提到的做法，先用 `curl` 拉取 NodeSource 提供的安裝腳本，並透過 `sudo` 執行：

```bash
curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash -
```

這裡會用到 `apt-get` 而不是平常慣用的 `apt`。`apt-get` 是比較底層的套件管理指令，`apt` 則是為了人類操作方便而設計的封裝版本，兩者實際做的事情差不多，只是介面設計取向不同，多數情況下用 `apt` 就好，但這裡沿用課程原本的寫法：

```bash
sudo apt-get install nodejs
```

安裝完成後，用 `node --version` 確認版本是否符合預期，這裡裝到的是 19.x 系列，屬於相對新的版本。

順手也確認一下 Git 有沒有裝好，通常安裝 Node.js 的過程會一併帶進 Git：

```bash
git --version
```

如果系統上還沒有 Git，可以再用 `sudo apt install git` 補裝。

## 用 chown 拿回目錄擁有權，不用每次都 sudo

在[[22-setup-nginx-web-server|上一篇]]編輯 Nginx 預設頁面時，曾經因為忘記加 `sudo` 而卡在存檔階段動彈不得，之後才想起要用 `sudo vi` 重新開啟檔案。為了避免接下來開發應用程式時反覆遇到同樣的麻煩，這裡先把應用程式要放置的目錄擁有權直接改成自己，之後就不需要每次編輯都加 `sudo`。

先切換到 `/var/www` 目錄，用 `chown`（change owner）把整個目錄的擁有權遞迴（`-R`）改成目前的使用者：

```bash
cd /var/www
sudo chown -R jem:jem .
```

`chown` 執行成功通常不會有任何輸出，這是正常現象。

## 建立應用程式目錄，並初始化 Git 與 npm

接下來依序建立應用程式目錄、初始化 Git 版本控制、建立應用程式檔案，並用 `npm init` 產生 `package.json`：

```bash
mkdir /var/www/app
cd /var/www/app
git init
touch app.js
npm init
```

`npm init` 過程中會依序詢問專案名稱、版本、描述、進入點等資訊，這些欄位都可以直接按預設值略過，不影響接下來的操作。執行完成後，目錄底下就會同時存在 `app.js` 與 `package.json` 兩個檔案。

## 寫一個最簡單的 Node.js 伺服器

因為擁有權已經改成自己，這裡編輯 `app.js` 不再需要 `sudo`：

```bash
vi app.js
```

寫法延續[[07-create-a-simple-nodejs-server|更早之前]]寫過的陽春伺服器，但這次不從檔案讀取內容，而是直接把回應內容寫進 response：

```js
const http = require('http');

http.createServer(function (req, res) {
    res.write('On the way to being a full stack engineer');
    res.end();
}).listen(3000, function () {
    console.log('Server started');
});
```

`http.createServer` 接收的參數固定是 `req`（請求）與 `res`（回應），順序不能顛倒。因為這裡只是想示範最直接的寫法，就不再額外從檔案讀取內容、直接呼叫 `res.write` 把內容寫進回應。但只呼叫 `res.write` 還不夠，因為伺服器沒辦法自己判斷回應內容什麼時候寫完，一定要明確呼叫 `res.end()`，才會真正把回應送回用戶端。最後在同一段程式碼裡直接鏈接 `.listen(3000, ...)`，讓伺服器監聽 3000 埠，並在啟動時印出一行提示訊息，方便確認伺服器有沒有成功啟動。

## 建立 Nginx 虛擬伺服器設定，串接 Nginx 與 Node

到這裡為止，Nginx 與 Node.js 伺服器是各自獨立運作的，還缺一個環節：讓 Nginx 知道要把請求轉送給 Node.js。這需要建立一個虛擬伺服器（virtual server）設定，也就是[[22-setup-nginx-web-server|上一篇]]提到的 `proxy_pass` 指令要派上用場的地方。

這裡不直接修改 Nginx 的預設設定檔，而是在 `sites-enabled` 目錄底下新增一個獨立的設定檔：

```bash
sudo vi /etc/nginx/sites-enabled/fsfe
```

檔案名稱本身其實不影響設定內容，可以自由命名，一個常見的慣例是直接用自己的網域名稱來命名，方便日後管理與辨識；這裡沿用課程示範，取名為 `fsfe`。之所以另外新建一個檔案、而不是直接修改預設設定檔，是因為預設設定檔裡包含大量預設的註解與不需要用到的內容，另外新增一個乾淨的虛擬伺服器區塊，只保留真正需要的設定項目，能讓之後維護起來更輕鬆。

## 複習

### 從 NodeSource 儲存庫安裝 Node.js 要用什麼指令？

先執行 `curl https://deb.nodesource.com/setup_19.x | sudo -E bash`，接著用 `sudo apt-get install nodejs` 安裝 Node.js。

### apt 與 apt-get 有什麼差異？

apt 是比較貼近人類操作習慣的封裝版本，apt-get 則是比較底層的套件管理指令，兩者實際上做的事情差不多。

### 初始化一個新的 Node.js 專案、建立 package.json 檔案要用什麼指令？

`npm init`。

### Node.js 中用來建立 HTTP 伺服器的方法是什麼？

`http.createServer()`。

### 在 Node.js HTTP 伺服器中撰寫回應時，必須呼叫哪兩個方法？

`res.write()` 與 `res.end()`。

## 小測驗

<details>
<summary>在目錄中初始化一個新的 Git 儲存庫要用什麼指令？</summary>
git init
</details>

<details>
<summary>用什麼指令可以建立新的 Node.js 專案設定檔？</summary>
npm init
</details>

<details>
<summary>Node.js 中用來建立 HTTP 伺服器的方法是什麼？</summary>
http.createServer()
</details>

<details>
<summary>要遞迴變更某個目錄的擁有權，該用什麼指令？</summary>
chown -R
</details>

<details>
<summary>Node.js 中用來結束一個 HTTP 回應的方法是什麼？</summary>
res.end()
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
