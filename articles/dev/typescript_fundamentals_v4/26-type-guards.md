---
title: 'TypeScript 型別守衛全解析：內建守衛、自訂 is 語法、asserts 與 switch (true)'
description: '整理型別守衛作為型別系統與執行期判斷的接合點，列出 instanceof、typeof、真假值檢查等內建守衛，示範用 value is Type 語法寫自訂守衛、asserts 拋錯取代條件分支，並看私有欄位存在檢查與 switch (true) 兩種進階寫法，提醒守衛邏輯要跟斷言精準對齊，避免產生錯誤型別。'
date: 2026-09-10
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 26
chapter: 'Classes & Type Guards'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeGuards
    - Narrowing
    - PrivateFieldPresenceCheck
    - TypePredicate
    - AssertionFunctions
    - SwitchTrue
---

# TypeScript 型別守衛全解析：內建守衛、自訂 is 語法、asserts 與 switch (true)

> [[25-param-properties-and-overrides|前面]] 用 `override` 把編譯期檢查跟基底類別的方法名稱綁在一起。這一節要深入談的型別守衛，做的是類似的事：把編譯期的型別系統，跟執行期實際會跑的判斷式緊密接合在一起。

## 型別守衛：型別系統與執行期判斷的接合點

型別守衛可以理解成一個接合點，銜接了「對型別系統有特殊意義的東西」跟「實際會在執行期被求值的東西」。回顧 [[11-union-types|前面看過]] 那個處理成功或失敗結果的例子，用 tuple 的第一個元素判斷是 `'error'` 還是別的值，藉此窄化第二個元素的型別。這一行程式碼很特別：它既是真正會在 JavaScript 執行期跑的判斷式，同時對型別系統也有意義，這兩者緊密對齊，只有在執行期真的檢查到第一個元素是字串 `'error'` 時，才能安全地把型別窄化下去。

## 常見的內建型別守衛

TypeScript 認得好幾種寫法，會自動把它們當成型別守衛：

- `instanceof`：檢查一個值是不是某個 class 的執行個體
- `typeof`：檢查基本型別（`'string'`、`'number'` 等等）
- 特定值檢查：例如檢查是否等於 `null`
- 真假值（truthy/falsy）檢查：例如一個可能是 `undefined` 的值，經過檢查後可以確定是有值的
- `Array.isArray()`：檢查是否為陣列
- 屬性存在檢查：用 `in` 運算子檢查一個物件是否具有特定屬性

用一個型別是「`Date`、`null`、`undefined`、字串 `'pineapple'`、長度為 1 的數字 tuple，或是帶有 `dateRange` 屬性的物件」這種大聯集的值當例子，可以把這些型別守衛串成一長串條件式，一步步縮小範圍：先用 `instanceof Date` 篩出 `Date`；再檢查是不是字串，因為這裡唯一可能的字串就是 `'pineapple'`；再用特定值檢查排除 `null`；剩下如果還是 falsy，就一定是 `undefined`；再用 `Array.isArray` 篩出那個 tuple；剩下的只可能是那個帶 `dateRange` 的物件。走到最後一個 `else` 分支時，型別會被窄化成 `never`，因為前面的分支已經把所有可能性都排除光了，這代表已經徹底處理完這個聯集型別的每一種可能。每一個分支裡，都能安心針對窄化後的具體型別繼續操作。

## 自訂型別守衛：用 value is Type 語法

除了內建的型別守衛，也可以自己定義。假設有一個 `CarLike` 介面，想確認一個型別是 `any` 的值，形狀是不是符合這個介面，只依賴它的結構來判斷：

```ts
interface CarLike {
    make: string;
    model: string;
    year: number;
}

function isCarLike(valueToTest: any) {
    return (
        valueToTest &&
        typeof valueToTest === 'object' &&
        'make' in valueToTest &&
        typeof valueToTest.make === 'string' &&
        'model' in valueToTest &&
        typeof valueToTest.model === 'string' &&
        'year' in valueToTest &&
        typeof valueToTest.year === 'number'
    );
}
```

這個函式邏輯是對的，但因為 `valueToTest` 一開始的型別是 `any`，光靠這個函式本身沒辦法幫呼叫端把型別窄化。要解決這個問題，需要把函式的回傳型別明確標註成「型別謂語」（type predicate）：

