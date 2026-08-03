---
title: 'SSH 金鑰流程總複習：known_hosts 是什麼，以及用 SSH config 省去每次打 -i 的麻煩'
description: '重新走一遍 SSH 金鑰產生、加進 DigitalOcean 到登入伺服器的完整流程，解釋第一次連線出現主機驗證提示的原因與 known_hosts 檔案的作用，並示範修改 SSH config、用 ssh-add 把私鑰加進 macOS 鑰匙圈，讓 SSH agent 自動嘗試金鑰，之後不必每次都手動指定身份檔案。'
date: 2026-08-11
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 14
chapter: 'Operating Systems'
tags:
  - frontendMasters
  - fullStackFundamentals
  - Security
  - SSH
  - KnownHosts
  - SSHConfig
  - SSHAgent
  - Keychain
  - DigitalOcean
---

# SSH 金鑰流程總複習：known_hosts 是什麼，以及用 SSH config 省去每次打 -i 的麻煩

> [[13-setup-ssh-keys-for-login|上一篇]]已經完整跑過一次 SSH 金鑰產生、加進 DigitalOcean、登入伺服器的流程。這一節先帶著大家重新走一遍整個流程確認沒有人掉隊，接著補上兩個上一篇沒細講的部分：連線時跳出的主機驗證提示背後在做什麼，以及怎麼用 SSH config 省去每次都要手動指定私鑰路徑的麻煩。

## 重新走一遍 SSH 金鑰流程

先進入 `.ssh` 目錄，用 `ssh-keygen` 產生一組新金鑰，命名為 `fsfe`：

```bash
cd ~/.ssh
ssh-keygen
```

完成後用 `ls` 確認目錄裡出現兩支金鑰檔案：私鑰 `fsfe` 與公鑰 `fsfe.pub`（如果目錄裡金鑰檔案太多不好辨識，可以用 `grep` 過濾出想找的那一支）。接著用 `cat` 印出公鑰內容並複製：

```bash
cat fsfe.pub
```

回到 DigitalOcean，把複製的公鑰貼進新增 SSH Key 的欄位，取一個自己看得懂的名稱即可，只要記得它對應到本機的哪一支金鑰。接著照先前流程選擇資料中心、Ubuntu LTS 版本，勾選剛新增好的 SSH 金鑰，幫 Droplet 取一個主機名稱，就可以建立伺服器；建好之後 Droplet 上就會預先安裝好對應的公鑰。

伺服器上線後，複製它的 IP 位址，用 `-i` 指定私鑰路徑並登入：

```bash
ssh -i ~/.ssh/fsfe root@<伺服器IP>
```

第一次建立的使用者永遠是 `root`，代表擁有管理者權限。

## 第一次連線的主機驗證提示與 known_hosts

第一次連上一台新伺服器時，系統會跳出提示，說這台主機的身分無法確認、詢問是否要繼續連線。這個提示的意義是：你的電腦從來沒有連過這台伺服器，沒辦法確定對方就是你原本想連的那一台。這個機制的重要性在於，伺服器對應的 IP 位址可能會變動——假設要連線到 frontendmasters.com，沒有這層檢查的話，根本無從確認這個網域背後的伺服器有沒有被別人劫持、換成完全不同的機器。電腦是靠比對伺服器自己的 SSH 金鑰來做這個判斷，只要是第一次遇到某台伺服器，就一定會跳出這個提示，這時候通常可以放心輸入 `yes`；但如果是連線到一台已經連過的伺服器卻突然又跳出這個提示，就代表情況不對，這時候不該貿然選 `yes`，需要先確認狀況。

要離開伺服器連線，輸入 `exit` 即可，或者直接關掉終端機視窗也會一併中斷 SSH 連線。想查看自己過去連過哪些伺服器，可以看 `known_hosts` 這個檔案：

```bash
cat ~/.ssh/known_hosts
```

這個檔案記錄了曾經用 SSH 金鑰連過的每一台電腦，本質上是額外的一層安全防護：只要 `known_hosts` 已經記錄過某台伺服器，之後再連線就不會重複跳出驗證提示。

## 用 SSH config 省去每次指定身份檔案的麻煩

每次連線都要手動打 `-i` 指定私鑰路徑，其實可以透過修改 SSH 設定檔省略。用 `vi` 或 `vim` 打開（開啟後）`.ssh` 目錄底下的 `config` 檔案（如果目錄裡還沒有這個檔案，直接新建一個即可）：

```bash
vi ~/.ssh/config
```

設定檔裡要確認兩個項目都設為 `yes`：`AddKeysToAgent`，以及（在 macOS 上）`UseKeychain`。設定好之後，就可以用 `ssh-add` 把私鑰加進系統的鑰匙圈：

```bash
ssh-add --apple-use-keychain fsfe
```

`--apple-use-keychain` 這個參數只在 macOS 上需要，這是因為 Apple 系統本身的一些特殊處理方式；Windows 使用一般標準的 SSH 設定方式即可。金鑰加進鑰匙圈之後，之後連線伺服器就不用再手動指定 `-i` 了：

```bash
ssh root@<伺服器IP>
```

這對需要同時管理多台伺服器、擁有多支金鑰的情境特別有用：把所有金鑰都加進身份清單後，SSH 會自動依序嘗試每一支金鑰，直到找到能成功連線的那一支為止，不需要自己記得每台伺服器對應哪一支金鑰。

如果連線時在 22 埠卡住、出現解析錯誤（parse error），通常代表貼上的公鑰內容有誤，可能缺了一行或多了空格，這時候檢查一下貼上的內容，必要時刪掉重新產生一支新的金鑰即可。SSH 金鑰可以想產生多少支就產生多少支，只是要記得追蹤每一支金鑰的用途，不然容易搞混。

## 複習

### 用什麼指令產生 SSH 金鑰？

`ssh-keygen`。

### 一般會產生哪兩種 SSH 金鑰檔案？

私鑰與公鑰，公鑰的檔名固定以 `.pub` 結尾。

### 怎麼查看公鑰的內容？

用 `cat` 指令加上公鑰檔名即可，例如 `cat fsfe.pub`。

### macOS 上用什麼指令把 SSH 金鑰加進鑰匙圈？

`ssh-add --apple-use-keychain [私鑰檔名]`。

### 用指定身份檔案的方式登入遠端伺服器，指令怎麼下？

`ssh -i ~/私鑰路徑 root@伺服器IP`。

## 小測驗

<details>
<summary>用什麼指令可以查看公鑰的內容？</summary>
cat 金鑰檔名.pub
</details>

<details>
<summary>SSH 的 known_hosts 檔案有什麼作用？</summary>
記錄過去曾經用 SSH 連線過的電腦
</details>

<details>
<summary>macOS 上用什麼指令把 SSH 金鑰加進鑰匙圈？</summary>
ssh-add --apple-use-keychain 金鑰名稱
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
