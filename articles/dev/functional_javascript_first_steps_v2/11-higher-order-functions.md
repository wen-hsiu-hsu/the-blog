---
title: '高階函數與一級函數：用三明治看懂 filter、map、reduce 的差別'
description: '高階函數與一級函數：函數能像字串、數字一樣當成值傳來傳去，接收或回傳函數的就是高階函數。用三明治比喻 filter、map、reduce 各自接收的函數與回傳結果的差別。'
date: 2026-10-12
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 11
chapter: 'Higher-Order Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - HigherOrderFunction
---

# 高階函數與一級函數：用三明治看懂 filter、map、reduce 的差別

> [[10-recursion-art-exercise|上一篇]]用遞迴畫完菱形圖案，結束了遞迴這個章節。這一篇開始往工具箱裡加入新工具：高階函數。它跟一級函數是一體兩面的概念，而 JavaScript 兩者都有。

## 一級函數：把函數當成一般的值

如果一個語言允許把定義好的函數像一般的值一樣傳來傳去，就像字串、數字那樣，就說這個語言有**一級函數（first-class functions）**。例如可以把函數當成輸入參數傳給另一個函數，就代表這個語言有一級函數。

JavaScript 就有一級函數，而且大家應該早就用過了，例如寫 callback 函數的時候。

### 每天都在用的 callback

在 DOM 裡替某個按鈕註冊事件監聽器時，會傳入一個函數，之後每次有人點擊按鈕，JavaScript 就會替我們執行這個函數：

```js
function handleClick() {
    // 每次按鈕被點擊時要做的事
}

button.addEventListener('click', handleClick);
```

這裡的 `button` 是頁面上的某個按鈕元素，`handleClick` 是自己定義的函數。注意傳進去的是 `handleClick` 本身，而不是 `handleClick()` 的呼叫結果。

註冊監聽器的當下，JavaScript 並沒有呼叫這個函數，也還沒有處理任何點擊。它只是把函數記下來、放進口袋留著之後用，就跟對待字串或數字這類一般的值一模一樣。

## 高階函數：操作函數的函數

一個函數如果會操作其他函數，也就是**接收函數當作輸入，或把函數當作輸出回傳**，就叫做**高階函數（higher-order function）**。它就像比它接收或回傳的那些函數高一個層級。

在函數式程式設計裡，高階函數是很常打交道的東西。因為在純函數式程式設計裡一切都是函數，所以免不了把函數傳來傳去。[[04-pure-functions-exercise|第四篇]]的 `truthTable` 接收一個邏輯運算函數 `logicalOperator`，就是這種用法；同一個 `handleClick` 也可以傳給好幾個不同元素的 `addEventListener`。

## 用 filter、map、reduce 取代迭代

在函數式的世界裡，想要對一個陣列的值做些處理時，不會用迭代。[[06-iteration-vs-recursion|第六篇]]提過，迭代在函數式程式設計裡是禁忌，因為它有狀態，而狀態危險、難以預測，還讓人頭痛。

取而代之的是 `map`、`reduce`、`filter` 這類函數。它們也是 JavaScript 陣列內建的方法，大家應該不陌生。不過接下來的課程不會直接用內建方法，而是運用剛學會的遞迴，用函數式的方式自己重新實作它們。

講師最喜歡用一張叫做 MapReduce 三明治的圖來說明這三個函數。這張圖不是她原創的，她只是改編過，再加上 filter。圖上的流程是一串三明治食材依序經過三個步驟：先用 filter 挑出想要的食材，再用 map 把每樣食材切好，最後用 reduce 把切好的食材疊成一個三明治。

三個函數都是高階函數，都接收一個函數作為輸入，也都會把這個函數套用到陣列的元素上，但做的事各不相同。

### filter：用 predicate 篩選元素

`filter` 接收的函數叫做 **predicate 函數**。predicate 函數每次會收到陣列裡的一個元素，並回傳一個布林值，不是 `true` 就是 `false`。

假設有一個裝著各種三明治食材的陣列，傳給 `filter` 的 predicate 可以是：

- 講師想把這個食材夾進三明治
- 講師覺得這個食材好吃
- 講師家裡已經有這個食材，不用去超市買

`filter` 會對每個元素呼叫這個函數，問出 `true` 或 `false`。回傳 `true` 的元素通過篩選，回傳 `false` 的就被濾掉。例如傳入「講師喜歡這個食材」，可能會濾掉小黃瓜和洋蔥。講師補充，這不是事實，她兩樣都喜歡，只是為了舉例。

最後得到的陣列通常比較短。長度也可能不變，但一定不會出現新的東西，頂多跟原本的陣列一模一樣。

### map：用轉換函數改變每個元素

接著把篩選好的食材陣列交給 `map`，同樣會得到一個新的陣列，但這次陣列裡的每個元素都會被轉換。

`map` 接收的不是固定回傳 `true` 或 `false` 的 predicate，而比較像一個**轉換函數**：收到一個值，回傳另一個值。回傳的值可能跟原本一樣，也可能不一樣，取決於這個函數做什麼。

