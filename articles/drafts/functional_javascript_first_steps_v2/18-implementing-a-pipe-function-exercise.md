---
title: '實作 pipe 函數：用遞迴與展開運算子把多個函數由左到右串成管線'
description: '用 head、tail 與展開運算子遞迴實作 pipe：零個函數回傳 identity function，一個就直接回傳，多個時先套用第一個再交給剩下函數的管線，免去倒著讀的巢狀呼叫。'
date: 2026-10-15
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 18
chapter: 'Function Composition'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - FunctionComposition
    - Pipe
    - Recursion
    - BaseCase
    - SpreadOperator
    - RestParameters
    - IdentityFunction
    - HigherOrderFunction
---

# 實作 pipe 函數：用遞迴與展開運算子把多個函數由左到右串成管線

> [[17-understanding-functional-composition|上一篇]]用 `hypeUp = (x) => exclaim(announce(adore(x)))` 示範函數合成，也點出一個小陷阱：巢狀呼叫在程式碼裡的順序，跟實際執行的順序相反。這一篇動手寫一個 `pipe` 函數，讓函數可以照執行順序由左到右寫。

## pipe 要解決什麼問題

`pipe`（也叫 pipeline 函數）是函數式程式設計工具箱裡很常見的工具，其實可以從別的函式庫匯入，但這次要自己做一個。它接收任意數量的函數，把它們合成成**一個**函數，而且不用再把呼叫倒過來巢狀寫。

有了它，就能用由左到右的方式寫出「先把這些值 join 起來，再把回傳值 split 開，然後再 reverse」這種流程。每次都要在腦中把運算順序倒過來的那種腦力體操，就可以省下來了，程式碼也更接近口語描述的方式。上一篇的 `hypeUp` 就是例子：心裡想的是先 `adore`、再 `announce`、再 `exclaim`，寫出來卻得倒過來。

## 起始程式碼

練習檔是 `funpro.js`，前幾篇做好的 `filter`、`map`、`reduce` 以及 `length`、`head`、`tail` 這些陣列輔助函數都還在，這次要用累積到現在的工具來實作 `pipe`：

```js
export function pipe(...fns) {
    //// Base cases

    // If we have zero functions, this is a no-op; return the identity fn
    // TODO

    // If we have only 1 fn, the pipeline is equivalent to just that fn
    // TODO

    //// Recursive case
    // If we have multiple functions, return a function that
    // calls the first fn on the input and passes the result
    // as input to another pipeline of the remaining fns

    return () => {}; // TODO
}
```

註解已經把實作方向寫出來了：兩個基本情況，加上一個遞迴情況。跟 [[14-implement-reduce-function-exercise|reduce 那篇]]一樣，這次也是一路遞迴到底，並用 `length`、`head`、`tail` 這些輔助函數來練習函數式的寫法：

```js
export function length(array) {
    return array.length;
}

export function head(array) {
    return array[0];
}

export function tail(array) {
    return array.slice(1);
}
```

### 用展開運算子收集任意數量的函數

`pipe` 接收的不是一個陣列，而是一串用逗號分隔的參數，每個參數都是一個函數。而且事先不知道會有幾個，`pipe` 要能處理任意數量的函數。

參數列裡的 `...fns` 就是用展開運算子（spread operator），把 `pipe` 收到的所有參數收集成一個叫 `fns` 的陣列。之後需要的話，也可以反過來用展開運算子把陣列攤開。講師說沒怎麼用過展開運算子也沒關係，還有其他做法，有興趣可以去查 MDN。參數列裡的 `...fns` 嚴格說叫其餘參數（rest parameter），講師口語上都稱為 spread。

## 基本情況一：沒有函數

先從基本情況開始。沒有任何函數時，管線就結束了，但要回傳什麼？`pipe` 一定要回傳一個函數，所以這裡回傳講師稱為 **identity function** 的函數，也就是什麼都不做的 no-op 函數：給它什麼輸入，就原封不動吐回來。

```js
if (length(fns) === 0) return (input) => input;
```

`fns` 是所有傳進 `pipe` 的函數組成的陣列，長度為 0 就代表沒有函數。

## 基本情況二：只有一個函數

只有一個函數時，一樣要回傳一個函數。給這個回傳的函數一個輸入，想要的輸出是什麼？學員回答：把輸入傳給那唯一的函數，也就是 `head(fns)`。

最明確的寫法是取出 `head(fns)`，再直接接一組括號，用輸入呼叫它：

```js
if (length(fns) === 1) return (input) => head(fns)(input);
```

講師說這裡開始出現比較「函數式」的語法了。`head(fns)` 本身就是一個函數，所以可以直接在後面加括號呼叫它。

但還有更短的寫法：直接回傳那個函數就好，因為它本來就是「接收輸入、對輸入做運算」的函數。兩種寫法完全等價：

