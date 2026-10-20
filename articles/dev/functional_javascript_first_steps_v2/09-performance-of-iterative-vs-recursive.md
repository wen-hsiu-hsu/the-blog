---
title: '遞迴的效能問題：call stack 如何拖慢遞迴，以及尾呼叫最佳化'
description: '遞迴的效能問題：每次呼叫函數都會在 call stack 加上新的 stack frame、配置新記憶體，遞迴太深可能讓引擎當掉或變慢。用費波那契實測差異，再認識尾呼叫最佳化。'
date: 2026-10-11
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 9
chapter: 'Recursion'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - Recursion
    - Performance
---

# 遞迴的效能問題：call stack 如何拖慢遞迴，以及尾呼叫最佳化

> [[08-iteration-vs-recursion-fibonacci-exercise|上一篇]]用 `for` 迴圈與遞迴各寫了一次費波那契函數，兩個版本都通過了測試。這一篇拿很大的數字測試這兩個版本，看看遞迴在效能上要付出什麼代價。

## 用很大的數字測試兩種費波那契

講師先拿命令式的 `imperativeFibonacci` 測試很大的數字。她請大家提供喜歡的多位數，沒人回應，就隨手打了一串數字，接著覺得太大，改成三位數再試一次。結果算出一個長得誇張的數字，命令式版本順利完成計算。

接著換遞迴的 `recursiveFibonacci`，用同樣很大的數字執行，卻遲遲沒有結果。講師說，這有可能只是測試沒有載入，但她認為程式其實有正常在跑，而這正是她想展示的狀況：**遞迴有效能上的代價**。

## 為什麼遞迴會有效能問題？

### 每次呼叫函數都會增加 stack frame

在 JavaScript 與許多語言的實作裡，記憶體中會記住目前正在呼叫的所有函數，這份紀錄叫做 **call stack**。

程式裡任何地方只要呼叫一個函數，call stack 上就會加上一個新的 **stack frame**，也就代表要配置新的記憶體。

遞迴函數會一路堆疊出許多 stack frame，直到碰到 base case 跳出遞迴，才開始從這些函數呼叫一層一層返回。以[[08-iteration-vs-recursion-fibonacci-exercise|上一篇]]的 `recursiveFibonacci` 來說，每一層都要等 `recursiveFibonacci(n - 2)` 與 `recursiveFibonacci(n - 1)` 算出結果才能返回，所以在抵達 base case 之前，這些呼叫都還留在 call stack 上。

### 遞迴太多的兩種後果

所以遞迴是有可能「太多」的，後果有兩種：

- **當掉**：可能讓 JavaScript 引擎當掉，或讓瀏覽器視窗當掉。講師笑說，請勿在家模仿
- **變慢**：就算沒當掉，也可能要等很久才拿到回傳值。因為得配置大量記憶體、建立大量新的 stack frame，還有 JavaScript 在底層做的各種額外處理

因此常聽到有人說遞迴的效能不好，講師認為這句話確實有幾分道理。

## 解法：尾遞迴與尾呼叫最佳化

這些效能問題也有解法。課程不會深入，結語裡有附相關連結。

讓遞迴函數效能好很多的一個方法是**尾遞迴（tail recursion）**。講師沒有在課堂上定義它，只說明要同時滿足兩個條件：

- 語言實作了一種叫做**尾呼叫最佳化（tail call optimization）**的最佳化
- 遞迴函數用特定的風格撰寫，成為尾遞迴函數

兩個條件都成立時，JavaScript 在底層就不需要一直配置新的 stack frame，處理這些遞迴呼叫的速度也會快很多。

講師沒有再多說，不過她在 YouTube 上有一場用音樂講解尾呼叫最佳化的演講。如果好奇尾呼叫最佳化是什麼，尤其是喜歡 90 年代迪士尼音樂劇的話，可以去看看，因為她就是用那種方式解釋它的運作。

## 程式設計者通常無法控制

講師說，這類效能問題的解法很多時候取決於語言的實作，而不是程式設計者能使用的語言功能。

除非是在開發新的瀏覽器引擎，或瀏覽器裡新的 JavaScript 引擎，否則我們通常無法控制自己所使用的 JavaScript 引擎。所以課程只會簡單帶過效能的影響。

總之，確實有方法可以避免一直遇到「call stack size exceeded」、「too much recursion」這類錯誤。[[06-iteration-vs-recursion|第六篇]]提過，Firefox 在遞迴太深時的錯誤訊息就是「too much recursion」，這正是 stack overflow 的情況。

## 複習

### 在 JavaScript 中呼叫遞迴函數時，記憶體會發生什麼事？

每呼叫一次遞迴函數，JavaScript 記憶體中的 call stack 就會加上一個新的 frame，每次函數呼叫都會配置新的記憶體，直到抵達 base case，才開始從這些函數呼叫返回。

### JavaScript 的遞迴函數可能有哪些效能問題？

遞迴函數可能讓 JavaScript 引擎或瀏覽器視窗當掉，而且因為每次遞迴呼叫都要配置記憶體、建立多個 stack frame，執行起來可能很慢。

### 什麼是尾遞迴？它如何改善遞迴函數的效能？

尾遞迴是一種撰寫遞迴函數的風格，遞迴呼叫是函數執行的最後一個操作。當語言實作了尾呼叫最佳化，JavaScript 就能避免為每次遞迴呼叫配置新的 stack frame，減少記憶體用量並避免 stack overflow 錯誤，讓函數的效能好很多。

### 為什麼開發者常說遞迴的效能不好？

遞迴的效能可能比較差，因為每次函數呼叫都需要配置新的記憶體、建立多個 stack frame，還要在 JavaScript 引擎底層執行額外的處理。

### 程式設計者能控制 JavaScript 引擎的效能最佳化嗎？

通常不能。除非是在開發新的瀏覽器或 JavaScript 引擎，否則程式設計者無法直接控制 JavaScript 引擎的實作。

### 有哪種最佳化技術可能改善遞迴函數的效能？

尾呼叫最佳化。

### 在 JavaScript 中用很大的輸入值執行遞迴，可能發生什麼效能問題？

call stack size exceeded 錯誤。

## 小測驗

<details>
<summary>在 JavaScript 中呼叫遞迴函數時，記憶體會發生什麼事？</summary>
call stack 上會加上一個新的 frame，配置新的記憶體
</details>

<details>
<summary>JavaScript 的遞迴函數可能有哪些效能問題？</summary>
可能讓 JavaScript 引擎或瀏覽器視窗當掉，也可能因為配置記憶體、建立大量 stack frame 而執行得很慢
</details>

<details>
<summary>什麼是尾遞迴？它如何改善遞迴函數的效能？</summary>
尾遞迴是遞迴呼叫為函數最後一個操作的撰寫風格；語言實作了尾呼叫最佳化時，就不必為每次遞迴呼叫配置新的 stack frame
</details>

<details>
<summary>為什麼開發者常說遞迴的效能不好？</summary>
每次函數呼叫都要配置新記憶體、建立 stack frame，還有引擎底層的額外處理
</details>

<details>
<summary>程式設計者能控制 JavaScript 引擎的效能最佳化嗎？</summary>
通常不能，除非是在開發新的瀏覽器或 JavaScript 引擎
</details>

<details>
<summary>有哪種最佳化技術可能改善遞迴函數的效能？</summary>
尾呼叫最佳化
</details>

<details>
<summary>在 JavaScript 中用很大的輸入值執行遞迴，可能發生什麼效能問題？</summary>
call stack size exceeded 錯誤
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
