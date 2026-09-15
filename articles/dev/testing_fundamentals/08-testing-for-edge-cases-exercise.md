---
title: '邊界案例練習：讓 subtract 吃陣列、正確處理 undefined 與 null，再決定除以零該怎麼辦'
description: '講師 Steve Kinney 開放讓學員自由決定數學函式該怎麼處理邊界輸入，示範怎麼讓 subtract 接受陣列並用 reduce 依序運算、用預設參數處理 undefined、揭露 null 不會被預設參數接住的行為差異，並在重構除以零的判斷邏輯時，靠測試立刻抓出自己不小心弄壞的既有案例。'
date: 2026-09-15
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 8
chapter: 'Testing Basics'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - UnhappyPath
    - ErrorHandling
    - UnitTesting
    - TypeCoercion
    - DefaultParameters
    - Refactoring
---

# 邊界案例練習：讓 subtract 吃陣列、正確處理 undefined 與 null，再決定除以零該怎麼辦

## 練習任務：自由探索邊界案例

延續前一篇對 unhappy path 的討論，Steve 這次把主導權交給學員：課程裡還有一堆數學函式，除以零該拋錯還是回傳 `NaN`、傳進奇怪的值該發生什麼事，全部自己決定。決定怎麼做並不是重點，重點是練習找出「這裡還可能出什麼問題」的能力，找到自己一時不知道怎麼測試或實作的情況，再一起拿出來討論。

Steve 也順帶點出一個常被忽略的好處：開發者最不擅長的事，測試贏過寫文件。當你為了「引數是 `undefined` 時該怎麼辦」寫下一個測試，就等於用程式碼明確記錄了這個決定背後的意圖，即使日後有人不認同這個決定，至少能一眼看出這是刻意為之，而不是遺漏。

## 陣列輸入：把 subtract 改成能接受陣列

有學員主動挑戰了一個比較刁鑽的情境：如果傳進 `subtract` 的是一個陣列呢？討論後決定的行為是，陣列裡的數字要依序相減，例如 `[10, 5, 2]` 應該先算 `10 - 5` 得到 `5`，再算 `5 - 2` 得到 `3`：

```javascript
it('should accept an array and subtract all the numbers down the line', () => {
    expect(subtract([10, 5, 2])).toBe(3);
});
```

一開始這個測試自然是紅燈，因為函式還沒有處理陣列輸入的邏輯。補上判斷後，用 `reduce` 把陣列裡的數字依序相減：

```javascript
export default function subtract(a, b) {
    if (Array.isArray(a)) {
        return a.reduce((total, current) => total - current);
    }

    return a - b;
}
```

## 重複使用既有的錯誤邏輯：一次驗證，兩種輸入都受益

前一篇已經替 `add` 函式加上判斷，遇到無法解析成數字的字串就拋出錯誤。這次追加一個測試，直接傳入 `NaN` 本身，驗證它會拋出跟「傳入無法解析的字串」相同的錯誤：

```javascript
it('should throw if given NaN directly', () => {
    expect(() => add(NaN, 2)).toThrow();
});
```

這個測試不用改任何程式碼就直接通過了，因為原本判斷字串能不能解析成數字的邏輯，本來就會把解析失敗的結果視為 `NaN` 來處理，等於同一段邏輯順手涵蓋了「直接傳入 `NaN`」這個情境。這種測試的價值在於保護未來的重構：如果哪天要調整這段判斷邏輯的寫法，只要專注在當下要解決的問題（例如接下來要處理布林值的情況），這個舊測試依然會在背景把關，一旦不小心改壞了先前已經解決的案例，會立刻收到失敗回報。

## 讓 undefined 引數有預設值

接著討論如果只傳一個引數、另一個引數是 `undefined`，該怎麼辦。決定是讓缺漏的引數預設為 `0`：

```javascript
it('should default undefined values to 0', () => {
    expect(subtract(3)).toBe(3);
    expect(subtract(undefined, 3)).toBe(-3);
});
```

先讓 `b` 有預設值，測試通過了一半；但故意漏掉的第一個引數 `a` 依然會讓測試失敗，因為預設值只加在 `b` 上。補齊兩個引數的預設值後，測試才完全通過：

```javascript
export default function subtract(a = 0, b = 0) {
    if (Array.isArray(a)) {
        return a.reduce((total, current) => total - current);
    }

    return a - b;
}
```

