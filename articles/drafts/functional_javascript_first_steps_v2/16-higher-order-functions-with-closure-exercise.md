---
title: '用閉包做部分應用：把 diamondPattern 拆成鎖定顏色或寬度的函數'
description: '閉包練習：用 makeMonotonePattern、makeFixedWidthPattern 回傳鎖定顏色或寬度的函數，把三個參數的 diamondPattern 部分應用成可重用的圖案函數，改寫成箭頭函數。'
date: 2026-10-14
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 16
chapter: 'Scope & Closure'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - Closure
    - PartialApplication
    - HigherOrderFunction
    - ArrowFunction
    - PureFunction
    - SVG
---

# 用閉包做部分應用：把 diamondPattern 拆成鎖定顏色或寬度的函數

> [[15-closure-overview|上一篇]]用 `makeAdjectifier` 介紹了閉包與部分應用：內層函數會記住外層作用域的值，把部分參數先鎖定下來。這一篇拿[[10-recursion-art-exercise|第十篇]]畫菱形圖案的 `diamondPattern` 來練習，用閉包做出幾個鎖定不同參數的新函數。

## 這次不用肉眼看，交給測試

這次的練習重新回到 `diamondPattern`，但不再打開畫面看圖案長什麼樣子，只跑測試。

原因是 `diamondPattern` 是純函數，不需要用肉眼檢查它的結果：給它同樣的輸入，就一定得到同樣的輸出。把圖案渲染到畫面上的不純部分，第十篇已經處理好了，那是位在程式最外圍的事，這次不用管。只要讓電腦驗證結果正確就夠了。

## 起始程式碼

`patterns.js` 裡的 `diamondPattern` 跟第十篇的解答一樣，接收兩個顏色參數 `color1`、`color2`（可以相同，也可以不同），以及一個寬度 `width`，回傳描述圖案的 SVG 字串：

```js
export function diamondPattern(color1, color2, width) {
    const rect = `<rect x=0 y=0 width=${width} height=${width} fill="${color1}" />`;

    if (width <= 20) {
        // BASE CASE
        return rect;
    } else {
        // RECURSIVE CASE
        const smallerWidth = (width * Math.SQRT2) / 2;
        return `${rect}
            <g transform="translate(${width / 2}) rotate(45)">
                ${diamondPattern(color2, color1, smallerWidth)}
            </g>`;
    }
}
```

這次要做的，是用閉包定義新的高階函數，把 `diamondPattern` 的部分參數鎖定下來。檔案下方有三個待完成的函數，以及已經呼叫過它們的匯出變數：

```js
export function makeMonotonePattern(color2) {
    // TODO return a monotonePattern function that takes
    // in color1 and width and always uses the given color2
}

export const purplePattern = makeMonotonePattern('purple');

export function makeFixedWidthPattern(width) {
    // TODO return a fixedWidthPattern function that takes in
    // both colors, and returns a pattern of the given width
}

export const largePattern = makeFixedWidthPattern(500);

export function makeMonotoneFixedWidthPattern(color2, width) {
    // TODO return a pattern function that takes in color1,
    // and returns a pattern with the given color2 & width
}

export const smallBluePattern = makeMonotoneFixedWidthPattern('blue', 100);
```

- **`makeMonotonePattern`**：鎖定 `color2`，回傳的函數接收 `color1` 和 `width`。`purplePattern` 就是 `diamondPattern` 的部分應用，第二個顏色固定是紫色。講師自己也說 monotone（單色）大概不是什麼好名字，請大家先將就一下
- **`makeFixedWidthPattern`**：改成鎖定 `width`，回傳的函數接收兩個顏色
- **`makeMonotoneFixedWidthPattern`**：同時鎖定 `color2` 和 `width` 兩個值

任務是定義這三個函數，讓它們回傳把指定值鎖進 `diamondPattern` 的函數，讓測試通過。講師說，就當作活動一下函數式的筋骨。

### 測試內容

`patterns.test.js` 測的是 `purplePattern` 和 `largePattern` 兩個匯出變數：

