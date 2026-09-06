---
title: 'TypeScript 型別註冊表模式：結合 keyof 與 declare module 打造可擴充的資料層'
description: '示範用一個空的 DataTypeRegistry interface 搭配 keyof 與 declare module，讓 book、magazine 模組不改中央檔案就能註冊型別，fetchRecord 的參數因此自動長出 book | magazine，這個模式對函式庫作者開放使用者擴充型別特別有價值。'
date: 2026-09-06
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 17
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeQueries
    - Keyof
    - DeclareModule
    - OpenInterfaces
    - NeverType
    - TypeRegistryPattern
---

# TypeScript 型別註冊表模式：結合 keyof 與模組宣告打造可擴充的資料層

> [[16-type-queries|前面]] 分別介紹了 `keyof`、`typeof`、索引存取型別這三種型別查詢。這一節把 `keyof` 拿來跟另一個概念搭配，解決一個實際的資料層設計問題。

## 動機：不知道使用者會定義哪些資料型別

假設要替公司裡的其他團隊打造一個資料層，目標是提供一個好用的 `fetchRecord` 函式，只要傳入資源名稱跟 ID，就能拿到對應的型別。問題在於，這些資源型別的定義權其實不在自己手上：其他團隊會自己定義「書」是什麼、「雜誌」是什麼，日後可能還會不斷冒出新的資源類型。這代表這裡需要的是一個能讓別人隨時「登記」新型別進來的機制，而不是把所有可能的型別都寫死在同一個檔案裡。

## 用 declare module 把型別疊加到指定的模組上

要做到這件事，需要先認識一個新概念：`declare module`。之前擴充全域 `window` 物件時用過 `declare global`，意思是「我要提供一些型別資訊，並指定這些資訊要套用在哪個作用域」。`declare module` 做的是類似的事，只是作用域換成了某一個特定的模組：在 `declare module` 的大括號裡放進一個 interface，效果就等於把這個 interface 直接寫進了目標模組那個檔案裡，即使實際的原始碼並沒有出現在那個檔案裡。

## 中央註冊表：一個刻意留空的 interface

專案結構裡設計了一個 `registry` 檔案，裡面放的是一個刻意留空的 interface，還有 `fetchRecord` 函式：

```ts
// lib/registry.ts
export interface DataTypeRegistry {}

export function fetchRecord(arg: keyof DataTypeRegistry & string, id: string) {
    // ...
}
```

`fetchRecord` 的第一個參數型別是 `keyof DataTypeRegistry & string`，也就是先取出 `DataTypeRegistry` 這個 interface 目前所有屬性鍵的聯集，再用交集限制只要字串鍵。因為 `DataTypeRegistry` 現在是空的，這個型別此刻等於 `never`。`never` 代表一種不可能的型別，它所代表的值集合是空集合，意思是沒有任何值能滿足這個型別的要求，此時沒有任何值能滿足 `arg` 這個參數的要求。

## 各自的模組用 declare module 註冊自己的型別

每個代表一種資源的模組（例如 `Book`、`Magazine`），可以在檔案底部加上一段模組宣告，把自己的型別註冊進中央的 `DataTypeRegistry`：

```ts
// data/book.ts
export class Book {
    // ...
}

declare module '../lib/registry' {
    export interface DataTypeRegistry {
        book: Book;
    }
}
```

```ts
// data/magazine.ts
export class Magazine {
    // ...
}

declare module '../lib/registry' {
    export interface DataTypeRegistry {
        magazine: Magazine;
    }
}
```

這裡用的是開放介面（open interface）的特性：同名的 interface 可以在不同地方多次宣告，TypeScript 會自動把這些宣告的內容合併起來。`book.ts` 裡新增了 `book` 這個屬性，`magazine.ts` 裡新增了 `magazine` 這個屬性，兩邊都各自往 `DataTypeRegistry` 裡新增了一筆條目，效果就跟直接把這些屬性寫進 `registry.ts` 裡一模一樣。

## 中央註冊表因此自動長出所有已註冊的型別

