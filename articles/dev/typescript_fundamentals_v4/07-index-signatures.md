---
title: 'TypeScript 索引簽名：電話簿字典結構、已知欄位並存與 unchecked indexed access'
description: '用電話簿物件示範索引簽名語法，說明如何讓 home、work、fax 已知欄位跟任意字串鍵在同一型別裡並存，整理點記法與方括號記法的存取慣例、noUncheckedIndexedAccess 編譯器選項如何處理鍵不存在的風險，並用 Stripe 貨幣金額為例說明字典結構相較陣列更適合的建模情境。'
date: 2026-09-01
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 7
chapter: 'Objects, Arrays and Tuples'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - IndexSignatures
    - ObjectTypes
    - UnionTypes
    - LiteralTypes
    - NoUncheckedIndexedAccess
---

# TypeScript 索引簽名：用字典結構描述電話簿，兼顧已知欄位與任意鍵

## 動機：一個允許任意鍵的電話簿

假設在做一個通訊錄應用，每個聯絡人可以有多組電話號碼：`home`、`work`、`fax` 這類固定欄位是可以預期的，但應用也想開放使用者自訂標籤，新增其他任意名稱的電話號碼欄位。要描述這種「有些欄位固定，但也允許任意新增同樣形狀欄位」的資料結構，就要用到索引簽名（index signature）。

## 索引簽名的語法

索引簽名的語法長這樣：

```ts
let simpleDict: { [key: string]: string };
```

方括號裡的 `key: string` 代表「任意一個字串鍵」，冒號後面的 `string` 則是這個鍵對應的值必須符合的型別。這代表可以放進任何字串鍵、對應字串值的組合，但如果值給的是數字，TypeScript 就會報錯，因為型別要求的是字串。這種結構本質上就是在描述一個字典（dictionary）：一個可以用任意鍵持有任意數量資料的集合，索引簽名正是定義字典型別所需要的語法。

## 套用到電話簿範例

把這個概念套進電話簿物件：

```ts
const phones: {
    [k: string]: {
        country: string;
        area: string;
        number: string;
    };
} = {};
```

有了這個型別，`phones.home`、`phones.fax` 都能正常存取，型別是三個欄位（`country`、`area`、`number`）組成的物件；即使是完全沒有事先定義過的鍵，例如 `phones.custom1`，TypeScript 一樣會把它當成合法存取，型別跟其他鍵一致。

## 索引簽名可以跟已知欄位並存

索引簽名不是只能單獨使用，也可以跟明確定義的固定欄位放在同一個型別裡：

```ts
const phones: {
    mobile: { country: string; area: string; number: string };
    [k: string]: { country: string; area: string; number: string };
} = {
    mobile: { country: '1', area: '555', number: '5555' },
};
```

如果宣告了 `mobile` 這個必要欄位卻沒有在初始值裡給：

```ts
const phones: {
    mobile: { country: string; area: string; number: string };
    [k: string]: { country: string; area: string; number: string };
} = {};
// 錯誤：Property 'mobile' is missing in type '{}'
// but required in type '{ mobile: {...}; [k: string]: {...} }'
```

TypeScript 會報錯，訊息會指出 `mobile` 缺失，並列出型別裡要求的值。只要對照錯誤訊息裡缺少的欄位名稱，反查型別定義中有哪些明確欄位沒被滿足，就能知道問題出在哪裡。補上 `mobile` 的初始值後（如前面程式碼區塊所示），錯誤就會消失。像 `mobile`、`work` 這種明確定義的欄位跟索引簽名允許的任意鍵，兩者可以同時生效，互不衝突。

## 慣例：點記法留給已知欄位，方括號留給字典存取

處理索引簽名時有一個建議的慣例：存取明確定義的已知欄位時用點記法（例如 `phones.mobile`），存取索引簽名允許的動態鍵時改用方括號記法（例如 `phones['custom1']`）。這樣一眼就能分辨這個屬性是型別裡明確保證存在的欄位，還是透過索引簽名開放、不確定是否真的存在的鍵。

這個慣例背後也牽涉到一個實際的風險：索引簽名雖然宣告了值的型別，但並不保證這個鍵底下真的有資料。例如上面電話簿的例子只初始化了 `mobile`，如果去存取一個完全沒賦值過的鍵：

