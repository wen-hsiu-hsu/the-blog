---
title: '別再用 root 登入伺服器：建立新使用者、加進 sudo 群組取得權限，並手動設定 SSH 金鑰讓新帳號能登入'
description: '解釋為什麼伺服器上不能長期用 root 帳號操作，實際用 adduser 建立新使用者、用 usermod 把它加進 sudo 群組取得超級使用者權限，並手動建立 authorized_keys 檔案、把 SSH 公鑰交給新帳號，讓新使用者也能用金鑰安全登入伺服器，不再需要依賴 root 帳號操作。'
date: 2026-08-14
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 20
chapter: 'The Internet'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Linux
    - Root
    - Sudo
    - AddUser
    - Usermod
    - SSH
    - AuthorizedKeys
---

# 別再用 root 登入伺服器：建立新使用者、加進 sudo 群組取得權限，並手動設定 SSH 金鑰讓新帳號能登入

> [[19-buying-a-domain-name|前面]]把網域跟伺服器串接起來之後，這一節要處理一個從[[13-setup-ssh-keys-for-login|更早之前]]登入伺服器起就一直存在、卻先被擱置的問題：目前一直用 `root` 帳號在操作伺服器，這其實並不恰當，這一節就要建立一個專屬的一般使用者，並停止依賴 root。

## 為什麼不能一直用 root

判斷目前是不是以 `root` 身分登入，最簡單的方法就是看提示字元：終端機提示字元結尾如果是井字號（`#`，也叫 octothorpe），就代表正在以 `root` 身分操作。

`root` 是作業系統上權限最高的帳號，擁有無限制的存取能力，可以做任何事，而且完全不會做二次確認：像 `rm -rf /` 這種會刪除整個目錄的指令，`root` 一樣會照做，不會攔下來提醒。正因為 `root` 什麼都不會攔，才特別危險，這也是為什麼絕對不該長期以 `root` 身分操作伺服器；如果某項操作真的需要 `root` 權限，那正好代表這件事需要格外謹慎、多想一步再執行。

## 建立新使用者，並加進 sudo 群組

處理方式是建立一個不是 `root`、但在需要時可以取得 `root` 權限的新使用者，這種「臨時取得 root 權限」的能力稱為超級使用者（super user）權限，實際操作時是透過 `sudo` 指令完成。`sudo` 全名是 super user do，作用是讓一般使用者可以針對單一指令暫時以 `root` 身分執行，執行完畢後就恢復成一般使用者權限。原則上永遠不要直接以 `root` 身分操作，即使覺得每次都要打 `sudo` 很麻煩，這個限制存在是有道理的：盡量把權限控制在執行當下真正需要的最小範圍。

用 `adduser` 建立一個新使用者：

```bash
adduser jem
```

過程中會要求設定密碼，其餘像是姓名、電話等欄位可以視需要填寫，也可以直接按預設值略過，這些欄位其實只是 Linux 系統沿用下來的舊慣例，不影響使用。

接著要讓這個新使用者可以在需要時取得 `root` 權限，做法是把它加進 `sudo` 群組，這裡要用到 `usermod`（user modify）指令：

```bash
usermod -aG sudo jem
```

`-aG` 代表把使用者加進（append）指定的群組（group），這裡指定的群組就是 `sudo`。

## 切換使用者並驗證 sudo 權限

設定好之後，可以用 `su` 切換到剛建立的使用者：

```bash
su jem
```

每建立一個新使用者，系統都會在 `/home/` 底下自動建立一個對應的個人目錄，例如 `/home/jem`。

接下來要驗證這個新使用者是否真的擁有 `sudo` 權限，可以嘗試讀取一般使用者原本無法存取的系統日誌檔案：

```bash
sudo cat /var/log/auth.log
```

執行時系統會要求輸入密碼，如果順利看到檔案內容被完整印出來，就代表這個新使用者確實擁有 `sudo` 權限，設定成功。

## 停用 root 登入前，先讓新使用者能用 SSH 金鑰登入

新使用者確認可以正常運作後，下一步是徹底停用 `root` 的登入權限：絕對不能讓 `root` 保持對外開放，因為只要有心人士拿到 `root` 權限，就等於對整台伺服器擁有不受限制的存取能力，這正是攻擊者最想取得的東西。

