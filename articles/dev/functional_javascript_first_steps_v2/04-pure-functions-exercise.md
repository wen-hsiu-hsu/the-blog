---
title: '純函數練習：判斷 12 個函數純不純，看懂副作用與可變陣列陷阱'
description: '純函數沒有副作用且具決定性。透過 12 個函數練習判斷：內建 Date 為何仍純，讀檔與 console.log 為何不純，可變陣列的陷阱，內部 mutation 為何無妨，與不純的傳染。'
date: 2026-10-08
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 4
chapter: 'Programming with Pure Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - PureFunction
    - SideEffect
---

# 純函數練習：判斷 12 個函數純不純，看懂副作用與可變陣列陷阱

> [[03-pure-functions-overview|上一篇]]用 `greet` 範例說明了純函數的定義，以及讀取外部變數、印到 console 為什麼不純。這一篇把這些原則拿來做練習，逐一判斷一批函數到底純不純。

## 純函數的兩個特徵

講師先快速複習，純函數有兩個關鍵特徵：

- **沒有副作用（side effect）**：除了回傳它的回傳值之外，不做任何其他事。印到 console、寫入檔案、對 HTTP endpoint 發 POST 請求，這些都是副作用
- **具有決定性（deterministic）**：換句話說，它只依賴自己的輸入參數

如果函數依賴外部世界的其他狀態，例如外面的天氣、現在幾點，或程式執行到這一刻某個變數剛好是什麼值，就會像上一篇不純的 `greet` 一樣：用同樣的輸入呼叫好幾次，可能得到不同的輸出。這種函數就是**非決定性（non-deterministic）**的，光看輸入無法預測它的輸出。

純函數要求的是 100% 的決定性。同一個函數在一百萬個不同的日子呼叫一百萬次，只要輸入相同，輸出就永遠相同。

## 練習：讀程式碼判斷純不純

這個練習在課程的線上練習環境裡進行。頁面上方有下拉選單可以切換整門課的各個段落，也有左右按鈕可以前後翻頁。

練習檔案（pure or not）裡放了一批不同類型的函數，任務是逐一讀過，判斷每個函數純不純，並在註解裡用幾個字寫下理由。

練習環境右上角有一個 solve 按鈕，按下去會用講師的參考答案取代編輯器裡自己寫的內容，所以講師提醒學員，自己做完之前不要按。不過為了接下來對答案，講師自己先按了，以下就照著參考答案一個一個討論。

## 逐一判斷每個函數

### `getTime`：不純，因為非決定性

```js
function getTime() {
    return new Date().toLocaleTimeString();
}
```

`getTime` 回傳當下的時間字串。在不同的時間點呼叫，就會得到不同的結果，因為它回傳的就是「現在幾點」。所以它是非決定性的，不是純函數。

### `compareDateStrings`：純，但用到了內建的 `Date`

```js
function compareDateStrings(s1, s2) {
    const d1 = new Date(s1);
    const d2 = new Date(s2);
    const delta = d2 - d1;
    return `${s1} is ${delta > 0 ? 'after' : 'before'} ${s2}`;
}
```

`compareDateStrings` 接收兩個日期字串 `s1`、`s2`，比較兩者的先後，回傳一段描述的字串。講師把它標為純函數，但這個函數有一個讓人挑眉的地方。

有學員點出來了：這要仰賴 `Date` 本身也是純的才行。`Date` 不是透過參數傳進來的，它是函數外部的東西。不過它是語言的內建功能（built-in），可以合理確定它不會在兩行程式碼的執行之間被改掉。

重點在於，我們必須知道這個內建功能的行為，也就是傳入同樣的字串，它是不是永遠給出同樣的結果。講師說在這個例子裡答案是肯定的。所以前面說的「純函數不看外部世界的任何東西」其實有一些附帶條件，內建功能就是其中之一，接下來還會看到更多。

想知道某個內建功能是不是決定性的純操作，可以去查 MDN。講師說 MDN 是 Web 開發者最好的朋友。

### `stringToJson`：純

```js
const stringToJson = (jsonString) => {
    return JSON.parse(jsonString);
};
```

`stringToJson` 把 JSON 字串解析成物件。這裡同樣用到內建的 `JSON`，但它的行為可以預測，所以 `stringToJson` 一樣是純函數。

### `fileToJson`：不純，因為依賴外部檔案

```js
const fileToJson = (filename) => {
    const fs = require('fs');
    const fileData = fs.readFileSync(filename, 'utf8');
    return JSON.parse(fileData);
};
```

`fileToJson` 用 Node.js 的 `fs` 模組，依照傳入的檔名 `filename` 讀取檔案內容，再解析成 JSON。學員一看到這個函數，紛紛比出倒讚。

