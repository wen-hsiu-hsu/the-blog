---
title: '用 ping、traceroute、netstat 揭開網路請求背後的隱藏層：實際動手驗證架構怎麼運作'
description: '不再只憑口頭描述，直接用 ping 快速檢查主機是否在線、用 traceroute 印出連到 google.com 沿途每一個節點的位址與延遲、用 netstat 檢視電腦上所有開放的通訊埠與連線的詳細狀態，藉此驗證前一節講的請求傳遞路徑是不是真的長這樣，也學會用這些工具排查網路問題究竟卡在哪一層。'
date: 2026-08-12
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 16
chapter: 'The Internet'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Networking
    - Ping
    - Traceroute
    - Netstat
    - ISP
    - Backbone
---

# 用 ping、traceroute、netstat 揭開網路請求背後的隱藏層：實際動手驗證架構怎麼運作

> [[15-how-the-internet-works|上一篇]]用一張簡化過的示意圖說明請求從電腦傳到伺服器要經過哪些節點，這一節換成實際動手操作三個網路工具：ping、traceroute、netstat，直接在終端機裡把這些隱藏在背後的節點與連線攤開來看，驗證上一篇講的架構是不是真的長這樣。

## ping：最快確認主機是否在線的方式

`ping` 是最簡單直接的工具，用來確認某個主機是否正常運作：

```bash
ping google.com
```

當 Wi-Fi 突然斷線、瀏覽器載入異常緩慢時，`ping` 可以快速判斷問題出在應用程式本身、還是網路連線本身出了狀況。選擇 `ping google.com` 是因為 Google 幾乎不會下線，可以當作一個穩定可靠的基準點，而且這個指令非常輕量，不會對系統造成負擔，隨時想確認網路狀態都可以執行。

值得注意的是，並非所有網站都會回應 `ping`：像 frontendmasters.com 就刻意停用了對 UDP 或 ICMP 請求的回應，因此不會有任何反應。是否要讓自己的電腦回應 `ping` 請求可以自行設定，但保持開放通常比較方便，能讓自己或其他人快速確認網域是否正常運作。

## traceroute：一站一站印出連到目的地的每一跳

`traceroute` 能讓「網路是怎麼運作的」這個問題變得更具體：

```bash
traceroute google.com
```

`traceroute` 會列出從自己電腦連到目的主機沿途經過的每一個節點（hop），並印出每一跳的位址與回應時間。實際執行 `traceroute google.com` 時，可以看到：

- 第一跳通常是自己電腦的區域網路 IP 位址，開頭通常是 `192.168.x.x`，這正是[[15-how-the-internet-works|上一篇]]提到路由器分配給裝置的內部位址
- 接下來是路由器與數據機（如果兩者是分開的裝置，會分別各佔一跳）
- 再往後會進入 ISP 的網路內部，可以從連續幾跳的 IP 位址區塊看出它們同屬同一家業者，像 Cogentco 這樣的 ISP，就是靠它獨自持有一整塊 IP 區塊判斷出來的
- 每一跳右側的欄位代表回應所花費的時間，能大致反映這個節點距離多遠、當下網路繁忙的程度
- 通常要花上好幾跳才能真正離開自己所在的 ISP，進入其他業者的網路，這時候看到的可能是另一個 ISP、某個網路骨幹（backbone），或是 Level 3 這類專門提供網路服務的業者
- 隨著持續往目的地跳過去，會慢慢注意到後段幾跳的 IP 位址開始落在同一個區塊裡，這通常代表已經接近目的地所在的資料中心
- 最後一跳抵達的目的地 IP，通常就是對方伺服器叢集前端的負載平衡器

實際連到 google.com 可能需要跳個 20 站，而[[15-how-the-internet-works|上一篇]]畫出來的示意圖其實是高度簡化過的版本；如果目的地伺服器在其他國家，往往會看到多達 30、40、甚至 50 跳，延遲也會隨著跳數增加而愈墊愈高。

`traceroute` 特別實用的地方在於，它能幫忙定位問題到底出在哪一層：如果 `ping` 沒有回應，但自己的網路確實還連得上，就可以用 `traceroute` 查看是卡在自己 ISP 內部的某個節點（代表問題不在自己身上），還是延遲在接近目的地那一段才開始飆高（代表問題可能出在對方的資料中心）。這類工具是網路管理員與 DevOps 工程師的基本功，操作起來並不複雜。

## netstat：檢視電腦上所有正在發生的網路連線

最後一個工具 `netstat` 輸出的資訊量遠比前兩者龐大：

```bash
netstat
```

`netstat` 會列出電腦上所有開放的通訊埠（port）、目前連線的所有 IP 位址，以及本機正在執行、會開啟通訊埠與其他程序溝通的所有處理程序，資訊量非常龐大，直接執行原始輸出參考價值有限。輸出結果裡會看到 UDP、TCP 等不同的連線協定，以及大量本機（localhost）層級的通訊埠，這些多半是本機程序彼此溝通用的管道，實際對應到哪個服務有時候不容易一眼看出。

為了讓輸出更容易閱讀，可以加上參數並搭配 `less` 分頁顯示：

```bash
netstat -lt | less
```

`-lt` 可以把輸出範圍縮小到只顯示 TCP 連線與部分本機連線，比原始輸出好理解得多；搭配 `less` 一次顯示一頁，比 `cat` 直接把整個結果一次倒出來要方便許多。即使篩選過後，還是能看到大量持續開啟的連線，這些通訊埠本來就會一直保持開啟、彼此持續溝通，這正是電腦背後始終在運作、卻平常完全不會被使用者察覺的一層。

## 複習

### ping 這個網路工具主要的用途是什麼？

用來快速確認某個主機是否正常在線，藉此判斷問題出在網路本身還是應用程式端。

### 執行 traceroute 時會顯示什麼資訊？

會顯示從自己電腦到目的主機之間經過的每一個節點（路由器、中繼站等），並印出每一跳的路徑與回應時間。

### netstat 能提供哪些關於電腦網路連線的資訊？

會顯示所有開放的通訊埠、目前連線的 IP 位址、本機正在執行的處理程序，以及 TCP、UDP 連線的詳細資訊。

### traceroute 如何幫助排查網路連線問題？

透過顯示每一跳的延遲與所在位置，可以判斷網路變慢或連線失敗究竟發生在自己的 ISP、網路骨幹，還是目的地伺服器那一端。

### 一般本機的區域網路 IP 位址通常以什麼開頭？

通常以 `192.168` 開頭，這是路由器分配給裝置、用來連上網際網路的內部位址。

## 小測驗

<details>
<summary>ping 指令主要用來確認什麼？</summary>
主機是否在線
</details>

<details>
<summary>netstat 能幫助了解電腦網路連線的哪些資訊？</summary>
目前開放的通訊埠與現有的網路連線
</details>

<details>
<summary>traceroute 的第一跳通常會顯示什麼？</summary>
來自路由器的本機區域網路 IP 位址
</details>

<details>
<summary>traceroute 可以幫助排查哪些網路問題？</summary>
定位網路延遲或連線失敗發生的位置
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
