---
title: 設計模式是什麼：從建築起源、四人幫到 JavaScript 的限制
description: 設計模式就像解決常見問題的食譜，還替開發者建立共同語彙。整理它從 70 年代建築設計到四人幫 23 個模式的由來，以及 JavaScript 不是嚴格物件導向語言帶來的限制。
date: 2026-11-08
section: dev
category: JavaScript Design Patterns
series: javascript_design_patterns_for_web_apps
seriesTitle: JavaScript Design Patterns for Web Apps
order: 2
chapter: Understanding Design Patterns
tags:
    - JavaScript
    - frontendMasters
    - javaScriptDesignPatterns
    - DesignPatterns
    - OOP
---

# 設計模式是什麼：從建築起源、四人幫到 JavaScript 的限制

> 延續 [[blog/courses_notes/javascript-design-patterns-for-web-apps/01-introduction|Vanilla JS 設計模式課程導覽]]，上一篇提到這門課會先說明什麼是設計模式，這篇就從定義開始。

## 設計模式的定義

最簡單的理解方式：設計模式就像一份解決問題的食譜。

比較正式的說法是，設計模式是一套可重複使用的範本，用來解決軟體設計裡常見的問題。它有三個主要用途：

- 解決常見的軟體設計問題
- 提升程式碼的可讀性與效率
- 在開發者之間建立共同語彙

### 共同語彙的價值

最後一點特別重要。每個設計模式都有名字，所以跟同事說「我要在這裡實作 X 模式」，對方馬上就知道做法是什麼，不用從頭解釋整套結構。

當然，設計模式最核心的目的還是解決問題。共同語彙是在解決問題之外，另一個很實際的好處。

## 為什麼 Vanilla JavaScript 特別需要設計模式

寫過 Vanilla JavaScript app 的人，應該常遇到這種狀況：碰到一個問題，不知道該怎麼解。用 React 或 Angular 時，框架本身已經規定好這類問題的處理方式，照著做就好。

換成 Vanilla JavaScript，就沒有框架可以依循了。想怎麼寫都可以，但也因為什麼都可以，反而不知道從哪裡下手。設計模式在這時候就能指出一條路，引導開發者把問題解決掉。

## 設計模式的起源：70 年代的建築設計

設計模式這個詞跟概念，其實來自 70 年代的建築領域。建築師在設計公寓、房子這類建築時，會遇到一些反覆出現的問題，於是有人整理出對應的解法，這就是建築裡的設計模式。

舉個例子：某個角落空間很小，卻得塞進一間浴室。針對這種情況，就有設計模式告訴建築師馬桶該放哪裡、門要開在哪邊。這種給建築師參考的「食譜」，就是設計模式最早的樣子。

## 四人幫與 23 個設計模式

把這個概念帶進軟體開發的，是約 30 年前出版的《Design Patterns: Elements of Reusable Object-Oriented Software》。這是第一本談軟體設計模式的書。

常聽到的「四人幫」（Gang of Four），指的就是這本書的四位作者。書裡整理了許多設計模式，最新版本共收錄 23 個。

這本書出版時還沒有 web，JavaScript 也還沒被拿來寫 web app，所以內容跟 web app 沒有關係。書裡的設計模式都是針對物件導向軟體準備、整理的，預設使用的是物件導向語言。

## JavaScript 不是嚴格的物件導向語言

那 JavaScript 算是物件導向語言嗎？不算嚴格的物件導向語言。JavaScript 是以原型（prototype）為基礎的語言，可以模擬大部分物件導向的概念，但不是全部。

就算用上現代 ECMAScript，有些東西還是很難做到。例如 protected 屬性或方法，在 JavaScript 裡幾乎不可能做出來。

所以照著四人幫那本書，把裡面的設計模式直接搬到 JavaScript 上實作，會遇到一些問題。這也呼應上一篇提到的，不需要把 Java、C# 這類語言的做法原封不動照抄過來。不過，這本書仍是推動軟體開發領域開始談設計模式的起點。

## 複習

### 設計模式在軟體開發中的三個主要用途是什麼？

設計模式是可重複使用的範本，用來解決常見的軟體設計問題，能提升程式碼的可讀性與效率，也替開發者建立共同語彙，讓溝通更順暢。

### 設計模式應用到軟體開發之前，這個概念源自哪裡？

源自 70 年代的建築領域。建築師在設計公寓、房子這類建築時，會把設計模式當成食譜，用來解決特定的設計難題。

### 在軟體設計模式的脈絡下，四人幫指的是什麼？

四人幫指的是約 30 年前出版的《Design Patterns: Elements of Reusable Object-Oriented Software》的四位作者，這本書介紹了 23 個軟體開發的設計模式。

### 為什麼在 JavaScript 裡實作傳統的設計模式可能會遇到困難？

JavaScript 不是嚴格的物件導向語言，而是以原型為基礎。它可以模擬大部分物件導向的概念，搭配現代 ECMAScript 更是如此，但像 protected 屬性或方法這類特性，幾乎不可能輕鬆做出來。

### 設計模式對開發者之間的溝通有什麼幫助？

設計模式在開發者之間建立了共同語彙。一提到要實作某個模式，同事馬上就能理解採取的做法，技術溝通也會更清楚。

## 小測驗

<details>
<summary>軟體開發中的設計模式是什麼？</summary>
一套可重複使用的範本，用來解決常見的軟體設計問題
</details>

<details>
<summary>除了解決問題之外，使用設計模式還有什麼重要的好處？</summary>
在開發者之間建立共同語彙
</details>

<details>
<summary>四人幫的書裡收錄了幾個設計模式？</summary>
23 個
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [JavaScript Design Patterns for Web Apps](https://master.dev/courses/js-design-patterns/) 課程筆記