但在停用 `root` 登入之前，必須先確保新使用者也能用 SSH 金鑰登入，否則會直接把自己鎖在伺服器外面。做法是在新使用者的家目錄底下建立一個 `authorized_keys` 檔案，這個檔案存放的是允許登入這個帳號的 SSH 公鑰：登入時系統會拿使用者的私鑰跟這個檔案裡的公鑰做配對驗證，驗證通過才允許登入。

實際操作上，先切換到新使用者的 home 目錄，建立 `.ssh` 目錄（如果還不存在的話）：

```bash
mkdir ~/.ssh
cd ~/.ssh
touch authorized_keys
```

這裡先用 `touch` 建立一個空檔案，而不是直接用 `vi` 編輯，是因為這時候手上還沒有可以貼進去的公鑰內容，用 `touch` 先佔位，之後可以直接切換終端機視窗、把公鑰內容貼進來，不用中途中斷編輯過程。

檔案建立好之後，要把自己的 SSH 公鑰內容貼進這個檔案。由於目前是以新使用者身分登入，還沒有辦法透過 SSH 直接連進來拿公鑰，這時候需要先切回原本的 `root` 登入階段：`root` 這邊本來就已經用同一把私鑰登入，可以直接用 `cat` 印出對應的公鑰內容並複製：

```bash
cat ~/.ssh/fsfe.pub
```

複製好公鑰內容後，切換回新使用者身分，打開剛剛建立的 `authorized_keys` 檔案，把公鑰內容貼進去並儲存：

```bash
su jem
cd ~/.ssh
vi authorized_keys
```

## 驗證新使用者可以用金鑰登入

設定完成後，先登出目前的連線階段，接著改用新使用者帳號重新透過 SSH 連線：

```bash
ssh jem@<伺服器IP>
```

如果一切設定正確，這時候就能順利用新使用者身分登入伺服器，不再需要依賴 `root`。如果登入失敗，可以依序檢查幾個常見疏漏：

- `authorized_keys` 這個檔名是否拼寫正確（檔名比較長，容易打錯）
- 貼進去的是不是公鑰內容而不是私鑰（私鑰的內容明顯比公鑰長很多）
- 是否確實登出了原本的連線階段，並用新使用者帳號重新連線到正確的 IP 位址

值得一提的是，SSH 金鑰本身其實是跟本機（自己的電腦）綁定，而不是綁定特定的伺服器使用者：同一把金鑰，只要把公鑰加進不同使用者各自的 `authorized_keys` 檔案，就可以用同一把私鑰登入伺服器上任何一個帳號。同一把 SSH 金鑰甚至可以同時用在 GitHub、不同伺服器等各種地方，不一定要為每個服務都各自建立一把新金鑰，只要留意金鑰保管得夠安全，這種做法通常是安全無虞的。

## 複習

### sudo 代表什麼，主要用途是什麼？

sudo 是 super user do 的縮寫，讓使用者可以針對特定指令暫時取得 root 權限來執行，同時讓系統平常維持在最小權限的狀態。

### 為什麼直接以 root 身分操作被認為很危險？

root 擁有不受限制的系統存取權，而且不會對任何操作做二次確認，代表使用者可能不小心刪除重要系統檔案或做出無法復原的變更，卻完全沒有安全防護攔下來。

### 在 Linux 上建立新使用者的步驟是什麼？

用 `adduser` 指令建立新使用者、設定密碼、用 `usermod -aG sudo 使用者名稱` 把使用者加進 sudo 群組，最後用 `su 使用者名稱` 切換成該使用者。

### authorized_keys 檔案是什麼、如何運作？

authorized_keys 是存放在使用者家目錄底下的檔案，用來存放允許登入這個帳號的 SSH 公鑰，登入時系統會拿使用者的私鑰跟檔案內的公鑰做配對驗證，通過才允許以安全、免密碼的方式登入系統。

## 小測驗

<details>
<summary>終端機裡的井字號（octothorpe）符號代表什麼意思？</summary>
代表目前是以 root 身分登入，這是作業系統中權限最高的等級
</details>

<details>
<summary>為什麼建議避免以 root 身分執行指令？</summary>
root 擁有不受限制的存取權限，且不會攔下任何危險指令
</details>

<details>
<summary>用什麼指令可以把使用者加進 sudo 群組？</summary>
usermod -a -G sudo 使用者名稱
</details>

<details>
<summary>哪個檔案用來存放 SSH 公鑰以供身分驗證？</summary>
authorized_keys
</details>

<details>
<summary>Linux 系統中，使用者專屬的目錄通常位於哪裡？</summary>
/home/使用者名稱
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
