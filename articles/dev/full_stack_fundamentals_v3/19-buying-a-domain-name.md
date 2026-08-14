---
title: '實際購買網域名稱：用 Namecheap 買下網域，設定 DigitalOcean 名稱伺服器與 A 記錄'
description: '用 Namecheap 買下網域完整走一遍：解釋為什麼選它而非 Google Domains、哪些頂級網域（.org、.edu、.gov、.mil）受限，並把名稱伺服器換成 DigitalOcean、新增根網域與 www 的 A 記錄，用 dig、nslookup 驗證設定生效，最後介紹網域信箱轉寄技巧。'
date: 2026-08-14
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 19
chapter: 'The Internet'
tags:
    - frontendMasters
    - fullStackFundamentals
    - DomainName
    - Namecheap
    - DigitalOcean
    - Nameserver
    - ARecord
    - TLD
    - EmailForwarding
    - DomainPrivacy
    - TwoFactorAuthentication
---

# 實際購買網域名稱：用 Namecheap 買下網域，設定 DigitalOcean 名稱伺服器與 A 記錄

> [[18-dns-and-urls|上一篇]]講完 DNS 如何把網域轉成 IP 位址、名稱伺服器的角色，以及 A 記錄的用途，這一節終於要實際動手：買一個網域，把名稱伺服器換到 DigitalOcean，新增 A 記錄，把網域跟伺服器真正串接起來。

## 為什麼選 Namecheap

課程選擇 Namecheap 作為網域註冊商（registrar），主要原因是它的功能相對完整：SSL、電子郵件代管等附加服務都能直接在 Namecheap 買到，而且不會強迫推銷。曾經試過用 Google Domains，但價格比 Namecheap 貴，而且整個購買過程一直被積極推銷加購項目，這點特別讓人反感。Namecheap 雖然介面稱不上精緻，但價格通常是市場上數一數二便宜的，選擇也很多。

這門課不需要用到註冊商附加販售的 SSL 或商業信箱等服務：SSL 會在後面用免費的方式自己設定，信箱的部分則會示範免費的電子郵件轉寄功能。

## 哪些頂級網域是受限制的

國家層級的頂級網域（TLD）通常歸該國家所有，並向 ICANN 登記，例如 `.ru` 屬於俄羅斯。不過這不是絕對規則：國家可以把自己的頂級網域使用權出售，換取金錢收益。曾經一度爆紅的 `.io`、`.ly` 就是典型例子，`.ly` 其實是某個小島國持有的國家頂級網域，因為唸起來剛好貼合英文單字的尾音，才被大量新創公司（例如 bit.ly、fast.ly）搶著拿來當品牌網域使用。

除了國家頂級網域，還有幾個頂級網域是被明確限制、不能隨意註冊的：

- **`.org`**：只有登記立案的組織（通常是非營利機構）才能申請
- **`.edu`**：僅限合法立案的教育機構使用
- **`.gov`**：只有合法的政府單位可以使用
- **`.mil`**：僅限軍事單位使用

除了這些受限制的頂級網域和被企業買下的專屬頂級網域，Namecheap 上可以選的頂級網域組合非常多，多到很容易在挑選好玩的網域名稱時卡關。

## 購買流程與帳號安全

購買時可以順便加購網域隱私保護（domain privacy）選項。結帳完成時系統會顯示一筆註冊費用，這筆費用正是[[18-dns-and-urls|上一篇]]提過要付給 ICANN 的手續費，用來維持整個名稱伺服器系統的運作。

像 Namecheap 這類提供網域服務的業者，正式名稱叫做註冊商（registrar），因為它們負責把網域登記在使用者名下、確認所有權。網域帳號的安全性非常重要：務必使用高強度密碼並開啟兩步驟驗證。過去曾發生帳密被盜、導致知名網域被轉走的案例，一旦網域落入他人手中，攻擊者很容易複製出一模一樣的網站外觀，再放上假的登入頁面大規模竊取帳號密碼，因此網域相關的管理權限應該盡量限縮在少數人手上，安全設定要盡可能嚴謹。

網域命名的唯一硬性規則，就是要好記或好玩，最好兩者兼具。買完之後，就可以在網域管理頁面看到自己名下所有的網域清單。

## 把名稱伺服器換成 DigitalOcean

買到網域後，接下來要做的事情依序是：先在 Namecheap 買下網域，接著把名稱伺服器換成 DigitalOcean 的名稱伺服器，最後在 DigitalOcean 新增 A 記錄。網域的名稱伺服器可以繼續留在 Namecheap 不動，但這裡刻意示範換到 DigitalOcean，是為了讓大家實際體驗一次搬移名稱伺服器的過程，之後在 DigitalOcean 端管理 DNS 記錄也比較方便。

DigitalOcean 提供的三組名稱伺服器分別是 `ns1.digitalocean.com`、`ns2.digitalocean.com`、`ns3.digitalocean.com`。回到 Namecheap 的網域管理頁面，找到名稱伺服器設定區塊，選擇自訂 DNS（Custom DNS），把這三組名稱伺服器依序貼上並儲存。

