---
title: 'SQLite 實作訪客紀錄：記憶體資料庫、建表、Prepared Statement、關閉連線的順序'
description: '用 SQLite 幫 WebSocket 伺服器寫一份訪客紀錄，示範為什麼 SQLite 比 MySQL 更適合小型專案，用記憶體資料庫、serialize 建表、db.run／db.each 讀寫資料，並拆解實際部署時撞到的三個真實錯誤：SQL 語法逗號、記憶體資料庫重建、關閉順序卡死的除錯過程。'
date: 2026-08-24
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 40
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - SQLite
    - Database
    - WebSocket
    - SQL
    - PreparedStatement
    - SIGINT
    - InMemoryDatabase
    - GracefulShutdown
---

# SQLite 實作訪客紀錄：記憶體資料庫、建表、Prepared Statement、關閉連線的順序

> [[39-database-overview|前面]]講完關聯式資料庫的基本概念，這一節要動手把資料庫接進實際專案：幫[[38-creating-a-websocket-connection|已經寫好的]] WebSocket 伺服器加一份訪客紀錄。目前每次有人連線只是把資料 `console.log` 出來，資料並沒有真的留下來，這一節要用 SQLite 把這些資料實際寫進資料庫。

## 為什麼選 SQLite

SQLite 不是功能最強、速度最快的資料庫，但它是使用率最高的資料庫，原因是它可以直接依附在應用程式裡，不需要另外安裝、啟動一個獨立的服務。像 MySQL 這類資料庫，還得額外架設服務、設定密碼、維護連線帳號，光是把資料庫跑起來就是一件麻煩事。SQLite 是可攜式的，附加到應用程式裡就能直接用，這也是這一節選用它的原因。

第一步先安裝套件：

```bash
npm install sqlite3
```

## 建立記憶體資料庫

在 `index-ws.js` 裡引入 `sqlite3` 並建立資料庫實體：

```javascript
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');
```

`:memory:` 代表這個資料庫只存在記憶體裡，不會寫進硬碟。如果想把資料實際寫成一個檔案，只要把這個字串換成路徑（例如 `./fullstackfrontend.db`）即可，檔案副檔名不一定要是 `.db`，只是慣例上這樣命名比較容易辨識。

用記憶體資料庫最大的取捨是伺服器一旦重啟，資料就會全部消失；換來的好處是不用額外處理「資料表是否已經存在」這種狀態檢查，每次啟動都可以直接重新建表。這也是為什麼即使有 JavaScript 原生的 Map、Set 可以拿來存資料，這一節還是選擇寫進資料庫：資料庫用結構化的方式儲存資料，查詢起來遠比手刻一套物件結構簡單。

## 建立資料表

用 `db.serialize()` 包住建表的邏輯，確保這段程式碼先執行完，之後的查詢才不會對著一張還沒建好的表發送：

```javascript
db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});
```

SQL 指令依照慣例一律用大寫（`CREATE TABLE`），跟資料本身或欄位名稱區分開來，讀起來才清楚哪些是語言本身的關鍵字。這張 `visitors` 表只有兩個欄位：`count` 記錄當下的連線人數，型別是整數；`time` 記錄發生的時間，型別是文字。SQLite 對時間沒有專屬型別，只當成一般文字儲存，比起 MySQL 那種內建時間型別要陽春一些，但也因此更單純，這裡直接靠 SQLite 內建的 `datetime('now')` 函式產生時間字串即可，不需要額外處理時區轉換這類複雜問題。

## 寫一個查詢的輔助函式

為了不用每次都重複寫同一段 SQL，這裡包一個 `getCounts` 函式，用 `db.each` 逐筆取出 `visitors` 表裡的所有資料：

```javascript
function getCounts() {
    db.each('SELECT * FROM visitors', (error, row) => {
        console.log(row);
    });
}
```

`db.each` 跟前面的 `db.run` 不同，它會針對查詢結果的每一列都呼叫一次回呼函式，適合用在需要把每一筆資料都拿出來處理的情境。

這裡也帶出一個資料庫安全性的重點：永遠不要讓使用者端直接執行任意 SQL，因為只要有人能存取資料庫，就能刪除資料表、讀走所有資料，甚至比拿到伺服器的 SSH 存取權限還危險，因為不需要再處理登入、讀取權限這些步驟。實務上應該用像這樣包好的固定查詢（也就是 prepared statement），把使用者能執行的操作限制在一個明確的範圍內，而不是讓外部輸入直接拼進 SQL 字串裡。

## 伺服器關閉時清乾淨資料庫連線

資料庫連線跟伺服器一樣，用完一定要明確關閉，不然連線會一直留著，連線數用完就會出問題。這裡寫一個 `shutdownDB` 函式，在關閉前先把當天所有的訪客紀錄印出來，再呼叫 `db.close()`：

```javascript
function shutdownDB() {
    getCounts();
    console.log('Shutting down db');
    db.close();
}
```

但光寫好這個函式還不夠，因為沒有任何地方呼叫它。伺服器程式本身並不知道自己什麼時候被中止，所以需要監聽 `SIGINT`（也就是 `Ctrl+C` 送出的中斷訊號），在收到訊號的當下手動觸發清理流程：

