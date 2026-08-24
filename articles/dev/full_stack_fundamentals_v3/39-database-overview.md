---
title: '關聯式資料庫概觀：為什麼不能只把資料存成一個檔案，用資料表、主鍵、外鍵、JOIN 串接多張表查詢資料'
description: '解釋為什麼多台伺服器沒辦法共用同一個檔案儲存資料，資料庫如何同時解決檔案缺乏擴展性、缺乏結構強制力這兩個根本問題，比較關聯式資料庫與非關聯式資料庫在嚴謹度、查詢速度上的取捨，拆解關聯式資料庫的三大組成：表、欄位、記錄，並示範用主鍵、外鍵把多張表串接起來，用 SELECT 與 JOIN 寫出一個簡單的跨表查詢。'
date: 2026-08-24
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 39
chapter: 'Realtime & Databases'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Database
    - SQL
    - RelationalDatabase
    - PrimaryKey
    - ForeignKey
    - JOIN
    - NoSQL
---

# 關聯式資料庫概觀：為什麼不能只把資料存成一個檔案，用資料表、主鍵、外鍵、JOIN 串接多張表查詢資料

> [[38-creating-a-websocket-connection|前面]]把 WebSocket 從 Nginx、伺服器端一路串到前端，這一節要換個主題，回到資料儲存的基礎：為什麼需要資料庫，以及關聯式資料庫的核心概念。

## 為什麼不能只把資料存成一個檔案

檔案最大的問題是無法擴展。檔案只能存在單一硬碟上，如果今天只有一台伺服器，把資料全部存進一個檔案或許還能運作；但只要多加一台伺服器，兩台伺服器同時寫入同一個檔案就會出問題，這個做法馬上就撐不住。

檔案的第二個問題是缺乏結構的強制力。要把資料存進檔案，每個人對「該怎麼存」都可以有自己的一套想法，而這些想法之間沒有任何機制可以互相約束一致，資料存取自然就變得混亂而低效率。資料庫存在的意義，就是同時解決「多伺服器共用同一份資料」與「資料結構該長什麼樣子」這兩個檔案系統天生無法處理好的問題。

講師提到自己 CS 教授畢業前說過的一句話：工作中九成的時間都在跟資料庫讀寫打交道。這句話點出了一個事實：不管平常在做什麼，核心動作幾乎都是從某個 API 讀取資料、或是把資料寫進某個 API，而這些 API 背後接的通常又是另一個系統或資料庫。這也是為什麼資料庫在整套現代運算架構裡幾乎無所不在，因為直接讀寫硬碟的做法本來就撐不住規模。

## 關聯式資料庫 vs. 非關聯式資料庫

資料庫大致分成兩種：

- **關聯式資料庫（relational database）**：如 MySQL、SQLite、Postgres、SQL Server，甚至瀏覽器內建的 IndexedDB 也是一種。這類資料庫結構嚴謹、規則明確，對於資料該怎麼寫入與讀取有很強的規範
- **非關聯式資料庫（non-relational database）**：也就是俗稱的 NoSQL，同樣有結構，但寬鬆許多；即使叫做「NoSQL」，實際操作時多半還是要用某種查詢語言

這個取捨可以類比成用純 JavaScript 寫程式跟改用 TypeScript：加上型別系統（對應關聯式資料庫的嚴謹結構）會讓開發過程更嚴格、拋出更多錯誤，限制你能做的事，但這種限制往往是好事；而非關聯式資料庫更自由，資料可以直接丟進去、再查出來，沒有那麼多前置的結構規範。NoSQL 通常查詢速度快一些，因為不需要每次都跑過一整套結構驗證，但相對地也失去了結構帶來的保障。這一節接下來會聚焦在關聯式資料庫，因為 SQL 的語法對很多人來說是最容易卡關的地方。

## 關聯式資料庫的三大組成

關聯式資料庫由三個部分組成：

- **表（table）**：儲存一類資料的容器，例如 `users` 表
- **欄位（field / column）**：表裡的每一個資料項目，把表想成一份表格，欄位就是欄
- **記錄（row / record）**：表格裡的每一列資料

光是一張表、幾個欄位、幾筆記錄，還看不出「關聯式」這個名字的由來。當系統裡有多張表格時，需要有辦法讓它們彼此建立關聯，這正是關聯式資料庫真正的核心。

