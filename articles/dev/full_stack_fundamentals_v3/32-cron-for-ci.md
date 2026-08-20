---
title: '用 cron 打造假 CI/CD：bash script 自動 git pull，crontab.guru 排程'
description: '不靠 Spinnaker 這類重型工具，只用 shebang、chmod、git pull 三行程式碼寫出 bash script，搭配 cron 每分鐘自動從 GitHub 拉取最新程式碼，用 crontab.guru 破解排程語法、syslog 搭配 logger 除錯，體驗簡化版 CI/CD 運作原理。'
date: 2026-08-20
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 32
chapter: 'Continuous Integration & Deployment'
tags:
    - frontendMasters
    - fullStackFundamentals
    - CICD
    - Cron
    - Crontab
    - BashScript
    - Shebang
    - Syslog
    - Logger
    - CrontabGuru
---

# 用 cron 打造假 CI/CD：bash script 自動 git pull，crontab.guru 排程

> [[31-continuous-integration-and-deployment|上一篇]]講完 CI/CD 的概念，也提到打造一個能運作的管線其實只需要幾行程式碼加上一支「碼錶」。這一節就動手做一個簡化版：不寫任何測試，純粹用 cron 定時執行一支 bash script，讓伺服器自動從 GitHub 拉取最新程式碼。

## Unix 上的碼錶：cron

要打造一個定時執行任務的機制，Unix 系統上要用的工具是 cron。cron 的核心概念其實很單純：讓某件事在固定的時間間隔重複執行，沒有更複雜的原理。如果把這個概念跟一支「從 GitHub 拉取程式碼」的 shell script 結合在一起，讓 cron 每隔一段時間就執行一次，就等於做出了一個簡化版的 CI/CD 流程：伺服器會不斷自動把最新的程式碼拉下來。

這裡要特別強調：這個範例完全沒有寫任何測試，本質上只是一個取巧的做法，用來示範 CI/CD 的運作原理，絕對不該直接套用在正式環境上。之所以稱它為「假的 CI/CD」，正是為了強調這一點。不過即使只是示範用途，這個做法確實能帶來一個實際的好處：往後在本機寫完程式碼推上 GitHub 之後，伺服器會自動同步拉取，不必再每次都手動登入伺服器執行 `git pull`。跟[[30-unattended-upgrades|更早之前]]用 `unattended-upgrades` 讓系統套件自動更新不同，這裡的排程完全是自己手動兜出來的 cron job，藉此體會排程機制實際運作的細節。

## Shell script 入門：從一支簡單的腳本開始

在正式寫自動拉取程式碼的腳本之前，先透過一個簡單範例熟悉 shell script 的基本寫法。每一支 shell script 開頭都要指定直譯器的位置，可以用 `which bash` 找到 bash 的實際路徑：

```bash
which bash
```

接著建立一支測試腳本：

```bash
vi test.sh
```

內容大致如下：

```bash
#!/usr/bin/bash
read -p "What is your name? " name
echo "Have a great day, $name"
```

第一行 `#!/usr/bin/bash`（俗稱 shebang，也就是井字號加驚嘆號）用來指定這支腳本該用哪個直譯器執行；`read -p` 用來接收使用者輸入、並存進一個變數；`echo` 則是把內容印出來。寫完存檔後，要先賦予執行權限才能真正執行：

```bash
chmod 700 test.sh
./test.sh
```

執行後會先詢問名字，輸入後就會印出對應的問候訊息。整個過程不需要另外開一個 Node.js 或 Python 這類完整的程式語言直譯器，就能直接在系統上執行一小段邏輯，這正是 shell script 的實用之處：雖然不適合拿來寫複雜龐大的系統，但作為簡單自動化的工具相當方便。

## 寫一支自動拉取 GitHub 程式碼的腳本

熟悉基本寫法之後，回到原本的目標：寫一支從主分支拉取最新程式碼的腳本。新建一支腳本：

```bash
vi github.sh
```

內容只需要兩行：

```bash
#!/usr/bin/bash
git pull origin main
```

一樣要記得賦予執行權限：

```bash
chmod 700 github.sh
```

這樣就完成了一支能夠自動拉取 GitHub 最新程式碼的腳本，整個流程比想像中簡單許多。

## 用 crontab.guru 看懂 cron 語法

有了腳本之後，接下來要決定多久執行一次。cron 排程的語法乍看是一串數字加上一段路徑，其實每個欄位分別代表：分鐘、小時、日期、月份、星期幾，最後接著要執行的指令與腳本路徑。

