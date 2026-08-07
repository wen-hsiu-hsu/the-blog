---
title: 'Git 也是靠雜湊運作的：在伺服器上建一把 GitHub 專用金鑰，改用本機開發後 push、pull 就好'
description: 'Git 底層同樣仰賴 SHA-1 雜湊，發明者 Linus Torvalds 也打造了 Linux。記錄如何在伺服器建立獨立的 gh_key、加進 GitHub、設定 SSH config 讓連線自動套用金鑰，並用 ssh -Tv 排查連線問題，之後改回本機開發，用 git push、pull 跟伺服器同步。'
date: 2026-08-17
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 25
chapter: 'Git'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Git
    - GitHub
    - SSH
    - SSHConfig
    - Hashing
    - SHA1
---

# Git 也是靠雜湊運作的：在伺服器上建一把 GitHub 專用金鑰，改用本機開發後 push、pull 就好

> 從[[09-buying-a-vps|買下 VPS]]一路[[24-virtual-server-and-pm2|把 Nginx 跟 Node.js 串接起來]]，前面所有程式碼都直接寫在伺服器上，用 `vi` 逐行編輯。這一節要把版本控制串進來：在伺服器上建立一把專屬於 GitHub 的 SSH 金鑰，把程式碼推上 GitHub，之後就能改回在本機用習慣的編輯器開發，靠 `push`、`pull` 跟伺服器同步，不必再繼續困在 `vi` 裡工作。

## Git 底層也是靠雜湊運作的

版本控制系統除了最常見的 Git，還有 Subversion、Mercurial 這類工具。Git 本身底層也是靠[[12-hashing-with-salt|前面提過的]]雜湊機制運作，用的是 SHA-1，這也再次印證了雜湊技術幾乎無所不在。另一個有趣的巧合是：Git 的發明者正是 Linus Torvalds，也就是打造 Linux 的同一個人，兩套如今幾乎每天都在仰賴的重要技術，出自同一位工程師之手。

## 在伺服器上建立一把 GitHub 專用金鑰

延續前面練習過的[[14-ssh-key-recap|SSH 金鑰產生流程]]，要幫 GitHub 建立一把獨立的金鑰。切換到家目錄再執行 `ssh-keygen`，是為了避免金鑰不小心產生在應用程式的 Git 目錄裡：

```bash
cd ~
ssh-keygen
```

金鑰命名為 `gh_key`，執行完 `ls` 應該能看到一組公鑰與私鑰檔案。

## 把公鑰加進 GitHub

到 GitHub 帳號的 Settings 頁面，不需要進到特定的 repository，直接找到「SSH and GPG keys」設定區塊，新增一把金鑰。這裡要複製的同樣是公鑰內容，跟前面加進[[13-setup-ssh-keys-for-login|DigitalOcean]]時的做法一致。

## 新增遠端儲存庫，並設定 SSH 使用正確的金鑰

回到伺服器上的應用程式目錄，加入遠端儲存庫：

```bash
git remote add origin <GitHub 上複製的網址>
```

接下來這一步最容易出錯：需要讓 SSH 知道連到 GitHub 時該用 `gh_key` 這把金鑰，而不是其他既有的金鑰。做法是編輯 `.ssh/config` 檔案：

```bash
vi ~/.ssh/config
```

設定內容大致如下：

```
Host github.com
    HostName github.com
    IdentityFile ~/.ssh/gh_key
```

這裡有個真實發生過的失敗經驗：編輯這個設定檔時，千萬不要加上 `sudo`。這個檔案本來就屬於一般使用者自己，用 `sudo` 反而會讓檔案擁有權變得不對，導致連線一直失敗、跳出公鑰驗證失敗的錯誤，而且錯誤訊息不會直接告訴你問題出在權限上，很容易誤以為是自己哪裡打錯字，反覆檢查了老半天才找到真正的原因。

## 用 ssh -Tv 測試連線是否成功

設定好之後，可以直接試著推送：

```bash
git push origin main
```

如果沒有跳出任何錯誤，就代表金鑰設定正確。但如果推送失敗，與其瞎猜到底是金鑰設定錯了還是哪裡打錯字，更有效的做法是直接測試 SSH 連線本身：

```bash
ssh -Tv git@github.com
```

這個指令會嘗試連線，並把 SSH 實際使用了哪把金鑰、驗證過程發生了什麼事情，完整印出來，能清楚看出問題到底出在哪一步。這個測試指令同樣適用於[[13-setup-ssh-keys-for-login|連線到 DigitalOcean 伺服器]]，只要遇到「permission denied publickey」這類看不出原因的錯誤，都可以先用這個指令排查。

如果測試時看到「authenticity of host」這種提示，這其實是正常現象，代表這是第一次連線到 GitHub，[[14-ssh-key-recap|前面提過的]] `known_hosts` 機制正在確認這是不是真的要連線的目標，直接輸入 `yes` 繼續即可，不代表金鑰或設定有問題。

## 常見卡關情境的救命指令

課程額外整理了幾個容易在操作過程中卡住時可以救急的指令：

- **停止一個關不掉的程序**：`pkill <process>`，適合遇到程序吃滿記憶體、又不確定它從哪裡冒出來、`Ctrl+C` 也無法中止時使用，另外開一個終端機視窗直接把整個程序砍掉
- **在 vim 裡儲存一個唯讀檔案**：`:w !sudo tee %`，適合已經在 `vi` 裡編輯了老半天，才發現自己一開始忘記加 `sudo`、檔案存不進去的情境。這個指令的原理是把目前緩衝區的內容透過標準輸入，交給另一個新開的、具備 `sudo` 權限的行程，由 `tee` 讀取輸入內容，寫回原本的檔案（`%` 代表目前正在編輯的檔名），藉此繞過原本因為權限不足而無法儲存的限制
- **用數字格式查看檔案權限**：`stat -c %a <file_name>`，比起 `ls -la` 顯示的 `rwx` 格式，直接看數字（例如 `644`）在某些情境下會更直覺

## 改回本機開發

一切設定完成、確認可以正常 `push` 之後，接下來的程式碼就不需要再直接在伺服器上手寫了：可以把儲存庫 clone 到本機，用習慣的編輯器開發，寫完再推上 GitHub，最後在伺服器端 `pull` 下來即可。這也是為什麼前面沒有花更多時間深入鑽研 `vi` 的細節，因為接下來的開發流程，會回到本機這種更趁手、更符合平常工作習慣的工具環境。

## 複習

### Linus Torvalds 開發的版本控制系統是什麼？

Git。

### Git 使用哪一種雜湊演算法？

SHA-1。

### 用什麼指令產生 SSH 金鑰？

`ssh-keygen`。

### 把 SSH 金鑰加進 GitHub 時，該複製哪一把金鑰？

公鑰。

### 用什麼指令可以測試與 GitHub 的 SSH 連線？

`ssh -Tv git@github.com`。

## 小測驗

<details>
<summary>Linus Torvalds 開發的版本控制系統是什麼？</summary>
Git
</details>

<details>
<summary>Git 使用哪一種雜湊演算法？</summary>
SHA-1
</details>

<details>
<summary>怎麼產生一把 SSH 金鑰？</summary>
ssh-keygen
</details>

<details>
<summary>把 SSH 金鑰加進 GitHub 時該複製哪一把金鑰？</summary>
公鑰
</details>

<details>
<summary>在 Git 中新增一個遠端儲存庫要用什麼指令？</summary>
git remote add origin [URL]
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