```ts
function isCarLike(valueToTest: any): valueToTest is CarLike {
    return (
        valueToTest &&
        typeof valueToTest === 'object' &&
        'make' in valueToTest &&
        typeof valueToTest.make === 'string' &&
        'model' in valueToTest &&
        typeof valueToTest.model === 'string' &&
        'year' in valueToTest &&
        typeof valueToTest.year === 'number'
    );
}
```

這個函式實際回傳的值型別就是一個普通的 `boolean`，但 `valueToTest is CarLike` 這段回傳型別標註，是額外講給 TypeScript 聽的：如果這個函式回傳 `true`，就代表 `valueToTest` 可以被當成 `CarLike`；回傳 `false`，就代表它不是。重點不只在於回傳了一個布林值，而是這段型別標註明確定義了「這個布林值代表什麼意思」，把執行期實際跑的這段邏輯，跟編譯期該如何理解這個結果緊密銜接起來。有了這個定義之後，就能寫出乾淨的判斷式：

```ts
if (isCarLike(maybeCar)) {
    // 這裡 maybeCar 已經被窄化成 CarLike
}
```

## 對齊執行期邏輯與型別斷言的重要性

自訂型別守衛之所以好用，是因為它們能優雅地處理聯集型別，尤其常用在處理來源不明的 API 回應：拿到一包不確定內容的 JSON，丟進一個型別守衛，就能得到一個範圍精確、可以放心往下游傳遞的型別。但這一切成立的前提，是執行期實際檢查的邏輯，必須跟回傳型別裡宣稱的意思完全一致。如果寫出一個邏輯有誤、卻宣稱得信誓旦旦的型別守衛，這個錯誤的型別資訊會被 TypeScript 全盤採信，並隨著程式碼一路擴散下去，帶來的問題會比完全沒有型別守衛還要棘手，因為開發者會誤以為這裡是安全的。

## asserts 語法：用拋錯取代條件分支

除了回傳布林值的型別守衛，還有另一種寫法，靠拋出例外來表達同樣的概念：

```ts
function assertsIsCarLike(valueToTest: any): asserts valueToTest is CarLike {
    if (
        !(
            valueToTest &&
            typeof valueToTest === 'object' &&
            'make' in valueToTest &&
            typeof valueToTest.make === 'string' &&
            'model' in valueToTest &&
            typeof valueToTest.model === 'string' &&
            'year' in valueToTest &&
            typeof valueToTest.year === 'number'
        )
    ) {
        throw new Error(`Value does not appear to be a CarLike`);
    }
}
```

呼叫這個函式時，不需要包在 `if` 判斷式裡：

```ts
assertsIsCarLike(maybeCar);
// 執行到這裡還沒有被拋出例外，代表 maybeCar 已經被窄化成 CarLike
```

概念上這跟前面的型別守衛是同一件事，只是表達的角度不同：前者是「條件成立與否」決定要不要窄化，這裡則是「有沒有拋出例外」決定要不要窄化。只要程式碼順利執行到下一行，沒有被這個函式拋出例外中斷，就代表 `valueToTest` 已經被確認符合 `CarLike`，型別也隨之窄化。這種風格適合用在真的希望在檢查失敗時直接拋出例外中止流程的情境。

## 用私有欄位存在檢查寫型別守衛

[[24-access-modifiers|前面]] 那個 `equals` 方法已經示範過私有欄位存在檢查，這一節可以把它再簡化一步：拿掉序號比較的邏輯，只要能通過 `#serialNumber in other` 這道檢查，就直接回傳 `true`，讓它變成一個純粹的型別守衛：

```ts
class Car {
    #serialNumber = Car.generateSerialNumber();
    // ...

    equals(other: unknown) {
        if (other && typeof other === 'object' && #serialNumber in other) {
            return true;
        }
        return false;
    }
}
```

用私有欄位存在檢查當守衛特別漂亮，因為只要能偵測到這個私有欄位存在，就一定代表這個值是 `Car` 的執行個體，判斷依據非常可靠。這類判斷寫成 `static` 方法一樣好用，因為 `static` 方法照樣看得到私有欄位。但要留意這種寫法本質上比較接近名義型別系統的思路，靠的是「這個值是不是從特定建構子產生的」，而不是純粹依賴結構；前面用 `'make' in valueToTest` 那種寫法，則完全是結構型別系統的思路，只在意形狀符不符合。兩種手法各有適合的場合，都是型別守衛工具箱裡值得保留的選項。