```js
if (length(fns) === 1) return head(fns);
```

## 遞迴情況：先套用第一個，再交給剩下的管線

有多個函數時，要先套用第一個函數，再把結果送進一條由**剩下所有函數**組成的管線。講師說接下來會有不少括號，但一定撐得過去。

### 回傳的一樣是函數

跟前兩個情況一樣，這裡還是回傳一個接收 `input` 的函數。`pipe` 永遠回傳「接收輸入、回傳輸出」的函數，而這個函數裡面會再呼叫一次 `pipe`。

### 用 tail 和展開運算子建立剩下的管線

要用剩下的函數建立遞迴管線，學員馬上想到 `tail`，也就是 `head` 的另一半。不過 `tail` 回傳的是一個陣列，一個裝著函數的陣列，而 `pipe` 不接收陣列。

這時展開運算子就派上用場了：把陣列裡的元素攤開，當成一個個參數傳進去，效果就跟用逗號把每個元素分開傳入一樣：

```js
pipe(...tail(fns));
```

### 別忘了第一個函數

這樣還沒完成，因為還漏了 `head`，也就是第一個函數。講師說，腦力體操就是從這裡開始的。

上一篇用圖形比喻函數：f 把圓形變成三角形，g 只改顏色，一個圖形依序傳過 f 和 g 就是合成。

回到這個圖形，問題是：f 和 g 哪個要先套用？以這裡來說，是 `head` 先，還是剩下的管線先？不管傳進管線的輸入是什麼，第一個要經過的，都應該是傳給 `pipe` 的第一個函數。寫這個工具的目的就是不用再煩惱執行順序，傳入 f 再傳入 g，就要得到先 f 後 g 的結果。

所以第一步跟基本情況二一樣，取出 `head` 函數，用輸入呼叫它：

```js
head(fns)(input);
```

講師說不一定要存成變數，但可以把它想成「第一個輸出」，也就是 f 處理完輸入後產生的那個圖形。接下來要把它傳給剩下的管線。

### 括號要放哪裡

`head(fns)(input)` 是執行時**最先**發生的事，所以在呼叫的寫法裡，它反而會出現在**最後面**，又是那個倒過來的順序。`pipe(...tail(fns))` 回傳的是一個函數，在它後面再加一組括號，把第一個輸出當成輸入傳進去：

```js
export function pipe(...fns) {
    if (length(fns) === 0) return (input) => input;

    if (length(fns) === 1) return head(fns);

    return (input) => pipe(...tail(fns))(head(fns)(input));
}
```

第一個函數處理輸入後的結果，成了遞迴管線的輸入。剩下的管線再用同樣的方式拆成 head 和 tail，直到剩一個函數時落入基本情況二。

## 用測試驗證執行順序

測試檔裡先定義三個只做一件事的小函數：

```js
const splitFn = (str) => str.split('');
const reverseFn = (strArray) => strArray.reverse();
const joinFn = (strArray) => strArray.join('');
```

- **`reverseFn`**：把陣列反轉
- **`joinFn`**：把陣列裡所有的值串成一個字串
- **`splitFn`**：把字串拆成一個個字元

前兩個測試確認 `pipe` 不論接收零到三個函數，都會回傳一個函數，而且是只接收一個參數的函數（`.length` 為 1）。最後一個測試則用不同順序組出兩條管線，比對結果是否不同，藉此確認 `pipe` 有照預期的順序套用函數：

```js
it('should apply the functions in the correct order', () => {
    const reverseJoinSplit = pipe(reverseFn, joinFn, splitFn);
    const joinSplitReverse = pipe(joinFn, splitFn, reverseFn);
    expect(reverseJoinSplit(['pipes', 'are', 'cool'])).toStrictEqual([
        'c',
        'o',
        'o',
        'l',
        'a',
        'r',
        'e',
        'p',
        'i',
        'p',
        'e',
        's',
    ]);
    expect(joinSplitReverse(['pipes', 'are', 'cool'])).toStrictEqual([
        'l',
        'o',
        'o',
        'c',
        'e',
        'r',
        'a',
        's',
        'e',
        'p',
        'i',
        'p',
    ]);
});
```

`reverseJoinSplit` 的流程是：

1. 把 `['pipes', 'are', 'cool']` 反轉成 `['cool', 'are', 'pipes']`
2. join 成字串 `'coolarepipes'`
3. split 成一個個字元

`joinSplitReverse` 拿同一個輸入，先 join 成一個字串、再拆成字元陣列，最後才反轉，得到的是完全不同的結果。