第一次看到這種語法很容易卡關，這時候可以借助一個很好用的網站 crontab.guru，只要輸入想要的排程頻率（例如「每 10 分鐘」「星期二」），它就會直接顯示對應的 cron 語法，不需要自己一格一格慢慢對照著猜。如果想要每分鐘執行一次，最簡單的寫法就是把所有欄位都留成星號 `*`，代表不限制任何條件、每分鐘都執行。

## 設定 crontab

要編輯 cron 排程，使用 `crontab -e`：

```bash
crontab -e
```

第一次執行會詢問要用哪個編輯器，這裡選擇 Vim。在檔案最下方新增一行：

```
* * * * * sh /var/www/app/github.sh
```

存檔離開後，這個排程就會生效，每分鐘執行一次 `github.sh`。

## 排查為什麼看起來沒有生效

cron 排程實際執行的紀錄，可以在系統紀錄檔 `/var/log/syslog` 裡找到：

```bash
sudo tail -f /var/log/syslog
```

`tail -f` 能持續追蹤檔案的最新內容，方便即時觀察。不過即使確認 cron 任務確實有在觸發，畫面上卻可能完全看不到任何輸出，這是因為排程本身並沒有指定要把輸出結果導向哪裡。

進一步排查後會發現兩個常見的疏漏：

1. **腳本裡沒有指定執行目錄**：`git pull origin main` 這一行本身沒問題，但 crontab 執行腳本時，預設的工作目錄並不是應用程式所在的目錄，而是類似根目錄的位置，所以腳本必須先明確切換到正確的路徑，才能真正對到想要的 Git 儲存庫：

    ```bash
    #!/usr/bin/bash
    cd /var/www/app
    git pull origin main --ff-only
    ```

    額外加上的 `--ff-only`（僅接受快轉合併）能確保拉取時只接受可以直接快轉的變更，不會跟本機既有的修改產生衝突，也不需要額外處理 rebase 之類的狀況。

2. **沒有把輸出結果導向紀錄檔**：即使腳本本身執行成功，如果沒有明確指定輸出位置，cron 預設就會把這些輸出直接捨棄，不會留下任何痕跡。這時候需要在 crontab 那一行的結尾，把標準輸出與標準錯誤一併導向 `logger`：

    ```
    * * * * * sh /var/www/app/github.sh 2>&1 | logger -t github.sh
    ```

    `2>&1` 是把標準錯誤（stderr）重導向到標準輸出（stdout）的簡寫寫法，讓兩者合併輸出；再透過管線把這些輸出交給 `logger` 這個工具，寫進系統紀錄檔。`-t` 用來替這筆紀錄加上一個好辨識的名稱（例如這裡的 `github.sh`），方便之後在紀錄檔裡搜尋定位，不加也可以，只是加了會讓紀錄更好閱讀。

修正這兩處之後，再用 `tail -f /var/log/syslog` 觀察，就能看到腳本確實定期在執行、正常從 GitHub 拉取最新內容。

## 完成後的效果

設定完成之後，往後只要在 GitHub 上的儲存庫推送新的變更，伺服器就會在下一次排程觸發時自動把最新程式碼拉下來，不再需要每次都手動連上伺服器操作。從這一步開始，往後撰寫程式碼可以完全在本機用習慣的編輯器（例如 VS Code）進行，不必再直接在伺服器上寫程式。

## 複習

### cron 的基本概念是什麼？

cron 是 Unix 上的工具，用來在固定的時間間隔重複執行某個任務或指令。

### 在 bash 中，shell script 開頭怎麼寫？

用 shebang（`#!/usr/bin/bash`）放在腳本的第一行，用來指定執行這支腳本要用的直譯器。

### crontab 指令搭配 `-e` 參數的作用是什麼？

用來開啟 crontab 檔案，編輯目前設定的 cron 排程。

### shell script 裡的 `2>&1` 這個寫法作用是什麼？

把標準錯誤（stderr）重導向到標準輸出（stdout），讓兩者合併輸出。

### 怎麼比較容易看懂 cron 排程的時間語法？

可以利用 crontab.guru 這個網站，它能幫忙把想要的執行頻率直接轉換成對應的 cron 語法。

## 小測驗

<details>
<summary>用什麼指令可以編輯 cron 排程？</summary>
crontab -e
</details>

<details>
<summary>shell script 開頭的 hash bang（#!/bin/bash）作用是什麼？</summary>
指定執行這支腳本時要使用的直譯器
</details>

<details>
<summary>有哪個網站能協助理解 cron 排程的語法？</summary>
crontab.guru
</details>

<details>
<summary>在 Unix 系統中，用什麼指令可以變更檔案權限？</summary>
chmod
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