## null 不等於 undefined：預設參數的盲點

如果傳進去的不是 `undefined` 而是 `null` 呢？測試是 `subtract(3, null)` 應該等於 `3`：

```javascript
it('should treat null as 0', () => {
    expect(subtract(3, null)).toBe(3);
    expect(subtract(null, 3)).toBe(-3);
});
```

這個測試不需要額外修改程式碼就直接通過了，因為 JavaScript 原生的減法運算子會把 `null` 當成 `0` 來處理，跟 `undefined` 的預設參數機制完全是兩回事：預設參數只在引數是 `undefined`（或完全沒傳）時才會生效，`null` 不會觸發預設值。如果之後想讓 `null` 的行為改成拋出錯誤，就得另外寫程式碼去處理，不能只靠預設參數解決，而這裡新增的兩個測試，也保證了日後不管怎麼調整 `null` 的行為，`undefined` 該有的預設值行為都不會被意外改壞。

## 除以零：先決定行為，再讓測試把關

換到除法函式，除以零該怎麼辦？這正是前面提過、當時還沒有答案的那個問題，這次由學員自己拍板，提議回傳 `null`：

```javascript
it('should return null when dividing by zero', () => {
    expect(divide(10, 0)).toBe(null);
});
```

第一次嘗試的實作，是先算出除法結果，再判斷這個結果是不是 `Infinity`：如果是，就回傳 `null`。但這個寫法在調整的過程中，不小心漏寫了正常情況下該回傳結果的那一行，導致原本應該通過的「十除以二等於五」這個既有測試瞬間壞掉，出現 `undefined`。因為太專注在處理除以零這個新案例，反而忘了正常路徑的回傳值，但測試立刻就抓出了這個疏漏，不需要手動跑一遍程式、盯著終端機的輸出才發現問題。

修正之後，Steve 進一步把邏輯重構成更直接的寫法：與其算出結果再判斷是不是 `Infinity`，不如一開始就先檢查除數是不是 `0`：

```javascript
export default function divide(a, b) {
    if (b === 0) {
        return null;
    }

    return a / b;
}
```

重構完直接重跑一次整個測試套件，所有案例依然全數通過，這正是測試帶來的信心：不需要重新手動確認每一種輸入，只要測試綠燈，就有理由相信這次重構沒有破壞任何已經處理過的情境。

Steve 也順帶提醒，JavaScript 裡空字串會被當成 `0` 處理，這代表除數是空字串時理論上也會落入「除以零」的情境，但這是不是想要的行為，同樣留給自己決定，這裡並沒有寫成測試去解決它。

## 複習

### 處理除以零的情況，可能有哪些策略？

有多種選擇，例如回傳 `null`、拋出例外，或回傳像 `NaN` 這樣的特定值，實際採用哪一種取決於具體的需求與想要的錯誤處理方式

### 數學函式在處理 undefined 引數時，可以採取什麼做法？

其中一種做法是讓 undefined 值預設為零，這樣能提供可預期的行為，也能避免潛在的執行期錯誤

### 測試如何幫助驗證數學函式在邊界案例下的行為？

測試可以明確定義並驗證不同輸入情境下該有的預期行為，例如處理陣列、undefined 值、null 值，或其他非預期的輸入型別

### 處理數學函式裡的陣列引數時，有哪些重要的考量？

可能的策略包括把陣列化簡成單一數值、對陣列裡的元素依序做運算，或是遇到非預期的輸入型別時直接拋出錯誤

### 為什麼替各種輸入情境撰寫測試是有價值的？

測試能記錄函式原本該有的行為、在重構時防止行為跑掉、讓開發者的決定變得明確，並在程式碼變動時提供即時回饋

## 小測驗

<details>
<summary>在決定如何處理非預期的輸入型別時，撰寫測試的主要好處是什麼？</summary>
它能記錄下你做的決定，並在之後抓出行為跑掉的情況
</details>

<details>
<summary>測試一個接受陣列的函式時，有什麼做法能幫助你先聚焦在想測試的行為上？</summary>
先從簡單的純量引數開始測試，之後再加入陣列的情境
</details>

<details>
<summary>為什麼要替不同的無效輸入（字串、NaN 等）各自寫測試，即使它們最後都預期拋出同一個錯誤？</summary>
用來驗證日後重構時，不會不小心破壞掉先前已經解決過的邊界案例
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
