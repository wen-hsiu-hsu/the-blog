---
title: 'TypeScript 編譯實戰：tsconfig target/module 設定與宣告檔產生原理'
description: '示範用 TSC 編譯 TypeScript 專案，比較 target 設為 ES2015、ES2017、ES2022 時輸出的 JS 差異，說明編譯器如何用輔助函式（awaiter、classPrivateFieldGet）回退相容舊環境，並用 declaration 產生 d.ts 檔案。'
date: 2026-08-29
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 2
chapter: 'Variables and Values'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TSC
    - Tsconfig
    - DeclarationFiles
    - Downleveling
    - ModuleFormat
---

# TypeScript 編譯實戰：tsconfig target/module 設定與宣告檔產生原理

> 前一篇談的是 TypeScript 作為一個心智模型：它只在建置期幫忙抓錯，實際跑起來的仍是編譯後的 JavaScript。這一篇動手做一個 Hello World 專案，實際看看這個編譯過程長什麼樣子。

## 專案結構：welcome-to-ts

範例專案位在課程 repo 的 `packages/welcome-to-ts` 資料夾底下，這個資料夾裡有幾個檔案值得留意：

- **`package.json`**：套件清單，裡面宣告了 `typescript` 作為開發依賴（當時版本是 5.3 beta）
- **`tsconfig.json`**：TypeScript 編譯器的設定檔
- **`index.ts`**：實際要編譯的原始碼

`dist` 資料夾在檔案總管裡是灰色的，代表它被 `.gitignore` 排除，不會被提交進版控，這個資料夾放的是編譯後產生的輸出檔案。

## tsconfig.json 的關鍵設定

`tsconfig.json` 決定了 TypeScript 編譯器怎麼處理原始碼，這一節先關注三個欄位：

- **`target`**：輸出的 JavaScript 要對應到哪個 ECMAScript 語言等級，例如 `ES2015` 這個等級就包含了 Promise 建構子、class 語法（ES2015 之前 JavaScript 沒有 class）
- **`moduleResolution`**：設為 `node` 代表沿用 Node.js 慣例去 `node_modules` 裡解析模組，這跟不使用 TypeScript 時預期的模組解析行為一致
- **`include`**：指定哪些原始碼要被納入編譯範圍，這裡設定為 `src` 資料夾底下的所有檔案

## 範例程式：刻意混用不同年代的語法

`index.ts` 特意寫了幾個只在特定 ECMAScript 版本才存在的語法特性，用來後續示範編譯器如何處理跨版本相容：

```ts
async function addNumbers(a: number, b: number): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return a + b;
}

class Foo {
    static #bar = 3;
    static getValue() {
        return Foo.#bar;
    }
}
```

`async`/`await` 是 ES2017 才加入的語法，`static #bar` 這種私有靜態欄位則要到 ES2022 才原生支援。程式邏輯很單純：等待半秒後把 `a` 和 `b` 相加，`Foo` 這個 class 只是用來展示私有靜態欄位這個現代語法特性。呼叫端用 `addNumbers(3, 4)` 計算出 7，等待完成後用 `console.log` 印出結果。

## 直接執行編譯輸出會失敗

執行 `tsc` 之後，`dist` 資料夾裡會出現 `index.js`。這份輸出檔案看起來已經不太像原本的 `index.ts`：多了一個叫 `__awaiter` 的輔助函式，還有一個叫 `classPrivateFieldGet` 的函式，這些都是編譯器自動生成、用來讓現代語法在舊環境也能運作的相容層。

如果直接用 `node` 執行這個編譯出來的 `index.js`，會得到 `Unexpected token 'export'` 這個錯誤。原因是預設輸出用的是原生 JavaScript 模組（MJS）語法，裡面的 `export` 關鍵字不是 Node.js 傳統執行方式能直接吃下去的。

## 切換 module 格式：commonjs

把 `tsconfig.json` 裡的 `module` 欄位改成 `"commonjs"`，重新編譯後再執行，程式就能正常印出結果 `7`。這時輸出的 `index.js` 裡會看到 `exports.addNumbers = addNumbers`，是傳統 Node.js 慣用的 CommonJS 匯出寫法，而不是原生 ESM 的 `export` 關鍵字。這說明 TypeScript 的編譯器可以依照 `module` 設定，產生不同的模組格式，CommonJS 只是其中一種選項。

## 切換 target：語言等級如何影響輸出

固定 `module` 為 `commonjs`，接著調整 `target` 觀察輸出變化：

**target 設為 `ES2017`**：重新編譯後，原本的 `__awaiter` 輔助函式消失了，`await` 關鍵字直接出現在輸出的程式碼裡，因為 `async`/`await` 從 ES2017 開始就是原生語法。不過 `classPrivateFieldGet` 這個相容層還在，因為私有靜態欄位在 ES2017 仍不被支援，編譯器改用類似 `_Foo_bar` 這種帶底線的命名方式，模擬一個外部不容易誤用到的「私有」屬性，藉此在較舊語言等級上還原私有欄位的行為。

