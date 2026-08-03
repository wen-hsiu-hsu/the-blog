---
title: 'TCP 與 UDP 差在哪：三向交握、封包、ICMP，以及 ping of death 攻擊的原理'
description: '解釋上一節用 ping、traceroute 時反覆出現的 TCP 與 UDP 到底是什麼，拆解 TCP 三向交握如何確保資料完整送達、UDP 為什麼犧牲可靠性換取速度並適合串流應用，說明封包與 ICMP 的角色，並揭露 ping of death 與 DDoS 攻擊背後利用的正是這套機制。'
date: 2026-08-13
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 17
chapter: 'The Internet'
tags:
  - frontendMasters
  - fullStackFundamentals
  - Networking
  - TCP
  - UDP
  - ICMP
  - Packet
  - DDoS
  - ThreeWayHandshake
  - PingOfDeath
---

# TCP 與 UDP 差在哪：三向交握、封包、ICMP，以及 ping of death 攻擊的原理

> [[16-network-tools-exercise|上一篇]]實際操作 ping、traceroute、netstat 時，輸出結果裡反覆出現 TCP、UDP 這類名詞。這一節就補上這兩個協定到底是什麼、為什麼網際網路需要同時存在這兩種協定，以及背後的封包、ICMP 概念。

## TCP：犧牲速度換取可靠性

TCP 全名是 Transmission Control Protocol（傳輸控制協定），跟 IP（Internet Protocol）合稱 TCP/IP，同樣是[[15-how-the-internet-works|前面]]提過「網際網路建立在規則與合作之上」的具體展現。網路上大多數封包走的都是 TCP。

TCP 之所以極度可靠，關鍵在於一套稱為三向交握（three-way handshake）的機制：

1. 用戶端送出 SYN 封包，代表「我要傳東西給你」
2. 伺服器回覆 SYN ACK，代表「我確認收到你的請求，這是我要傳回去的東西」
3. 用戶端再回覆 ACK，確認自己也收到了對方的回應

這個交握過程每天都在網路上發生數以百萬計次。TCP 之所以被設計成這樣，正是因為網際網路本身天生不可靠：就像[[16-network-tools-exercise|上一篇]]用 traceroute 看到的，光是連到 google.com 就要經過大約 20 個節點，任何一個節點都可能故障、需要重新繞路，或是某個路由器只允許進向流量、不允許出向流量。TCP 就是用來解決這些不確定性的機制：如果收到的資料只有 90%、缺了某些封包，用戶端可以告訴伺服器「這部分遺失了」，伺服器就會重新傳送，直到整份資料完整重組為止。TCP 內建大量的重試與備援機制，確保資料真正送達目的地。

## UDP：不在乎完整性，只求速度

相對地，UDP（User Datagram Protocol，使用者資料包協定）的態度完全不同：它就是把資料丟出去，接不接得到、接得完不完整都不重要，是一種單向、不做確認的傳輸方式。

TCP 與 UDP 之所以並存，是因為兩者適合的場景完全不同，取捨在於「資料能不能事後重組回來」以及「連線有沒有真的送達重不重要」。以串流影片為例，如果某一幀畫面遺失，使用者根本不會特地回放那一幀，所以 UDP 很適合這種允許偶爾丟幀、換取速度與即時性的即時資料傳輸，例如串流影片、串流音樂、視訊通話。視訊通話畫面有時候會突然模糊，正是因為底層用的是 UDP：只要持續傳送資料，不在乎中間丟了多少封包，直到連線結束為止。

相對地，TCP 速度較慢，如果拿來跑視訊通話或串流影音這類高頻寬需求的應用，會消耗遠比 UDP 更多的頻寬與成本。但如果換成一個網頁，就完全不能用 UDP，因為網頁的每一個位元組都必須依照正確順序完整重組回來，才能正確呈現畫面，這時候就必須依賴 TCP 的可靠性。

## ICMP：不傳資料，只是確認連線狀態

ICMP（Internet Control Message Protocol，網際網路控制訊息協定）是建立在 TCP 或 UDP 之上的協定，通常會透過 TCP 傳送，但實際上用哪一種都可以。`ping` 與 `traceroute` 之所以能運作，靠的正是 ICMP：它不傳送任何實際資料，單純只是詢問對方「你還在嗎」、「現在幾點」，本身不提供有意義的資訊內容，主要用途就是[[16-network-tools-exercise|前面]]提到的這類網路工具。

## 封包：網路傳輸的最小單位

以上所有機制，不論是 TCP 還是 UDP，最終都運作在封包（packet）這個層級上。封包是網路上可以傳輸的最小資料單位：要傳送一份很大的檔案時，會先拆解成一個個極小的資料區塊（可能只有幾 KB，也可能更大或更小），再依照特定的協定與標準重新組裝回原本的檔案。封包本身的組成方式非常複雜，值得另外花時間深入探討。

## Ping of death 與 DDoS：把 ICMP 拿來當攻擊武器

早期網路上有一種攻擊手法叫做 ping of death：因為每次 `ping` 對方，對方的電腦都必須耗費一點點 CPU 資源來回應（pong），只要短時間內對同一個目標發送大量的 ping 請求，就能逼迫對方電腦不斷回應、最終癱瘓。現代系統已經有辦法防範這種攻擊。

另一個相關的手法是偽造封包標頭：發送 ping 請求時偽裝來源位址，讓對方誤以為請求是從第三方（例如 google.com）發出的，於是回應（pong）就會導向那個被冒用的第三方，而不是真正的發送者。攻擊者可以藉此讓大量伺服器同時把回應洪流般地送往某個受害目標，自己卻完全不用直接動手。這種利用未修補的路由器等設備發動的手法，正是分散式阻斷服務攻擊（DDoS，Distributed Denial-of-Service）的常見成因之一，現在雖然已經有各種防範機制，但被駭的伺服器或設定錯誤的路由器，仍然是造成這類攻擊的常見原因。

網際網路能建立在 TCP/IP 這套共通標準之上，靠的是所有硬體、所有網路設備彼此協議、共同遵守同一套協定，這種在沒有任何單一權威強制之下自然達成的共識，本身就是一件相當了不起的事情。

## 複習

### TCP 代表什麼，它獨特的地方是什麼？

TCP 是 Transmission Control Protocol（傳輸控制協定）的縮寫。它極度可靠，透過三向交握（SYN、SYN ACK、ACK）建立連線，並會不斷重新傳送遺失的封包，直到資料完整傳輸完成為止。

### TCP 與 UDP 之間最關鍵的差異是什麼？

TCP 透過備援機制與封包驗證確保資料完整傳輸，可靠但速度較慢；UDP 速度較快但不保證資料完整送達，適合串流影片這類即使偶爾遺失部分封包也不影響整體體驗的場景。

### UDP 典型的應用場景有哪些？

UDP 適合用在串流影片、串流音樂、視訊通話等即時資料傳輸場景，這些情境下即使遺失少量封包，也不會嚴重影響使用體驗。

### 網路傳輸中的「封包」是什麼？

封包是網路上可以傳輸的最小資料單位，大型檔案會被拆解成許多極小的資料區塊來傳輸，並依照特定協定與標準將這些區塊重新組裝還原。

## 小測驗

<details>
<summary>UDP 通常用於哪種類型的資料傳輸？</summary>
串流影片與即時資料傳輸
</details>

<details>
<summary>TCP 的三向交握流程是什麼？</summary>
用戶端傳送 SYN，伺服器回覆 SYN-ACK，用戶端再傳送最後的 ACK
</details>

<details>
<summary>網路傳輸中的「封包」是什麼？</summary>
網路上可以傳輸的最小資料單位
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
