---
title: '遞迴版 reduce 與 reducer 函數：用累加器寫出 sum 與 max'
description: '先讀懂遞迴版 reduce 怎麼把 initialValue 當累加器、對 tail 反覆遞迴，再寫出 sum 與 max 的 reducer，處理 undefined 的陷阱，並把要記住的東西變成函數輸入。'
date: 2026-10-13
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 14
chapter: 'Higher-Order Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - HigherOrderFunction
    - Recursion
---

# 遞迴版 reduce 與 reducer 函數：用累加器寫出 sum 與 max

> [[13-implement-map-function-exercise|上一篇]]用遞迴重新實作了 map，這一篇輪到高階函數三兄弟的最後一個：reduce。不過這次的練習方式不太一樣，不是自己實作 reduce，而是寫要傳給它的 reducer 函數。

## 這次不實作 reduce，改寫 reducer

講師說，光是使用 reduce 就已經夠難了，還要大家自己實作它有點太壞心。所以這次的安排是：先一起讀過已經寫好的 reduce 實作，再動手實作幾個 reducer 函數。

在講師看來，使用 reduce 真正棘手的地方就在 reducer 函數。至於 reduce 本身的寫法，跟前面的 filter、map 其實沒有太大差別。

## 讀懂遞迴版 reduce

`funpro.js` 裡已經寫好的 `reduce` 長這樣，它除了接收 reducer 函數 `reducerFn` 和陣列 `array`，還多接收一個 `initialValue`：

```js
export function reduce(reducerFn, initialValue, array) {
    if (length(array) === 0) return initialValue;
    const newInitialValue = reducerFn(initialValue, head(array));
    return reduce(reducerFn, newInitialValue, tail(array));
}
```

`length`、`head`、`tail` 是前兩篇一直在用的陣列輔助函數，分別取得陣列長度、第一個元素，以及第一個以外的其他元素。

### initialValue：也常被叫做 accumulator

`initialValue` 這個變數在其他地方常被寫成 accumulator，或縮寫成 `acc`，講師這裡就叫它 `initialValue`。它是整個縮減過程的立足點，其他的縮減都從它開始。

它的值取決於想從 reduce 拿回什麼東西。用[[11-higher-order-functions|三明治那篇]]的例子來說，如果給它一片切好的麵包，要它縮減出一個三明治，那陣列裡什麼都沒有的時候，拿回來的就應該是同一片麵包。但像 sum 這種情況，起始值可能就要是別的東西，講師說到這裡還特地眨了眨眼，暗示等一下的練習。

### Base case：陣列空了就回傳 initialValue

base case 的套路跟前面一樣：陣列裡沒有東西，就直接回傳那個值，它是第一個值，也是唯一的值。

```js
if (length(array) === 0) return initialValue;
```

跟 filter、map 不同的是，這裡回傳的不是空陣列，而是 `initialValue`，因為 reduce 最後要拿回的是單一的值。

### 遞迴情況：更新累加器，再對 tail 遞迴

陣列還有東西的話，就把 reducer 函數套用到累加器（也就是 `initialValue`）和陣列的第一個元素上，得到一個新的值：

```js
const newInitialValue = reducerFn(initialValue, head(array));
```

這裡把結果存進變數，只是為了讓過程更清楚。接著再遞迴呼叫一次 `reduce`，這次傳入的是 `newInitialValue`，也就是新的累加器，以及陣列的 tail：

```js
return reduce(reducerFn, newInitialValue, tail(array));
```

這就像在更新累加器，一路把值累積起來，這也是它有時被叫做 accumulator 的原因。整個過程一再重複，直到碰到空陣列，再帶著一個代表整個陣列「縮減結果」的單一值跳出來，就像例子裡那個完整的三明治。

## 練習：sum 與 max

既然 reduce 已經寫好，使用它的訣竅就落在傳進去的 reducer 函數上。這一題要完成 `sum` 與 `max` 兩個函數，它們都會呼叫 `reduce`，目前 reducer 和初始值都還沒填：

```js
export function sum(array) {
    return reduce(
        () => {}, // TODO replace this reducerFn
        undefined, // TODO replace this initialValue
        array,
    );
}

export function max(array) {
    return reduce(
        () => {}, // TODO replace this reducerFn
        undefined, // TODO replace this initialValue
        array,
    );
}
```

- **`sum`**：給它一個數字陣列，回傳所有數字加總的結果
- **`max`**：給它一個陣列，回傳裡面最大的值

講師提醒，初始值也要自己想出來，而且「大概不是 `undefined`」。這裡假設處理的都是整數或數字。

### 測試內容

`funpro.test.js` 裡 reduce 相關的測試如下：

