---
title: '用 UFW 設定防火牆：關閉不該開放的 3000 埠，以及 deny 與 reject 的關鍵差異'
description: '用 ufw（Uncomplicated Firewall）取代過去繁瑣的 iptables 設定，實際只開放 22 與 80 埠、關掉上一節發現的 3000 埠，並解釋 deny 與 reject 的差異，為什麼靜默的 deny 反而更能防範放大攻擊，以及設定防火牆時千萬不能誤鎖 SSH 埠。'
date: 2026-08-18
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 28
chapter: 'Security'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Security
    - Firewall
    - UFW
    - Port
    - DDoS
    - AmplificationAttack
    - IPTables
---

# 用 UFW 設定防火牆：關閉不該開放的 3000 埠，以及 deny 與 reject 的關鍵差異

> [[27-view-open-ports-with-nmap|上一篇]]用 `nmap` 掃描伺服器，發現除了理應開放的 22、80 埠之外，3000 埠也因為 Node.js 伺服器意外對外開放。這一節就要用防火牆把這個破口關起來，並認識防火牆背後兩種常見的阻擋方式：`deny` 與 `reject`。

## 什麼是防火牆

防火牆的作用，簡單來說就是套用一套規則，明確定義哪些連線允許進來、哪些不允許，並依照需求隨時開啟或關閉特定連接埠。這門課只需要開放少數幾個連接埠，剛好可以搭配一套相當好用的工具：`ufw`。

## UFW：不複雜的防火牆

`ufw` 全名是 Uncomplicated Firewall（不複雜的防火牆）。在 `ufw` 出現之前，設定防火牆通常得直接操作像 `iptables` 這類工具，指令又長又難懂，過去往往被視為只有專家才碰得動的領域。相較之下，`ufw` 用起來輕鬆許多，核心指令主要就是 `ufw allow`、`ufw deny`、`ufw reject` 這幾種，管理防火牆規則變得直覺許多。

## deny 與 reject 的差異

`deny` 與 `reject` 乍看之下很像，都是拒絕連線，但背後行為並不相同：

- **`reject`**：會明確告知對方連線被拒絕，對方能清楚知道自己被擋下來了
- **`deny`**：完全靜默、不做任何回應，對方連伺服器是不是真的存在都無法確定

課程建議通常優先採用 `deny`，而不是 `reject`。[[26-security|前面談過]] DDoS 攻擊與放大攻擊（amplification attack）的風險：如果使用 `reject`，伺服器每次都得花費資源回覆一則拒絕訊息，一旦攻擊者刻意大量發送請求，逼迫伺服器不斷產生大量拒絕回應封包，反而可能讓伺服器因為疲於應付這些回應而被拖垮。相對地，如果選擇 `deny`，伺服器完全不回應，連存在與否都無從得知，除非有明確理由需要讓對方知道某個連接埠被擋下，否則 `deny` 通常是更穩妥的選擇。

## 用 UFW 設定防火牆規則

先確認目前防火牆的狀態，如果是全新安裝、還沒手動啟用過，狀態通常會顯示為停用（disabled），因為系統原本一直是用 `iptables` 在管理：

```bash
sudo ufw status
```

在正式啟用防火牆之前，要先把規則設定好，避免規則還沒生效前就先把自己擋在門外。首先要允許 SSH（22 埠）與 HTTP（80 埠）通過：

```bash
sudo ufw allow ssh
sudo ufw allow http
```

這裡有個常見疑問：為什麼不是直接開放 HTTPS，而是先開放 HTTP？原因是目前這台伺服器根本還沒設定 HTTPS，也還沒有任何憑證、Nginx 端也尚未做相關設定，如果這時候就開放 HTTPS 對應的 443 埠，只會是一個毫無意義、白白開著的連接埠，之後真正設定好 HTTPS 時再處理即可。

規則設定好之後，才正式啟用防火牆：

```bash
sudo ufw enable
```

這一步務必格外小心：如果一開始就忘記先允許 SSH（22 埠），直接啟用防火牆，很可能會把自己徹底鎖在伺服器外面，再也連不進去。務必先確認 SSH 規則已經正確設定好，再啟用防火牆。

啟用完成後，可以用 `ufw status` 再次確認目前生效的規則，這時候應該會看到 22 埠與 80 埠分別對 IPv4 與 IPv6 都是開放狀態。整個流程相較於過去手動操作 `iptables` 簡單得多，過去這類防火牆設定往往只有資深工程師才敢輕易嘗試，現在透過 `ufw` 已經變得容易上手許多。

## 之後還能做什麼：視情況封鎖 HTTP

日後如果正式啟用了 HTTPS，可能會想進一步封鎖所有 HTTP 連線（也可能選擇改成導向 HTTPS，這部分之後會再深入討論），這時候就可以用 `ufw reject` 明確拒絕所有 HTTP 連線。不過無論做任何調整，都要再三提醒自己：千萬不要關閉 22 埠，一旦不小心把 SSH 埠關掉，就等於自己把自己鎖在伺服器外面，會陷入非常麻煩的處境。

`ufw` 正如它的名字所暗示的，用起來確實相當簡單。

## 複習

### UFW 是什麼，它的全名是什麼？

UFW 全名是 Uncomplicated Firewall（不複雜的防火牆），是一套讓防火牆管理變得比 iptables 這類舊工具更簡單的軟體工具。

### ufw deny 與 ufw reject 有什麼差異？

`ufw reject` 會回應一則明確的拒絕訊息，告知對方連線被擋下；`ufw deny` 則完全靜默、不做任何回應，這種做法能減少放大攻擊的風險，讓對方無法確定伺服器是否存在。

### 設定基本防火牆時，通常會用哪些初始指令？

通常會依序執行 `sudo ufw allow ssh`、`sudo ufw allow http`，設定好基本規則後再執行 `sudo ufw enable` 正式啟用防火牆。

### 設定基本的 UFW 防火牆時，預設會開放哪些連接埠？

通常會開放 22 埠（SSH）與 80 埠（HTTP），並同時對 IPv4 與 IPv6 生效。

### 防火牆規則中 deny 與 reject 有什麼差異，為什麼會偏好其中一種？

`reject` 會回傳錯誤訊息告知對方連線被拒絕，`deny` 則完全靜默不回應。通常會偏好使用 `deny`，因為如果攻擊者刻意逼迫系統大量回傳拒絕封包，反而可能造成系統被 DDoS 攻擊拖垮；使用 `deny` 的話，對方甚至無法確定伺服器是否存在。

## 小測驗

<details>
<summary>在防火牆管理的脈絡下，UFW 代表什麼？</summary>
Uncomplicated Firewall（不複雜的防火牆）
</details>

<details>
<summary>在 UFW 防火牆設定中，deny 與 reject 最關鍵的差異是什麼？</summary>
deny 是靜默的，reject 則會回應告知對方連線被拒絕
</details>

<details>
<summary>用什麼指令可以檢查目前 UFW 的狀態？</summary>
sudo ufw status
</details>

<details>
<summary>在這次的 UFW 設定中，一開始開放了哪些連接埠？</summary>
22 埠（SSH）與 80 埠（HTTP）
</details>

<details>
<summary>防火牆在網路安全中的主要作用是什麼？</summary>
套用規則來決定哪些網路流量被允許、哪些被拒絕
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