```js
import { describe, it, expect } from 'vitest';
import { purplePattern, largePattern } from './patterns.js';

describe('makeMonotonePattern', () => {
    describe('purplePattern', () => {
        it('should be a function', () => {
            expect(typeof purplePattern).toBe('function');
        });
        it('should return a pattern (SVG contents) when called', () => {
            const bluePurple = purplePattern('blue', 50);
            expect(typeof bluePurple).toBe('string');
            expect(bluePurple.startsWith('<') && bluePurple.endsWith('>')).toBeTruthy();
        });
        it('should always create patterns with the color purple', () => {
            const pinkPurple = purplePattern('pink', 100);
            const whitePurple = purplePattern('white', 300);
            expect(pinkPurple.includes('purple')).toBeTruthy();
            expect(whitePurple.includes('purple')).toBeTruthy();
        });
    });
});

describe('makeFixedWidthPattern', () => {
    describe('largePattern', () => {
        it('should always return a pattern of the given width', () => {
            const lgBluePink = largePattern('blue', 'pink');
            const lgBlackWhite = largePattern('black', 'white');
            expect(lgBluePink.includes('width=500')).toBeTruthy();
            expect(lgBlackWhite.includes('width=500')).toBeTruthy();
        });
    });
});
```

- **`purplePattern`**：必須是函數；呼叫後回傳以 `<` 開頭、`>` 結尾的 SVG 字串；不管第一個顏色傳什麼，字串裡都要有 `purple`
- **`largePattern`**：不管傳入哪兩個顏色，回傳的字串裡都要有 `width=500`

## 實作 makeMonotonePattern

`makeMonotonePattern` 要回傳一個函數。講師先搭個架子，問學員這個函數要接收哪些參數，學員回答 `color1` 和 `width`，也就是 `color2` 以外剩下的那些。

這個函數要回傳什麼？學員說是 `diamondPattern`。更精確地說，是把 `diamondPattern` 套用在 `color1`、`width`，以及閉包記住的 `color2` 上。`color2` 不在內層函數的參數裡，它是從外層作用域鎖定進來的值：

```js
export function makeMonotonePattern(color2) {
    return function (color1, width) {
        return diamondPattern(color1, color2, width);
    };
}
```

跑測試後，有幾個測試通過了，剩下的失敗都跟其他還沒寫的函數有關，這一步就算完成。

## 實作 makeFixedWidthPattern

固定寬度的版本，講師直接把上一個函數複製過來改。差別在回傳的函數不再接收 `color1` 和 `width`，而是改成接收 `color1` 和 `color2`：

```js
export function makeFixedWidthPattern(width) {
    return function (color1, color2) {
        return diamondPattern(color1, color2, width);
    };
}
```

做法完全一樣，一樣是鎖定其中一個變數，只是換了要鎖定哪一個。

### 改用箭頭函數

講師到目前為止都用 `function` 關鍵字，但這些函數也完全可以寫成箭頭函數，只要調整一下大括號。喜歡一行寫完的俐落感、不想寫 `function` 關鍵字和大括號的話，可以這樣寫，這純粹是個人偏好：

```js
export function makeMonotonePattern(color2) {
    return (color1, width) => diamondPattern(color1, color2, width);
}

export function makeFixedWidthPattern(width) {
    return (color1, color2) => diamondPattern(color1, color2, width);
}
```

講師說自己很喜歡箭頭函數，尤其是寫函數式程式的時候，因為它清楚表達出「這個函數只是回傳一個值」。

## 實作 makeMonotoneFixedWidthPattern

最後用同樣的原則完成 `makeMonotoneFixedWidthPattern`。這次一口氣鎖定 `color2` 和 `width` 兩個值，回傳的函數只接收剩下的 `color1`，其他兩個則由閉包記住：

```js
export function makeMonotoneFixedWidthPattern(color2, width) {
    return (color1) => diamondPattern(color1, color2, width);
}
```

所以 `smallBluePattern` 是一個只要傳入第一個顏色，就會畫出寬度 100、第二個顏色固定為藍色的圖案函數。

## 從三元函數到部分應用

`diamondPattern` 原本接收三個值，也就是一個**三元函數（ternary function）**。這裡的 ternary 指的是參數有三個，跟[[14-implement-reduce-function-exercise|第十四篇]]寫 max reducer 時用的三元運算子不是同一回事；上一篇的 `greet` 接收兩個參數，則是二元函數。

這一節用 `diamondPattern` 做出了好幾個部分應用的函數：單色圖案、大圖案、小的單色圖案等等。它們都是 `diamondPattern` 的部分應用版本，靠著閉包，記住了想要鎖定的那些值。

## 複習

### 函數式程式設計裡的閉包是什麼？

閉包是一種技巧，讓函數記住並能存取外層作用域的變數，即使外層函數已經執行完畢也一樣。閉包可以用來做出部分應用的函數，把特定的值（例如顏色或寬度這類參數）鎖定下來，之後呼叫回傳的函數時，這些值依然會被記住。