```js
describe('reduce', () => {
    it('should return a single value', () => {
        expect(sum([])).toBe(0);
        expect(typeof max(wholes)).toBe('number');
        expect(
            reduce(
                (acc, str) => {
                    const capitalized = str.toUpperCase();
                    if (acc) {
                        return [acc, capitalized].join(' ');
                    } else {
                        return capitalized;
                    }
                },
                '',
                ['fp', 'rulez'],
            ),
        ).toBe('FP RULEZ');
    });

    describe('sum', () => {
        it('should return the correct value', () => {
            expect(sum(wholes)).toBe(55);
            expect(sum([1, 2, 3])).toBe(6);
            expect(sum([])).toBe(0);
        });
    });

    describe('max', () => {
        it('should return the correct value', () => {
            expect(max(wholes)).toBe(10);
            expect(max(wholes.reverse())).toBe(10);
            expect(max([25, 12, 49, 2, 70, 28, 40])).toBe(70);
            expect(max([])).toBeUndefined();
        });
    });
});
```

`wholes` 是測試檔開頭定義的 `[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`。第一個測試直接拿 `reduce` 搭配一個字串 reducer，把 `['fp', 'rulez']` 每個字轉成大寫再用空格接起來，初始值是空字串 `''`，結果是 `'FP RULEZ'`。另外要注意最後一行：空陣列的 `max` 預期是 `undefined`。

## reducer 函數的形狀

reducer 函數有固定的形狀：

- 第一個參數是累加器的值，也就是這裡的 `initialValue`
- 第二個參數是要累積進累加器的陣列元素

它回傳某個值，作為新的累加器。常見的函數簽名寫法是：

```js
(accumulator, value) => newAccumulator;
```

## 實作 sum

假設手上已經有前面所有數字加總好的累加器，陣列裡又來了一個新的值，要繼續累積總和，該用什麼？學員的答案是加法。所以 reducer 就是回傳 `accumulator + value` 的箭頭函數。

初始值呢？空陣列的總和是 0，所以初始值填 `0`：

```js
export function sum(array) {
    return reduce((accumulator, value) => accumulator + value, 0, array);
}
```

這樣 sum 的測試就通過了，max 還是失敗。講師說，這正是使用 reducer 時常在想的事：我需要的 reducer 到底是什麼？這題練的就是這個。

## 實作 max

max 的函數簽名一樣是累加器和要累積的新值，但這次不是把兩者相加，而是要回傳累加器和新值之間比較大的那個。

### 先比較大小

這需要比較，學員建議用三元運算子。思考的方式是：新的值有沒有比目前為止最大的值，也就是累加器裡存的值還大？

- 有的話，新的累加器就變成 `value`，因為它比較大
- 沒有的話，就回傳原本的累加器

```js
(acc, val) => (val > acc ? val : acc);
```

### JavaScript 的小陷阱：undefined

但有個因 JavaScript 而起的小陷阱。學員指出，初始值是 `undefined`，而沒有累加器的時候，應該直接把它設成新的值。

講師同意，如果要求的是 max、卻沒有任何東西可以比較，回傳 `undefined` 是合理的，所以初始值維持 `undefined`。問題在於拿數字跟 `undefined` 比較大小時，JavaScript 不會認為數字比較大。累加器一開始是 `undefined`，`val > acc` 就不成立，回傳的會一直是 `undefined`。所以要特別處理累加器是 `undefined` 的情況。

做法是在原本回傳 `acc` 的地方，再巢狀放一個三元運算子，確認 `acc` 不是 `undefined`：是 `undefined` 就回傳 `val`，不是的話才回傳 `acc`。這樣寫開始有點難讀，所以常會看到把三元運算子拆成好幾行的寫法：

```js
export function max(array) {
    return reduce(
        (acc, val) => (val > acc ? val : acc === undefined ? val : acc),
        undefined,
        array,
    );
}
```

學員也提出另一種寫法，把 `undefined` 的檢查放到最前面的條件裡，也就是「沒有 `acc`，或 `val` 比 `acc` 大」就回傳 `val`。講師說巢狀的方式有好幾種，都可以。

reducer 雖然都是很小的函數，有時候還是會讓人有點頭痛，講師說這就是使用 reduce 的樂趣所在。

## 把要記住的東西變成資料

累加器的好處是，想從陣列算出單一的值時，完全不用在意陣列裡有幾個東西。

因為這是純函數式程式設計，沒有狀態，所以不能在每次呼叫函數之間「記住目前看過最大的值」。這種有狀態的寫法是要避免的，改成把需要記住的東西轉成資料，再依需要操作這份資料，延續記住該記的東西。

講師說這個原則在課程後面還會再出現。習慣用狀態來記住值、記住資料、記住目前進行到哪一步時，例如用 `for` 迴圈裡的 `i` 記住已經跑到第幾圈，在函數式程式設計裡的做法則是：

- 把需要記住的東西變成函數的輸入
- 讓它本身就是一個值，而不是程式裡某個可能跟預期不一樣的部分

