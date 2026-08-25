---
title: '用 Certbot 免費幫網站裝上 HTTPS：snap 安裝、自動改寫 Nginx 設定、開放 443 埠'
description: '示範用 EFF 提供的免費工具 Certbot，透過 snap 套件管理器安裝，自動改寫 Nginx 虛擬伺服器設定加上 443 埠與憑證、把 HTTP 導向 HTTPS，並解釋 Certbot 為什麼要建立臨時檔案驗證網域所有權，最後用 ufw 開放 443 埠、測試自動更新，完成整個 HTTPS 部署流程。'
date: 2026-08-25
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 42
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - HTTPS
    - Certbot
    - Nginx
    - SSL
    - UFW
    - CertificateAuthority
    - Snap
    - PEM
---

# 用 Certbot 免費幫網站裝上 HTTPS：snap 安裝、自動改寫 Nginx 設定、開放 443 埠

> [[41-https-overview|前面]]講完為什麼一定要用 HTTPS，這一節就要動手幫網站實際加上 HTTPS，讓網站看起來更像一個正式的產品，而不只是玩具專案。實作會用到 [Certbot](https://certbot.eff.org)，過程比想像中簡單很多，因為它把所有 Nginx 設定的細節都自動處理好了。

## Certbot 是什麼

Certbot 是由電子前哨基金會（Electronic Frontier Foundation，EFF）維護的免費工具，用來自動申請並設定 HTTPS 憑證。EFF 是一個長期為網路使用者權益發聲、打隱私相關訴訟的非營利組織，Certbot 就是他們提供的服務之一。像 Namecheap、DigitalOcean 這類平台通常會提供付費的 HTTPS 憑證服務，Certbot 則完全免費，等於是用開源工具取代了原本要花錢才能取得的功能。

在 Certbot 出現之前，設定 HTTPS 得手動修改 Nginx 設定、自己處理憑證檔案，過程繁瑣又容易出錯。

Certbot 會自動讀取現有的 Nginx 設定、判斷網站架構，並直接把該加的設定寫進去，這正是延續[[22-setup-nginx-web-server|前面]]選用 Ubuntu 加 Nginx 這條主流路線的好處：因為這是一條被大量使用者驗證過的路徑，才會有 Certbot 這樣的工具直接支援。

## 用 snap 安裝 Certbot

Certbot 官方建議透過 `snap` 這個套件管理器安裝，跟平常慣用的 `apt` 不太一樣，穩定性也稍微差一點，但這是目前安裝 Certbot 最推薦的方式。先確認 `snapd` 是最新版本：

```bash
sudo snap install core
sudo snap refresh
```

保險起見，先移除舊版透過 `apt` 安裝的 Certbot（如果不存在也沒關係）：

```bash
sudo apt-get remove certbot
```

接著用 `snap` 安裝正式版的 Certbot：

```bash
sudo snap install --classic certbot
```

安裝完成後，還需要建立一個符號連結，把 Certbot 的執行檔連到系統慣用的執行檔路徑，這樣之後才能直接用 `certbot` 這個指令呼叫它：

```bash
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

`ln` 就是建立檔案之間連結的指令，概念上類似 Windows 裡的捷徑。

## 讓 Certbot 自動設定 Nginx

準備工作做完後，只要一行指令就能讓 Certbot 接管剩下的設定：

```bash
sudo certbot --nginx
```

執行後會依序詢問幾個問題：填寫一個 email 地址（可以用自己的網域信箱，如果已經設定好信件轉發）、是否同意服務條款，以及是否要訂閱電子報。接著 Certbot 會掃描現有的 Nginx 設定，列出偵測到的所有網域（主網域跟[[36-subdomains|前面建立的]]子網域都會列在裡面），詢問要幫哪些網域申請憑證，這裡直接全選即可。

## Certbot 實際做了哪些事

與其照單全收，不如直接檢查 Certbot 到底改了什麼。用以下指令檢視虛擬伺服器設定檔：

```bash
sudo cat /etc/nginx/sites-enabled/fsfe
```

可以看到 Certbot 沒有動到原本 80 埠的設定，而是額外加了一段監聽 443 埠的區塊：

- 開啟了 **SSL**（Secure Socket Layer，加密技術）
- 指定了憑證檔案與私鑰檔案的路徑，憑證用的是 `.pem` 格式檔案，概念上跟 SSH 金鑰類似，都是用來驗證身分的一把鑰匙，只是使用情境不同（AWS 目前仍普遍用 `.pem` 檔案作為憑證格式）
- 加了一條**重新導向規則**，把所有透過 80 埠（HTTP）連進來的請求導向 443 埠（HTTPS），確保使用者永遠是透過加密連線在存取網站

Certbot 除了寫設定檔，本質上更重要的角色是一個**憑證授權機構（certificate authority）**：它會替網站核發一張憑證，等於是替這個網站「蓋章認證」。核發憑證前，Certbot 會在伺服器的檔案系統上建立一個臨時檔案，藉此驗證申請者確實擁有這個網域的控制權。這一步是必要的，如果沒有這層驗證，任何人都可以幫任意網站申請憑證，進而攔截、解密原本應該受保護的流量。這也是為什麼[[19-buying-a-domain-name|前面]]一定要先買好網域名稱：HTTPS 沒辦法直接架在一個 IP 位址上，一定要有網域名稱才能完成這個驗證流程。

## 測試自動更新與開放防火牆埠號

HTTPS 憑證不是一勞永逸的，需要定期更新，Certbot 本身已經內建了自動更新機制，這裡先做一次模擬更新，確認流程沒問題：

```bash
sudo certbot renew --dry-run
```

確認完成後，實際連到網站測試，卻發現連不上，原因是 443 埠還沒開放。Certbot 本身不會自動幫忙修改防火牆規則，這其實是件好事，畢竟不會希望有工具擅自更動防火牆設定。用[[28-firewall-and-ufw|前面用過]]的 `ufw` 手動開放即可：

```bash
sudo ufw allow https
sudo ufw status
```

`sudo ufw status` 可以確認 443 埠確實已經開啟。這時候再重新整理網頁，就能看到瀏覽器網址列出現代表安全連線的鎖頭圖示，整個 HTTPS 設定就完成了。

從安裝、掃描設定、申請憑證、改寫 Nginx 設定，到自動加上重新導向，這些原本得手動一步步處理的工作，Certbot 全都自動完成了。EFF 提供這樣一套完全免費、對開發者相當友善的工具，值得考慮捐款支持他們的理念。

## 複習

### HTTPS 使用的是哪個埠？

443。

### 這次示範用來替網站產生 SSL 憑證的工具是什麼？

Certbot。

### 用來在防火牆開放 HTTPS 埠的指令是什麼？

`sudo ufw allow https`。

### 憑證授權機構在驗證憑證時，為什麼要在網站的檔案系統上建立一個臨時檔案？

用來驗證申請者確實擁有這個網站（網域）的控制權，避免任何人都能替別人的網站申請到憑證。

### HTTPS 預設使用的埠號是哪一個？

443 埠。

## 小測驗

<details>
<summary>用來自動安裝與設定 HTTPS 憑證的工具是什麼？</summary>
Certbot
</details>

<details>
<summary>用來開放 HTTPS 埠的防火牆工具是什麼？</summary>
ufw
</details>

<details>
<summary>HTTPS 預設的埠號是多少？</summary>
443
</details>

<details>
<summary>Certbot 是由哪個組織營運維護的？</summary>
電子前哨基金會（Electronic Frontier Foundation）
</details>

<details>
<summary>Certbot 在產生憑證時，為什麼要在檔案系統上建立臨時檔案？</summary>
用來驗證申請者確實擁有這個提出申請的網站
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
