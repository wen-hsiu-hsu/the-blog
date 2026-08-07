---
title: 'HTTP 請求與回應結構完整拆解：常見標頭、狀態碼分類，以及為什麼一定要改用 HTTPS 加密連線傳輸'
description: '拆解一個 HTTP 請求跟回應實際長什麼樣子，整理 User-Agent、Accept-Encoding、Set-Cookie 等常見標頭的用途，說明狀態碼第一碼分類（1xx 到 5xx）怎麼幫助快速判斷問題出在客戶端還是伺服器端，並解釋為什麼未加密的連線容易被攔截竊聽，一定要改用 HTTPS 保護資料傳輸。'
date: 2026-08-25
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 41
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - HTTP
    - HTTPS
    - HTTPHeader
    - StatusCode
    - Encryption
    - ManInTheMiddleAttack
---

# HTTP 請求與回應結構完整拆解：常見標頭、狀態碼分類，以及為什麼一定要改用 HTTPS 加密連線傳輸

> [[40-sqlite|前面]]把 WebSocket 跟 SQLite 資料庫串起來後，這一節要回頭拆解每天都在用、卻很少細看的 HTTP 協定本身：請求與回應長什麼樣子、標頭在做什麼、狀態碼怎麼分類，最後帶到為什麼一定要把連線升級成 HTTPS。這一節先建立好觀念，下一節再實際動手用 Certbot 幫網站加上 HTTPS。

## HTTP 由請求與回應組成

HTTP（HyperText Transfer Protocol，超文本傳輸協定）由兩個部分組成：請求（request）是送往伺服器的內容，回應（response）則是伺服器回傳的結果。一個實際的請求大致長這樣：

```
GET / HTTP/1.1
Host: jemyoung.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36
    (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36
Accept: text/html
Accept-Encoding: gzip, br
Accept-Language: en,en-US
```

第一行包含請求方法（`GET`）、路徑（`/`）與協定版本（`HTTP/1.1`），接著是 `Host`（要連線的網域），其餘每一行都是標頭（header）。標頭是附加在請求與回應上的一小段資訊，用來說明這次連線實際發生了什麼事，格式是簡單的 key-value：例如 `Host` 是鍵，`jemyoung.com` 是值。

## 常見的 HTTP 標頭

- **`User-Agent`**：說明是哪種裝置、瀏覽器發出的請求，伺服器可以依此判斷該裝置是否支援特定功能，例如原生 ES6/ES7 語法，如果支援就不需要再透過 Babel 轉譯
- **`Accept`**：說明這個裝置能處理哪些類型的內容
- **`Accept-Encoding`**：瀏覽器告訴伺服器自己能處理哪些壓縮格式，例如 `gzip, br` 代表瀏覽器同時能處理 gzip 與 Brotli 兩種壓縮方式；Brotli 目前還沒有內建進 Nginx，需要額外重新編譯二進位檔案，所以[[35-nginx-redirection-and-gzip|前面]]實作壓縮時並沒有涵蓋它
- **`Accept-Language`**：瀏覽器的語言設定，用來判斷該把畫面上的文字翻譯成哪種語言，不必假設每個使用者都看得懂英文
- **`Content-Type`**：說明傳送內容的媒體類型
- **`Set-Cookie`**：另一個標頭而已，用來設定 cookie 這種帶有狀態的資訊，並不是什麼特別的機制
- **`X-` 開頭的自訂標頭**：如果需要一個不屬於任何標準規範、又不想跟現有標頭名稱衝突的自訂欄位，就用 `X-` 開頭命名，內容可以自由定義

回應的格式跟請求很類似，但通常內容精簡許多，因為不需要回傳像請求那麼多的標頭資訊。回應主要會帶一個狀態碼（例如 `200`），以及伺服器類型（例如目前這台伺服器跑的是 Ubuntu 上的 Nginx）這類資訊。

## 用狀態碼的第一碼快速判斷問題

狀態碼的第一個數字就代表一個大分類：

| 分類 | 意義       |
| ---- | ---------- |
| 1xx  | 資訊性回應 |
| 2xx  | 成功       |
| 3xx  | 重新導向   |
| 4xx  | 客戶端錯誤 |
| 5xx  | 伺服器錯誤 |

看到 `5xx` 就知道問題出在伺服器這一端，看到 `4xx` 就知道是客戶端這一端的問題，不需要記得每一個細分代碼的完整定義，光靠第一碼就能快速判斷問題大致出在哪一層。常見的具體狀態碼包括：

- **`200`**：OK，請求成功
- **`301`**：永久轉址
- **`302`**：暫時轉址，代表目前先重新導向，之後可能又會恢復正常
- **`401`**：未授權
- **`500`**：伺服器內部錯誤，代表出了問題但不確定確切原因

