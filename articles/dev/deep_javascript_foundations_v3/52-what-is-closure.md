---
title: '閉包（Closure）：函式記憶自身範疇的能力'
description: '介紹閉包（Closure）的觀察性定義：函式能在不同範疇執行時，仍保有對原始詞彙範疇的存取能力。說明閉包與詞彙範疇的差異、JavaScript 引擎以範疇為單位實作閉包的實務影響，以及閉包作為「第一類函式 + 詞彙範疇」必然結果的理解角度。'
date: 2026-06-21
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 52
chapter: 'Closure'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Closure
  - LexicalScope
---

# 閉包（Closure）：函式記憶自身範疇的能力

> 本篇延續前幾篇對詞彙範疇（lexical scope）的討論。前面已確立：JavaScript 是兩階段語言，範疇在編譯期決定、執行期查找。本篇建立在這個基礎上，進入閉包（closure）的核心概念。

## 閉包的起源與重要性

閉包的概念早於程式語言本身，源自數學領域的 lambda calculus（λ 演算）。在電腦科學的早期，它主要出現在 Lisp 等學術型語言中，被認為是「普通開發者不會用到的東西」。

1995 年，Brendan Eich 被 Netscape 雇用時，原本想把 Scheme（一種函數式程式語言）放進瀏覽器，但公司要求語法必須看起來像 Java。結果是：JavaScript 在語法上模仿 Java，但骨子裡更接近 Scheme，也因此繼承了閉包這個概念。

Kyle Simpson 認為，這是一種「意外的天才之舉」：用親切的語法包裝了強大的語言能力，讓閉包得以走出學術圈，進入消費端開發者的日常。

## 閉包的定義

學術上的閉包定義往往難以直接對應到程式行為。Kyle Simpson 提出了一個從「觀察角度」出發的定義：

> **Closure 是當一個函式能夠記住並存取其詞彙範疇（lexical scope）中的自由變數（free variables），即使這個函式是在不同的範疇中執行時。**

這個定義由兩個部分組成，缺一不可：

1. **函式能存取自身詞彙範疇中的變數** - 這是詞彙範疇本身就具備的能力
2. **即使函式在不同的範疇執行時** - 這才是閉包的關鍵

只有第一點，那只是詞彙範疇。加上第二點，才是閉包。

## 閉包與詞彙範疇的差異

詞彙範疇讓函式可以往外查找變數，這是靜態的、編譯期決定的行為。

閉包發生在：把一個函式傳遞到其他地方（作為 callback 或回傳值），使得它在原本定義的範疇之外執行。直覺上，原始範疇應該已經消失（被 garbage collect），但實際上，只要有函式存活並引用了該範疇，該範疇就不會消失。

以 `setTimeout` 為例：

```javascript
function ask(question) {
  setTimeout(function waitASec() {
    console.log(question);
  }, 100);
}

ask("什麼是閉包？");
```

`ask` 函式執行完畢後，`question` 這個變數理論上應該消失。但 `waitASec` 函式持有對 `question` 的參考，使得該範疇被保留下來。這就是閉包：`waitASec` 對 `question` 形成了閉包。

閉包保留的不是變數的快照（snapshot），而是變數本身。這意味著如果變數之後被修改，閉包看到的會是修改後的值。

## 閉包是第一類函式 + 詞彙範疇的必然結果

Kyle Simpson 提出一個思考角度：如果一個語言同時具備以下兩點，閉包幾乎是必然會出現的第三個特性：

- **第一類函式（first-class functions）**：函式可以被傳遞、被回傳
- **詞彙範疇（lexical scope）**：變數查找在定義時決定

若沒有閉包，把函式傳遞出去後，函式會「忘記」所有它原本能存取的變數，幾乎無法做任何有意義的事。閉包讓這兩個特性組合在一起時真正有用。

## JavaScript 引擎的實作方式與記憶體影響

從規格書角度來看，閉包理論上是以「單一變數」為單位，只保留實際被參考的變數。

但就目前 JavaScript 引擎的實際實作而言，閉包通常以**整個範疇**為單位保留，而不是個別變數。

這帶來一個實務上需要注意的隱患：

```javascript
function outer() {
  const bigData = new Array(1000000).fill("大量資料");
  const small = 42;

  return function inner() {
    console.log(small); // 只用到 small
  };
}

const fn = outer();
// bigData 可能也被保留在記憶體中，即使 inner 根本沒有用到它
```

即使 `inner` 只參考 `small`，`bigData` 也可能因為範疇被整體保留而無法被 garbage collect。

實務建議：把閉包視為**範疇層級的操作**，而非變數層級，以避免無意間的記憶體洩漏。

## 總結

| 概念       | 說明                                             |
| ---------- | ------------------------------------------------ |
| 詞彙範疇   | 函式可往外查找定義時所在的範疇                   |
| 閉包       | 函式在不同範疇執行時，仍保有對原始範疇的存取能力 |
| 保留的是   | 變數本身（非快照）                               |
| 引擎實作   | 以整個範疇為單位保留，非個別變數                 |
| 記憶體影響 | 整個範疇可能無法被 GC，需注意大型資料的生命週期  |

閉包不是需要特別「啟動」的功能，只要在函式內存取外部變數，再把函式傳遞出去，閉包就自然發生了。在 JavaScript 中，你每天都在使用它，差別只在於是否有意識地知道它的存在。

## 複習

### 閉包（closure）在 JavaScript 中的核心定義是什麼？

閉包是指一個函式能夠記住並存取其詞彙範疇（lexical scope）中的變數（即自由變數），即使該函式是在不同的範疇中執行。

### 閉包與單純的詞彙範疇有何不同？

詞彙範疇讓函式能夠參考自身外部的變數。閉包則更進一步，即使原始範疇看似已消失（例如函式被作為 callback 傳遞或從另一個函式回傳），仍能保持對那些變數的存取能力。

### JavaScript 引擎通常如何實作閉包？

JavaScript 引擎通常以範疇為單位實作閉包，而非以單一變數為單位。這表示整個範疇可能都被保留，即使閉包實際上只直接參考其中部分變數。

### 閉包對垃圾回收（garbage collection）有什麼影響？

閉包可能阻止整個範疇被垃圾回收，使得變數與資料繼續佔用記憶體，即使閉包函式並沒有直接使用它們。

### 為什麼閉包被視為「詞彙範疇語言 + 第一類函式」的必要組成？

若沒有閉包，被傳遞到其他範疇的函式將會失去對原始變數的存取能力，使其實用性大幅降低。閉包確保函式無論在哪裡執行，都能保有對其原始詞彙環境的存取。

## 小測驗

<details>
<summary>閉包（closure）在 JavaScript 中的核心定義是什麼？</summary>
函式能夠記住並存取其詞彙範疇的能力，即使是在不同的範疇中執行時
</details>

<details>
<summary>JavaScript 引擎通常如何實作閉包？</summary>
以整個範疇為單位保留，而非個別變數
</details>

<details>
<summary>理解閉包的兩個關鍵組成要素是什麼？</summary>
①函式能存取其詞彙範疇，②函式在不同範疇執行時仍保有該存取能力
</details>

<details>
<summary>使用閉包時，開發者需要注意什麼潛在問題？</summary>
即使沒有直接參考，大量資料仍可能因整個範疇被保留而無法被垃圾回收，造成記憶體佔用
</details>

<details>
<summary>在閉包的脈絡下，函式的行為有何特別之處？</summary>
即使原始範疇在表面上已經消失，函式仍能存取來自該範疇的變數
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記