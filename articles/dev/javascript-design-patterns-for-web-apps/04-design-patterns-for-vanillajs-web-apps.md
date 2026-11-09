---
title: Vanilla JS web app 的設計模式：四人幫經典模式與 web 專屬模式
description: Vanilla JS 只用 HTML、CSS、JavaScript 寫 web app。整理它能套用的設計模式：四人幫的 singleton、factory 等經典模式，以及 SPA、MPA、狀態管理等 web 專屬分類。
date: 2026-11-09
section: dev
category: JavaScript Design Patterns
series: javascript_design_patterns_for_web_apps
seriesTitle: JavaScript Design Patterns for Web Apps
order: 4
chapter: Understanding Design Patterns
tags:
    - JavaScript
    - frontendMasters
    - javaScriptDesignPatterns
    - DesignPatterns
---

# Vanilla JS web app 的設計模式：四人幫經典模式與 web 專屬模式

> 延續 [[blog/courses_notes/javascript-design-patterns-for-web-apps/03-components-of-a-design-pattern|設計模式的六個組成]]，上一篇談到 Vanilla JS 專案為什麼需要設計模式，這篇先釐清 Vanilla JavaScript 指的是什麼，再看有哪些設計模式可以用在這類 web app 上。

## 什麼是 Vanilla JavaScript

Vanilla JavaScript 指的是只用語言核心與瀏覽器 API 來寫 web app，上面不再疊任何函式庫或框架。換句話說，整個 app 只用 HTML、CSS 和 JavaScript 寫成。

有些人會把定義放寬一點，認為用上微框架（microframework）或微函式庫（microlibrary）也還算 Vanilla JavaScript，這種說法也可以接受。重點在於這個 web app 不是建立在 React、Angular、Vue 或 Next.js 這類框架之上。

對 Vanilla JavaScript 還不熟的話，可以先看 Frontend Masters 上的「Vanilla JavaScript: You Might Not Need a Framework」課程。這門課之後要套用設計模式的其中一個專案，正是那門課的成果，想看它怎麼從零寫起，可以回頭看那門課。

## 可以套用的兩大類設計模式

### 四人幫的經典設計模式

Vanilla JavaScript web app 可以套用經典的設計模式，也就是出自四人幫那本書的模式。不過這門課不會把書裡 23 個設計模式全部講一遍，這樣做沒有意義，只會挑其中幾個來用。上一篇提過的 singleton 和 factory，就出自這本書。

### 解決 web 專屬問題的設計模式

除了經典模式，還有專門解決 web 問題的設計模式。每個軟體開發平台都有自己的一份設計模式清單，因為各平台遇到的問題不一樣。寫 web app、做 VR 遊戲、開發 Android app，要解決的問題都不同。

所以不管開發哪一類 app，都找得到那個平台專屬的設計模式。這門課會介紹能用在 web、但對桌面應用程式或後端應用程式沒有用處的設計模式，分成以下幾類：

- 單頁應用程式（SPA）
- 多頁應用程式（MPA）
- 資料與狀態管理

## 不會涵蓋所有設計模式

這門課不會涵蓋所有的設計模式，原因有兩個。

第一，設計模式本來就沒有固定的清單，找不到一份「所有設計模式都在這裡」的列表。四人幫那本書的 23 個只是最初的一批，之後還有更多，而且每天都有新的設計模式誕生。這也呼應上一篇提到的，任何人都能創造設計模式。

第二，就算想把大部分設計模式都講完，大概也要花上一個月。

所以重點是理解最重要的幾個設計模式。懂了之後，在別的地方看到新的設計模式，也能看懂它的想法，再試著自己實作出來。

## 複習

### 什麼是 Vanilla JavaScript？

Vanilla JavaScript 是只用語言核心與瀏覽器 API 來寫 web app，上面不疊任何函式庫或框架。也就是只用 HTML、CSS 和 JavaScript 寫出 web app，而不是用 React、Angular、Vue、Next.js 這類框架。

### 有哪兩個出自四人幫的經典設計模式，可以用在 Vanilla JavaScript web app 上？

Singleton 和 factory 是兩個出自四人幫、可以用在 Vanilla JavaScript web app 上的經典設計模式。

### 為什麼不同的軟體開發平台會有各自的設計模式清單？

因為建立的應用程式類型不同，遇到的問題也不同。web app、VR 遊戲或 Android app 各自面對不同的挑戰，所以設計模式會針對該平台特有的問題量身打造。

### 有哪些設計模式的分類是 web 應用程式專屬的？

web 應用程式專屬的設計模式分類包括單頁應用程式（SPA）、多頁應用程式（MPA），以及資料與狀態管理模式。

### 為什麼 web 專屬的設計模式跟其他平台的設計模式不一樣？

每個軟體開發平台都有自己的設計模式清單，因為不同平台面對的問題不同。寫 web app 遇到的挑戰，跟做 VR 遊戲、Android app 或桌面應用程式都不一樣，所以 web 專屬的設計模式解決的是 web 開發特有的問題。

## 小測驗

<details>
<summary>Vanilla JavaScript 最主要的特徵是什麼？</summary>
只用語言核心與瀏覽器 API，不額外使用函式庫或框架
</details>

<details>
<summary>為什麼不同的軟體開發平台會有各自專屬的設計模式？</summary>
每個平台都有自己獨特的問題要解決
</details>

<details>
<summary>Vanilla JavaScript web app 的基礎是哪些技術？</summary>
HTML、CSS 和 JavaScript
</details>

<details>
<summary>哪個敘述最能描述軟體開發中設計模式的性質？</summary>
設計模式跟平台有關，會依開發的應用程式類型而不同
</details>

<details>
<summary>以下哪些是出自四人幫的經典設計模式？</summary>
Singleton 和 factory
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [JavaScript Design Patterns for Web Apps](https://master.dev/courses/js-design-patterns/) 課程筆記