這跟[[06-iteration-vs-recursion|第六篇]]說迭代的狀態危險、難以預測是同一個道理。只要知道傳進來的是什麼值，就知道會得到什麼結果，不用去查程式的狀態才能弄清楚。

## 我的解法

自己做這題時的寫法如下。sum 跟講師的解法一樣，只是參數取名叫 `currentValue` 和 `nextValue`：

```js
export function sum(array) {
    return reduce(
        (currentValue, nextValue) => {
            return currentValue + nextValue;
        },
        0,
        array,
    );
}
```

max 就直接偷懶，交給 `Math.max` 比大小，初始值則用陣列的第一個元素 `array[0]`：

```js
export function max(array) {
    return reduce(
        (currentValue, nextvalue) => {
            return Math.max(currentValue, nextvalue);
        },
        array[0],
        array,
    );
}
```

初始值一開始就是陣列裡的值，所以 reducer 不會碰到 `undefined`。空陣列的時候，`array[0]` 本身就是 `undefined`，base case 直接把它回傳，`max([])` 的測試也剛好通過。省掉巢狀三元運算子的煩惱，我果然是偷懶大師。

## 複習

### 實作 reduce 函數時，base case 是什麼？

陣列是空的時候，回傳初始值（`initialValue`）。

### 用 reducer 函數實作 sum 時，要用哪一種數學運算？

加法（`accumulator + value`）。

### 實作 sum 的 reducer 時，初始值應該用什麼？

0。

### 怎麼實作 max 的 reducer 函數？

用三元運算子比較 `value > accumulator`，成立就回傳 `value`，否則回傳 `accumulator`。另外要處理 `undefined` 的情況，先檢查 `accumulator` 是不是 `undefined`，是的話就回傳 `value`：`value > accumulator ? value : (accumulator === undefined ? value : accumulator)`。

### 在函數式程式設計中，傳給 `reduce` 的 reducer 函數通常是什麼樣的簽名？

reducer 函數接收兩個參數：累加器（或初始值）與目前的陣列元素，回傳新的累加值。簽名大致是 `(accumulator, value) => newAccumulator`。累加器保存一路累積起來的結果，`value` 則代表正在處理的每一個陣列元素。

### 在找最大值的 reducer 函數裡，用什麼方式比較值？

用三元運算子比較。

### 在 reduce 函數裡，累加器代表什麼？

縮減過程中逐步計算出來的值。

### 在函數式程式設計中使用 reducer 的關鍵原則是什麼？

把需要記住的東西轉成函數的輸入。

### 遞迴版的 reduce 函數通常怎麼處理空陣列？

回傳初始值。

### 用 `reduce` 對數字陣列實作 `sum` 函數時，正確的初始值是什麼？

0。

## 小測驗

<details>
<summary>實作 reduce 函數時，base case 是什麼？</summary>
陣列是空的時候，回傳初始值（<code>initialValue</code>）
</details>

<details>
<summary>用 reducer 函數實作 sum 時，要用哪一種數學運算？</summary>
加法（<code>accumulator + value</code>）
</details>

<details>
<summary>實作 sum 的 reducer 時，初始值應該用什麼？</summary>
0
</details>

<details>
<summary>怎麼實作 max 的 reducer 函數？</summary>
用三元運算子比較 <code>value &gt; accumulator</code>，成立就回傳 <code>value</code>，否則回傳 <code>accumulator</code>。另外要處理 <code>undefined</code> 的情況，先檢查 <code>accumulator</code> 是不是 <code>undefined</code>，是的話就回傳 <code>value</code>：<code>value &gt; accumulator ? value : (accumulator === undefined ? value : accumulator)</code>
</details>

<details>
<summary>在函數式程式設計中，傳給 <code>reduce</code> 的 reducer 函數通常是什麼樣的簽名？</summary>
reducer 函數接收兩個參數：累加器（或初始值）與目前的陣列元素，回傳新的累加值。簽名大致是 <code>(accumulator, value) =&gt; newAccumulator</code>。累加器保存一路累積起來的結果，<code>value</code> 則代表正在處理的每一個陣列元素
</details>

<details>
<summary>在找最大值的 reducer 函數裡，用什麼方式比較值？</summary>
用三元運算子比較
</details>

<details>
<summary>在 reduce 函數裡，累加器代表什麼？</summary>
縮減過程中逐步計算出來的值
</details>

<details>
<summary>在函數式程式設計中使用 reducer 的關鍵原則是什麼？</summary>
把需要記住的東西轉成函數的輸入
</details>

<details>
<summary>遞迴版的 reduce 函數通常怎麼處理空陣列？</summary>
回傳初始值
</details>

<details>
<summary>用 <code>reduce</code> 對數字陣列實作 <code>sum</code> 函數時，正確的初始值是什麼？</summary>
0
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