講師說，這等於是靠著自己做的函數式工具把自己拉上來，能用更好讀、但依然純函數式的方式，讓輸入流過一條由多個函數組成的管線。更精確地說，是**建立**那條管線，而管線本身就是一個函數。它像一個大黑盒子，不用再費腦筋把函數按正確順序巢狀起來，只要丟進原始輸入，就會經過所有想要的轉換，得到最終輸出。

## 後記：卡在一個 `...`

這次的練習我沒有成功寫出來，原因是遞迴情況裡呼叫 `pipe` 時，忘了在 `tail(fns)` 前面加上展開運算子，哈哈。少了 `...`，`pipe` 收到的就是一個裝著函數的陣列，而不是一個個函數，正好踩中講師特別提醒的那一點。

## 複習

### 函數式程式設計裡的 pipe 函數是什麼？

一種工具函數，接收多個函數作為參數並把它們合成在一起，讓函數能依由左到右的順序套用，不需要寫巢狀的函數呼叫。

### 使用 pipe 函數最主要的好處是什麼？

避免巢狀的函數呼叫，讓函數合成能用更自然的由左到右順序寫，程式碼更好讀。

### 函數式程式設計裡的 `pipe` 函數有什麼用途？

`pipe` 函數接收多個函數作為參數，把它們合成成一個依由左到右順序套用的函數。這樣寫出來的程式碼，執行順序就跟口語描述的順序一致，不用在腦中把巢狀呼叫的順序倒過來。

### 實作 `pipe` 函數時，要怎麼在 JavaScript 裡接收數量不定的函數參數？

在函數簽名裡使用展開運算子：`function pipe(...fns)`。不管傳入幾個參數，都會被收集成一個叫 `fns` 的陣列。

### `pipe` 函數接收多個函數時，在遞迴情況裡，輸入應該怎麼處理？

輸入先傳給 head（第一個）函數，得到一個中間結果，再把這個結果當成輸入，傳給由其餘（tail）函數組成的遞迴管線。

### pipe 函數裡，哪個 JavaScript 語法能接收任意數量的函數參數？

其餘參數語法（`...`）。

### pipe 函數收到零個函數時，基本情況是什麼？

回傳一個 identity function，把輸入原封不動地回傳。

### 實作 pipe 函數的遞迴時，一開始的兩個步驟是什麼？

定義零個函數與一個函數這兩個基本情況。

### 合成多個函數時，使用 pipe 函數最主要的好處是什麼？

能用好讀的由左到右順序寫函數，而不是寫巢狀呼叫。

### 實作 pipe 函數時，收到多個函數的情況下，哪個函數要最先套用在輸入上？

參數列裡的第一個函數。

## 小測驗

<details>
<summary>函數式程式設計裡的 pipe 函數是什麼？</summary>
一種工具函數，接收多個函數作為參數並把它們合成在一起，讓函數能依由左到右的順序套用，不需要寫巢狀的函數呼叫
</details>

<details>
<summary>使用 pipe 函數最主要的好處是什麼？</summary>
避免巢狀的函數呼叫，讓函數合成能用更自然的由左到右順序寫，程式碼更好讀
</details>

<details>
<summary>函數式程式設計裡的 <code>pipe</code> 函數有什麼用途？</summary>
<code>pipe</code> 函數接收多個函數作為參數，把它們合成成一個依由左到右順序套用的函數。這樣寫出來的程式碼，執行順序就跟口語描述的順序一致，不用在腦中把巢狀呼叫的順序倒過來
</details>

<details>
<summary>實作 <code>pipe</code> 函數時，要怎麼在 JavaScript 裡接收數量不定的函數參數？</summary>
在函數簽名裡使用展開運算子：<code>function pipe(...fns)</code>。不管傳入幾個參數，都會被收集成一個叫 <code>fns</code> 的陣列
</details>

<details>
<summary><code>pipe</code> 函數接收多個函數時，在遞迴情況裡，輸入應該怎麼處理？</summary>
輸入先傳給 head（第一個）函數，得到一個中間結果，再把這個結果當成輸入，傳給由其餘（tail）函數組成的遞迴管線
</details>

<details>
<summary>pipe 函數裡，哪個 JavaScript 語法能接收任意數量的函數參數？</summary>
其餘參數語法（<code>...</code>）
</details>

<details>
<summary>pipe 函數收到零個函數時，基本情況是什麼？</summary>
回傳一個 identity function，把輸入原封不動地回傳
</details>

<details>
<summary>實作 pipe 函數的遞迴時，一開始的兩個步驟是什麼？</summary>
定義零個函數與一個函數這兩個基本情況
</details>

<details>
<summary>合成多個函數時，使用 pipe 函數最主要的好處是什麼？</summary>
能用好讀的由左到右順序寫函數，而不是寫巢狀呼叫
</details>

<details>
<summary>實作 pipe 函數時，收到多個函數的情況下，哪個函數要最先套用在輸入上？</summary>
參數列裡的第一個函數
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
