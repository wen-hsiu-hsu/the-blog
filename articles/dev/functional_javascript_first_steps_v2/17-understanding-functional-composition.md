---
title: '函數合成：用 hypeUp 範例看懂函數管線與由內而外的執行順序'
description: '函數式程式就是一個函數，靠合成小函數組成：上一個的輸出成為下一個的輸入。用 ender 與 hypeUp 範例看懂部分應用如何重用，以及巢狀呼叫跟閱讀方向相反的執行順序。'
date: 2026-10-15
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 17
chapter: 'Function Composition'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionComposition
    - Closure
---

# 函數合成：用 hypeUp 範例看懂函數管線與由內而外的執行順序

> [[15-closure-overview|閉包那篇]]最後提到，把外層作用域鎖進內層函數，讓函數可以依需要重用與重新組合，「組合」的部分課程後面再談。這一篇進入新章節 Function Composition，正式談怎麼把函數組合起來。

## 函數式程式就是一個函數

「函數式程式」這個名稱本身就給了提示。比較三種程式設計方式，程式各自由什麼組成：

- **命令式程式設計**：程式由一堆命令組成，這些命令可能再被歸類成程序（procedure）或不純的函數
- **物件導向程式設計**：命令式的邏輯被包進一個個物件裡，程式由一堆物件組成
- **函數式程式設計**：程式就是一個函數，或者說，是一堆函數一起合作，完成老闆要求的計算

這呼應了[[02-what-is-functional-programming|第二篇]]比較程式設計典範時的結論：函數式只需要函數這一個基本單位。

問題來了：只有一個函數，要怎麼做出有用的程式？答案是把很多負責一小部分工作的小函數，**合成（compose）**成一個大函數。

## 輸出變成輸入

[[03-pure-functions-overview|純函數那篇]]講過，純函數就是接收一個輸入、回傳一個輸出。講師用圖形來比喻：

- **函數 f**：給它一個圓形，回傳同樣顏色的三角形，只改形狀、不改顏色
- **函數 g**：只改顏色、不改形狀

f 的輸出只是更多的資料，所以它可以直接拿來當另一個函數的輸入。輸入變成輸出，輸出又變成下一個輸入，這樣一路傳下去。

把一個圖形依序傳過 f 和 g，得到的就是形狀和顏色都改變了的圖形。這就是 f 和 g 的合成。

## 小陷阱：閱讀方向跟執行順序相反

上面的流程是先對 x 呼叫 f，再對結果呼叫 g，寫成程式碼是這樣：

```js
g(f(x));
```

在腦中想像管線時，習慣從左到右：先 f、再 g。但寫成程式碼時，f 反而出現在右邊，得在腦中切換成由右到左來讀。講師說，至少在習慣由左到右閱讀的西方，這是個需要留意的小陷阱。

判斷方式很簡單：想想哪個函數先被呼叫。巢狀的括號裡，最裡面的東西會最先執行。

### 數學課的小圓圈

函數合成還有另一種寫法，可能在數學課看過：在 f 和 g 中間放一個小圓圈，寫成 `f ∘ g`，有時也讀成 f dot g，代表 f 和 g 的合成。講師說這就像一種視覺上的術語，在不同地方可能會看到稍微不同的寫法。

## 範例：用 ender 做出一組函數

接下來的例子會讓部分應用的好處更清楚。閉包那篇用過 `makeAdjectifier` 做出鎖定形容詞的函數，這次換成 `ender`，接收一個結尾字串，回傳一個函數：

```js
var ender = (ending) => (input) => input + ending;
```

這裡用連續的箭頭函數寫出巢狀函數，越來越接近更純粹的函數式語言裡會看到的語法。

- **外層函數**：接收結尾 `ending`，回傳內層函數
- **內層函數**：接收 `input`，把 `input` 和 `ending` 拼在一起

內層函數就是一個閉包，這只是用另一種語法寫出閉包那篇的巢狀函數。在第二個箭頭函數裡，既能存取外層作用域的 `ending`，也能存取自己作用域的 `input`，而且這種巢狀可以一路延伸到任意層數。

### lambda calculus 的影子

講師順帶一提，函數式程式設計的理論基礎 lambda calculus，是 Alonzo Church 在 1930 年代發明的一套計算的數學系統，也是現在各種函數式語言 lambda 標誌的由來。最硬派、最學術的老派函數式程式設計能做的事，其實光靠一個接一個的箭頭函數就做得到，相關資源放在課程的結語（epilogue）。

### 部分應用出三個函數

有了 `ender`，就能部分應用出三個鎖定不同結尾的函數：

```js
var adore = ender(' rocks');
var announce = ender(", y'all");
var exclaim = ender('!');
```

