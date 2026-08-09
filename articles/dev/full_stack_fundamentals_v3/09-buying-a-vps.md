---
title: '實際購買一台 VPS：DigitalOcean Droplet 建立流程，地區與 Ubuntu LTS 作業系統怎麼選'
description: '跟著課程在 DigitalOcean 實際建立第一台 VPS：說明為什麼選擇介面更友善的 DigitalOcean 而非功能更廣的 AWS、建立 Droplet 時地區與資料中心該怎麼挑才能兼顧訪客延遲，以及為什麼正式伺服器的作業系統一律要選 Ubuntu LTS 長期支援版而不是追新版本，避免踩到未知的臭蟲。'
date: 2026-08-09
section: dev
category: Full Stack Fundamentals
series: full_stack_fundamentals
seriesTitle: 'Full Stack Fundamentals'
order: 9
chapter: 'Server'
tags:
    - frontendMasters
    - fullStackFundamentals
    - Server
    - VPS
    - DigitalOcean
    - Droplet
    - CloudComputing
    - Ubuntu
    - DevOps
---

# 實際購買一台 VPS：DigitalOcean Droplet 建立流程，地區與 Ubuntu LTS 作業系統怎麼選

> [[08-server-management|上一篇]]解釋完雲端運算、虛擬化與 VPS 的關係後，這一節終於要動手買一台真正的 VPS：在 DigitalOcean 上建立一顆 Droplet，並決定地區與作業系統。

## 為什麼選 DigitalOcean 而不是 AWS

課程選擇 DigitalOcean 作為 VPS 供應商，而不是功能更廣的 AWS。AWS 提供的服務種類遠比 DigitalOcean 多，像是 Route 53 這類進階功能，但這堂課的目的不需要用到那些工具。DigitalOcean 的介面對新手更友善，比較不容易在建立或修改伺服器時誤觸設定，這也呼應了[[06-servers|前面]]提到的心態：先把最單純的概念搞懂，不必一開始就追求最完整的工具組。如果想深入研究 AWS，Frontend Masters 上另外有一門專門講 AWS 環境設置的課程。

建立伺服器前，先在 DigitalOcean 建立一個新專案（project），名稱與描述可以自由填寫，方便之後管理同一堂課用到的資源。

## Droplet：DigitalOcean 對 VPS 的稱呼

DigitalOcean 把它的 VPS 產品稱為 Droplet（AWS 則稱為 EC2）。建立時要選的第一個項目是地區（region）。

## 怎麼選地區與資料中心

選地區時要考慮的是網站訪客主要來自哪裡，而不是開發者自己人在哪裡，除非這台伺服器只是開發用途，這種情況才優先考量開發者所在地。以美國為例，西岸使用者選舊金山，東岸使用者則通常選紐約。大型服務（例如 Netflix）會在全球各地都佈建伺服器，並靠負載平衡器（load balancer）與路由把使用者導向最近的伺服器，但這堂課只需要選一個離自己與預期使用者最近的地區即可。

選好地區後還要選資料中心（data center），DigitalOcean 介面上也會直接提示：選一個離使用者最近的資料中心即可，不需要額外糾結。

## 作業系統：為什麼一定要選 Ubuntu LTS

比起地區還能隨時更改，作業系統一旦選定就得長期使用下去，因此這一步要謹慎。課程選擇 Ubuntu，並指定 LTS（Long Term Support，長期支援版）的 64 位元版本。

LTS 版本雖然不是最新，卻是最穩定的選擇。這跟企業軟體開發的思維一致：追求最新版本聽起來很吸引人，但新版本往往帶著還沒被發現的臭蟲與未知問題。既然要花時間投入開發一個應用程式，就該選擇最新但最穩定、經過長期驗證的版本，而不是站在技術最前緣冒險。

## 複習

### VPS 代表什麼，它的核心特性是什麼？

VPS 是 Virtual Private Server（虛擬私有伺服器）的縮寫，核心特性是它是一塊完全屬於使用者自己的網路空間，可以在上面自由地做任何想做的事。

### 為什麼建立伺服器時建議選擇 Ubuntu LTS？

Ubuntu LTS（長期支援版）提供最穩定、經過長期驗證的版本，能大幅降低遇到未知臭蟲的風險，這對需要長期投入開發、追求穩定運作的伺服器來說非常重要，也是企業軟體開發一貫的考量方式。

### 選擇伺服器地區時該考慮哪些因素？

應該選擇離預期網站訪客最近的地區，才能有效降低延遲、提升效能；但如果這台伺服器只是開發用途，則應該優先選擇離開發者自己最近的地區。

### DigitalOcean 的 Droplet 是什麼？

Droplet 是 DigitalOcean 對 VPS 產品的稱呼，是一種可以部署在雲端上的虛擬伺服器，概念上相當於 AWS 的 EC2。

### 為什麼選擇穩定的作業系統版本對伺服器很重要？

選擇穩定版本可以降低遇到未知臭蟲的機率，確保能獲得長期支援，並符合企業軟體開發中重視穩定性優先於追新的原則。

## 小測驗

<details>
<summary>建立 VPS 時，為什麼選擇地區很重要？</summary>
為了降低使用者的網路延遲
</details>

<details>
<summary>DigitalOcean 對虛擬伺服器的稱呼是什麼？</summary>
Droplet
</details>

<details>
<summary>選擇伺服器作業系統時建議怎麼做？</summary>
選擇 LTS（長期支援）版本
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Full Stack Fundamentals, v3](https://master.dev/courses/fullstack-v3/) 課程筆記
