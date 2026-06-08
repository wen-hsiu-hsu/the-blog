---
title: '閉包關閉的是變數，不是值：迴圈閉包的常見陷阱'
description: '釐清閉包關閉的是變數本身而非值的快照，並透過 for 迴圈的經典案例說明這個差異：var 讓所有迭代共用同一個變數，let 讓每次迭代建立新變數。整理 for、for...of、for...in 搭配 let 的自動行為。'
date: 2026-06-21
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 53
chapter: 'Closure'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - Closure
---

# 閉包關閉的是變數，不是值：迴圈閉包的常見陷阱

> 本篇直接延續[[52-what-is-closure|上一篇]]「閉包（Closure）：函式記憶自身範疇的能力」。上一篇確立了閉包的核心定義：函式在不同範疇執行時，仍能存取原始詞彙範疇中的變數。本篇深入一個關鍵細節：閉包關閉的是「變數」，而非「值」，並透過 `for` 迴圈的經典案例說明這個差異的實際影響。

## 閉包抓的是變數，不是值

這是開發者對閉包最常見的誤解之一：以為閉包會在建立當下「捕捉」（capture）某個變數的值，就像拍下快照一樣。這個理解是錯的。

閉包保留的是**對變數本身的活連結（live linkage）**。存取閉包中的變數時，看到的是執行當下該變數的現值，而不是閉包建立時的值。

以下面這個例子說明：

```javascript
var teacher = "Kyle";

var myTeacher = function() {
  console.log(teacher);
};

teacher = "Suzy";

myTeacher(); // Suzy
```

`myTeacher` 在第 3 行建立時，`teacher` 的值是 `"Kyle"`。但第 7 行把 `teacher` 改成了 `"Suzy"`。第 9 行執行時，印出的是 `"Suzy"`，而非 `"Kyle"`。

原因很直接：閉包關閉的是 `teacher` 這個**變數**，不是它在某個時間點的值。執行時存取的是變數當下的狀態。

## 迴圈中的閉包：最經典的陷阱

這個「變數 vs 值」的差異，在迴圈中建立閉包時最容易引發問題。

### `for` + `var`

```javascript
for (var i = 1; i <= 3; i++) {
  setTimeout(function() {
    console.log(`i: ${i}`);
  }, i * 1000);
}
// i: 4
// i: 4
// i: 4
```

直覺上會預期印出 `1`、`2`、`3`，但實際上三次都印出 `4`。

原因：`var i` 只建立了**一個** `i` 變數，整個迴圈共用它。三個 callback 函式都對同一個 `i` 形成閉包。等到這些 callback 真正執行時，迴圈早已結束，`i` 的值已經是 `4`。

要讓三個函式各自持有不同的值，就需要三個不同的變數，而非一個。

#### 解法一：在迴圈內建立新的區塊範疇變數

```javascript
for (var i = 1; i <= 3; i++) {
  let j = i;
  setTimeout(function() {
    console.log(`j: ${j}`);
  }, j * 1000);
}
// j: 1
// j: 2
// j: 3
```

每次迴圈迭代都執行 `let j = i`，`let` 的區塊範疇特性讓每次迭代都建立出一個全新的 `j`。三個 callback 各自對不同的 `j` 形成閉包，因此各自持有 `1`、`2`、`3`。

#### 解法二：直接在 `for` 宣告處使用 `let`（推薦）

```javascript
for (let i = 1; i <= 3; i++) {
  setTimeout(function() {
    console.log(`i: ${i}`);
  }, i * 1000);
}
// i: 1
// i: 2
// i: 3
```

ES6 的規格對 `for` 迴圈搭配 `let` 做了特別處理：JavaScript 引擎會**在每次迭代時自動建立一個全新的 `i`**，並將上一次迭代結束時的值帶入新的 `i`。開發者不需要手動建立額外的變數，閉包就能正常運作。

這個行為適用於三種 `for` 語法：`for`、`for...of`、`for...in`

## 結論

閉包的本質是對變數的**持續連結**，不是對某個值的快照。這個細節決定了：

- 閉包存取的永遠是變數的「現值」，不是「當時的值」
- 多個閉包若指向同一個變數，它們會看到相同的值
- 要讓不同閉包持有不同的值，必須讓它們各自對應不同的變數

迴圈中的閉包問題，根本原因不是「閉包沒有正確捕捉值」，而是「所有閉包都在共用同一個變數」。解法永遠是：建立更多的變數。

## 複習

### 閉包在存取變數時，真正保留的是什麼？

閉包保留的是對變數本身的活連結，而非某個時間點的值快照。存取閉包中的變數時，得到的是執行當下該變數的現值。

### 在 for 迴圈中使用 var 搭配閉包，為什麼會產生非預期的行為？

因為 var 宣告的 i 只有一個，所有迭代共用同一個變數。當閉包真正執行時，迴圈已結束，i 已是最終值，導致所有閉包都印出相同的結果（例如 4、4、4）。

### for 迴圈搭配 let 如何解決閉包的變數捕捉問題？

使用 let 時，JavaScript 引擎會在每次迭代自動建立一個全新的變數，讓每個閉包各自持有當次迭代的獨立變數，而非共用同一個。

### 哪些 for 語法支援 let 在每次迭代建立新變數？

標準 for、for...of，以及 for...in 這三種語法，使用 let 時都會在每次迭代建立新的變數。

### 為什麼 for 迴圈的迭代變數不能使用 const？

因為迴圈需要在每次迭代後修改迭代變數（例如 i++），而 const 禁止重新賦值，因此會拋出錯誤。

## 小測驗

<details>
<summary>閉包在存取變數時，真正保留的是什麼？</summary>
對該變數的活連結，反映的是執行當下的現值
</details>

<details>
<summary>在使用 let 的 for 迴圈中，每次迭代的變數會發生什麼事？</summary>
JavaScript 自動為每次迭代建立一個全新的變數
</details>

<details>
<summary>for 迴圈中的閉包為什麼可能印出 4、4、4 而非 1、2、3？</summary>
因為所有閉包都參考同一個 var 變數，執行時該變數已是迴圈結束後的最終值
</details>

<details>
<summary>哪三種 for 語法在搭配 let 時，會在每次迭代建立新變數？</summary>
for、for...of 和 for...in
</details>

<details>
<summary>在需要遞增的 for 迴圈中使用 const 會發生什麼事？</summary>
因為嘗試修改常數，會拋出錯誤
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記