## switch (true)：更簡潔的多重型別守衛寫法

TypeScript 5.3 開始支援一種新寫法，可以用 `switch (true)` 搭配多個 `case` 子句，取代一長串 `if-else`：

```ts
class Fish {
    swim() {
        /* ... */
    }
}

class Bird {
    fly() {
        /* ... */
    }
}

function move(val: Fish | Bird) {
    switch (true) {
        case val instanceof Bird:
            val.fly(); // val 被窄化成 Bird
            break;
        case val instanceof Fish:
            val.swim(); // val 被窄化成 Fish
            break;
    }
}
```

寫法上是拿 `true` 去跟每個 `case` 子句的判斷式比較，會依序往下找，直到找到第一個結果為 `true` 的 `case` 為止。這種寫法很接近其他語言（像 Scala、Erlang、Elixir）裡常見的模式匹配（pattern matching），在需要串接一長串型別判斷邏輯時，可以讓程式碼讀起來更整齊。

## 撰寫高品質型別守衛的提醒

型別守衛的品質非常重要，寫得不好的守衛，是會說謊、而且說得理直氣壯的那種。舉一個明顯不好的例子：

```ts
function isNull(val: unknown): val is null {
    return !val; // 錯誤：這個檢查也會讓 0、''、false、undefined 通過
}
```

這個型別守衛表面上是要檢查一個值是不是 `null`，但邏輯上用的是單純的真假值檢查，數字 `0`、空字串 `''`、布林值 `false`、甚至 `undefined`，都會被誤判成 `null`。要正確表達這個意圖，應該直接寫成 `val === null`，這也剛好是內建的特定值檢查型別守衛能做到的事，完全不需要另外自訂一個。這種看似無傷大雅的邏輯錯誤，其實是特別容易造成傷害的地方：因為 TypeScript 會完全相信這段程式碼宣稱的意思，並讓這個錯誤的型別假設隨著程式碼一路擴散，最終不僅沒有幫忙抓到 bug，反而變成製造 bug 的源頭，撰寫型別守衛時務必格外謹慎。

## 複習

### 什麼是型別守衛？它為什麼被形容成一個「接合點」？

型別守衛是一段同時具備執行期意義與型別系統意義的判斷式，稱為接合點是因為它把「實際會在執行期被求值的邏輯」跟「編譯期該如何窄化型別」緊密銜接在一起，只有在執行期的檢查真的通過時，對應的型別窄化才成立。

### 自訂型別守衛的函式，回傳型別要怎麼寫？為什麼不能只寫 boolean？

要寫成型別謂語（type predicate）的形式，例如 `valueToTest is CarLike`。函式實際回傳的值確實是 `boolean`，但單純標註 `boolean` 沒辦法讓 TypeScript 理解這個布林值窄化的意義，型別謂語才能明確告訴編譯器：回傳 `true` 代表這個值可以被當成哪個具體型別。

### asserts 語法的型別守衛，跟一般回傳布林值的型別守衛有什麼不同？

一般型別守衛回傳布林值，需要包在 `if` 判斷式裡依條件窄化；asserts 型別守衛則是在檢查失敗時直接拋出例外，只要程式碼順利執行到下一行、沒有被中斷，就代表型別已經窄化，不需要額外的條件分支。

### 為什麼撰寫型別守衛時，執行期邏輯跟型別斷言必須精準對齊？

因為 TypeScript 會完全信任型別守衛宣稱的斷言，一旦執行期的檢查邏輯跟型別斷言不一致，這個錯誤的型別假設會隨著程式碼一路擴散下去，讓後續使用這個型別的地方都建立在錯誤的假設上，造成的問題往往比完全沒有型別守衛還要難以追查。

## 小測驗

<details>
<summary>撰寫使用者自訂型別守衛函式時，回傳型別要如何標註？</summary>
用型別謂語（例如 value is Type）
</details>

<details>
<summary>撰寫型別守衛時，有什麼重要的注意事項？</summary>
執行期檢查邏輯要跟編譯期的型別意義保持一致
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
