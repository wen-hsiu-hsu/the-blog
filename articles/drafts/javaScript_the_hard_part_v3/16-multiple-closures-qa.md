---
title: Closure：為什麼每次呼叫外層函式都是全新開始
description: 釐清 closure 的常見誤解：外層函式本身沒有記憶，被回傳的函式攜帶的是定義當下的資料快照。說明本地記憶體與背包的差異、背包的私有性與持久性，以及如何透過重新指派變數釋放背包記憶體，最後延伸至 IIFE 與 Module Pattern 的核心原理。
date: 2026-05-05
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 16
chapter: Closure
tags:
    - JavaScript
    - Closure
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Closure：為什麼每次呼叫外層函式都是全新開始

## 用來產生閉包的函式並沒有記憶

理解 closure 時最容易產生的誤解：認為 `newFunc` 或 `anotherFunction` 在執行時，某種程度上仍與 `outer` 保持著連結，或是每次執行會「回去找 outer」重新設定資料。

事實上：

- `outer` 本身是一個普通函式，**每次執行都是全新的開始**，執行完畢後完全忘記自己做過什麼
- `newFunc` 與 `anotherFunction` 在被指派之後，**與 outer 再無任何關係**
- 它們持有的只是當初那次 `outer` 執行時，`add1` 被定義當下所綁定的資料快照

同樣用下方的程式碼來做範例。

```javascript
function outer() {
    let counter = 0;
    function add1() {
        counter++;
    }
    return add1;
}

const newFunc = outer();
newFunc();
newFunc();

const anotherFunction = outer();
anotherFunction();
anotherFunction();
```

第二次呼叫 `outer` 時，之所以 `counter` 從 `0` 開始，不是因為有任何「重置」機制，而是因為這是一次**全新的執行環境**，在這次執行中，`let counter = 0` 被重新執行了一次，產生了一個全新的 `counter = 0` 儲存在電腦記憶體中，並隨著這次的 `add1` 一起被帶出去。

## 函式執行時的兩層記憶體

每次呼叫 `newFunc` 或 `anotherFunction`，都同時擁有：

| 記憶體          | 每次呼叫時               | 特性       |
| --------------- | ------------------------ | ---------- |
| 本地記憶體      | 全新建立，執行完畢即清除 | 暫時性     |
| 背包（Closure） | 持續存在，跨越每次呼叫   | 私有且持久 |

這份背包資料是**私有的**：它不在全域，外部無法直接存取，只有持有它的函式在執行時能夠讀取和修改。

## 關於記憶體釋放

只要持有函式的標籤（變數）仍然存在，背包就不會被釋放。若要讓垃圾回收機制（garbage collection）清除背包，可以將該變數重新指派：

```javascript
anotherFunction = null; // 解除參考，背包資料最終會被 GC 清除
```

值得注意的是，這並不構成真正的「記憶體洩漏（memory leak）」。記憶體洩漏的定義是：資料**無法再被存取**，但仍佔用空間。而背包中的資料只要函式還在，就**仍可透過呼叫該函式來存取**，所以不符合定義。JavaScript 也會自動優化——只有在函式中實際被參照的變數才會進入背包，未被參照的會被垃圾回收掉。

## 延伸：IIFE 與 Module Pattern 的雛形

既然 `outer` 回傳的函式可以攜帶私有的持久資料，那麼可以更進一步，讓 `outer` 在定義後立刻執行（Immediately Invoked Function Expression，IIFE）：

```javascript
const newFunc = (function outer() {
    let counter = 0;
    function add1() {
        counter++;
    }
    return add1;
})();
```

這正是 **Module Pattern（模組模式）** 的核心原理：用一個立即執行的外層函式建立一個私有的持久狀態空間，回傳的函式可以持續存取並操作這份狀態，而外部無法直接干涉。

## 複習

### 當一個函式從外層函式被回傳並儲存在變數中時，外層函式執行環境中的本地變數會怎樣？

被回傳的函式會將其定義當下所在位置的活資料，以背包（closure）的形式一起帶出來。
即使外層函式的執行環境已被銷毀，這份資料仍持續存在，
讓被回傳的函式在執行時能夠存取這些變數。

### 如果外層函式被呼叫多次，每次各回傳一個函式，這些回傳的函式是否共享同一份背包資料？

不，每次呼叫外層函式都會建立全新的執行環境，擁有各自獨立的本地記憶體。
每個被回傳的函式都會得到自己專屬的背包，其中包含來自各自執行環境的資料。
這些回傳的函式彼此之間，以及與外層函式之間，在回傳後都不存在任何關係。

### 帶有背包（closure）的函式執行時，其本地執行環境是否會在多次呼叫之間持續保留？

不，每次函式執行完畢後，本地執行環境都會被清空。
但背包（closure）中的資料會跨越多次呼叫持續存在。
函式查找變數的順序是：先查本地記憶體，再查背包，最後才是全域作用域。

### 當內層函式被回傳並儲存在變數中之後，它與外層函式之間是什麼關係？

兩者之間沒有任何持續的關係。
被回傳的函式不會再回頭參照外層函式，它只是持有外層函式執行環境在回傳當下的資料快照。
外層函式本身在多次執行之間也不保有任何記憶。

### 在程式結束之前，如何釋放函式背包（closure）所佔用的記憶體？

若將持有該函式的變數重新指派為其他值（例如 null），
垃圾回收機制（garbage collection）最終會釋放背包中的資料。
只要變數仍持有對該函式的參照，背包資料就會持續存在於記憶體中。

## 小測驗

<details>
<summary>函式執行完畢後，其本地記憶體會怎樣？</summary>
被清除丟棄
</details>

<details>
<summary>當一個函式從另一個函式中被回傳時，它會額外攜帶什麼資料？</summary>
它被定義當下所在環境的周圍資料
</details>

<details>
<summary>附加在被回傳函式上的持久私有記憶體，通常被稱為什麼？</summary>
背包（Backpack）
</details>

<details>
<summary>outer 被多次呼叫時，它是否會在多次執行之間保有記憶？</summary>
不會，每次呼叫都會建立全新的執行環境
</details>

<details>
<summary>如果將一個持有回傳函式的變數重新指派為 null，其背包資料最終會怎樣？</summary>
被垃圾回收機制（garbage collection）釋放
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