### 函數式程式設計裡的部分應用是什麼？

部分應用是一種技巧，把多參數函數的部分參數固定下來，轉換成參數比較少的新函數。在菱形圖案的例子裡，單色圖案、固定寬度圖案這些函數，都是把值部分應用到原本的 `diamondPattern` 而做出來的。

### 箭頭函數在函數式程式設計裡有什麼用處？

箭頭函數提供精簡的語法來建立函數。回傳一個值時，不需要寫 `function` 關鍵字和大括號，程式碼更精簡。沒有大括號、隱式回傳的箭頭函數，特別能清楚表達「這個函數只是回傳一個值」，跟函數式程式設計的原則很契合。例如 `(color1) => diamondPattern(color1, color2, width)`，就比用 `function` 關鍵字加上明確的 `return` 精簡得多。

### 在菱形圖案的脈絡下，三元函數是什麼意思？

三元函數是接收三個參數的函數。在菱形圖案的例子裡，原本的 `diamondPattern` 就是三元函數，接收 `color1`、`color2` 與 `width` 三個值。

### 做出單色圖案、固定寬度圖案這類高階函數的目的是什麼？

透過部分應用做出的高階函數，可以預先設定部分參數，從比較通用的函數產生出特化的版本。這樣能簡化函數呼叫、提高程式碼的重用性，做出更專注、更貼合特定情境的函數。

### 在菱形圖案的函數裡使用閉包，主要目的是什麼？

做出新的高階函數，把特定的值鎖定下來。

### 在菱形圖案函數的脈絡下，部分應用是什麼意思？

鎖定部分的值，其他的值則保留彈性。

### 原本的 `diamondPattern` 函數接收幾個參數？

三個參數。

### 在這個函數式程式設計的脈絡下，使用箭頭函數有什麼好處？

清楚表達出這個函數只是回傳一個值。

## 小測驗

<details>
<summary>函數式程式設計裡的閉包是什麼？</summary>
閉包是一種技巧，讓函數記住並能存取外層作用域的變數，即使外層函數已經執行完畢也一樣。閉包可以用來做出部分應用的函數，把特定的值（例如顏色或寬度這類參數）鎖定下來，之後呼叫回傳的函數時，這些值依然會被記住
</details>

<details>
<summary>函數式程式設計裡的部分應用是什麼？</summary>
部分應用是一種技巧，把多參數函數的部分參數固定下來，轉換成參數比較少的新函數。在菱形圖案的例子裡，單色圖案、固定寬度圖案這些函數，都是把值部分應用到原本的 <code>diamondPattern</code> 而做出來的
</details>

<details>
<summary>箭頭函數在函數式程式設計裡有什麼用處？</summary>
箭頭函數提供精簡的語法來建立函數。回傳一個值時，不需要寫 <code>function</code> 關鍵字和大括號，程式碼更精簡。沒有大括號、隱式回傳的箭頭函數，特別能清楚表達「這個函數只是回傳一個值」，跟函數式程式設計的原則很契合。例如 <code>(color1) =&gt; diamondPattern(color1, color2, width)</code>，就比用 <code>function</code> 關鍵字加上明確的 <code>return</code> 精簡得多
</details>

<details>
<summary>在菱形圖案的脈絡下，三元函數是什麼意思？</summary>
三元函數是接收三個參數的函數。在菱形圖案的例子裡，原本的 <code>diamondPattern</code> 就是三元函數，接收 <code>color1</code>、<code>color2</code> 與 <code>width</code> 三個值
</details>

<details>
<summary>做出單色圖案、固定寬度圖案這類高階函數的目的是什麼？</summary>
透過部分應用做出的高階函數，可以預先設定部分參數，從比較通用的函數產生出特化的版本。這樣能簡化函數呼叫、提高程式碼的重用性，做出更專注、更貼合特定情境的函數
</details>

<details>
<summary>在菱形圖案的函數裡使用閉包，主要目的是什麼？</summary>
做出新的高階函數，把特定的值鎖定下來
</details>

<details>
<summary>在菱形圖案函數的脈絡下，部分應用是什麼意思？</summary>
鎖定部分的值，其他的值則保留彈性
</details>

<details>
<summary>原本的 <code>diamondPattern</code> 函數接收幾個參數？</summary>
三個參數
</details>

<details>
<summary>在這個函數式程式設計的脈絡下，使用箭頭函數有什麼好處？</summary>
清楚表達出這個函數只是回傳一個值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
