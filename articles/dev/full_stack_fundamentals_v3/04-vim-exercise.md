---
title: '命令列迷路指南與 Vim 三種模式入門'
description: '整理命令列操作中「迷路時」的求救指令，並介紹 Vim 編輯器的三種模式與基本操作，附上建立檔案並儲存離開的練習。'
date: 2026-08-06
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 4
chapter: 'Command Line'
tags:
    - frontendMasters
    - fullStackFundamentals
    - CLI
    - Vim
    - Terminal
    - VimModes
---

# 命令列迷路指南與 Vim 三種模式入門

> [[03-command-line-solution|上一篇]]示範了目錄操作練習的解答與 `rm -rf`、man page 等技巧，這一節先補上命令列操作中「迷路時」的求救指令，接著進入這堂課會用到的文字編輯器：Vim。

## 命令列迷路時的求救指令

命令列的日常操作，說穿了就是建立東西、刪除東西：執行程式、修改權限、搬移或複製檔案。但操作過程中難免會迷失方向，講師整理了幾個「卡住時」可以用的指令：

- `cd ..`：跳出目前所在目錄，移動到上一層
- `pwd`（print working directory）：印出目前所在的完整路徑，用來確認自己在哪裡
- `clear`：清空終端機畫面。這裡值得注意的是，`clear` 並不會刪除歷史紀錄，只是把畫面清乾淨，之後仍然可以往上捲動找到先前的輸出
- `Ctrl+C`：可以中斷幾乎所有正在執行的程式。雖然理論上有可能卡在一個迴圈裡，導致 `Ctrl+C` 也沒反應、必須直接關掉整個終端機視窗，但這種情況很少見，今天課程中會用到的 Node、bash 等工具，`Ctrl+C` 幾乎都能順利中斷
- `cd`（不加參數）：直接回到家目錄

這些指令背後呼應了[[03-command-line-solution|上一篇]]提到的心態：不需要把所有東西都背下來，重點是知道遇到問題時有哪些路可以走。

## 為什麼要學 Vim

學會了在命令列中移動、建立、刪除檔案後，接下來要談的是如何直接在命令列裡編輯檔案內容。對前端工程師來說，這塊經常是比較陌生的領域，因為大家早已習慣使用 VS Code、Sublime Text、JetBrains 系列或 Notepad++ 這類編輯器。這些工具功能強大，有自動補全、可以在裡面直接執行指令，甚至能在編輯器內開啟瀏覽器。

Vim 幾乎沒有這些附加功能（雖然它也有外掛系統可以擴充），但它的核心設計哲學很單純：只想單純地編輯一個檔案，不想為此經歷太多麻煩的步驟。

Vim 剛上手時會有點不適應，因為它不使用滑鼠，操作方式也偏向一些較為隱晦的指令。但熟練之後，會發現 Vim 是編輯檔案速度最快的方式之一，這也是為什麼常常能看到有些工程師用 Vim 或 Emacs 快速地在畫面上切換、編輯，一旦雙手不需要離開鍵盤去操作滑鼠，效率自然會提升。這堂課只會涵蓋剛好夠用的 Vim 基礎，真的要深入鑽研 Vim 設定與進階用法，可以另外去找專門的課程。

## Vim 的三種模式

Vim 雖然核心操作簡單，但確實有三種模式需要先搞清楚：

- **Insert 模式**：實際輸入文字或修改內容的模式
- **Normal 模式**：Vim 開啟後預設所在的基本模式，也是隨時可以返回的「原點」
- **Command 模式**：用來搜尋、儲存、離開等操作

在這三種模式之間切換的方式：

- 按 `i` 進入 insert 模式
- 按 `ESC` 回到 normal 模式
- 輸入 `:`（冒號）進入 command 模式

## 練習：建立檔案並儲存離開

1. 切換到家目錄
2. 建立一個名為 `temp` 的目錄
3. 用 Vim 開啟一個叫做 `test` 的檔案

這裡有兩種做法：可以先用 `touch test` 建立空檔案，再用 Vim 開啟；或者直接執行 `vi test`，如果檔案不存在，Vim 會自動幫忙建立。

4. 寫入幾行文字
5. 儲存並離開

儲存並離開的方式是先確保回到 normal 模式（按 `ESC`），再進入 command 模式輸入 `:wq`：`w` 代表寫入（write，也就是儲存），`q` 代表離開（quit）。

## 複習

### 如何跳出目前所在的目錄，回到上一層？

`cd ..`

### 哪個指令可以顯示目前所在的目錄位置？

`pwd`（print working directory）

### 如何在 Vim 中進入 insert 模式？

按下 `i` 鍵

### 如何在 Vim 中儲存並離開？

先按 `ESC` 確保回到 normal 模式，接著輸入 `:wq`（冒號進入 command 模式，`w` 儲存，`q` 離開），最後按下 Enter。

### 在 Vim 中，哪個按鍵可以回到 normal 模式？

`ESC`（Escape 鍵）

## 小測驗

<details>
<summary>印出目前工作目錄的指令是什麼？</summary>
pwd
</details>

<details>
<summary>在 Vim 中要進入 insert 模式該按哪個鍵？</summary>
i
</details>

<details>
<summary>在 Vim 中要從其他模式回到 normal 模式，該按哪個鍵？</summary>
ESC
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
