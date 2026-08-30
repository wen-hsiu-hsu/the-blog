---
title: 'TypeScript 型別轉換再探：相容性邊界、雙重轉型逃生口與 any 與 unknown 的選擇'
description: '延續上一篇的 casting 基礎，用 frontEndMastersFounding 日期實例，討論型別轉換的相容性邊界：為什麼字面值之間看似合理的轉型仍會被拒絕，如何用先轉 any 再轉目標型別的雙重轉型繞過檢查，這個逃生口適合用在什麼情境，以及為何 any 與 unknown 在這個技巧上完全等價。'
date: 2026-08-30
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 4
chapter: 'Variables and Values'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeCasting
    - TopType
    - LiteralTypes
    - AnyType
    - UnknownType
---

# TypeScript 型別轉換再探：相容性邊界、雙重轉型逃生口與 any/unknown 選擇

> 上一篇已經看過 casting 的基本用法：把型別轉得更寬泛（`79 as number`）是安全的，把完全不相容的型別硬轉在一起（`"oops" as Date`）會被 TypeScript 擋下來。這一篇接著討論的是這個相容性邊界到底畫在哪裡，以及真的需要繞過它時該怎麼做。

## 一個實際的日期範例：一般賦值就是最基本的推斷

課程用一個實際變數 `frontEndMastersFounding: Date` 當例子，賦值給另一個變數 `date1` 時，`date1` 的型別直接就是 `Date`。講師特別點出這其實稱不上什麼特別的「推斷」，因為右邊這個值的型別本來就已經明確是 `Date`，賦值時 TypeScript 只是原封不動地把這個已知型別帶過去而已。

如果基於某些理由想讓 `date1` 有更大的彈性，可以把它轉型成 `any`：

```ts
let date2 = frontEndMastersFounding as any;
```

這就是前面看過的其中一種 casting，跟 `as 79`、`as const` 一樣，都是「把值當成另一個型別來看待」的變化型。

## 相容性邊界：字面值之間的轉型也不是完全自由

有學員提問，既然 `10` 跟 `79` 都是 `number`，把 `10 as 79` 這樣的字面值互轉，概念上似乎說得通，為什麼還是會被 TypeScript 拒絕？講師的回答是：只要把兩者當成字面值型別來看，`10` 和 `79` 就是兩個不同的值，並不相同，TypeScript 現階段的判斷邏輯就是照字面值嚴格比對，不會因為兩者「同樣是數字」就放行。講師也留了一個伏筆：這個規則不是鐵律，未來的 TypeScript 版本也可能會針對這種情況收緊或調整判斷方式。

這說明 casting 允許與否的判斷基準是「型別彼此之間是否有合理的相容性」，只要兩個型別的集合之間還有交集或包含關係，TypeScript 就會放行這個轉型；但像字串與 `Date` 這種完全沒有交集的型別，TypeScript 會直接提出質疑，等於是在問「你確定要這麼做嗎？這兩者差異太大了，之後沒辦法把這個值當成 `Date` 安全地到處傳遞」。

## 雙重轉型：先繞道 any 或 unknown 才能硬轉

如果真的需要把一個字串值當成 `Date` 使用，直接轉型會被拒絕，唯一的路徑是先轉型成一個上限型別（top type），再從那個上限型別轉型到目標型別：

```ts
let oops = 'oops' as any as Date;
oops.toISOString(); // 編譯期不會報錯，執行期會直接壞掉
```

講師特別提醒這是一段「很詭異的程式碼」，之所以危險，是因為 TypeScript 會放心讓你在這個值上呼叫只有 `Date` 才有的方法（例如 `toISOString`），但這個值實際上是字串，執行到這一行就會直接噴錯。這種雙重轉型比較合理的使用情境是寫測試的時候，刻意建立一個型別不對的錯誤值，藉此驗證程式碼在執行期真的會照預期的方式攔截並處理這種異常輸入。

## any 與 unknown：這個技巧下兩者完全等價

有學員問，做這種雙重轉型時，選擇轉成 `any` 還是 `unknown` 有沒有差別。講師的回答是：`unknown` 也是另一種上限型別，這門課後續的中階課程才會深入介紹它，但就這個「先轉上限型別、再轉回目標型別」的技巧來說，`any` 跟 `unknown` 沒有差別，兩者都能達到同樣效果，因為最終都是要轉回 `Date`，選哪一個當中間站都無所謂。`unknown` 確實有一些自己的優點，但這些優點在這個轉型技巧的情境下派不上用場，要等之後介紹 `unknown` 時才會說明。

## 複習

### 為什麼把兩個都是 number 的字面值互相轉型（例如 `10 as 79`）還是會被 TypeScript 拒絕？

因為字面值型別是精確比對值本身，`10` 和 `79` 是兩個不同的值，即使同屬 `number`，TypeScript 目前的判斷邏輯仍會視為不相容的型別而拒絕轉型。

### 當兩個型別完全不相容（例如字串跟 Date）時，如果真的需要轉型，該怎麼做？

必須先把值轉型成一個上限型別（例如 `any` 或 `unknown`），再從這個上限型別轉型到目標型別，這樣可以繞過 TypeScript 對直接轉型的相容性檢查。

### 這種先轉上限型別再轉回目標型別的雙重轉型，有什麼風險，又適合用在什麼情境？

風險是編譯期完全檢查不出問題，但執行期一旦呼叫了目標型別特有的方法，就會直接出錯。比較合理的使用情境是在測試中刻意建立型別錯誤的值，驗證程式碼在執行期是否真的會照預期攔截這種異常輸入。

### 做雙重轉型時，選擇 any 還是 unknown 作為中間的上限型別，有差別嗎？

沒有差別，兩者都是上限型別，都能達到同樣的轉型效果，`unknown` 有一些自己的優點，但在這個轉型技巧裡派不上用場。

## 小測驗

<details>
<summary>把一個字串直接轉型成 Date（例如 `"oops" as Date`），TypeScript 會有什麼反應？</summary>
TypeScript 會拒絕這個轉型，因為 string 和 Date 之間沒有交集，是完全不相容的型別。
</details>

<details>
<summary>要強行轉型兩個完全不相容的型別，正確的做法是什麼？</summary>
先轉型成一個上限型別（如 any 或 unknown），再從這個上限型別轉型到目標型別。
</details>

<details>
<summary>把一個字串錯誤地轉型成 Date 並呼叫 Date 專屬方法時，什麼時候才會出錯？</summary>
編譯期不會出錯，要等到執行期實際呼叫那個方法時才會出錯。
</details>

<details>
<summary>TypeScript 允許一個型別轉型成另一個型別的判斷基準是什麼？</summary>
兩個型別必須具備合理的相容性；完全不相容、彼此沒有交集的型別，TypeScript 會直接拒絕轉型。
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