```ts
phones.aaaaa; // 型別仍是 { country: string; area: string; number: string }
// 但實際上這個鍵從未被賦值，執行期會是 undefined
```

TypeScript 依然會依照索引簽名判定型別存在，實際上執行時卻拿不到任何值。有一個叫做 `noUncheckedIndexedAccess` 的 TypeScript 編譯器設定，開啟後會強制索引簽名存取到的值型別自動加上 `| undefined`（`phones.aaaaa` 的型別會變成 `{ country: string; area: string; number: string } | undefined`），逼開發者處理這種鍵不存在的可能性，也能連帶引導開發者遵循「已知欄位用點記法、動態鍵用方括號」這個慣例。

## 為什麼不寫成 `string | 'mobile'`

延續前面選擇性屬性用聯集表達「可能不存在」的概念，這裡的聯集運算方向不太一樣。有學員提問，能不能把索引簽名的鍵型別寫成 `string | 'mobile'`，想同時強調 `mobile` 這個字面值鍵的存在。這其實會回歸到單純的 `string`，因為字面值型別 `'mobile'` 本身就是 `string` 的子型別，跟涵蓋範圍更廣的 `string` 做聯集，等於是被 `string` 整個吸收掉，結果就跟只寫 `string` 完全一樣，`'mobile'` 這個字面值部分不會產生任何額外效果。

## 什麼時候值得用索引簽名，而不是陣列

有學員問，既然索引簽名的鍵不容易像已知欄位一樣被點記法直接存取到，為什麼還要用它？這其實是資料建模上的考量，用來描述「用有意義的鍵直接查找值，而順序完全不重要」的資料。講師舉了 Stripe API 裡貨幣金額的例子，像用 `USD`、`JPY` 這樣的貨幣代碼當鍵，對應各自的金額數字。如果改用陣列存放一堆「{ 貨幣代碼, 金額 }」的物件，要找出日圓金額還得用 `filter` 之類的方法搜尋整個陣列，這個過程沒有帶來任何額外價值，而陣列原本擅長表達的「順序」在這種情境裡也完全沒有意義。當資料本質上就是「用鍵查值」，而且鍵的種類無法在寫程式的當下完全窮舉出來時，索引簽名描述的字典結構就比陣列更貼近實際的資料語意。

## 複習

### 索引簽名的基本語法是什麼，它用來描述什麼樣的型別？

語法是 `[key: string]: ValueType`，代表任意字串鍵都能對應到指定型別的值。它用來描述字典型別，也就是鍵在寫程式當下無法完全預先列舉、但每個鍵對應的值型別都一致的資料結構。

### 索引簽名可以跟明確定義的固定欄位放在同一個型別裡嗎？

可以。已知欄位跟索引簽名允許的任意鍵可以在同一個型別定義裡並存，兩者都能被正常存取；已知欄位是必要的，必須在初始化時提供，索引簽名開放的則是額外、非固定的鍵。

### 存取索引簽名時，建議的記法慣例是什麼？

已知的固定欄位用點記法存取，索引簽名允許的動態鍵改用方括號記法存取，藉此清楚區分這個屬性是型別保證一定存在，還是不確定是否真的有資料的動態鍵。

### 什麼情境下適合用索引簽名描述的字典結構，而不是陣列？

當資料的本質是用一個有意義的鍵直接查找對應的值，而資料彼此之間的順序沒有任何意義時，字典結構比陣列更貼切，因為陣列擅長表達順序，但用陣列搜尋特定鍵的值（例如用 filter 找出符合條件的元素）並不會帶來額外價值。

## 小測驗

<details>
<summary>使用索引簽名時，建議採用什麼記法慣例？</summary>
已知欄位用點記法，動態鍵用方括號記法
</details>

<details>
<summary>索引簽名可以跟物件型別裡明確定義的欄位並存嗎？</summary>
可以，而且明確定義的欄位必須能夠符合索引簽名所要求的型別
</details>

<details>
<summary>TypeScript 中索引簽名的主要用途是什麼？</summary>
定義一個字典結構，允許任意鍵搭配指定的值型別
</details>

<details>
<summary>給定型別 `{ [key: string]: string }`，下列哪一種賦值是合法的？</summary>
`{ home: "555-1234", custom: "555-5678" }`
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
