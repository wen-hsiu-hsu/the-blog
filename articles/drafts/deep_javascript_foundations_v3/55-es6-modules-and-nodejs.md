---
title: 'ES6 模組語法：原生模組支援與 Node.js 的相容之路'
description: '介紹 ES6 原生模組語法的核心特性：預設私有、以 export 公開、以檔案為單位、單例行為。同時說明 TC39 與 Node.js 之間的相容性問題歷史，以及 Kyle Simpson 在課程錄製時選擇觀望的背景。'
date: 2026-06-22
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 55
chapter: 'Closure'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ModulePattern
---

# ES6 模組語法：原生模組支援與 Node.js 的相容之路

> 本篇延續[[54-module-pattern|上一篇]]的模組模式討論。上一篇說明了用 IIFE 和工廠函式手工實作模組的方式。本篇進入 JavaScript 語言層級的原生支援：ES6 模組語法，並探討它在實際採用上的歷史障礙。

## ES6 模組：期待已久的語言原生支援

多年來，社群一直呼籲 JavaScript 應該為這麼重要的設計模式提供第一等的語法支援。ES6 終於帶來了原生模組語法，但它的普及之路並不順遂。

## ES6 模組與 Node.js 的相容問題

ES6 模組規格推出後，TC39 與 Node.js 社群之間出現了一段嚴重的溝通落差：兩方在設計階段並未充分協調，導致新規格與 Node.js 長期使用的 CommonJS（`require`/`module.exports`）系統存在根本性的不相容。

問題的核心之一是**循環引用（circular dependency）**：當一個 CommonJS 模組 `require` 了一個 ES6 模組，而那個 ES6 模組又 `import` 了原來的 CommonJS 模組時，兩套系統的載入行為會產生難以預測的結果。

Node.js 採用的妥協方案之一，是要求使用 `.mjs` 副檔名來標示 ES6 模組，以便與 `.js` 的 CommonJS 模組區分。這個妥協對許多人來說代價過高。Kyle Simpson 在錄製本課程時（約 2019 年）選擇繼續使用經典模組模式，原因正是不想在這場規格動盪尚未落定之前貿然採用新語法。

## ES6 模組的語法與特性

儘管有上述背景，ES6 模組本身的設計有幾個清楚的特性值得理解。

### 預設私有、明確公開

開啟一個 ES6 模組檔案後，裡面的所有變數和函式**預設都是私有的**。可以把整個檔案想像成被一個大型函式包裹起來，形成私有範疇。要公開某個東西，必須明確使用 `export` 關鍵字：

```javascript
// workshop.mjs
var teacher = "Kyle";           // 私有，外部無法存取

export default function ask(question) {
  console.log(teacher, question);
};
```

沒有 `export` 的宣告永遠不會被外部看到。

### 兩種 import 風格

ES6 模組提供兩種主要的 import 語法，背後代表兩種不同的思維方式。

#### 具名匯入（named import）

```javascript
import ask from "workshop.mjs";
ask("It's a default import, right?");
// Kyle It's a default import, right?
```

這裡把模組預設匯出的函式直接以 `ask` 這個識別字引入目前的頂層範疇。這種風格類似 Java 的 import 概念：把識別字直接帶進範疇中使用。

#### 命名空間匯入（namespace import）

```javascript
import * as workshop from "workshop.mjs";
workshop.ask("It's a namespace import, right?");
// Kyle It's a namespace import, right?
```

這裡把模組的所有匯出內容收進一個命名空間物件 `workshop`，再透過它存取各個成員。這種風格把模組本身視為一個具名的命名空間單位，與上一篇介紹的命名空間模式在思維上更為接近。

兩種風格並無對錯之分，只是組織和消費模組的不同視角。Kyle Simpson 個人偏好命名空間匯入，因為這樣可以在程式碼中清楚看出某個函式來自哪個模組。

### 一個檔案一個模組

ES6 模組是**以檔案為單位**的。一個檔案只能是一個模組，無法在同一個檔案內定義多個 ES6 模組。這意味著一個由一千個模組組成的應用程式，就是一千個獨立的檔案。

這個特性也決定了若要在瀏覽器中不經過建置工具直接使用，就必須載入大量獨立的網路請求。這也是多數團隊仍搭配打包工具使用 ES6 模組語法的原因。

### 單例行為

ES6 模組是**單例（singleton）**。無論一個模組被 `import` 多少次，它只會執行一次，後續所有的 `import` 取得的都是同一個實例的參考。

如果需要能建立多個實例的能力，必須在模組的公開 API 中明確匯出一個工廠函式，讓呼叫方自行建立新的實例。這和上一篇介紹的工廠函式模組概念完全一致，只是載體換成了 ES6 模組語法。

## 為什麼範疇是最重要的支柱

模組模式是詞彙範疇這整條學習路徑的終點站。Kyle Simpson 認為，在 JavaScript 的三個大主題中，Pillar 2（範疇與閉包）是最重要的一個，因為它以最根本的方式觸及其他所有概念。

值得注意的是，模組模式對內部的實作方式沒有限制。你完全可以在一個模組內部大量使用 `class`，只要最終把這些行為組織進模組，讓外部可以 `import` 並使用即可。模組模式是程式碼組織層面的決策，它凌駕於內部的實作選擇之上。

## 複習

### ES6 模組在檔案結構上有什麼關鍵特性？

ES6 模組以檔案為單位，每個檔案只能存在一個模組，無法在同一個檔案內定義多個 ES6 模組。

### 在 ES6 模組中，如何讓某個宣告成為公開的？

使用 export 關鍵字可以讓宣告成為公開的，沒有被 export 的所有內容都維持私有。

### ES6 模組在模組實例化方面有什麼獨特行為？

ES6 模組是單例，無論被 import 多少次，模組只會執行一次，後續的 import 都取得同一個實例的參考。

### Node.js 建議使用什麼副檔名來支援 ES6 模組？

建議使用 .mjs 副檔名，以便在 Node.js 中使用 ES6 模組並與 CommonJS 模組區分。

### ES6 模組的範疇預設可見性為何？

ES6 模組中的所有內容預設都是私有的，可以把整個模組想像成被包裹在一個私有範疇中。

## 小測驗

<details>
<summary>ES6 模組在檔案結構上的主要特性是什麼？</summary>
模組以檔案為單位，每個模組必須是獨立的檔案
</details>

<details>
<summary>ES6 模組如何處理模組實例？</summary>
模組是單例，只會執行一次
</details>

<details>
<summary>在 ES6 模組中，使用哪個關鍵字讓內容成為公開的？</summary>
export
</details>

<details>
<summary>Node.js 中建議用於 ES6 模組的副檔名是什麼？</summary>
.mjs
</details>

<details>
<summary>ES6 模組中，變數和函式的預設可見性為何？</summary>
私有（private）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記