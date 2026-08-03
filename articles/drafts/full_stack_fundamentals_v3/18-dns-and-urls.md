---
title: 'DNS 是怎麼把網域轉成 IP 的：nslookup、dig 實測，以及 URL 結構與網域搶註爭議'
description: '拆解網域名稱系統（DNS）如何像電話簿一樣把好記的網域名稱翻譯成 IP 位址，用 nslookup、dig 實際查詢名稱伺服器、A 記錄與 CNAME 記錄的差異，並說明 URL 的完整結構（網域、子網域、TLD、路徑、查詢參數），透過 toyota.com 等真實案例談 ICANN 的網域仲裁與網域搶註爭議。'
date: 2026-08-13
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 18
chapter: 'The Internet'
tags:
  - frontendMasters
  - fullStackFundamentals
  - DNS
  - Nameserver
  - Nslookup
  - Dig
  - URL
  - TLD
  - ICANN
  - Cybersquatting
---

# DNS 是怎麼把網域轉成 IP 的：nslookup、dig 實測，以及 URL 結構與網域搶註爭議

> 有了[[17-internet-and-networking-terminology|上一篇]]TCP/UDP、封包這些基礎概念，這一節要補上最後一塊拼圖：網域名稱到底是怎麼運作的。畢竟平常瀏覽器打的是 frontendmasters.com、google.com 這類好記的名稱，而不是一長串 IP 位址，這中間到底發生了什麼事？

## DNS：把好記的名稱翻譯成 IP 位址的電話簿

網域名稱系統（DNS，Domain Name System）的作用，可以想像成一本電話簿：與其要背下 frontendmasters.com 背後那一長串 IP 位址，不如直接記住這個好記的名稱就好，google.com、netflix.com 之所以能被輕鬆記住，靠的都是 DNS 這套機制。

真正保存「名稱對應到 IP 位址」這份對照表的，是名稱伺服器（nameserver）。名稱伺服器是各自獨立運作的實體，彼此之間會互相交換資訊，這也是為什麼買下一個網域之後，不論用哪一家 ISP、哪一種網路服務，都能順利解析到正確的伺服器。如果沒有網域名稱系統，網際網路根本不可能發展到今天的規模，因為沒有人能記得住這麼多 IP 位址。

實際流程是這樣的：瀏覽器要連到 google.com 時，會先去問名稱伺服器「這個名稱對應到哪個 IP 位址」，名稱伺服器回覆對應的 IP 位址之後，瀏覽器才會拿著這個 IP 位址去跟真正的伺服器建立連線，伺服器回應的內容也只認得 IP 位址這個層級，跟瀏覽器之間的溝通同樣要透過這一層轉換。使用者眼中看到的只是「輸入網址、畫面就跑出來了」，但背後其實是好幾個各自獨立運作的單位分工合作、串接起來的結果。

## DNS 記錄的兩種常見類型

DNS 底下有兩種最常用的記錄類型：

- **A 記錄（A record）**：把一個名稱對應到一個 IP 位址，這門課接下來設定網域時會用到的就是這種
- **CNAME 記錄**：把一個名稱對應到另一個名稱，不需要額外建立一個新的 IP 位址

## 用 nslookup 查詢名稱伺服器

要查看某個網域對應到哪些名稱伺服器與 IP 位址，可以用 `nslookup`：

```bash
nslookup frontendmasters.com
```

執行之後會列出這個網域對應的一組 IP 位址。如果想實際感受一下，把查到的其中一個 IP 位址直接貼到瀏覽器網址列，同樣可以連到這個網域。frontendmasters.com 並不是只有一個 IP，而是同時對應多個 IP 位址，`nslookup` 通常只會回傳其中三個，因為大多數網域背後都不只一台伺服器在服務，全部列出來反而沒有太大意義。

商業網站幾乎不會只跑在單一伺服器上，通常會同時佈署在多台伺服器、搭配負載平衡器分流。所以每次連上 frontendmasters.com，實際上並不會知道自己被導向了哪一台伺服器，但透過 CDN 與負載平衡器的組合，系統會自動把請求導向距離最近、路徑最短的那一台；即使某個 IP 位址失效，也還有其他 IP 位址可以頂上。現在幾乎沒有商業網站只依賴單一 IP 位址，這種做法既方便擴充規模，也大幅提升了系統的韌性。

## 用 dig 深入查看 DNS 記錄

想更進一步查看實際的 DNS 記錄內容，可以用 `dig`：

```bash
dig frontendmasters.com
```

`dig` 的輸出比 `nslookup` 詳細得多，一樣會列出對應的 IP 位址，但會明確標示這些是 A 記錄：也就是前面提到的、把網域名稱對應到 IP 位址的那種 DNS 記錄。這些記錄實際上存放在名稱伺服器與網域註冊商（domain registrar）那裡。