例如傳給 `map` 一個「切碎」函數，它收到一樣東西，就把它切成好幾片後回傳。`map` 會對陣列裡每個元素呼叫它，回傳一個裝滿切好食材的陣列：麵包變成切好的麵包，番茄變成切好的番茄，以此類推。

講師說，到目前為止應該都算複習，因為 `array.filter`、`array.map` 本來就是我們日常寫 JavaScript 常用的東西。

### reduce：把整個陣列縮減成一個值

`reduce` 比較不一樣。`filter` 和 `map` 都是接收陣列、回傳陣列，`reduce` 雖然也接收陣列，回傳的卻是單一的值。它把一整個陣列的東西縮減（reduce）成一個東西。

`reduce` 接收的函數叫做 **reducer**。reducer 是一種特別的函數，每次會收到兩樣東西：

- 目前已經縮減好的值
- 接下來要加進這次縮減的新元素

reducer 處理這兩樣東西之後，回傳一個單一的結果。

最後把切好的食材交給 `reduce`。假設有一個叫做「疊上去」的 reducer，給它麵包和甜椒，它就會把甜椒疊到麵包上。`reduce` 會依序對陣列裡的每個元素套用它，一層疊上一層再疊上一層，直到所有元素都處理完。最後就得到一個美味的多層三明治，在動完腦之後好好享用。

## 複習

### 什麼是一級函數？

一級函數是可以像一般的值一樣對待的函數，就像字串或數字。也就是說，它們可以當作參數傳給其他函數、從函數回傳，也可以指派給變數。

### 什麼是高階函數？

高階函數是接收一個或多個函數作為參數，或回傳一個函數作為結果的函數。它操作的對象是函數，把函數當成可以處理的值。

### 在函數式程式設計中，filter 函數做什麼？

`filter` 接收一個 predicate 函數作為參數，回傳一個只包含符合 predicate 條件之元素的新陣列。它會對每個元素套用 predicate 函數，只保留回傳 `true` 的元素。

### 在函數式程式設計中，map 函數怎麼運作？

`map` 接收一個轉換函數作為參數，把它套用到陣列的每個元素上，建立一個由轉換後元素組成的新陣列。回傳的新陣列跟原本的陣列一樣長，每個元素都經過轉換函數處理。

### reduce 函數的用途是什麼？

`reduce` 接收一個 reducer 函數，依序把它套用到陣列的元素上，把陣列縮減成單一的值。它會把所有元素組合成一個最終結果，例如把數字加總，或建立出一個複雜的物件。

### 在 filter 的情境裡，predicate 函數是什麼？

對陣列裡每個元素回傳布林值的函數。

### 高階函數的特徵是什麼？

接收函數作為輸入，或回傳函數作為輸出。

### 以 JavaScript 來說，語言要具備什麼能力，才算支援一級函數？

能夠像一般的值一樣，把函數當作參數傳遞。

### map 與 filter 的 callback 函數主要差在哪裡？

filter 的 callback 回傳布林值，map 的 callback 轉換元素。

### 在函數式程式設計中，reduce 函數做什麼？

把一個有多個元素的陣列縮減成單一的值。

## 小測驗

<details>
<summary>什麼是一級函數？</summary>
可以像字串、數字這類一般的值一樣對待的函數，可以當作參數傳給其他函數、從函數回傳，也可以指派給變數
</details>

<details>
<summary>什麼是高階函數？</summary>
接收一個或多個函數作為參數，或回傳一個函數作為結果的函數，把函數當成可以處理的值
</details>

<details>
<summary>在函數式程式設計中，filter 函數做什麼？</summary>
接收 predicate 函數，對每個元素套用它，只保留回傳 <code>true</code> 的元素，組成新陣列回傳
</details>

<details>
<summary>在函數式程式設計中，map 函數怎麼運作？</summary>
接收轉換函數，套用到陣列的每個元素上，回傳一個跟原本一樣長、由轉換後元素組成的新陣列
</details>

<details>
<summary>reduce 函數的用途是什麼？</summary>
依序把 reducer 套用到陣列的元素上，把陣列縮減成單一的值，例如把數字加總，或建立出一個複雜的物件
</details>

<details>
<summary>在 filter 的情境裡，predicate 函數是什麼？</summary>
對陣列裡每個元素回傳布林值的函數
</details>

<details>
<summary>高階函數的特徵是什麼？</summary>
接收函數作為輸入，或回傳函數作為輸出
</details>

<details>
<summary>以 JavaScript 來說，語言要具備什麼能力，才算支援一級函數？</summary>
能夠像一般的值一樣，把函數當作參數傳遞
</details>

<details>
<summary>map 與 filter 的 callback 函數主要差在哪裡？</summary>
filter 的 callback 回傳布林值，map 的 callback 轉換元素
</details>

<details>
<summary>在函數式程式設計中，reduce 函數做什麼？</summary>
把一個有多個元素的陣列縮減成單一的值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
