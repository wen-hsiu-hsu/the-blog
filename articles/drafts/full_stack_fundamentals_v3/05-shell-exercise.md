---
title: 'Shell 是什麼：從 bash 到 zsh，設定開啟終端機時的問候語'
description: '介紹 shell 與 terminal 的差異、bash 與 zsh 兩種常見 shell、如何用 $SHELL 查詢與 source 重新載入設定檔，並附上修改 .zshrc 讓終端機每次開啟時問候的練習與 oh-my-zsh 介紹。'
date: 2026-08-07
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 5
chapter: 'Command Line'
tags:
  - frontendMasters
  - fullStackFundamentals
  - CLI
  - Terminal
  - Shell
  - Zsh
  - Bash
  - EnvironmentVariables
---

# Shell 是什麼：從 bash 到 zsh，設定開啟終端機時的問候語

> [[04-vim-exercise|上一篇]]介紹了 Vim 的三種模式，能在命令列裡直接編輯檔案。這一節要往下一層看：終端機背後真正在解讀這些指令的，其實是 shell。

## Terminal 與 Shell 的差異

Terminal 是實際在作業系統裡執行的應用程式，也就是打開之後看到的那個視窗本身。但真正負責把輸入的指令轉換成作業系統能理解的動作的，是 shell：shell 會解讀所有輸入的指令，並轉換成作業系統能執行的形式。

現代 MacBook 預設使用的是 zsh，是 bash 的一個更具擴充性的版本，目前也是業界比較偏好的選擇。不過 bash 仍然是預設值，幾乎所有基於 Unix 的作業系統上都找得到它。bash 全名是 Bourne again shell，這個雙關語名稱其實只是純粹的文字遊戲，並不是紀念哪一位真實人物。zsh 基本上被視為 bash 的一種延伸，兩者高度相容、差異不大，這堂課用到的指令在兩者之間都通用。

## 如何查詢目前使用的 shell

想知道目前用的是哪一種 shell，可以輸入 `echo $SHELL`，這會顯示目前 shell 的路徑（例如 `/bin/bash` 或 `/bin/zsh`）。`$SHELL` 是類似 `$USER`（會顯示使用者名稱）這樣的保留字，屬於系統內建的一整組環境變數捷徑，這堂課不會逐一介紹每一個，但知道它們的存在，遇到需要確認環境資訊時就能派上用場。另外也可以用 `echo $0` 直接查看目前正在執行中的 shell process，講師示範修改設定檔前就是先用這個方式確認自己用的是 zsh。

## 修改設定後要 source 才會生效

修改 shell 的設定檔後，要用 `source` 指令加上設定檔路徑，才能讓終端機套用新的設定，例如 `source ~/.bash_profile` 會重新載入 bash 的設定。這一步很容易被忽略，修改完設定檔卻發現「怎麼都沒有反應」，往往就是忘了執行 `source` 重新載入。

zsh 的設定則是存放在 `.zshrc` 這個檔案裡。許多人會搭配 oh-my-zsh 這套很受歡迎的 zsh 設定框架使用，它讓 zsh 安裝後就自帶顏色與外掛，預設值就相當完整，不需要額外調整太多東西，這也是為什麼不同人的 `.zshrc` 內容可能長得差異很大，取決於各自安裝過哪些外掛或工具（例如 git 相關的外掛）。

## 練習：讓 shell 在開啟終端機時說聲早安

1. 開啟自己的 shell 設定檔
2. 加上一行，讓 shell 在開啟新終端機時說「早安」

實際操作時，可以先用 `echo $0` 確認自己目前用的是哪個 shell（例如 zsh），再用 `vi ~/.zshrc` 打開對應的設定檔（這裡可以善用 tab 自動補全，這呼應了[[03-command-line-solution|命令列練習解答]]提過的技巧，能省下大量輸入路徑的時間）。在設定檔裡加上一行 `echo good morning`，也可以用 `$USER` 這個保留字讓內容更個人化，例如 `echo good morning $USER`。存檔離開後，打開一個新的終端機分頁，就會看到這行問候語出現。

## 修改 Shell 設定的更多可能性

這個練習本身很簡單，但背後代表的是：每次打開新的終端機，都可以讓 shell 自動執行任何想做的事，不只是印出一句問候語，也可以拿來檢查信件、顯示系統狀態、查詢天氣，或是列出目前所有開啟中的 PR，能做的事情其實非常多。這堂課不會深入這個主題，但值得知道這件事是可行的，而且效果相當實用。前面提到的 oh-my-zsh 也是一套很推薦的終端機設定工具，預設值就相當不錯。

## 複習

### Shell 是什麼，它的作用是什麼？

Shell 是在終端機裡執行的應用程式，負責解讀輸入的指令，並將其轉換成作業系統能理解的動作。

### 課程中提到的兩種常見 shell 是什麼？

Bash 與 zsh（Z shell），zsh 是較新、擴充性更好的版本，也是現代 MacBook 上使用的版本。

### 如何在終端機中查詢目前使用的 shell？

用 `echo $SHELL` 顯示目前的 shell 類型，`$SHELL` 這個變數會顯示目前 shell 的路徑（例如 `/bin/bash` 或 `/bin/zsh`），也可以用 `echo $0` 查看目前執行中的 shell process。

### 重新載入 shell 設定要用什麼指令？

用 `source` 加上設定檔路徑，例如 `source ~/.bash_profile`。

### 在終端機中輸出文字要用什麼指令？

`echo` 指令用來在終端機中顯示文字或訊息。

## 小測驗

<details>
<summary>作業系統中 shell 的主要作用是什麼？</summary>
解讀輸入的指令，並轉換成作業系統能理解的動作
</details>

<details>
<summary>目前現代 MacBook 上預設使用的是哪一種 shell？</summary>
zsh
</details>

<details>
<summary>要在終端機中顯示目前使用的 shell，該輸入什麼指令？</summary>
echo $SHELL
</details>

<details>
<summary>要重新載入 shell 設定檔，該用什麼指令？</summary>
source ~/.bash_profile
</details>

<details>
<summary>在 bash 與 zsh 中，用來輸出文字到終端機的指令是什麼？</summary>
echo
</details>

<details>
<summary>zsh 的設定通常存放在哪個檔案裡？</summary>
.zshrc
</details>

<details>
<summary>哪一套熱門的 zsh 設定框架，預設就會加上顏色與外掛？</summary>
oh-my-zsh
</details>

<details>
<summary>範例中用來在 shell 設定檔裡印出問候訊息的指令是什麼？</summary>
echo
</details>

<details>
<summary>設定 shell 在開啟終端機時自動執行指令，有什麼實際好處？</summary>
每次開啟新的終端機時，可以自動執行想要的動作，例如顯示問候語、檢查信件或狀態
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
