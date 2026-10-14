---
title: '純函數（Pure Function）是什麼？用 greet 範例看懂副作用與外部狀態，把不純的函數改寫成純函數'
description: '函數式程式設計歸結起來就是純函數：只看輸入、只回傳輸出，不讀取外部狀態，也不對外部世界產生副作用。透過 greet 範例拆解讀取外層變數、console.log 與沒有 return 為什麼不純，以及如何把外部變數改成參數、改用 return 回傳結果，讓同樣的輸入永遠得到同樣的輸出，不受外部變動影響。'
date: 2026-10-08
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 3
chapter: 'Programming with Pure Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - PureFunction
    - SideEffect
---

# 純函數（Pure Function）是什麼？用 greet 範例看懂副作用與外部狀態，把不純的函數改寫成純函數

> [[02-what-is-functional-programming|上一篇]]提到，函數式程式設計真正需要的只有一種建構元素：純函數。這一篇就正式進入純函數的定義，看看什麼樣的函數算「純」，什麼樣的函數不算。

## 函數式程式設計歸結起來就是純函數

講師開門見山地說，函數式程式設計可以歸結成一個概念：**純函數（pure function）**。

純函數跟我們平常寫的函數一樣，接收輸入、回傳輸出。差別在於，純函數決定要怎麼計算時，**只看它收到的輸入**：

- 不會去看外部世界的任何其他資訊，例如世界的狀態、今天的天氣、現在幾點
- 只做它需要做的計算，然後回傳輸出
- 除此之外，不做任何其他事

所以純函數本質上就是**從輸入到輸出的轉換**，僅此而已。這也呼應[[02-what-is-functional-programming|上一篇]]的說法：寫函數式程式時，要把程式想成一次把輸入轉換成輸出的過程，而純函數就是這個轉換的最小單位。

## 純函數不能跟外部世界互動

平常在 JavaScript 裡寫函數，我們會讓它做各式各樣的事，例如：

- 跟瀏覽器溝通
- 發出 fetch 請求
- 把東西寫進檔案

這些本質上都是在函數裡跟外部世界溝通。函數式程式設計不允許這麼做。函數只看自己的輸入，只給出一個輸出：它不看外部世界的任何東西，也不對外部世界產生任何影響，**它唯一的效果就是它的回傳值**。

## 範例：拆解一個不純的 greet 函數

講師用一個很簡單的 `greet` 函數當例子。這個函數只有一行，用 `console.log` 印出打招呼的字串，要打招呼的對象則來自外層的 `name` 變數：

```js
let name = 'Alonzo';

function greet() {
    console.log(`Hello, ${name}!`);
}

greet(); // Hello, Alonzo!

name = 'Alan';
greet(); // Hello, Alan!
```

講師請學員找出這個函數哪裡不純，大家點出了兩個問題。

### 問題一：讀取了輸入以外的外部資料

`greet` 用到的 `name` 不是透過參數傳進來的，而是直接從外層作用域拿來用。這代表函數在決定輸出時，看了輸入以外的外部資料，這在純函數裡是不允許的。

結果就是，只要外部的 `name` 被改掉，用完全相同的輸入（在這個例子裡是「沒有輸入」）再呼叫一次 `greet()`，就可能得到不同的結果。上面的範例中，兩次 `greet()` 的呼叫方式一模一樣，印出來的內容卻不同。這正是[[01-Introduction|第一篇]]講師提過的情境：同事在不知情的情況下改掉了 `name`，bug 就這樣冒出來了。

### 問題二：印到 console，而不是回傳值

`greet` 做的事是把字串印到 console，但「印到 console」不等於「回傳一個值」。那這個函數回傳什麼？

它沒有明確的 `return`，而在 JavaScript 裡，沒有明確 `return` 的函數會回傳 `undefined`。一個函數如果沒有回傳它的輸出值，就絕對不可能是純函數，因為它的效果不在回傳值上，而是做了別的事。

印到 console 這個**副作用（side effect）**也有不確定性：同樣是 log，在不同的情況、不同的環境下，運作方式可能不一樣。所以每次執行這個函數，產生的副作用都可能不同。

## 改寫成純函數

把 `greet` 改成純函數的做法，就是針對上面兩個問題各自修正：

- 把 `name` 變成函數的**輸入參數**，讓函數計算時只看這份資料
- 把結果**回傳**出去，而不是印到 console

```js
function greet(name) {
    return `Hello, ${name}!`;
}

greet('Alonzo'); // 'Hello, Alonzo!'

greet('Alan'); // 'Hello, Alan!'
```

改寫之後，輸出只由傳進來的參數決定：傳 `'Alonzo'` 就回傳 `'Hello, Alonzo!'`，傳 `'Alan'` 就回傳 `'Hello, Alan!'`，外部任何變數怎麼改都影響不到它。

講師說，原本的 `greet` 雖然是非常簡單的例子，但很能說明在函數式程式裡要避免哪些寫法：讀取輸入以外的外部資料，以及用副作用取代回傳值。

## 複習

### 純函數有哪些關鍵特性？

純函數只看自己的輸入參數，進行計算後回傳輸出，不產生任何副作用，也不改變外部狀態。

### 為什麼在函數式程式設計中，印到 console 被視為不純的操作？

印到 console 是一種會改變外部環境的副作用，而且它本身不回傳值，違反了純函數的原則。

### 函數使用外層作用域的變數時，為什麼會變得不純？

使用外層作用域的變數，代表函數不再只依賴自己的輸入參數，打破了純函數只依賴直接輸入的原則。

### 要怎麼把不純的函數改寫成純函數？

把外部變數改成輸入參數，並改為回傳輸出值，而不是印到 console 或執行其他副作用。

### 純函數最主要做的是什麼樣的轉換？

純函數單純就是把輸入轉換成輸出，不跟外部狀態或環境有任何互動。

## 小測驗

<details>
<summary>下列哪一項違反了純函數的原則？</summary>
存取外層作用域的變數
</details>

<details>
<summary>在函數式程式設計中，純函數的決定性特徵是什麼？</summary>
把輸入轉換成輸出，不產生副作用
</details>

<details>
<summary>在純函數裡印到 console 有什麼問題？</summary>
它會產生一個跟函數輸出無關的副作用
</details>

<details>
<summary>要怎麼把不純的函數改寫成純函數？</summary>
用輸入參數取代外部變數，並回傳一個值
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