只要專案裡有引入 `book.ts` 跟 `magazine.ts`，`book.ts` 跟 `magazine.ts` 就已經把 `DataTypeRegistry` 這個 interface 同時擴充成包含 `book`、`magazine` 兩個屬性。回到 `fetchRecord` 的參數型別，`keyof DataTypeRegistry & string` 現在會自動變成 `'book' | 'magazine'`，呼叫 `fetchRecord('book', someId)` 或 `fetchRecord('magazine', someId)` 都能通過型別檢查，不需要對 `registry.ts` 這個檔案本身做任何修改。

如果之後又新增一個 `video.ts`，一樣在檔案裡加上對應的 `declare module` 區塊，把 `video: Video` 註冊進去，`fetchRecord` 的參數型別就會自動再多出一個 `'video'` 選項，變成 `'book' | 'magazine' | 'video'`，完全不用回頭去改任何一行 `registry.ts` 的程式碼。這正好呼應了型別在編譯過程中只有單一表示的特性：不管這些型別資訊來自哪個檔案，最終攤平合併出來的，都是同一個 `DataTypeRegistry`。

## 為什麼這對函式庫作者特別有價值

單看這個範例，可能會疑惑何必大費周章，直接請各團隊把自己的型別加進 `registry.ts` 這個檔案不就好了？差別在於，如果 `registry.ts` 這種程式碼是被打包進一個發布出去的函式庫、放在別人專案的 `node_modules` 資料夾裡，使用這個函式庫的人根本不可能、也不應該去修改函式庫本身的原始碼來新增自己的型別。

透過型別註冊表這個模式，函式庫作者可以先只提供一個空的、通用的中央 interface，讓使用者在自己的程式碼裡用 `declare module` 指向函式庫裡那個 registry 檔案的路徑，把自己的型別註冊進去。從編譯器的角度來看，編譯器會把這些型別資訊視為原本就寫在函式庫那個檔案裡一樣，即使打開函式庫本身的原始碼，裡面完全不會出現使用者定義的那些型別名稱，因為它們是透過模組宣告從外部「注入」進去的。

這個技巧目前只解決了「讓 `fetchRecord` 接受正確的資源名稱」這個問題，`fetchRecord` 實際回傳的型別現在還是不精確的，之後需要搭配泛型才能讓回傳型別也對應到正確的資源型別，這部分留待後面的章節處理。

## 複習

### 型別註冊表模式主要解決的問題是什麼？

解決「無法預先知道使用者會定義哪些型別」的資料層設計問題，讓不同模組能各自把自己的型別註冊進一個中央的 interface，而不用集中在同一個檔案裡預先窮舉所有可能的型別。

### `declare module` 的用途是什麼？

讓開發者提供一段型別資訊，並指定這段型別資訊要套用到哪一個模組，效果等同於把這段型別資訊直接寫進目標模組的檔案裡，即使實際的原始碼並不在那個檔案裡。

### `never` 型別代表什麼意思？

`never` 代表一種不可能的型別，它所代表的值集合是空集合，意思是沒有任何值能滿足這個型別，通常出現在某個型別運算的結果被縮限到完全沒有東西符合的情況。

### 型別註冊表模式對函式庫作者有什麼特別的價值？

函式庫作者事先不會知道使用者需要哪些具體型別，透過型別註冊表模式，可以只提供一個空的中央 interface，讓使用者用 `declare module` 指向函式庫內對應的檔案路徑，在自己的程式碼裡註冊型別，完全不需要修改函式庫本身的原始碼。

## 小測驗

<details>
<summary>TypeScript 中的 never 型別代表什麼？</summary>
一種不可能的型別，代表空集合
</details>

<details>
<summary>使用開放介面（open interface）做型別註冊，主要的好處是什麼？</summary>
讓函式庫的使用者能自行擴充型別，而不需要修改函式庫本身的原始碼
</details>

<details>
<summary>型別註冊表模式主要用到了哪些 TypeScript 概念？</summary>
型別查詢（keyof）、索引存取型別，以及模組擴充（declare module）
</details>

<details>
<summary>在型別註冊表模式中，在一個 interface 內使用 declare module 的目的是什麼？</summary>
把型別資訊加進一個 interface，效果如同這段程式碼直接寫在那個模組的檔案裡
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
