---
title: 'TypeScript 函式型別標註全解析：參數型別如何攔下 any 錯誤，回傳型別如何定位問題'
description: '用 add 函式為例，說明沒有型別標註的參數為何會讓 any 型別的錯誤悄悄流過（例如誤把數字傳進只接受 callback 的 Promise 建構子），比較讓 TypeScript 自動推斷回傳型別跟顯式標註回傳型別在錯誤發生位置上的差異，並談 TypeScript 與 ESLint 的分工。'
date: 2026-08-31
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 5
chapter: 'Variables and Values'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - FunctionTypes
    - TypeAnnotations
    - TypeInference
    - AnyType
    - ESLint
---

# TypeScript 函式參數與回傳型別：型別標註如何把錯誤攔在定義處，而非呼叫端

> 系列開頭第一篇用 `add(a, b)` 這個函式，示範了型別標註如何讓程式碼說出作者的真實意圖。這一篇回到同一個函式，實際在課程的 notes 專案裡把型別標註補上，看看沒有型別標註時到底會出什麼問題。

## 沒有型別標註的參數：任何值都能傳入

回到 `add` 函式：

```ts
function add(a, b) {
    return a + b; // strings? numbers? a mix?
}
```

在 TypeScript 檔案裡，`a`、`b` 這兩個參數沒有型別標註，TypeScript 會直接提出警告，因為它不知道呼叫這個函式時應該限制傳入什麼型別的值，等於任何東西都可以塞進來。

## 補上參數型別標註

補上型別標註的寫法，跟前面在變數宣告中看過的一樣，都是冒號加型別名稱：

```ts
function add(a: number, b: number) {
    return a + b;
}
```

`a` 是 `number`，`b` 是 `number`，函式簽名一補上，程式碼的意圖立刻變得清楚。

## 一個被 any 悄悄放過的真實錯誤

補上參數型別之前，`add` 的呼叫結果被當成 `any`，而這個 notes 專案裡剛好有一段程式碼直接把 `add(3, 4)` 的結果傳進 `Promise` 建構子當作參數：

```ts
// add 的參數與回傳值都還是 any
function add(a, b) {
    return a + b;
}

new Promise(add(3, 4)); // Promise 建構子預期收到的是 callback 函式，不是數字
```

`Promise` 建構子預期收到的應該是一個 callback 函式，但因為 `add(3, 4)` 的型別是 `any`，TypeScript 完全不會對這個明顯的誤用發出任何警告。這正是上一篇提到的 `any` 這個上限型別在實戰中的代價：它能接受任何值，也就完全放棄了型別檢查的保護。

一補上參數型別標註，`add` 的回傳值型別就從模糊的 `any` 變成明確的 `number`，同一行 `new Promise(add(3, 4))` 立刻被 TypeScript 標紅：

```ts
function add(a: number, b: number) {
    return a + b;
}

new Promise(add(3, 4));
// 錯誤：Argument of type 'number' is not assignable to parameter of type
// '(resolve: ...) => void'
```

這正是 TypeScript 的價值所在：程式碼裡到處遊蕩、沒有明確型別的 `any` 值，就像一顆隨時可能引爆的地雷，尤其是把既有 JavaScript 專案逐步轉換成 TypeScript 時，這種殘留的 `any` 特別容易被忽略。如果這是一個純 JavaScript 專案，這類問題得靠夠聰明的 linter，或是等到使用者真的走到這段程式碼、測試涵蓋剛好有覆蓋到，才會被發現。

## TypeScript 與 ESLint 的分工

有學員問，用了 TypeScript 之後還需要 ESLint 嗎？TypeScript 專注在型別檢查，也就是像前面看到的，函式引數被傳入時進行型別比對，或是把字串誤指派給數字型別時跳出的紅色波浪底線。但 TypeScript 本身不太管程式碼風格或最佳實踐這類問題，這正好是 linter 的守備範圍。

這兩者可以視為「低階」與「高階」兩個不同層次的檢查工具，而且結合 TypeScript 型別資訊寫成的 ESLint 規則，能做到比純語法分析更精準的檢查。`typescript-eslint` 這個專案（TypeScript 核心團隊也有相當程度的參與）就是把型別資訊提供給 lint 規則使用，讓能偵測到的問題更精確。換裝了 TypeScript 之後不代表可以丟掉 linter，反而因為有更多型別資訊可用，linter 能發揮的價值更大。

## 讓 TypeScript 自動推斷回傳型別，還是顯式標註？

`add` 函式即使不寫回傳型別，TypeScript 也能從 `a + b` 這行程式碼自動推斷出回傳型別是 `number`。這樣寫比較精簡，之後如果調整了函式邏輯，回傳型別的推斷結果也會自動跟著更新。

但講師傾向替函式回傳值明確標註型別，原因跟函式的邊界責任有關：回傳型別代表這個函式對外承諾的一份合約，明確寫出來，等於把「這個函式應該回傳什麼」的責任攤在陽光下。

## 一個具體案例：合約沒寫清楚時，錯誤跑去哪裡了

假設在 `add` 函式裡加入一個條件邏輯，讓它有機率回傳 `undefined`（例如原本用擲硬幣的方式決定要不要提早跳出、不回傳任何值），並且沒有寫回傳型別標註：

```ts
function add(a: number, b: number) {
    if (Math.random() > 0.5) {
        return; // 忘了回傳值，或是刻意提早跳出
    }
    return a + b;
}
```

這時 TypeScript 會自動把推斷出的回傳型別更新成「可能是 `number`，也可能是 `undefined`」，函式呼叫端表面上看起來完全正常，實際上已經悄悄埋了一顆地雷。如果呼叫端接著對這個回傳值呼叫 `toExponential`（`number` 型別才有的方法），TypeScript 才會在使用這個回傳值的地方報錯：

```ts
const result = add(3, 4);
result.toExponential();
// 錯誤：Object is possibly 'undefined'
```

這個報錯時機類似 duck typing 錯誤慣有的模式：程式一路執行到真正用上這個值的那一刻，才浮現出問題。

問題在於，如果 `add` 函式定義在另一個模組，而呼叫端散落在很多不同的地方，這種寫法會讓每一個呼叫並使用回傳值的地方都各自冒出錯誤。講師更想看到的情況是，錯誤直接出現在函式定義本身：「你已經宣告了要回傳 `number`，但這個函式不是每一條執行路徑都真的回傳了 `number`」，一旦顯式標註了回傳型別，TypeScript 就會在函式定義處立刻抓出這個矛盾，而不是讓問題擴散到所有呼叫端。這也是為什麼替函式標註明確回傳型別，能把錯誤攔在更接近該修的地方，也是這門課裡雖然不是每個函式都會刻意加回傳型別，但寫正式上線程式碼時，講師習慣加上這個小小合約的原因。

## 小測驗

<details>
<summary>TypeScript 的型別檢查主要幫開發者攔截什麼樣的問題？</summary>
悄悄流過的、沒有型別或型別錯誤的值，這類值可能在執行期造成難以追蹤的錯誤。
</details>

<details>
<summary>TypeScript 如何處理函式回傳值的型別推斷？</summary>
它能依函式的實際實作內容，自動推斷出對應的回傳型別。
</details>

<details>
<summary>TypeScript 跟 ESLint 之間是什麼關係？</summary>
兩者搭配得很好，ESLint 專注在程式碼風格與最佳實踐這類 TypeScript 不太處理的面向。
</details>

<details>
<summary>替函式明確標註回傳型別，主要的好處是什麼？</summary>
當函式實作跟宣告的回傳型別不符時，錯誤會直接出現在函式定義的地方，而不是分散到所有呼叫端。
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
