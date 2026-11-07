---
title: JavaScript 經典設計模式：用現代 ES 語法，別照搬 Java 寫法
description: 四人幫經典設計模式多是物件導向解法，JavaScript 不是純物件導向語言，ES6 之後也有更好的寫法。整理三大分類、網路上過時的實作，以及別把 JavaScript 寫成 Java。
date: 2026-11-10
section: dev
category: JavaScript Design Patterns
series: javascript_design_patterns_for_web_apps
seriesTitle: JavaScript Design Patterns for Web Apps
order: 5
chapter: Classic Patterns
tags:
    - JavaScript
    - frontendMasters
    - javaScriptDesignPatterns
    - DesignPatterns
---

# JavaScript 經典設計模式：用現代 ES 語法，別照搬 Java 寫法

> 延續 [[blog/courses_notes/javascript-design-patterns-for-web-apps/04-design-patterns-for-vanillajs-web-apps|Vanilla JS web app 的設計模式]]，上一篇提到 Vanilla JavaScript web app 可以套用四人幫的經典設計模式，這篇開始看這些模式套用到 JavaScript 時要注意什麼。

## 四人幫那本書適合 web 開發者讀嗎

經典設計模式出自四人幫那本書。以現在的 web 開發者來說，這本書不太好讀。

原因是它從設計的角度出發，離實作很遠，書裡充滿 UML 圖。整本書不是寫給 web 開發者看的，喜歡這類內容的話它是本好書，但讀起來確實吃力。

## 經典模式多是物件導向的解法

書裡大部分的設計模式，都是圍繞物件導向程式設計（OOP）的解法。[[blog/courses_notes/javascript-design-patterns-for-web-apps/02-what-are-design-patterns|設計模式是什麼]]提過，JavaScript 可以模擬、借用部分物件導向的想法，但它不是 100% 物件導向的語言。

所以書裡有些解法，不一定適合直接搬到 JavaScript 上。

書中的模式分成三大類，接下來每一類會挑兩三個例子來看：

- 建立型（creational）設計模式
- 結構型（structural）設計模式
- 行為型（behavioral）設計模式

## ES6 之後，很多模式有了更好的寫法

在 ES6（2015 年）之前，很多問題要靠設計模式和特定的實作方式來解決。從 ECMAScript 6 開始，再加上後續的新版本，同樣的問題有了不同的解法。像 ECMAScript 2020、2022 就替 JavaScript 的 class 語法加入了不少功能。想多了解這些功能，可以看 Frontend Masters 上的 professional JavaScript 課程。

這代表上網搜尋「JavaScript design patterns」時，會找到很多過時的解法。這類部落格文章給的寫法今天還能動，但用現代的 ECMAScript，有更好的方式來套用同一個設計模式。看這些文章時要記得這一點。

## 同一個模式可以有很多種寫法

JavaScript 是動態語言，本質上就很動態，同一個問題能用很不一樣的方式解決，而且沒有所謂最好的寫法。

接下來的內容只會用其中一種寫法。不喜歡這種寫法也沒關係，只要理解這個模式要解決什麼問題、用什麼方式解決，就可以寫出自己的版本。

## 別把 JavaScript 寫成 Java

在網路上找設計模式時，特別要注意：不要用寫 Java 的方式來實作設計模式。

大部分的設計模式，包括書裡的那些，其實都是針對 Java 或類 Java 語言寫的。有些談 web app 的部落格文章，也是拿 Java 的實作直接在 JavaScript 裡模仿一遍。這不是在 web app 裡實作設計模式的好方法。

實作時要發揮 JavaScript 本身的能力。「別把 JavaScript 寫成 Java」本來就是通用的建議，套用到設計模式時更是如此。這也呼應[[blog/courses_notes/javascript-design-patterns-for-web-apps/03-components-of-a-design-pattern|設計模式的六個組成]]提到的語言差異：Java 和 C# 在設計模式上幾乎可以視為同一回事，JavaScript 則完全不同。

## 複習

### 為什麼直接照四人幫那本書實作經典設計模式，放到 JavaScript 上會有困難？

JavaScript 不是 100% 物件導向的語言。它雖然能模擬或借用部分物件導向的想法，但經典設計模式書裡的許多解法是針對純物件導向語言設計的，不一定適合 JavaScript。此外，這本書使用 UML 圖、偏向設計導向，離 web 開發的實作很遠。

### 經典設計模式那本書裡的設計模式分成哪三大類？

建立型設計模式、結構型設計模式和行為型設計模式。

### ECMAScript 6（ES6）和之後的版本，對 JavaScript 設計模式有什麼影響？

ES6 和更新的 ECMAScript 版本加入了許多原生功能，能解決以前需要靠設計模式處理的問題。所以網路上很多舊的設計模式實作已經過時，用現代 ECMAScript 可以用更好的方式套用同樣的模式。

### 為什麼同一個設計模式在 JavaScript 裡會有多種不同的實作？

JavaScript 是動態語言，本質上就很動態，同一個問題能用很不一樣的方式解決。實作設計模式沒有唯一的「最好寫法」，同一個模式可以有好幾種都成立的做法。

### 在 JavaScript web app 裡實作設計模式時，常見的錯誤是什麼？

常見的錯誤是用寫 Java 的方式實作設計模式，或是拿 Java 的實作在 JavaScript 裡照樣模仿。這樣沒有發揮 JavaScript 獨特的優勢與能力，應該避免。

## 小測驗

<details>
<summary>JavaScript 的哪個特性，讓同一個設計模式能有多種實作方式？</summary>
它的動態本質
</details>

<details>
<summary>經典設計模式分成哪幾類？</summary>
建立型、結構型和行為型
</details>

<details>
<summary>web 開發者閱讀四人幫原著時，主要的困難是什麼？</summary>
書裡大量使用 UML 圖，偏向設計導向而不是實作導向
</details>

<details>
<summary>在 JavaScript 裡實作設計模式，建議的做法是什麼？</summary>
善用 JavaScript 獨特的特性
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [JavaScript Design Patterns for Web Apps](https://master.dev/courses/js-design-patterns/) 課程筆記
