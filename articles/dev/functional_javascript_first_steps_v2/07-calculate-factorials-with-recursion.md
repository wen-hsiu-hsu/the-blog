---
title: '用遞迴計算階乘：比較 while 迴圈與遞迴寫法，哪個比較好讀？'
description: '階乘是函數式程式設計練習遞迴的經典題目。對照 while 迴圈與遞迴兩種 factorial 實作，看懂兩者如何算出同一個結果，以及遞迴為什麼讀起來比較燒腦、需要刻意練習。'
date: 2026-10-10
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 7
chapter: 'Recursion'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - Recursion
    - BaseCase
---

# 用遞迴計算階乘：比較 while 迴圈與遞迴寫法，哪個比較好讀？

> [[06-iteration-vs-recursion|上一篇]]用 `sum` 比較了迭代與遞迴，也認識了 base case。這一篇換成另一個經典題目：階乘，先讀兩種實作，再聊聊哪一種比較好讀。

## 階乘是什麼？

講師笑說，階乘（factorial）是每個函數式程式設計學生「最愛」的函數。接下來的練習分成兩步：先讀程式碼，再動手寫程式碼。

階乘的計算方式是給一個整數，把它跟所有比它小的正整數乘在一起。例如 3 的階乘就是 1 × 2 × 3。講師說它跟上一篇的 `sum` 很像，只是把加法換成乘法。

## 兩種 factorial 實作

練習檔案裡有兩個函數，都接收一個整數 `n`，回傳 `n` 的階乘。講師請大家花一分鐘讀完，思考兩件事：

- 每個函數各自在做什麼？
- 哪一個比較好讀、比較容易理解？哪一個比較難？

### 命令式版本：`imperativeFactorial`

```js
const imperativeFactorial = (n) => {
    let product = 1;
    while (n > 0) {
        product *= n;
        n--;
    }
    return product;
};
```

`imperativeFactorial` 先把累乘的結果 `product` 設成 `1`，接著進入 `while` 迴圈。只要 `n` 大於 `0`，就把 `product` 乘上目前的 `n`，再用 `n--` 把 `n` 減一。`n` 減到 `0` 時迴圈停止，回傳 `product`。

這正是上一篇說的有狀態寫法：`product` 與 `n` 的值都隨著每一輪迴圈改變。

### 遞迴版本：`recursiveFactorial`

```js
const recursiveFactorial = (n) => {
    if (n === 0) return 1;
    return n * recursiveFactorial(n - 1);
};

console.log(recursiveFactorial(6)); // 720
```

`recursiveFactorial` 沒有任何會被重新指派的變數，一樣分成兩個情況：

- **base case**：`n` 等於 `0` 時直接回傳 `1`，不再呼叫自己
- **遞迴情況**：回傳 `n` 乘上 `recursiveFactorial(n - 1)`，也就是用比較小的輸入再呼叫自己一次

跟[[06-iteration-vs-recursion|上一篇]]遞迴版的 `sum` 一樣，每一層呼叫都要等下一層算出結果，才能把自己的 `n` 乘上去。一路到 `n` 為 `0` 的 base case 之後，再一層一層把結果乘回來。

## 哪一個比較好讀？

講師強調這是主觀問題，沒有標準答案。現場舉手調查時，有幾個人覺得 `imperativeFactorial` 比較好讀，覺得 `recursiveFactorial` 比較好讀的則是零人。

講師接著問為什麼，並說這只是在聊感受，而聊感受對軟體開發其實很重要，她不是在開玩笑。

### 學員的回答：遞迴要多繞好幾圈

一位學員說，讀遞迴版本時感覺要多做一些「腦力體操」，得一邊追蹤值怎麼變化，一邊處理函數參照自己這件事。

另一位學員說，遞迴像是「走到底、再從頭開始、再走到底、再從頭開始」。在西方，大家習慣從左到右、從上到下閱讀。讀到「做這個、再做這個、再做這個」的程式碼時，就像在照著食譜做菜，很好跟上。遞迴卻是「做這個，然後從頭再做一次」，第一位學員也補了一句，這裡多了一層抽象。

### 執行順序可能出乎意料