如果 `nslookup` 的輸出出現「not authoritative」（非權威回答）的字樣，代表回應的這台名稱伺服器並不是真正持有這筆記錄的伺服器，只是從另一台名稱伺服器那裡輾轉得知的資訊，理論上這筆資訊有可能不完全準確，但通常已經是目前所知最可靠的答案。

## URL 的結構：不只是一串網址

URL 全名是 Uniform Resource Locator（統一資源定位符），作用就是標示「某個東西的所在位置」。URL 同樣是建立在規則與共同約定之上，可以拆解成以下幾個部分：

- **網域（domain）**：例如 `frontendmasters.com`
- **子網域（subdomain）**：出現在網域名稱前面、以句點分隔的部分，例如 `test`、`dev`
- **頂級網域（TLD，Top-Level Domain）**：例如 `.com`、`.net`、`.org`
- **路徑（path）**：TLD 之後的部分，前端工程師平常最熟悉的段落
- **查詢參數（query parameters）**：路徑之後、問號開始接續的部分，可以無限延伸下去

## TLD 是被買賣的：ICANN、企業專屬頂級網域與搶註爭議

TLD 如今其實是可以被企業買下來的。早期只有 `.com` 這一種，管理權掌握在 ICANN（網域名稱的治理機構）手上，每次購買網域都需要支付一筆小額費用給 ICANN，用來維持整套系統的運作。後來企業開始向 ICANN 付費，取得自己專屬的頂級網域，例如 Google 就擁有 `.google` 這個頂級網域。如今除了早期常見的 `.com`、`.net`、`.org`，還出現了 `.science`、`.best` 之類五花八門的新 TLD，網域命名的自由度比十幾年前大得多。

購買頂級網域也有爭議地帶，最典型的案例是 toyota.com：這個網域最早的持有人並不是汽車製造商豐田，而是一位姓氏正好是 Toyota、經營汽車修理廠的小生意主。這位小業主是先取得這個網域的人，但豐田汽車以「消費者可能因此混淆」為由提告，希望取得這個網域的所有權。這類案例反映出網際網路原本的精神其實更接近「先來後到、誰先取得就是誰的」，但隨著企業愈來愈積極透過法律途徑施壓、要求對方讓出網域，ICANN 在仲裁時往往也更容易傾向資源與法務團隊更充足的一方。

網域搶註（cybersquatting）則是另一種情況：如果有人買下 `microsoft.com` 這類與知名企業商標高度相關的網域，卻只拿來放垃圾廣告、完全沒有正當使用目的，微軟就有比較充分的理由主張這是惡意搶註、要求 ICANN 仲裁取回網域所有權；但如果持有人確實有正當、合法的使用目的，企業要主張搶註就困難得多。

也因為這樣，每次有新的 TLD 上線，大型企業幾乎都會立刻搶先買下所有跟自己品牌相關、可能帶有負面意涵的網域（例如某家公司搶先買下「品牌名+sucks.com」），避免這些網域落入他人手中被拿去惡搞或散布不實內容。

這類搶先佈局也延伸出實際的資安風險：假設有心人士買下類似 `help.google.com` 這種看似正規、實則夾帶惡意內容的網址（或是刻意使用視覺上容易混淆的網域，例如把字母替換成看起來相似的數字，像是把 `o` 換成 `0`），毫無戒心的使用者很容易誤信這是官方網站，進而下載到惡意軟體或洩漏帳號密碼。TLD 與網域這套系統實際上遠比表面上看起來複雜，不過這門課接下來買網域時，會盡量選擇單純、容易理解的組合。

## 複習

### 網域名稱系統（DNS）通常被拿來比喻成什麼？

一本電話簿，把好記的網域名稱對應到實際的 IP 位址。

### DNS 討論到的兩種記錄類型是什麼？

A 記錄（把名稱對應到一個 IP 位址）與 CNAME 記錄（把名稱對應到另一個名稱）。

### 用什麼工具可以查詢一個網域的名稱伺服器？

`nslookup`。

### URL 代表什麼，它的作用是什麼？

URL 是 Uniform Resource Locator（統一資源定位符）的縮寫，作用是標示某項資源的所在位置。

### URL 主要由哪些部分組成？

網域（例如 `yourdomain.com`）、子網域（網域前面以句點分隔的部分，例如 `test.yourdomain.com` 裡的 `test`）、頂級網域（TLD，例如 `.com`、`.net`、`.org`，是網域最後一段句點之後的部分）、路徑（TLD 之後的部分），以及查詢參數（路徑之後、問號開始接續的部分）。

## 小測驗

<details>
<summary>網域名稱系統（DNS）主要的功能是什麼？</summary>
把人類容易記憶的網域名稱對應到 IP 位址
</details>

<details>
<summary>DNS 討論到的兩種主要記錄類型是什麼？</summary>
A 記錄與 CNAME 記錄
</details>

<details>
<summary>URL 代表什麼？</summary>
Uniform Resource Locator（統一資源定位符）
</details>

<details>
<summary>負責治理與管理網域名稱的機構是誰？</summary>
ICANN
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