```javascript
process.on('SIGINT', () => {
    wss.clients.forEach(function each(client) {
        client.close();
    });

    server.close(() => {
        shutdownDB();
    });
});
```

這裡的順序很重要：先逐一關閉所有 WebSocket 客戶端連線，再關閉 HTTP 伺服器本身，最後才關閉資料庫連線。

## 在連線時寫入資料

前面把資料庫、資料表、輔助函式都準備好了，但還漏了最關鍵的一步：從來沒有真的把資料寫進資料庫過。這一步要放進 WebSocket 的 `connection` 事件裡，每當有新連線進來，就把目前的連線數與時間寫進 `visitors` 表：

```javascript
db.run(`
    INSERT INTO visitors (count, time)
    VALUES (${numClients}, datetime('now'))
`);
```

`INSERT INTO` 後面接表名與要寫入的欄位，`VALUES` 後面依序對應每個欄位實際要寫入的值。這裡的 `numClients` 是目前的連線數（來自 `wss.clients.size`），時間則直接呼叫 SQLite 內建的 `datetime('now')` 函式，不需要在 JavaScript 端自己組時間字串。

## 部署時遇到的三個真實錯誤

程式碼寫完不代表就一定能跑，實際部署時依序踩到了三個常見的坑，正好可以當作除錯的參考。

第一個錯誤是 SQL 語法本身漏打逗號，導致 `CREATE TABLE` 執行失敗；這種語法錯誤在 SQL 字串裡因為沒有編輯器的即時檢查，特別容易漏掉，仔細核對每個欄位定義之間有沒有逗號分隔是排查的第一步。

第二個錯誤是伺服器不正常關閉（沒有走過 `SIGINT` 清理流程）後重新啟動，因為資料庫是建立在記憶體裡，資料表在重啟時本該被重新建立一次；但如果程式在中途只跑到一半就崩潰，反而可能出現資料表結構跟預期不一致、甚至報錯說資料表已經存在這類矛盾狀況。

第三個錯誤最棘手：按下 `Ctrl+C` 之後伺服器卡住沒有反應，觀察到 Node.js 跳出「監聽器數量過多」的警告，代表某個地方沒有正確釋放資源。這種情況下，可以先用 `pkill node` 強制把卡住的行程砍掉，再回頭排查。追下去後發現問題出在 WebSocket 連線本身沒有被關閉，導致連線持續佔用，使得 `SIGINT` 處理常式永遠沒辦法真正跑完。整個流程其實同時開著三種連線：WebSocket 連線、HTTP 伺服器連線、資料庫連線，三種都要依序妥善關閉，缺一個都會卡住整個關閉流程，這也是為什麼前面的 `SIGINT` 監聽要先逐一 `client.close()`、再 `server.close()`、最後才 `shutdownDB()`。

## 部署到正式伺服器

程式碼修好、確認本機測試沒問題後，一樣透過 git 推送，交給伺服器上的排程自動拉取：

```bash
git add .
git commit -am "Add database logging"
git push
```

到這裡，訪客紀錄的邏輯就完整串起來了：安裝 SQLite、建立資料庫與資料表、在每次連線時寫入一筆紀錄，聽起來只是三個步驟，但實際做下來會發現藏著不少需要留意的細節，尤其是資源清理跟關閉順序這種容易被忽略的地方。

## 複習

### SQLite 最主要的優勢是什麼？

SQLite 是使用率最高的資料庫，具備可攜性，可以直接附加到應用程式裡使用，能在任何平台上運作，不需要像 MySQL、Redis 那樣另外架設獨立的服務、設定密碼與維護連線。

### 怎麼建立一個記憶體版的 SQLite 資料庫？

使用 `const db = new sqlite.Database(':memory:')`，其中 `sqlite` 是引入的 `sqlite3` 模組。

### `db.serialize()` 這個方法的作用是什麼？

確保資料庫的設定指令依序執行，並保證資料表在任何查詢執行之前就已經建立好。

### 為什麼不應該讓使用者端直接執行任意 SQL？

因為使用者端可能藉此刪除資料表、讀取敏感資料，或執行未經授權的資料庫操作，是很大的安全風險。

### 相較於 MySQL 這類資料庫，SQLite 為什麼具有高度可攜性？

SQLite 可以直接附加在應用程式裡，不需要另外安裝獨立服務。MySQL 等資料庫通常需要架設服務、設定密碼並持續維護，SQLite 則可以在任何平台上不需要額外設定就能運作，這也是它雖然不是最強大或最快的資料庫，卻是使用率最高的資料庫的原因。

## 小測驗

<details>
<summary>相較於其他資料庫，使用 SQLite 最主要的優勢是什麼？</summary>
可攜性，能直接附加到應用程式裡使用
</details>

<details>
<summary>怎麼建立一個記憶體版的 SQLite 資料庫？</summary>
const db = new sqlite3.Database(':memory:')
</details>

<details>
<summary>在 SQLite 中，用來建立新資料表的 SQL 指令是什麼？</summary>
CREATE TABLE
</details>

<details>
<summary>在 SQLite 資料庫中，用來執行 SQL 指令的方法是什麼？</summary>
db.run()
</details>

<details>
<summary>db.serialize() 這個方法的作用是什麼？</summary>
確保資料庫的指令依序執行
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