**target 設為 `ES2022`**：再次編譯執行，一樣正確印出 `7`，但這次輸出的程式碼裡直接看得到原生的 `static` 私有欄位語法，前面提到的所有相容層輔助函式都消失了，因為 ES2022 原生支援這個語法，Node 18 可以直接執行它。

這個依 `target` 決定要不要插入相容層的行為，本質上跟 Babel 做的事情類似：讓開發者能用最新的語言特性寫程式，同時保證輸出的程式碼仍能在較舊的執行環境正確運作。隨著瀏覽器普遍不再需要顧慮 Internet Explorer 這類舊環境，這種向下相容的需求也逐漸沒那麼迫切，但機制本身仍是 TypeScript 編譯流程重要的一環。

## declaration 選項與宣告檔

在 `tsconfig.json` 加入 `"declaration": true` 後重新編譯，`dist` 資料夾裡會多出一個 `.d.ts` 檔案。這份檔案就是宣告檔，可以把它想成編譯後 JavaScript 的「影子」：它跟輸出的 `.js` 檔案必須保持同步，兩者合在一起，幾乎等於重新拼回原本的 `index.ts`。

編譯後的 `index.js` 只留下 `addNumbers(a, b)` 這樣去除型別的函式簽名，型別資訊被完全抽走；而 `.d.ts` 檔案裡則會看到類似函式型別宣告的內容，只是沒有函式主體，純粹用來描述對應的 JavaScript 應該長什麼型別形狀。

TypeScript 之所以要同時輸出這兩份檔案，是因為要同時滿足兩種使用者：只用一般 JavaScript 的人，需要能直接執行純淨的 `.js` 輸出；而使用 TypeScript 的開發者，則需要透過 `.d.ts` 檔案取得型別資訊的好處。把這兩個檔案疊在一起看，等於是把執行邏輯跟型別描述分層放在一起，效果上就跟原本那份有型別的 `index.ts` 一樣。

## 複習

### TypeScript 編譯一個專案時，主要會產生哪兩種檔案？

一份去除型別資訊、可以直接執行的 JavaScript 檔案，以及一份描述對應型別資訊的宣告檔（`.d.ts`）。這兩份檔案合在一起，才等於原本那份有型別的 TypeScript 原始碼。

### `tsconfig.json` 裡的 `declaration` 選項設為 `true` 會發生什麼事？

編譯器除了輸出一般的 JavaScript 檔案，還會額外產生對應的 `.d.ts` 宣告檔案，讓其他使用 TypeScript 的開發者能取得這份程式碼的型別資訊。

### TypeScript 讓開發者選擇不同 target 語言等級來編譯，主要目的是什麼？

讓開發者能使用現代 JavaScript 語法撰寫程式，同時仍能產生相容於較舊執行環境的輸出，這個機制跟 Babel 做的事情類似。

### 當 target 設定的語言等級不支援某個語法特性時，TypeScript 怎麼處理？

編譯器會自動生成輔助函式與相容層來模擬那個語法特性的行為，例如用 `__awaiter` 模擬 async/await，用 `classPrivateFieldGet` 搭配帶底線命名的屬性來模擬私有靜態欄位。

## 小測驗

<details>
<summary>編譯一個 TypeScript 專案主要會產生哪兩種檔案？各自的用途是什麼？</summary>
一份可執行的 JavaScript 檔案（`.js`），負責實際執行程式邏輯；一份型別宣告檔（`.d.ts`），提供對應的型別資訊，讓 TypeScript 開發者能受益於這些型別。兩者合起來才等同於原本有型別的 TypeScript 原始碼。
</details>

<details>
<summary>`tsconfig.json` 裡的 `declaration` 選項設為 `true` 會做什麼？</summary>
在編譯輸出的同時，額外產生對應的 `.d.ts` 型別宣告檔案。
</details>

<details>
<summary>TypeScript 編譯時可以指定 target 為不同的 ECMAScript 語言等級，這樣做的目的是什麼？</summary>
讓開發者能使用現代 JavaScript 語法撰寫程式，同時產生相容於較舊執行環境的輸出程式碼，這跟 Babel 的作用類似。
</details>

<details>
<summary>TypeScript 可以透過哪個設定產生不同的模組格式（例如 CommonJS 或 ESM）？</summary>
`tsconfig.json` 裡的 `module` 欄位。
</details>

<details>
<summary>把 target 設為 `ES2017` 並編譯含有 async/await 的程式碼，輸出結果會是什麼？</summary>
`async`/`await` 語法會直接保留在輸出的 JavaScript 裡，因為 ES2017 原生支援這個語法，不需要額外的 `__awaiter` 相容函式。
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
