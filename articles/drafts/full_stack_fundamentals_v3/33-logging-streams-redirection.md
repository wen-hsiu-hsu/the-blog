---
title: '讀 log 檔的正確工具：cat、tail -f 怎麼選，以及 POSIX 標準串流與重導向符號全解析'
description: '解釋為什麼 cat 與 tail -f 適合不同讀取情境，整理 syslog、auth.log、Nginx 日誌為什麼統一放在 /var/log/，拆解 POSIX 標準賦予每個指令的標準輸入、輸出、錯誤三個共同介面，並說明 >、>>、2>&1 這些重導向符號的作用，理解指令為何能無限串接組合。'
date: 2026-08-21
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 33
chapter: 'Continuous Integration & Deployment'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Logging
    - POSIX
    - StandardStreams
    - Pipe
    - Redirection
    - Tail
---

# 讀 log 檔的正確工具：cat、tail -f 怎麼選，以及 POSIX 標準串流與重導向符號全解析

> [[32-cron-for-ci|上一篇]]用 `tail -f /var/log/syslog` 排查 cron 排程有沒有正常執行，並靠 `2>&1` 與 `logger` 把輸出寫進紀錄檔，但當時沒有解釋這些指令與符號背後的原理。這一節就補上這一塊：為什麼要記錄日誌、怎麼選對讀取工具，以及 POSIX 標準串流與重導向符號的完整邏輯。

## 為什麼一定要記錄日誌

如果沒有把系統上發生的事情記錄下來，就完全無從得知系統是不是正常運作、出了什麼問題，只能用猜的。這正是為什麼日誌（logging）如此重要：它是唯一能讓人確實掌握系統狀態、而不是憑感覺猜測的依據。

## cat、tail -f：怎麼選對讀取日誌的工具

讀取日誌檔案有好幾種不同的方式，各自適合不同情境：

- **`cat`**：會把整個檔案內容一次全部印出來，遇到像 `syslog` 這種動輒非常龐大的檔案時，這種做法就不太實用，畫面會被大量內容洗版
- **`tail -f`**：只印出檔案最末端的內容，並持續追蹤新增的內容，讓使用者可以即時、逐行看到系統正在發生的事，這是追蹤日誌時最實用的指令，[[32-cron-for-ci|前面追蹤 cron 排程時]]就是靠這個指令即時確認排程是否正常運作

之所以會有這麼多種讀取方式，是因為使用情境本來就不一樣：有時候只需要看檔案結尾、有時候只需要看檔案開頭、有時候需要一頁一頁翻閱整份內容、有時候則需要一次看到完整內容。理解了這些不同的使用場景，就能明白為什麼系統要提供這麼多種讀取工具，而不是只靠單一一種方式應付所有情境。

## 常見的系統日誌，以及為什麼都放在 /var/log/

幾個經常需要查看的日誌檔案包括：

- **syslog**：記錄整個系統上發生的一般性事件
- **auth.log**：記錄身分驗證相關的活動，例如[[21-file-permissions|前面]]看過的登入嘗試紀錄
- **Nginx 的連線紀錄**：記錄 Nginx 處理連線時發生的狀況

這些日誌檔案一律存放在 `/var/log/` 底下。技術上檔案要放在哪裡其實沒有強制限制，但把所有日誌統一集中在同一個位置，能讓整個系統的維護與排查工作變得容易許多，這也是為什麼幾乎所有系統日誌都遵循這個慣例。

## POSIX 標準：每個指令共用的三個介面

要理解重導向符號的運作原理，得先認識一個 Unix 系統極具威力的設計：POSIX 標準（Portable Operating System Interface，可攜式作業系統介面）。POSIX 標準規定，系統上執行的每一個指令都具備三個共同的介面：

- **標準輸入（standard in）**
- **標準輸出（standard out）**
- **標準錯誤（standard error）**

每一個指令、每一個函式，都只透過這三個管道跟外界溝通，沒有例外。這個設計看似簡單，卻是 Unix 系統極其強大的關鍵：因為所有指令都遵循同一套共同的介面規格，任何指令都可以自由地跟另一個指令串接組合，不必擔心資料格式對不上。這正是為什麼熟悉命令列的人，能夠寫出一長串環環相扣的指令組合，看起來像變魔術一樣精準抓出所需要的資料，背後的原理其實就是標準輸入、標準輸出、標準錯誤這三者永遠保持一致。

## 管線與重導向符號全解析

[[16-network-tools-exercise|前面已經用過]]的管線符號 `|`（直立線），作用是把前一個指令的標準輸出，直接接到下一個指令的標準輸入，讓資料在指令之間流動，不需要另外寫入檔案再讀取。

除了管線，還有幾個重導向符號各自代表不同的行為：

- **`>`**：把輸出寫入指定的檔案，如果檔案已經有內容，會直接覆蓋掉原本的內容。例如：

    ```bash
    echo hello > foo
    cat foo
    ```

    這樣會在 `foo` 這個檔案裡寫入 `hello`。如果接著再執行一次 `echo hola > foo`，會發現 `foo` 裡的內容變成了 `hola`，`hola` 已經整個覆蓋掉原本的 `hello`。

- **`>>`**：跟 `>` 類似，但不會覆蓋原本的內容，而是把新的輸出附加（append）到檔案結尾，這正是[[32-cron-for-ci|前面寫入日誌]]時採用的方式，適合持續累積記錄、不想遺失先前內容的情境。

- **`<`**：方向跟前面兩者相反，代表把某個檔案的內容當作輸入餵給指令，這種寫法乍看比較不直覺，因為一般讀取順序習慣由左至右，但這裡卻是由右至左讀取，這門課裡比較少用到這個符號。

- **`2>&1`**：這是一個比較特殊的簡寫符號，代表把標準錯誤（第 2 號串流）重導向、合併進標準輸出（第 1 號串流），把兩者一起導向同一個地方。這正是[[32-cron-for-ci|前面排查 cron 排程]]時用來確保錯誤訊息也能一併寫進日誌檔案的做法。

## 複習

### Linux 系統中的日誌檔案通常放在哪裡？

`/var/log/`。

### POSIX 代表什麼？

Portable Operating System Interface（可攜式作業系統介面）。

### Unix 類系統中的三個標準串流是什麼？

標準輸入（stdin）、標準輸出（stdout）、標準錯誤（stderr）。

### 指令中使用雙箭頭符號（`>>`）時會發生什麼事？

會把輸出附加到檔案結尾，而不是覆蓋掉原本已經存在的內容。

### 想即時追蹤日誌檔案的變化，該用哪個 Unix 指令？

`tail -f`。

## 小測驗

<details>
<summary>Unix / Linux 系統中的日誌檔案通常放在哪裡？</summary>
/var/log/
</details>

<details>
<summary>哪個指令可以讓你即時追蹤日誌檔案的變化？</summary>
tail -f
</details>

<details>
<summary>指令中的 `>` 符號會做什麼？</summary>
把輸出寫入檔案，並覆蓋掉原本已經存在的內容
</details>

<details>
<summary>POSIX 代表什麼？</summary>
Portable Operating System Interface（可攜式作業系統介面）
</details>

<details>
<summary>哪個符號用來把輸出附加到檔案結尾，而不是覆蓋掉原本的內容？</summary>
>>
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
