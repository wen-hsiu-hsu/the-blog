---
title: '用 chmod 644 修正 authorized_keys 權限並停用 root 登入：關閉伺服器最後一道安全破口'
description: '實際查看 /var/log/auth.log，看見伺服器上線瞬間湧入的入侵嘗試，理解為什麼要停用 root 登入；用 chmod 644 修正 authorized_keys 權限、編輯 sshd_config 停用 root，並強調照順序驗證新使用者能登入再重啟 daemon，避免把自己鎖在伺服器外。'
date: 2026-08-15
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 21
chapter: 'The Internet'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Linux
    - Chmod
    - FilePermissions
    - SSH
    - SSHDaemon
    - AuthLog
    - RootLogin
---

# 用 chmod 644 修正 authorized_keys 權限並停用 root 登入：關閉伺服器最後一道安全破口

> [[20-create-a-user|上一篇]]建立了新使用者、把公鑰加進 `authorized_keys`，並驗證新使用者可以用 SSH 金鑰登入。這一節要修正 `authorized_keys` 的檔案權限，並正式關上最後一道破口：停用 `root` 登入。

## 先看 auth.log，理解為什麼一定要停用 root 登入

在動手之前，先看看伺服器實際承受著什麼樣的攻擊壓力。查看 `/var/log/auth.log`：

```bash
sudo cat /var/log/auth.log
```

即使是一台剛剛上線、幾乎沒做過任何事的全新伺服器，`auth.log` 裡也已經記錄了大量嘗試連線的紀錄，其中不少是「無效使用者」（invalid user）的連線嘗試，帳號名稱五花八門，攻擊者最常嘗試的帳號名稱之一就是 `root`。伺服器只要一連上網際網路，各種自動化程式就會立刻開始嘗試入侵，用常見密碼、常見帳號名稱、常見連接埠一一試探。這正是[[11-security-and-hashing|前面談安全性時]]提過的現實。只要留一點點破口，攻擊者就有機會拿下整個系統，一旦系統落入攻擊者手中，往往只能整台砍掉重練，這也是為什麼會如此強調一律使用 SSH 金鑰、不用密碼登入的原因。

停用 `root` 登入正是為了徹底堵住這個最常被鎖定的目標，因為之後再也不需要用 `root` 身分登入了。

## 修正 authorized_keys 的檔案權限

在停用 `root` 登入之前，還有一件事要先處理：SSH 對檔案權限相當講究，如果 `authorized_keys` 的權限設定不對，SSH daemon 重新啟動後可能會直接拒絕使用這個檔案。

這裡要用到 `chmod`（change file mode bits）指令來調整權限：

```bash
chmod 644 ~/.ssh/authorized_keys
```

這個指令不需要加 `sudo`。`ls -la` 顯示出來的權限資訊，代表的是檔案的讀（read）、寫（write）、執行（execute）權限，並依照擁有者（owner）、群組（group）、其他人（others）三個層級分別設定。`644` 代表的意思是：檔案擁有者可以讀寫這個檔案，但群組與其他人只能讀取、不能寫入。`authorized_keys` 本來就不是腳本，不需要任何人有執行權限，這裡的調整純粹是修正讀寫權限，確保只有檔案擁有者能修改它，其他人都只能讀取。

## 編輯 sshd_config，停用 root 登入

`/etc` 目錄底下存放的都是系統層級的設定檔，涉及這類設定通常都需要 `sudo` 權限才能修改。SSH daemon（也就是負責監聽 SSH 連線的背景程式）的設定檔在：

```bash
sudo vi /etc/ssh/sshd_config
```

這是整個流程裡風險最高的一步，一旦改錯設定，很可能直接把自己鎖在伺服器外面。也正因為如此，前面才會反覆強調要照著嚴謹的步驟走：先建立新使用者、確認新使用者的 `sudo` 權限正常運作、登出再重新用新使用者的身分登入確認一切正常，最後才輪到停用 `root` 登入這一步。如果新使用者根本無法登入就先停用了 `root`，整台伺服器就會徹底無法存取，只能刪掉重建。如果還沒完成前面所有步驟，**不要**執行這一步。

確認一切就緒後，在設定檔裡找到 `PermitRootLogin` 這一行，把值改成 `no`。這個設定檔裡還有其他可以調整的項目，例如是否強制使用 SSH 金鑰、是否允許密碼登入、要不要更換預設的連接埠等，但除非清楚知道自己在做什麼，否則不建議在這個設定檔裡隨意嘗試其他項目，很容易把自己困住。

## 重啟 SSH daemon 讓設定生效

daemon（背景常駐程式）不會主動監控設定檔的變化，只會在啟動當下讀取一次設定，之後就把這些設定保留在記憶體裡。也就是說，光是儲存 `sshd_config` 的變更並不會立即生效，必須重新啟動 SSH daemon 才能讓新設定真正套用：

```bash
sudo service sshd restart
```

如果這個指令執行後沒有把自己踢出目前的連線，就代表一切正常。

這裡有個小技巧：如果覺得每次都要打 `sudo` 很麻煩，可以用 `sudo -i` 直接切換成 `root` 身分繼續操作，不過並不建議養成這個習慣，日常操作還是應該盡量維持在一般使用者權限下進行，需要時再單獨用 `sudo` 執行特定指令即可。用 `exit` 就能跳出 `root`，回到原本的一般使用者身分。

## 驗證 root 登入確實被擋下

設定完成後，務必實際測試一次：先退出目前的連線，再嘗試用 `root` 身分重新登入，這時候應該會被拒絕，這正是設定生效的證明。

```bash
ssh root@<伺服器IP>
```

如果測試時發現不管是 `root` 還是新使用者都無法登入，也不用太緊張。回頭對照課程步驟，重新走一遍建立伺服器、建立使用者、設定金鑰的流程，把伺服器重建起來，並仔細檢查每一步是否確實執行過。這是整堂課裡最容易出錯、風險最高的一段，但只要按部就班，通常不會有問題。

## 複習

### Linux 中用來變更檔案權限的指令是什麼？

`chmod`，語法是 `chmod` 加上代表權限的數字（例如 `644`）。

### 設定檔案權限時，數字 `644` 代表什麼意思？

代表擁有者可以讀寫這個檔案，而群組與其他人都只能讀取。

### SSH daemon 的設定檔通常放在哪裡？

`/etc/ssh/sshd_config`，是 SSH daemon 設定檔的標準存放位置。

### 停用 SSH 的 root 登入有什麼目的？

避免未經授權的存取嘗試、提升伺服器安全性。`root` 是自動化攻擊最常鎖定的帳號名稱之一，既然已經有設定妥當、擁有 `sudo` 權限的一般使用者可以完成所有管理工作，直接允許 `root` 登入就是一項不必要的安全風險。

### 怎麼查看驗證紀錄、確認有哪些登入嘗試？

用 `sudo cat /var/log/auth.log` 查看驗證紀錄檔，裡面會記錄系統的驗證事件、連線嘗試、無效使用者登入紀錄等各種與安全相關的活動。

## 小測驗

<details>
<summary>Linux 中用來修改檔案權限位元的基本指令是什麼？</summary>
chmod
</details>

<details>
<summary>Linux 檔案權限中，`644` 通常代表什麼？</summary>
擁有者可讀寫，群組與其他人僅可讀取
</details>

<details>
<summary>Linux 系統中，SSH 驗證紀錄通常存放在哪裡？</summary>
/var/log/auth.log
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
