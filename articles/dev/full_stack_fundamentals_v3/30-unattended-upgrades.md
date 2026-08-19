---
title: 'unattended-upgrades 安裝教學：Ubuntu 伺服器自動套用 LTS 更新，多數資安事件只是懶得補洞'
description: '許多資安事件（尤其是 WordPress 站台）其實只是因為系統沒有定期更新，這一節安裝 unattended-upgrades 讓 Ubuntu 伺服器在背景自動套用 LTS 穩定更新，用 dpkg-reconfigure 完成設定，不必再自己動手寫 cron job 排程更新流程。'
date: 2026-08-19
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 30
chapter: 'Security'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Security
    - UnattendedUpgrades
    - Apt
    - LTS
    - DpkgReconfigure
---

# unattended-upgrades 安裝教學：Ubuntu 伺服器自動套用 LTS 更新，多數資安事件只是懶得補洞

> [[29-permissions-and-chmod|前面]]搞懂了權限的數學邏輯，也在[[28-firewall-and-ufw|更早之前]]設定好防火牆。這一節接著補上安全性防護的最後一塊：讓伺服器的軟體永遠保持在最新狀態，而且不必自己動手。

## 沒有更新軟體，是駭客入侵最常見的原因之一

許多資安事件與入侵事件，追根究柢其實只是因為系統沒有定期套用修補程式。像 WordPress 這類系統之所以頻繁遭到入侵，很多時候並不是因為攻擊手法有多高明，而是因為使用者根本沒有把系統維持在最新版本，這件事原本並不困難，卻經常被忽略。

## 用 unattended-upgrades 讓系統自動更新

與其每次都得手動確認、手動更新，Ubuntu 提供了一個 apt 套件可以直接把這件事自動化：`unattended-upgrades`。裝好之後，系統會在背景定期自動套用更新，完全不需要人為介入，只需要事先完成一次性的設定即可。

安裝方式很直接：

```bash
sudo apt install unattended-upgrades
```

有些 Ubuntu 版本可能已經預先裝好這個套件，執行安裝指令前不妨先確認一下，省得白忙一場。

## 用 dpkg-reconfigure 完成設定

安裝好之後，接著要進行設定，確保更新程序會以低優先權（low priority）的方式在背景執行，也就是趁系統相對閒置的時候才進行，盡量不影響正常運作：

```bash
sudo dpkg-reconfigure unattended-upgrades
```

執行後會出現一個提示視窗，內容大致是提醒使用者定期套用更新的重要性，並詢問是否要自動下載並安裝穩定版本的更新。這裡選擇的方向，正好呼應[[10-operating-systems|前面談過]] Ubuntu LTS（Long Term Support，長期支援版）的選擇邏輯：永遠不會自動安裝最前緣、還沒經過充分驗證的版本，因為伺服器最重視的是穩定性，而未經充分測試的版本往往更容易出現錯誤與臭蟲。選擇「是」完成設定，這一步就大功告成了。

## 為什麼這比自己寫 cron job 方便多了

在有這類工具之前，要達成類似的自動更新機制，通常得自己寫一個 cron job（排程工作）來手動處理這整套更新流程，相對繁瑣許多。隨著 Ubuntu 與 apt 生態系持續進步，這類原本需要手動處理的工作，如今已經能透過現成的套件輕鬆解決，就像[[28-firewall-and-ufw|前面提到的]] `ufw` 把原本複雜的防火牆設定變得簡單一樣，讓伺服器維運的日常工作變得省事許多。

## 複習

### 系統沒有隨時保持更新，最主要的風險是什麼？

沒有定期修補系統，是導致入侵與資安事件最常見的原因之一。

### Ubuntu 上有哪個套件可以自動處理系統更新？

`unattended-upgrades`。

### 伺服器上應該自動安裝哪一類型的更新？

穩定版本的更新，最好來自 LTS（長期支援版）發行版，確保套用的是經過充分驗證的軟體。

### 安裝 unattended-upgrades 要用什麼指令？

`sudo apt install unattended-upgrades`。

### 在軟體發行版本的脈絡下，LTS 代表什麼？

Long Term Support（長期支援）。

## 小測驗

<details>
<summary>Ubuntu 中 unattended-upgrades 的用途是什麼？</summary>
在背景自動下載並安裝系統更新
</details>

<details>
<summary>伺服器環境建議採用哪一類型的更新？</summary>
長期支援版（LTS）更新
</details>

<details>
<summary>用什麼指令可以安裝 unattended-upgrades？</summary>
sudo apt install unattended-upgrades
</details>

<details>
<summary>unattended-upgrades 執行時是以什麼優先權層級運作？</summary>
低優先權
</details>

<details>
<summary>為什麼正式環境的伺服器會選擇 LTS（長期支援版）的 Ubuntu？</summary>
它以穩定性為優先，並提供長時間的更新支援
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
