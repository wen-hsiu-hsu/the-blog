---
title: 'TypeScript 型別查詢：用 keyof、typeof 與索引存取型別，從既有值反推出型別定義'
description: 'keyof 取得物件所有屬性鍵組成的聯集型別，typeof 能從 Promise.all 回傳的複雜 tuple 萃取完整型別（並釐清跟執行期 typeof 的差異，含取得 class 靜態面），加上用方括號索引存取型別特定屬性、可連續串接，並讓聯集索引投射出新的聯集型別，三者合起來能大幅減少重複手寫型別的麻煩。'
date: 2026-09-05
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 16
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeQueries
    - Keyof
    - Typeof
    - IndexedAccessTypes
    - UnionTypes
    - IntersectionTypes
    - ClassStaticSide
---

# TypeScript 型別查詢：用 keyof、typeof 與索引存取型別從既有值反推型別

型別查詢（type query）是 TypeScript 提供的一組工具，讓開發者能從既有的值或型別裡「查詢」出對應的型別資訊，不必手動重新寫一份。這一節依序看三種型別查詢：`keyof`、`typeof`，以及索引存取型別（indexed access types）。

## keyof：取得一個物件所有屬性鍵組成的型別

`keyof` 這個型別查詢，能取得一個物件型別上所有屬性鍵組成的聯集型別：

```ts
type DatePropertyNames = keyof Date;
```

JavaScript 裡合法的屬性鍵只有三種型別：字串、數字、符號（symbol）。`keyof Date` 會把 `Date` 型別上所有屬性鍵通通列出來，如果只想篩選出字串型別的鍵，可以搭配交集型別：

```ts
type DateStringPropertyNames = DatePropertyNames & string;
```

`DatePropertyNames & string` 等於是把原本聯集裡不是字串的部分（數字、符號鍵）都濾掉，只留下屬於字串的那些鍵。這是一個好用的小技巧：只要對任何型別做這種交集運算，就能強迫 TypeScript 把原本可能被收合、簡化顯示的內容整個攤開列出來，方便觀察這個型別實際涵蓋了哪些成員。

## typeof：從一個值萃取出它的型別

跟 `keyof` 對照的是另一個型別查詢 `typeof`，作用是從一個既有的值萃取出它的型別：

```ts
async function main() {
    const apiResponse = await Promise.all([
        fetch('https://example.com'),
        Promise.resolve('Titanium White'),
    ]);

    type ApiResponseType = typeof apiResponse;
    // 結果：[Response, string]
}
```

`apiResponse` 是同時等待兩個 Promise（一個 HTTP fetch、一個立即 resolve 的字串）解析完成後得到的 tuple，如果這個型別複雜到不想手動寫出來，直接用 `typeof apiResponse` 就能取得跟這個值完全吻合的型別，不用再手動重複一次。

要特別留意的是，這裡的 `typeof` 跟 JavaScript 執行期的 `typeof` 運算子雖然是同一個關鍵字，但用途完全不同。執行期的 `typeof` 只會回傳極少數固定的字串（大概只有八種可能的結果，例如 `'string'`、`'object'`），任何物件不管內部結構多複雜，一律回傳 `'object'`；但在型別查詢裡使用的 `typeof`，回傳的是解析度高得多的完整型別資訊，能還原出這個值實際的型別結構，而不只是一個粗略的分類字串。同樣的關鍵字在型別語境跟值語境裡意義天差地遠，需要分開理解。

上面這個例子也順帶展示了一件事：型別別名不一定要定義在模組的最外層，也可以像變數一樣定義在函式作用域內部，範圍只侷限在這個函式裡。這種寫法比較少見，但完全合法，如果一個外層函式本身是在做函式式程式設計、回傳另一個內部函式，把型別宣告放在這個閉包（closure）範圍內、讓它去影響這個閉包實際回傳的內容，也是說得通的用法。

## 用 typeof 取得 class 的靜態面

`typeof` 另一個常見用途，是取得一個 class 的「靜態面」（static side）。用瀏覽器內建的 `CSSRule` 這個 class 示範，建立一個實例後，能存取到的是 `cssText`、`parentRule` 這些屬於實例本身的欄位：

```ts
const myAjax = new CSSRule();
// myAjax 的型別是 CSSRule，只有 cssText、parentRule 這些實例欄位
```

但如果想描述的是 `CSSRule` 這個 class 本身（也就是那個能拿去呼叫 `new` 的建構子），而不是它產生出來的實例，該怎麼辦？先證明 `CSSRule` 本身就是一個真正的值，而不只是一個型別名稱，可以把它指派給一個新的變數：

```ts
const MyAjaxConstructor = CSSRule;
const foo = new MyAjaxConstructor();
```

`MyAjaxConstructor` 依然可以正常拿去呼叫 `new`，這證明它引用的是 `CSSRule` 這個真正的 class 值，不是單純的一個型別。這時候如果想取得這個建構子本身的型別，就要用 `typeof`：

```ts
type MyAjaxConstructorType = typeof CSSRule;
// {
//     new (): CSSRule;
//     prototype: CSSRule;
//     readonly STYLE_RULE: 1;
//     readonly CHARSET_RULE: 2;
//     readonly IMPORT_RULE: 3;
//     // ...還有更多
// }
```