`1xx` 這個分類相對少被提到，但同樣有實際用途，例如 `101` 代表「continue」，告訴客戶端目前收到的標頭還沒結束、後面還有更多資料要傳，可以用來加快資料傳輸的速度，這屬於效能調校的範疇。

狀態碼細分得越明確，能傳達的資訊就越多。以伺服器錯誤為例，只看到 `500` 並不能說明太多，但如果看到 `501` 這種更細分的代碼，就能得到更具體的資訊；[[23-setup-proxy-pass|前面]]遇到 Nginx 能正常連上、但實際應用程式沒有啟動時看到的 `502`，就是靠狀態碼本身區分出「Nginx 正常運作、但後端應用程式沒有回應」這種更精確的狀況，不需要額外的說明文字，光憑狀態碼本身就傳達了大量資訊。

成功回應的狀態碼也有更細緻的區分：`POST` 請求對應的是新增或寫入資料的動作，語意上更精準的成功狀態碼其實是 `201`（Created），代表資源已成功建立；不過實務上很多人習慣一律回傳 `200`，同樣代表成功，只是少了「這是一筆新建立的資源」這層更精確的語意。就像 `401` 跟 `403` 都代表某種形式的權限問題，但兩者的意義並不完全相同，選用更精確的狀態碼能讓 API 的行為更容易被理解。

## 為什麼一定要用 HTTPS

目前這些請求與回應都是在完全沒有加密的情況下傳輸的。回想[[16-network-tools-exercise|前面]] traceroute 練習裡看到的，一個請求要經過好幾個節點才能抵達目的伺服器，如果中間任何一個節點上有惡意的第三方，就可以直接讀取所有經過的資料。這種攻擊方式叫做中間人攻擊（man-in-the-middle attack）：只要一台設定不當的伺服器遭第三方利用，對方就能直接攔截信用卡號、密碼這些敏感資訊。

在網際網路早期，幾乎所有連線都是這樣沒有加密地明碼傳輸，現在回頭看相當危險。也因此現代瀏覽器全面要求網站使用 HTTPS，只要偵測到連線沒有加密，就會跳出警告提醒使用者這不是安全連線，這件事在早期並不是預設行為，是後來才逐漸被強制要求的。

HTTPS 用的是加密而不是[[11-security-and-hashing|前面提過的]]雜湊（hashing）：伺服器與瀏覽器各自持有一把金鑰，連線建立時彼此協商，之後所有往返的資料都會用這把金鑰加密。就算第三方在連線中途攔截封包，看到的也只會是無法解讀的亂碼，因為他們手上沒有金鑰。瀏覽器網址列上那個小鎖頭圖示，代表的就是這個連線已經受到 HTTPS 保護。

## 複習

### 組成 HTTP 的兩個部分是什麼？

請求（request，也就是送往伺服器的內容）與回應（response，也就是伺服器回傳的結果）。

### 常見的 HTTP 標頭有哪些，各自的用途是什麼？

`User-Agent` 用來識別瀏覽器或裝置類型，`Accept-Encoding` 說明支援的壓縮格式，`Accept-Language` 用於決定該回傳哪種語言的內容，`Content-Type` 說明傳送內容的媒體類型，`Set-Cookie` 用來管理 cookie，而 `X-` 開頭的則是自訂標頭。

### HTTP 狀態碼的分類與各自代表的意義是什麼？

`1xx` 是資訊性回應，`2xx` 是成功，`3xx` 是重新導向，`4xx` 是客戶端錯誤，`5xx` 是伺服器錯誤。常見的例子包括 `200`（OK）、`201`（Created）、`301`（永久轉址）、`302`（暫時轉址）、`401`（未授權）、`500`（伺服器錯誤）。

### HTTPS 的用途是什麼？

加密伺服器與瀏覽器之間的連線，防止中間人攻擊。就算資料在傳輸過程中被攔截，因為沒有正確的加密金鑰，攔截到的內容也無法被解讀。

### 成功的 POST 請求建議使用哪個狀態碼？

`201`（Created），不過實務上很多開發者仍習慣直接使用 `200`（OK）。

## 小測驗

<details>
<summary>組成 HTTP 的兩個部分是什麼？</summary>
請求與回應
</details>

<details>
<summary>根據 HTTP 標準，一個成功建立新資源的 POST 請求，語意上最合適的狀態碼是什麼？</summary>
201
</details>

<details>
<summary>HTTP 標頭中 `x-` 開頭代表什麼意思？</summary>
自訂標頭
</details>

<details>
<summary>HTTP 狀態碼的第一個數字代表什麼？</summary>
回應的分類
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