問題在於它依賴函數外部的東西：用檔名找到的那個檔案。在兩次執行之間，這個檔案可能發生任何事。今天執行一次，晚上同事改了這個檔案，明天再用同樣的檔名執行，期待得到同樣的輸出，結果就不會如預期。

這正是要避免的寫法。至於不能這樣做的話，實際上要怎麼完成工作，講師說等一下就會談到。

### `add`：純

```js
function add(a, b) {
    return a + b;
}
```

`add` 很單純，只用兩個參數算出結果並回傳，沒有外部依賴也沒有副作用，是純函數。

### `sum`：不純，因為陣列是可變的

```js
function sum(numArray) {
    let total = 0;
    for (let value of numArray) {
        total += value;
    }
    return total;
}
```

`sum` 把傳入的數字陣列 `numArray` 全部加總。這題比較刁鑽，講師把它標為不純，但附上一個星號。

即使 `numArray` 是透過參數傳進來的，這個函數仍然不一定是決定性的。原因是 JavaScript 的陣列預設是**可變的（mutable）**，別的團隊的同事也能動到這個陣列。

假設我們期待這個函數明天回傳跟今天一樣的結果，但同事在這段期間往陣列裡 push 了一堆新的值。即使傳入的是同一個陣列物件，算出來的結果也可能不同。換句話說，參數只是指向同一個陣列，陣列的內容卻可能已經變了，所以光看輸入無法保證輸出。這跟[[03-pure-functions-overview|上一篇]]外部 `name` 被同事改掉的情境如出一轍，只是這次被改掉的東西是從參數傳進來的。

星號的意思是：課程後面會談到怎麼使用永遠不會改變的資料。如果能強迫自己只使用確定不會改變的陣列，就可以把 `sum` 視為純函數。

### `logicalXor`：純

```js
const logicalXor = (A, B) => (A || B) && !(A && B);
```

`logicalXor` 是邏輯運算的互斥或（exclusive or）：`A`、`B` 恰好只有一個為真時才回傳 `true`。這裡用了箭頭函數的語法，但語法不會改變函數純不純。它只是一連串簡單的布林運算，是純函數。

### `truthTable`：純，即使內部有 mutation

```js
const truthTable = (logicalOperator) => {
    const values = [true, false];
    const table = [];
    for (const A of values) {
        for (const B of values) {
            table.push([A, B, logicalOperator(A, B)]);
        }
    }
    return table;
};
```

`truthTable` 接收一個邏輯運算函數 `logicalOperator`（例如上面的 `logicalXor`），列出 `A`、`B` 所有 `true`／`false` 組合的運算結果，回傳一張真值表。

講師問大家有沒有看到剛剛才說是壞主意的東西，學員馬上回答：陣列。這裡不只用了陣列，還用了 `push`，會直接改動陣列本身。

不過這些改動全都發生在函數內部。`table` 是函數自己建立的陣列，外部碰不到，所以不會造成不同時間得到不同結果。只要輸入相同，`truthTable` 永遠回傳相同的表，也沒有副作用，因此仍然是純函數。

### JavaScript 的函數式不是全有全無

在強制函數純度的語言裡不能這樣寫，但 JavaScript 不強迫我們寫純函數。所以在 JavaScript 裡，一個具有決定性、沒有副作用的純函數，內部可以包含 mutation 這類比較不函數式的操作。只要把這些操作包在純函數裡，我們依然能有效率地用函數式的方式寫程式。

講師認為這正是在 JavaScript 裡寫函數式最棒的地方：不必 100% 函數式，不是全有全無。可以一點一點把程式碼函數式化，就算要做一些不純的事，也確保它們只發生在函數內部這個安全的小沙盒裡。這也呼應[[02-what-is-functional-programming|第二篇]]提到的，JavaScript 雖然不是設計成純函數式的語言，依然能寫出合格的函數式程式。

### `xorTruthTable`：不純，因為印到 console

```js
const xorTruthTable = () => {
    console.log('XOR truth table:\n================\n');
    const table = truthTable(logicalXor);
    console.log('\tA\t|\tB\t|\tA xor B');
    console.log('\t-----\t|\t-----\t|\t-----');
    table.map(([A, B]) => console.log(`\t${A}\t|\t${B}\t|\t${logicalXor(A, B)}`));
};
```

`xorTruthTable` 用前面的 `truthTable` 和 `logicalXor` 產生 XOR 的真值表，再一行一行用 `console.log` 印出來。學員一眼就看出問題：印到 console，也就是[[03-pure-functions-overview|上一篇]] `greet` 已經示範過的副作用。

