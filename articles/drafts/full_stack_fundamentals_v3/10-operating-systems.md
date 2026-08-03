---
title: '作業系統怎麼選：Windows 與 Unix 的差異、Solaris／Linux／BSD 三大分支，以及三個組成部分'
description: '拆解 Windows 與 Unix 兩大作業系統陣營的差異，說明 Solaris、Linux、BSD 這三個 Unix 主要分支的關係，解釋為什麼 Ubuntu 是伺服器首選，並用「程式與工具、核心、檔案或程序」三個部分拆解 Unix 運作模型，理解為何一切都是檔案或程序、並遵循 POSIX 標準。'
date: 2026-08-09
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 10
chapter: 'Operating Systems'
tags:
  - frontendMasters
  - fullStackFundamentals
  - OperatingSystem
  - Unix
  - Linux
  - Ubuntu
  - Kernel
  - POSIX
  - BSD
---

# 作業系統怎麼選：Windows 與 Unix 的差異、Solaris／Linux／BSD 三大分支，以及三個組成部分

> [[09-buying-a-vps|上一篇]]實際選好了 Ubuntu LTS 作為伺服器作業系統，這一節先暫停 VPS 的實作，回頭把「作業系統」這個概念講清楚：Windows 與 Unix 兩大陣營的差異、Unix 底下的幾個主要分支，以及 Unix 之所以強大的核心設計哲學。

## Windows 與 Unix：兩大作業系統陣營

作業系統基本上分成兩大類：Windows 系統與 Unix 系統。談到伺服器用的作業系統時，Windows 這邊選擇不多，基本上就是 Windows Server；一般消費者用的 Windows（目前是 Windows 11）雖然技術上也能拿來跑伺服器，但並不建議這麼做，因為 Windows Server 才是針對伺服器用途特別優化過的版本。

相較之下，Unix 陣營的變化就豐富得多，幾乎有各種你想像得到的版本（flavor）。

## Unix 的三個主要分支

Unix 底下主要有三個分支：

- **Solaris**
- **Linux**
- **BSD**

其中 Linux 是大家最熟悉的一支，也是版本數量最多的一支。Linux 是 Unix 更親民、更容易上手的版本，內建了更多指令。常見的 Linux 發行版包括 Debian、CentOS、Ubuntu、Fedora、Red Hat、Alpine、Arch 等等，因為高度可客製化，幾乎每種需求都能找到對應的 Linux 版本。

課程選擇 Ubuntu，是目前最常見、最受歡迎的作業系統，用 Ubuntu 幾乎不會出錯。BSD 這一支則比較少被提起，但它衍生出 FreeBSD，而 macOS 正是以 FreeBSD 為基礎打造的系統，這也是為什麼終端機上用到的指令，在 Ubuntu 上也同樣能用：因為兩者的根源都是 Unix。

Linux 另一個很大的優點是大多數發行版都是開放原始碼、免費使用（Red Hat 是少數例外）。

## Unix 作業系統的三個組成部分

不只是電腦，手機、汽車、智慧手錶等各種裝置背後都在跑某種作業系統。以 Unix 而言，作業系統由三個明確的部分組成：

- **程式與工具（programs / utilities）**：像先前練習用過的 `mkdir`、`rmdir`、`vi`，都是內建在作業系統裡的程式與工具
- **核心（kernel）**：作業系統的核心部分，負責與硬體溝通，是整個系統中最複雜的一層
- **檔案或程序（file / process）模型**：Unix 底層運作的核心邏輯

核心這一層屬於電腦工程（computer engineering）而非軟體工程（software engineering）的範疇，這堂課只會停留在 shell 與使用者層級（user land），不會深入到核心與硬體程式設計。

## Unix 最有趣的設計：一切都是檔案或程序

Unix 之所以強大，關鍵在於它的運作模型非常單純：系統裡的一切，不是檔案就是程序，沒有第三種東西。所有的工具程式本質上都是檔案，並且遵循 POSIX 標準，具備標準輸入（standard in）、標準輸出（standard out）、標準錯誤（standard error）。

正因為這套標準一致，同一組工具與指令才能無縫地在手機、macOS、Ubuntu、Fedora 等各種系統上通用，這也呼應了[[06-servers|前面]]提到的「伺服器不限於特定硬體」的概念：只要遵循同一套 Unix 核心邏輯，不同系統之間就能共用同一套操作方式。

## 回顧目前的 VPS 設定進度

在進入下一個主題（安全性）之前，先回顧一下目前為止的 VPS 設定：作業系統選了 Ubuntu 的 LTS 版本；Droplet 大小則選最小、最便宜的規格即可，這堂課不需要太強的運算能力。像 4 美元的規格在舊金山資料中心買不到，但紐約買得到；如果想選最便宜的方案，可以改選紐約資料中心。課程本身仍選擇留在舊金山，運算費用大約每月 6 美元，但透過課程連結註冊可以拿到免費額度，只要別忘了關閉用不到的伺服器，通常不會實際產生費用。

伺服器建好之後，下一個要解決的問題是：該怎麼登入這台伺服器？雖然可以用密碼，但更好的做法是使用 SSH 金鑰。

## 複習

### Unix 作業系統底下的三大分支是什麼？

Solaris、Linux 與 BSD。

### Unix 作業系統模型中最有趣的一點是什麼？

一切不是檔案就是程序，所有工具程式都遵循 POSIX 標準，具備標準輸入、標準輸出與標準錯誤。

### 為什麼課程選擇 Ubuntu 作為伺服器的作業系統？

因為 Ubuntu 是目前最常見、最受歡迎的作業系統，穩定可靠，選它幾乎不會出錯。

### macOS 與 Ubuntu 上的終端機指令為什麼可以通用？

因為兩者的根源都是 Unix：macOS 是以 BSD 衍生出的 FreeBSD 為基礎，而 Ubuntu 屬於 Linux，兩者都遵循同一套 Unix 核心邏輯與指令規則。

## 小測驗

<details>
<summary>Unix 作業系統的三大主要分支是哪些？</summary>
Solaris、Linux 與 BSD
</details>

<details>
<summary>依 Unix 作業系統架構，組成系統的三大部分是什麼？</summary>
程式與工具（Programs/Utilities）、核心（Kernel），以及檔案／程序模型（File/Process Model）
</details>

<details>
<summary>下列哪個 Linux 發行版被描述為最常見、最受歡迎？</summary>
Ubuntu
</details>

<details>
<summary>Unix 工具程式在輸入輸出上遵循什麼標準？</summary>
POSIX 標準
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