講師同意這些看法，並補充遞迴的執行順序可能讓人有點意外。想確認函數到底怎麼算出結果的話，可以自己改改這段程式碼，她甚至允許大家為了學習，在裡面加 `console.log` 看看過程。[[03-pure-functions-overview|第三篇]]說過印到 console 是副作用，所以這裡算是為了理解程式而破例。

## 為什麼迴圈讀起來比較直覺？

講師認為，覺得迴圈比較好讀，是因為身為習慣寫 JavaScript 的程式設計者，大家幾乎已經有了「肌肉記憶」。平常看到的程式碼大多是命令式的，雖然不是全部。

講師也提到，callback 在 JavaScript 裡到處都是，而那其實就是函數式的寫法。不過整體來說，大家看慣了 `while` 與 `for` 迴圈，遇到新的寫法自然會覺得有點怪。

講師希望上完這堂課，以及函數式程式設計學習路徑的後續課程後，用遞迴取代 `while` 迴圈會變得自然許多。但她也坦言，遞迴在某種程度上就是對函數式程式設計者比較有道理，對一般人的大腦不見得那麼直覺。這也是接下來要花很多時間練習遞迴的原因。

## 複習

### 階乘在數學上的定義是什麼？

階乘是一個整數與所有比它小的正整數相乘的乘積，例如 3 的階乘是 1 × 2 × 3。

### 實作階乘有哪兩種不同的程式設計方式？

命令式的做法（使用迴圈），以及遞迴的做法（函數呼叫自己）。

### 為什麼遞迴實作讀起來可能比較吃力？

遞迴程式碼需要在腦中追蹤函數呼叫的過程與函數對自己的參照，而且可能不符合傳統從左到右、從上到下的閱讀方式。

### 遞迴實作和命令式實作有什麼不同？

遞迴實作透過在函數裡呼叫函數本身來解決問題，命令式實作則是用迴圈或一步一步的指令。

### 函數式程式設計解決問題的方式有什麼關鍵特色？

函數式程式設計通常偏好用遞迴取代命令式的迴圈，強調函數的組合與自我參照的計算。

### 階乘函數計算的是什麼數學運算？

把從 1 到該數字（包含該數字）的所有正整數乘在一起。

### 為什麼遞迴程式碼對程式設計者來說可能比較不直覺？

大多數程式設計者習慣的是線性執行的命令式程式碼。

### 遞迴程式碼和傳統命令式程式碼有什麼不同？

函數呼叫自己，而不是使用迴圈。

### 階乘計算有什麼關鍵特色？

把一個數字乘上所有比它小的正整數。

## 小測驗

<details>
<summary>階乘在數學上的定義是什麼？</summary>
一個整數與所有比它小的正整數相乘的乘積，例如 3 的階乘是 1 × 2 × 3
</details>

<details>
<summary>實作階乘有哪兩種不同的程式設計方式？</summary>
命令式的做法（使用迴圈）與遞迴的做法（函數呼叫自己）
</details>

<details>
<summary>為什麼遞迴實作讀起來可能比較吃力？</summary>
需要在腦中追蹤函數呼叫與自我參照，也可能不符合從左到右、從上到下的閱讀習慣
</details>

<details>
<summary>遞迴實作和命令式實作有什麼不同？</summary>
遞迴在函數裡呼叫函數本身，命令式則用迴圈或一步一步的指令
</details>

<details>
<summary>函數式程式設計解決問題的方式有什麼關鍵特色？</summary>
通常偏好用遞迴取代命令式迴圈，強調函數組合與自我參照的計算
</details>

<details>
<summary>階乘函數計算的是什麼數學運算？</summary>
把從 1 到該數字（包含該數字）的所有正整數乘在一起
</details>

<details>
<summary>為什麼遞迴程式碼對程式設計者來說可能比較不直覺？</summary>
大多數程式設計者習慣線性執行的命令式程式碼
</details>

<details>
<summary>遞迴程式碼和傳統命令式程式碼有什麼不同？</summary>
函數呼叫自己，而不是使用迴圈
</details>

<details>
<summary>階乘計算有什麼關鍵特色？</summary>
把一個數字乘上所有比它小的正整數
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