如果這個函數回傳的是代表真值表的字串，那就另當別論。但它是印到 console。除非有人把 `console` 換掉或重新定義（JavaScript 一樣不會阻止我們這麼做），否則它每次執行都會做出完全相同的事。即使如此，印到 console 仍然是對外部世界產生的影響，所以不純。

## 真實世界的例子：mapbox 的 URL 編碼函數

接下來的三個例子更貼近真實世界的程式碼，改寫自 GitHub 上 mapbox-sdk-js 的 `url-utils.js`。這些函數同樣用到不是透過參數傳進來的內建功能，像是 `encodeURIComponent`，必要時可以去 MDN 確認它的行為。

### `encodeString`：純

```js
function encodeString(stringValue) {
    return encodeURIComponent(stringValue);
}
```

`encodeString` 把傳入的字串交給 `encodeURIComponent` 做 URI 編碼。`encodeURIComponent` 是純的、具決定性的函數，給定相同的輸入字串，永遠回傳相同的編碼結果。`encodeString` 內部只用了一個純函數，其他什麼都沒做，所以也是純的。

### `encodeArray`：不純，同樣是陣列的陷阱

```js
function encodeArray(arrayValue) {
    return arrayValue.map(encodeURIComponent).join(',');
}
```

`encodeArray` 把陣列 `arrayValue` 的每個元素都做 URI 編碼，再用逗號串成一個字串。它跟 `sum` 有同樣的星號：函數本身沒有改動傳進來的陣列，但其他程式碼裡的同事可能會改，這就是這裡的陷阱。

### `encodeValue`：不純，因為呼叫了不純的函數

```js
function encodeValue(value) {
    if (Array.isArray(value)) {
        return encodeArray(value);
    }
    return encodeString(String(value));
}
```

`encodeValue` 判斷傳入的 `value` 是不是陣列：是的話交給 `encodeArray`，不是的話先轉成字串再交給 `encodeString`。

學員點出它不純的原因：它呼叫了上面的 `encodeArray`。剛剛說過，因為 JavaScript 的陣列可變，`encodeArray` 可以視為不純的函數。

## 一點不純就會傳染整個程式

在函數裡使用不純的函數，不純就會**傳染**給這個函數。`encodeValue` 被 `encodeArray` 的不純傳染，所以自己也變得不純。一點點不純，就足以毀掉整個函數，甚至整個程式的純度。

這帶出一個挑戰。如果以下這些都不能做：

- 印到 console
- 寫檔
- 讀檔
- 發 fetch 請求

那要怎麼做真正有用的事？講師說，這是身為函數式程式設計者必須想通的主要課題之一。

## 複習

### 純函數有哪兩個關鍵特徵？

一是沒有副作用，除了回傳它的回傳值之外不做任何其他事；二是具有決定性，只依賴自己的輸入參數。

### 為什麼 `getTime()` 被視為不純的函數？

它不具決定性。它依據當下的時間回傳結果，在不同時間點呼叫就會得到不同的結果。

### 為什麼在 JavaScript 裡，處理陣列的函數可能不純？

JavaScript 的陣列是可變的，即使傳入的是同一個陣列物件，陣列的內容也可能在兩次呼叫之間被外部修改。這讓函數變得不具決定性，因為陣列每次的值可能不同，光看輸入無法預測輸出。

### 純函數呼叫不純的函數時會發生什麼事？

被呼叫的函數的不純會「傳染」給呼叫它的函數，讓整個函數變得不純。

### JavaScript 的純函數內部可以包含 mutation 操作嗎？為什麼？

可以。只要所有 mutation 都發生在函數的作用域內，這個函數仍然是純的：它具有決定性（相同的輸入永遠回傳相同的輸出），也沒有影響外部世界的副作用。mutation 必須被限制在函數這個沙盒裡。

### 函數要被視為純函數，關鍵的條件是什麼？

相同的輸入永遠回傳相同的輸出。

## 小測驗

<details>
<summary>純函數有哪兩個關鍵特徵？</summary>
沒有副作用，以及具有決定性（只依賴自己的輸入參數）
</details>

<details>
<summary>為什麼 <code>getTime()</code> 被視為不純的函數？</summary>
每次呼叫都會回傳不同的值
</details>

<details>
<summary>為什麼在 JavaScript 裡，處理陣列的函數可能不純？</summary>
陣列是可變的，可能被程式碼的其他部分改動
</details>

<details>
<summary>純函數呼叫不純的函數時會發生什麼事？</summary>
整個函數都會變得不純
</details>

<details>
<summary>JavaScript 的純函數內部可以包含 mutation 操作嗎？為什麼？</summary>
可以，只要 mutation 都限制在函數內部，函數仍具決定性且沒有對外的副作用
</details>

<details>
<summary>函數要被視為純函數，關鍵的條件是什麼？</summary>
相同的輸入永遠回傳相同的輸出
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
