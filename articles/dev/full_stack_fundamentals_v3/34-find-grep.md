---
title: 'find 找檔案位置、grep 找檔案內容：兩個指令搭配 sudo !! 快捷技巧，快速排查系統問題'
description: '拆解 find 的語法邏輯（去哪找、找什麼類型、名稱是什麼），實際搜尋 /var/log 底下的所有 log 檔，用 sudo !! 快速補上權限而不必重打整串指令，再理解 find 找檔案位置、grep 找檔案內容的分工，搭配 ps aux 與管線示範 grep 怎麼從一大坨程序清單裡精準揪出想找的那一個。'
date: 2026-08-21
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 34
chapter: 'Continuous Integration & Deployment'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Find
    - Grep
    - Zgrep
    - Sudo
    - Ps
    - Pipe
---

# find 找檔案位置、grep 找檔案內容：兩個指令搭配 sudo !! 快捷技巧，快速排查系統問題

> [[33-logging-streams-redirection|上一篇]]拆解了重導向符號與標準串流的原理，這一節接著介紹兩個排查系統時經常會用到的工具：`find` 用來找檔案位置，`grep` 用來找檔案內容，兩者搭配起來，面對再龐大的輸出結果也能快速定位到真正需要的資訊。

## find：找檔案位置在哪裡

`find` 的語法乍看有點陌生，但拆解開來其實邏輯很直覺：去哪裡找、要找什麼類型的東西、名稱是什麼。基本結構大致是：

```bash
find <要搜尋的位置> -type <f 或 d> -name <名稱樣式>
```

其中 `-type` 用來指定要找的是檔案（`f`）還是目錄（`d`），`-name` 則是要比對的名稱樣式。這個語法不算特別直覺，需要多練習幾次才會變成肌肉記憶，值得留一份參考筆記備查。

## 實際搜尋 /var/log 底下的所有 log 檔案

以[[33-logging-streams-redirection|前面提過的]] `/var/log` 為例，可以用 `find` 找出這個目錄底下所有以 `.log` 結尾的檔案：

```bash
find /var/log -type f -name "*.log"
```

`find` 是一個唯讀操作，不會對系統造成任何改動，即使指令打錯也不需要擔心會弄壞什麼。實際執行時很可能會遇到權限被拒絕（permission denied）的錯誤，原因很單純：這個指令還沒有加上 `sudo`。

## sudo !!：重跑上一條指令、自動補上 sudo

這時候有個相當實用的小技巧：`sudo !!`。這個寫法會直接重新執行歷史紀錄裡的上一條指令，並自動在前面加上 `sudo`，不需要重新把整串指令打一次：

```bash
sudo !!
```

這是一個會用上非常多次的小技巧，很值得記起來。

## 搜尋目錄：找出所有名為 log 的資料夾

`find` 同樣可以用來搜尋目錄，例如找出整個系統裡所有名稱為 `log` 的資料夾：

```bash
find / -type d -name log
```

這裡的 `/` 代表從系統的根目錄（root）開始搜尋，也就是整個檔案系統的最上層。從根目錄開始搜尋通常會遇到大量的權限拒絕錯誤，因為一般使用者原本就不太需要，也不建議隨意在根目錄底下四處翻找；如果真的需要查看，一樣可以用前面提到的 `sudo !!` 補上權限。這個指令看起來比實際操作起來複雜，只要記得「去哪找、找什麼類型、名稱是什麼」這個邏輯，用起來其實不難，很快就會變成不需要思考的肌肉記憶。

## grep：找檔案內容裡有什麼

`find` 負責定位檔案本身的位置，而 `grep` 則是往檔案內容裡面搜尋。`grep` 的語法大致是：要找的表達式（可以是一般字串，也可以是正規表達式）加上要搜尋的目標。額外值得一提的是 `zgrep`：它可以直接在壓縮檔案內容裡搜尋，不需要事先解壓縮，相當方便。

## 用 grep 搭配管線，從一大坨輸出裡揪出真正需要的內容

`grep` 真正大顯身手的場景，是搭配管線一起使用。以查看目前執行中的程序為例，先執行：

```bash
ps aux
```

這個指令會把系統上所有正在執行的程序全部列出來，即使系統上實際運作的服務並不多（例如只有 Nginx 跟 Node），輸出結果依然會相當雜亂，很難一眼看出真正需要的資訊。這時候只要透過[[33-logging-streams-redirection|前面提過的]]管線符號 `|`，把輸出結果交給 `grep` 過濾：

```bash
ps aux | grep node
```

這樣就能立刻篩選出只跟 Node 程序有關的那幾行，grep 會把其餘不相關的內容全部濾掉。像這樣先用一個指令產生大量輸出、再用 `grep` 過濾出真正在意的部分，是常反覆用到的組合，`grep` 本身的語法也相對容易上手：只要打上想找的關鍵字，多數情況下就已經很夠用，真的需要更精準比對時，才需要動用正規表達式。

## 複習

### find 指令的基本語法是什麼？

`find <位置> -type <f 或 d> -name <名稱樣式>`，其中位置代表要搜尋的地方（例如 `/var/log` 或 `/`），`-type` 代表要找的類型（`f` 代表檔案、`d` 代表目錄），`-name` 則是要比對的名稱或樣式。

### 怎麼快速用 sudo 權限重新執行上一條指令？

使用 `sudo !!`，會自動把上一條指令加上 `sudo` 重新執行一次。

### find 指令的 `-type f` 選項代表什麼？

代表要搜尋的目標類型是一般檔案（regular file）。

### 怎麼用 grep 過濾程序輸出的內容？

把像 `ps aux` 這類指令的輸出結果透過管線交給 `grep`，例如 `ps aux | grep node`，就能篩選出跟 Node 相關的程序資訊。

### zgrep 可以做到 grep 做不到的什麼事？

zgrep 可以直接在壓縮檔案內容裡搜尋，不需要事先解壓縮。

## 小測驗

<details>
<summary>find 指令中，用什麼參數指定要搜尋目錄？</summary>
-type d
</details>

<details>
<summary>怎麼快速用 sudo 權限重新執行上一條指令？</summary>
sudo !!
</details>

<details>
<summary>grep 指令最主要的用途是什麼？</summary>
在檔案內容裡搜尋特定的文字樣式
</details>

<details>
<summary>find 指令語法中，`-type f` 這個參數代表什麼？</summary>
只搜尋檔案
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