這個操作的意義是：Namecheap 依然是網域的註冊商，代表網域登記在使用者名下、負責處理續約等事務；但實際的 DNS 管理（也就是網域要指向哪裡）改交給 DigitalOcean 的名稱伺服器負責，DigitalOcean 就此成為這個網域真正的權威解析來源。設定儲存後，這項變更需要一點時間在網際網路上傳播，通常最多幾分鐘就能完成。

## 新增 A 記錄，把網域指向伺服器

名稱伺服器換好之後，回到 DigitalOcean 把網域加進來，並指向對應的 Droplet（如果帳號底下有多台 Droplet，要注意選對正確的那一台）。加入網域後，還需要手動新增 DNS 記錄，才能真正建立起網域與伺服器之間的對應關係。

這裡要新增兩筆 A 記錄：

- **`@`**：代表根網域本身（例如 `jemstack.lol`），一律指向伺服器的 IP 位址
- **`www`**：雖然不算正式的子網域，但依照慣例（源自 World Wide Web 的縮寫），通常也會額外設定一筆，讓使用者不論輸入根網域還是加上 `www` 前綴都能連到同一台伺服器

兩筆記錄都設定完成後，網域理論上就已經跟伺服器連結起來了。不過此時直接連到這個網域通常還看不到任何內容，因為伺服器本身還沒有設定任何服務可以回應請求。

## 用 dig、nslookup 驗證設定是否生效

DNS 變更需要時間在全球的名稱伺服器之間傳播，可以用[[16-network-tools-exercise|前面]]學過的網路工具驗證進度：

```bash
dig jemstack.lol
nslookup jemstack.lol
```

如果查詢結果還沒反映出新設定的 IP 位址，代表變更尚未完全傳播，這種情況下不用擔心，通常只是需要多等一下；如果暫時等不及，也可以先直接用伺服器的 IP 位址測試連線，不必依賴網域名稱。

## 順手設定網域信箱轉寄

Namecheap 有一個實用的功能，可以幫網域底下的任何信箱地址設定轉寄（forwarding），甚至可以設定萬用字元（wildcard）當作全部信箱的通用轉寄規則，把寄到這個網域下任何地址的信件，統一轉寄到自己真正在用的信箱。這種轉寄地址只能收信、不能用來寄信，如果需要真正寄送郵件，才需要額外付費申請完整的信箱服務。

一個實用的技巧，是幫每個註冊使用的服務建立專屬的轉寄地址，例如 `amazon@自己的網域.com`、`frontendmasters@自己的網域.com`，這樣一旦收到垃圾信，就能立刻知道信箱資訊是從哪個服務外洩出去的，還能透過萬用字元把所有變化都收進同一個信箱。不過如果轉寄地址取得跟某些機構名稱太相似（例如取名包含銀行字樣），有時候反而會讓對方誤以為帳號遭到冒用，需要額外花時間解釋這只是單純的轉寄地址，而不是詐騙帳號。

## 複習

### 選擇網域註冊商時，有哪些關鍵考量？

價格是否便宜、是否會過度推銷加購項目、是否內建 SSL 與電子郵件代管等功能、網域管理是否方便，以及是否提供網域隱私保護、兩步驟驗證等安全機制，還有電子郵件轉寄功能是否好用。

### 有哪些受到限制的頂級網域（TLD）？

`.org`（限登記立案的組織）、`.edu`（限合法教育機構）、`.gov`（限政府單位）、`.mil`（限軍事單位），這些都只有符合特定資格的組織或機構才能申請。

### 更換名稱伺服器的目的是什麼？

把 DNS 管理權轉移到另一個服務（例如 DigitalOcean），讓它成為網域對應 IP 位址的權威解析來源，這樣能提供更彈性的 DNS 管理與設定方式。

### 網域管理中的 A 記錄是什麼？

A 記錄把網域名稱對應到特定的 IP 位址，讓根網域（`@`）或 `www` 子網域可以正確指向特定伺服器，藉此把網路流量正確導向該伺服器。

### 網域信箱轉寄策略是什麼？

利用自己的網域建立客製化的信箱別名（例如 `service@自己的網域.com`），並把這些信件轉寄到主要使用的信箱，這樣可以追蹤信箱資訊外洩的來源、保護隱私，也能不用額外付費就打造出專業的客製化信箱地址。

## 小測驗

<details>
<summary>ICANN 在網域註冊中扮演什麼角色？</summary>
收取費用來維持名稱伺服器系統的運作
</details>

<details>
<summary>哪些頂級網域（TLD）受到限制、需要符合特定資格才能申請？</summary>
.edu、.gov、.mil
</details>

<details>
<summary>網域設定中的「@」符號代表什麼？</summary>
根網域名稱
</details>

<details>
<summary>網域註冊商（registrar）的主要功能是什麼？</summary>
把網域名稱登記在擁有者名下
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