## 用主鍵與外鍵串接多張表

以簡報中的範例來看，假設系統裡有 `users`、`pets`、`food` 三張表，`users` 表裡的 `userID` 欄位是這張表的**主鍵（primary key）**。每一張表都會有一個主鍵，通常是自動遞增的數字，或是一組隨機產生的雜湊值，重點是它在該表裡是唯一的，可以用來快速查詢到特定那一列資料。

如果某張表裡出現的是另一張表的主鍵，這個欄位就叫做**外鍵（foreign key）**。以圖中的 `food` 表為例，`food` 表裡有一個 `userID` 欄位，紀錄某筆食物資料屬於哪個使用者，但單看 `food` 這張表，並不知道這個 `userID` 對應的人是誰、住在哪裡、email 是什麼；透過這個外鍵回頭查詢 `users` 表，才能把使用者的完整資訊串接回來。這就是關聯式資料庫的威力所在：把原本各自獨立、看似無關的多張表，透過主鍵與外鍵串在一起，寫查詢時就能把分散在不同表裡的資料組合成一份完整的結果。

## 用 SQL 查詢資料

SQL（Structured Query Language，結構化查詢語言）是操作關聯式資料庫的語言。最基本的查詢是從一張表裡挑出符合條件的資料：

```sql
SELECT * FROM users WHERE name = 'Jem';
```

`*` 是萬用字元，代表要取回這張表裡的所有欄位；`WHERE` 後面接篩選條件，這裡是查出 `users` 表裡 `name` 欄位等於 `Jem` 的那一列。

實務上更常見的情境是要同時取用多張表的資料，這時候要用 `JOIN` 把表接在一起。JOIN 有好幾種類型，這裡只示範其中一種：查出所有喜歡的食物是 `ramen` 的使用者名稱：

```sql
SELECT food.type, users.name
FROM food
LEFT JOIN users ON users.userID = food.userID
WHERE food.name = 'ramen';
```

`LEFT JOIN` 把 `food` 表與 `users` 表用 `food.userID = users.userID` 這個條件接在一起，查詢結果會把原本分散在兩張表裡的欄位（`food.type` 與 `users.name`）合併成同一份輸出，看起來就像單一張表的資料一樣。

這只是關聯式資料庫概念最基礎的示範，實際能寫出的查詢可以複雜很多，但核心邏輯不變：資料本身存放得很結構化，透過主鍵、外鍵、JOIN，把分散在多張表裡的資料重新組合起來。

## 複習

### 這一節討論了哪兩種主要的資料庫類型？

關聯式資料庫（如 MySQL、SQLite、Postgres、SQL Server）與非關聯式資料庫（NoSQL）。關聯式資料庫結構嚴謹，對資料的寫入與讀取方式有明確規範，類似 TypeScript 的型別系統；非關聯式資料庫結構較鬆散，通常查詢速度較快，但缺乏關聯式資料庫那樣的結構保障。

### 關聯式資料庫的三個關鍵組成是什麼？

表（table）、欄位（field，也稱 column）、記錄（row，也稱 record）。

### 資料庫裡的主鍵是什麼？

每一列資料在該表裡的唯一識別碼，通常是自動遞增的數字或隨機產生的雜湊值，能讓資料庫快速查詢到特定那一列。

### 資料庫裡的外鍵是什麼？

某張表裡引用了另一張表主鍵的欄位，用來在不同表格的資料之間建立關聯，讓查詢時可以把它們串接起來。

### 基本的 SQL SELECT 語句長什麼樣子？

`SELECT * FROM table_name WHERE condition`，例如 `SELECT * FROM users WHERE name = 'Jem'`。

## 小測驗

<details>
<summary>這一節討論了哪兩種主要的資料庫類型？</summary>
關聯式資料庫與非關聯式資料庫
</details>

<details>
<summary>在關聯式資料庫中，什麼是主鍵？</summary>
表格中某一列資料的唯一識別碼
</details>

<details>
<summary>SQL 代表什麼？</summary>
結構化查詢語言（Structured Query Language）
</details>

<details>
<summary>在關聯式資料庫中，什麼是外鍵？</summary>
另一張表的主鍵，用來在不同表格之間建立關聯
</details>

<details>
<summary>關聯式資料庫表格的主要組成有哪些？</summary>
表（table）、欄位（column）、記錄（row）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
