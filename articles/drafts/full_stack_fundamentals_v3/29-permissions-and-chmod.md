---
title: 'chmod 數字背後的數學：read、write、execute 怎麼變成 4、2、1，以及最小權限原則'
description: '拆解 ls -la 顯示的 rwx 權限字元背後代表什麼、擁有者、群組、其他人這三層權限怎麼區分，並揭開 chmod 數字（例如 777、600）背後其實是 read=4、write=2、execute=1 這三個八進位數字加總而成，說明為什麼永遠不該隨手 chmod 777，而該遵守最小權限原則。'
date: 2026-08-19
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 29
chapter: 'Security'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Security
    - Chmod
    - FilePermissions
    - LeastPrivilege
    - Octal
---

# chmod 數字背後的數學：read、write、execute 怎麼變成 4、2、1，以及最小權限原則

> [[21-file-permissions|前面]]已經用過 `chmod 644` 修正 `authorized_keys` 的權限，課程練習中也曾對 GitHub 金鑰用過 `chmod 600`，但當時都只是照著指令打，沒有真正解釋這些數字是怎麼來的。這一節要補上這一塊：拆解 `chmod` 數字背後其實是一套簡單的數學。

## 用 ls -la 看懂 rwx 權限字元

[[03-command-line-solution|前面用過]]的 `ls -la`，除了列出隱藏檔案，也會顯示每個檔案的權限資訊，像是這樣的一串字元：

```
drwxrwxr-x 3 jem jem 4096 Mar  9 04:28 .
drwxr-xr-x 4 jem jem 4096 Mar  8 22:11 ..
drwxrwxr-x 8 jem jem 4096 Mar  9 15:50 .git
-rw-rw-r-- 1 jem jem  204 Mar  8 22:21 app.js
-rw-rw-r-- 1 jem jem  198 Mar  8 22:12 package.json
```

這串看似隨機的字元其實每個位置都有明確意義：

- **`r`**：read（讀取），代表允許讀取這個檔案
- **`w`**：write（寫入），代表允許修改這個檔案
- **`x`**：execute（執行），代表允許執行這個檔案

這三個權限字元會依序分成三組，分別對應：

- **擁有者（owner）**：檔案的擁有者，以 `app.js` 這個範例來說就是使用者 `jem`
- **群組（group）**：使用者所屬的群組，如果目前只加入了 `sudo` 群組，這裡看到的往往就是那個群組
- **其他人（everyone else）**：除了擁有者跟同群組成員之外，系統上的其他任何人

以 `app.js` 這一行 `-rw-rw-r--` 為例：擁有者（`jem`）可以讀寫，但不能執行，因為 `app.js` 不是直接被執行的檔案，而是要透過 `node` 來啟動；群組成員同樣可以讀寫、不能執行；其他人則只能讀取，不能寫入。搞懂這三組字元各自對應誰、代表什麼權限之後，這些原本看起來像亂碼的符號，其實都有清楚的邏輯可循。

## chmod 數字背後的數學：4、2、1

`chmod` 常常搭配數字使用，例如 `644`、`600`、`777`，這些數字並不是隨便湊出來的，而是有一套簡單的八進位（base 8）數學規則：

- **read（讀取）= 4**
- **write（寫入）= 2**
- **execute（執行）= 1**

把想要授予的權限對應數字加總起來，就會得到最終要 `chmod` 的那個數字。例如同時擁有讀、寫、執行權限，就是 `4 + 2 + 1 = 7`；只有讀寫權限、沒有執行權限，就是 `4 + 2 = 6`；完全沒有任何權限，就是 `0`。

依照這套邏輯，可以整理出下面幾組常見組合：

```
owner   group   everyone else
rwx     rwx     rwx
(4+2+1) (4+2+1) (4+2+1)
  7       7       7

rw-     ---     ---
(4+2+0) (0+0+0) (0+0+0)
  6       0       0
```

理解了這套換算方式，回頭再看 `chmod 777`，就會明白這代表擁有者、群組、其他人全部都同時擁有讀、寫、執行權限，等於是完全對所有人開放；而課程稍早在設定 GitHub 金鑰時用過的 `chmod 600`，代表的則是只有擁有者能讀寫，群組與其他人完全沒有任何權限，這正是 SSH 對金鑰檔案權限要求特別嚴格的原因。這套數字系統雖然一開始看起來很像亂碼，但只要理解背後的加法邏輯，用數字表示權限反而比每次都寫「讀寫執行、讀寫執行、讀寫執行」要簡潔得多。

## 為什麼不要隨手 chmod 777

`chmod 777` 是很多人遇到權限問題卡關時，第一個想到的「解法」：乾脆讓所有人對這個檔案擁有完整的讀寫執行權限，問題自然就消失了。但這種做法通常不是好主意，應該盡量避免。

真正該遵循的原則是最小權限原則（least privilege）：只給予真正需要用到的權限，盡可能把權限範圍限縮在擁有者自己、或是真正需要操作這個檔案的人身上。原因很直接：如果伺服器上的其他使用者擁有過多不必要的權限，即使他們並非惡意，只是不小心誤刪了某個檔案，事後也很難釐清是哪個環節出了問題。這就跟為人父母的道理很像：如果把一個玻璃花瓶放在小孩伸手可及的地方，結果花瓶被打破了，那是自己沒有做好防範。同理，如果賦予某個使用者過大的權限，對方哪怕只是因為網路上有人開玩笑說「你試試看跑這個指令」，就真的執行了會清空整台伺服器的指令，責任終究還是在給出這份權限的人身上，所以任何時候設定使用者權限，都應該堅持給予對方完成任務所需要的最小權限即可，不多給一分。

## 複習

### 檔案權限中的字母 rwx 分別代表什麼？

r 代表讀取（read）、w 代表寫入（write）、x 代表執行（execute），用來描述一個檔案或目錄各自擁有哪些權限。

### Unix / Linux 系統中，檔案權限是怎麼被劃分的？

分成三組：擁有者（owner）、群組（group）、其他所有人（everyone else）。

### 在八進位權限系統中，讀取、寫入、執行分別對應哪個數字？

讀取（read）是 4、寫入（write）是 2、執行（execute）是 1。

### chmod 600 這個權限設定代表什麼意思？

只有擁有者可以讀取與寫入這個檔案，其他任何使用者都沒有任何權限。

### 檔案與系統權限設定應該遵循什麼原則？

遵循最小權限原則，只給予使用者完成任務所需要的最低限度存取權限。

## 小測驗

<details>
<summary>chmod 600 通常代表什麼意思？</summary>
只有擁有者擁有讀取與寫入權限
</details>

<details>
<summary>在檔案權限中，「x」代表什麼？</summary>
執行（Execute）
</details>

<details>
<summary>在標準的 Unix 權限模型中，檔案權限是怎麼被劃分的？</summary>
擁有者、群組、其他所有人
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