- **`adore`**：表達喜愛，在後面加上「rocks」
- **`announce`**：像在對大家宣布，加上「, y'all」
- **`exclaim`**：加上驚嘆號。講師說自己寫 email 時會放一大堆驚嘆號，收到講師的信要有心理準備（雖然講師也很不擅長回信）

## 把三個函數合成 hypeUp

講師想要能輕鬆替任何技術話題造勢，於是寫了 `hypeUp`，接收一個讓人興奮的東西，把它依序傳過上面三個函數，得到最終結果：

```js
var hypeUp = (x) => exclaim(announce(adore(x)));

hypeUp('JS'); // "JS rocks, y'all!"
hypeUp('FP'); // "FP rocks, y'all!"
```

這裡唯一要小心的，就是前面提過的陷阱：結尾被加上去的順序，跟原始碼裡由左到右看到的順序不一樣。

以 `hypeUp('JS')` 為例，執行順序是：

1. 最先執行最裡面的 `adore`，得到 `'JS rocks'`
2. `'JS rocks'` 傳進 `announce`，得到 `"JS rocks, y'all"`，語氣平淡，毫無興奮感
3. 結果再傳進 `exclaim`，加上驚嘆號，得到 `"JS rocks, y'all!"`，終於有了大家應得、也渴望的興奮感

`exclaim` 在程式碼裡寫在最左邊，卻是最後才執行的函數。

## 複習

### 函數式程式設計裡，合成的核心原則是什麼？

在函數式程式設計裡，程式由多個較小的函數串接組成，上一個函數的輸出成為下一個函數的輸入，形成一條轉換資料的管線。

### 函數合成在函數式程式設計裡通常怎麼表示？

函數合成有兩種表示方式：用巢狀的函數呼叫（`f(g(x))`），或用圓圈符號（`f ∘ g`）。兩者意思相同，都是依序套用函數。

### 在函數式程式設計的脈絡下，閉包是什麼？

閉包是能存取外層作用域變數的函數，即使外層函數已經執行完畢，依然能保留並使用那些變數。

### 函數式程式設計裡的 lambda calculus 是什麼？

lambda calculus 是 1930 年代發明的一套計算的數學系統，是函數式程式語言的理論基礎，提供定義與合成函數的方式。

### 合成函數時要特別留意什麼？

合成函數時要記得，執行順序是由右到左，即使在程式碼裡看起來，函數是由左到右排列。

### 函數式程式設計裡，程式主要由什麼組成？

一個或多個函數。

### 純函數的關鍵特性是什麼？

接收一個輸入、回傳一個輸出，不改變外部狀態。

### 把輸入依序傳過多個函數（例如 `adore`、`announce`、`exclaim`）的函數，展示了什麼概念？

函數合成與串接。

### 在函數合成裡，`g(f(x))` 這個運算式的執行順序是什麼？

先呼叫 f，再對結果呼叫 g。

## 小測驗

<details>
<summary>函數式程式設計裡，合成的核心原則是什麼？</summary>
在函數式程式設計裡，程式由多個較小的函數串接組成，上一個函數的輸出成為下一個函數的輸入，形成一條轉換資料的管線
</details>

<details>
<summary>函數合成在函數式程式設計裡通常怎麼表示？</summary>
函數合成有兩種表示方式：用巢狀的函數呼叫（<code>f(g(x))</code>），或用圓圈符號（<code>f ∘ g</code>）。兩者意思相同，都是依序套用函數
</details>

<details>
<summary>在函數式程式設計的脈絡下，閉包是什麼？</summary>
閉包是能存取外層作用域變數的函數，即使外層函數已經執行完畢，依然能保留並使用那些變數
</details>

<details>
<summary>函數式程式設計裡的 lambda calculus 是什麼？</summary>
lambda calculus 是 1930 年代發明的一套計算的數學系統，是函數式程式語言的理論基礎，提供定義與合成函數的方式
</details>

<details>
<summary>合成函數時要特別留意什麼？</summary>
合成函數時要記得，執行順序是由右到左，即使在程式碼裡看起來，函數是由左到右排列
</details>

<details>
<summary>函數式程式設計裡，程式主要由什麼組成？</summary>
一個或多個函數
</details>

<details>
<summary>純函數的關鍵特性是什麼？</summary>
接收一個輸入、回傳一個輸出，不改變外部狀態
</details>

<details>
<summary>把輸入依序傳過多個函數（例如 <code>adore</code>、<code>announce</code>、<code>exclaim</code>）的函數，展示了什麼概念？</summary>
函數合成與串接
</details>

<details>
<summary>在函數合成裡，<code>g(f(x))</code> 這個運算式的執行順序是什麼？</summary>
先呼叫 f，再對結果呼叫 g
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