`typeof CSSRule` 取得的不是 `CSSRule` 實例的型別，而是 `CSSRule` 這個 class 本身的型別，包含它的建構子簽章（`new (): CSSRule`），以及像 `STYLE_RULE`、`CHARSET_RULE` 這種掛在 class 本身、而不是掛在實例上的靜態成員，這些都是 `CSSRule` 這個瀏覽器內建 class 上真正定義的靜態常數，用來標示不同種類的 CSS 規則。如果熟悉早期 ES5 用原型鏈（prototype）手動模擬繼承的寫法，這裡描述的正是原型鏈背後那個「類別本身」的角色，也就是俗稱的 class 靜態面。

## 索引存取型別：用方括號取出型別裡某個屬性的型別

第三種型別查詢是索引存取型別（indexed access types），語法跟存取物件屬性很像，只是操作對象換成型別本身：

```ts
interface Car {
    make: string;
    model: string;
    color: { red: string; green: string; blue: string };
}

type CarColor = Car['color'];
// { red: string; green: string; blue: string }
```

`Car['color']` 直接取出 `color` 這個屬性對應的型別，即使這個型別原本沒有獨立命名，也能透過這種方式單獨拿出來用。這個方括號裡放的字串，其實就是要存取的屬性鍵名稱，這也是為什麼稱它為「索引」存取型別。tuple 也適用同樣的語法，只是索引換成數字。如果嘗試存取一個型別上不存在的屬性鍵，TypeScript 會直接報錯，跟一般的型別檢查行為一致。

## 索引存取型別可以連續串接

索引存取型別可以連續往下挖：

```ts
type CarColorRed = Car['color']['red'];
// string
```

先透過 `Car['color']` 取得顏色物件的型別，再從這個型別裡繼續用 `['red']` 取出 `red` 這個欄位的型別，最終得到 `string`。

## 用聯集當索引，會把聯集投射到每個結果上

如果在方括號裡放進一個由多個屬性鍵組成的聯集，索引存取型別會把這個聯集「投射」過去：

```ts
interface Car {
    make: string;
    model: string;
    year: number;
    color: { red: string; green: string; blue: string };
}

type CarProperty = Car['year' | 'color'];
// number | { red: string; green: string; blue: string }
```

可以把這個過程想成：先把聯集裡的每一個鍵分別拿去做索引存取，各自得到一個結果型別，再把這些結果全部聯集起來，變成一個新的聯集型別。這裡的結果會是 `year` 對應的 `number`，跟 `color` 對應的顏色物件型別，兩者聯集在一起，這種手法有時被稱為「透過索引存取型別投射一個聯集」。

## keyof 與 typeof 的差異：一個像 Object.keys，一個是取得型別

`keyof` 跟 `typeof` 很容易搞混，可以用一個具體的物件釐清兩者的差異：

```ts
const contact = { name: 'Mike', email: 'mike@example.com' };

type ContactKeys = keyof typeof contact;
// 'name' | 'email'
```

如果只寫 `keyof contact`，會直接出錯，因為 `contact` 在這裡指的是一個值，不能直接拿一個值去做 `keyof` 查詢；`keyof` 要作用的對象必須是型別。這時候需要先用 `typeof contact` 取得 `contact` 這個值對應的型別，再對這個型別做 `keyof`，才能得到 `'name' | 'email'` 這個由屬性鍵組成的聯集型別。簡單來說，`keyof` 相當於型別世界裡的 `Object.keys()`，而 `typeof`（在型別語境下）則是負責從一個值取得它的型別，兩者經常需要搭配著一起使用。

## 複習

### keyof 這個型別查詢的作用是什麼？

`keyof` 能取得一個物件型別上所有屬性鍵組成的聯集型別，這些屬性鍵可能是字串、數字或符號（JavaScript 中合法的屬性鍵型別只有這三種）。

### 型別語境下的 typeof，跟 JavaScript 執行期的 typeof 運算子有什麼差異？

執行期的 `typeof` 只會回傳極少數固定的字串（大約八種），任何物件不論結構多複雜，一律回傳 `'object'`；型別語境下的 `typeof` 則是從一個值萃取出解析度高得多的完整型別結構，能還原出這個值實際的型別，而不只是一個粗略分類。

### 索引存取型別可以做到哪些事？

可以用方括號搭配屬性鍵名稱，從一個物件型別或介面裡取出某個屬性對應的型別，也能用在 tuple 上搭配數字索引；可以連續串接多層存取，也支援存取不存在的屬性鍵時會被 TypeScript 報錯；如果方括號裡放的是一個聯集鍵，會把聯集裡每個鍵各自對應的型別結果聯集起來。

### 把一個聯集型別當作索引存取型別的索引時，會發生什麼事？

聯集裡的每一個鍵都會分別被拿去做索引存取，各自得到一個對應的結果型別，最後把這些結果全部聯集起來，形成一個新的聯集型別。

## 小測驗

<details>
<summary>JavaScript 中合法的屬性鍵有哪三種型別？</summary>
字串、數字、符號
</details>

<details>
<summary>TypeScript 中的索引存取型別可以做什麼？</summary>
用方括號搭配屬性鍵名稱，存取某個屬性對應的型別
</details>

<details>
<summary>對一個 class 使用 typeof 時，會得到什麼樣的型別？</summary>
這個 class 的靜態面，包含建構子與靜態成員
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
