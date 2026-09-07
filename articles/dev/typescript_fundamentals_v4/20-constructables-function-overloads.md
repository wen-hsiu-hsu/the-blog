---
title: 'TypeScript construct signature 與函式多載：用 new 描述建構子、用函式頭綁定參數關係'
description: '示範用 new 關鍵字寫出 construct signature 描述像 Date 這樣的建構子型別，並用 handleMainEvent 這個處理表單與 iframe 事件的函式，說明函式多載如何用多個函式頭綁定第一個參數與第二個參數的對應關係，避免混搭出不合理的組合，也點出多載頭必須跟底層實作相容的限制。'
date: 2026-09-07
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 20
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - ConstructSignature
    - FunctionOverloads
    - CallSignature
---

# TypeScript construct signature 與函式多載：用 new 與多個函式頭綁定參數關聯

> [[19-void-type|前面]] 看的是回傳型別 `void` 的細節，兩篇之前的 [[18-callables|call signature]] 則介紹了如何替一個能被呼叫的函式定義型別。這一節接著看跟呼叫很像、但語意不同的另一種型別：能被 `new` 出來的建構子；並介紹函式多載，處理參數之間彼此綁定的情境。

## construct signature：跟 call signature 幾乎一樣，只差一個 new

前面看過的 call signature 描述的是「可以被呼叫的東西」，如果在同樣的語法前面加上 `new` 關鍵字，描述的就變成「可以用 `new` 建立實例的東西」，這種型別稱為 construct signature：

```ts
interface DateConstructor {
    new (value: number): Date;
}

let MyDateConstructor: DateConstructor = Date;
const d = new MyDateConstructor(1697923072611);
// d 的型別：Date
```

`DateConstructor` 這個 interface 描述的正是 `Date` 這個內建 class 本身的介面：可以用 `new` 呼叫、傳入一個 `number`、回傳一個 `Date` 執行個體。這裡把 `Date`（不是 `new Date()`，而是 `Date` 這個 class 本身）指派給 `MyDateConstructor`，通過型別檢查沒有問題，因為 `Date` 這個 class 的形狀完全符合 `DateConstructor` 這個 construct signature 的要求。

construct signature 在實務上相對少見，寫 call signature 的機會遠遠更常見，畢竟只要牽涉到 callback、高階函式，就會需要 call signature。但兩者的語法差異只在於有沒有多加一個 `new`，不需要另外記一套語法。

## 函式多載的動機：讓兩個參數彼此綁定

接下來看一個更進階的情境。假設要做一個集中處理事件的函式，同時處理表單提交跟 iframe 訊息這兩種來源，分別對應到不同的 handler 型別：

```ts
type FormSubmitHandler = (data: FormData) => void;
type MessageHandler = (evt: MessageEvent) => void;
```

如果直接把這兩種可能性簡單地用聯集型別堆在一起：

```ts
function handleMainEvent(
    elem: HTMLFormElement | HTMLIFrameElement,
    handler: FormSubmitHandler | MessageHandler,
) {}
```

呼叫 `handleMainEvent` 時，第二個參數 `handler` 的型別會直接被推斷成 `any`，而不是預期中「依第一個參數是表單還是 iframe，對應出正確的 handler 型別」。因為這個函式簽名裡完全沒有表達出「第一個參數是表單元素時，第二個參數就該是表單 handler；第一個參數是 iframe 元素時，第二個參數就該是訊息 handler」這種綁定關係，兩個參數各自獨立取值，實際上允許表單元素搭配訊息 handler 這種不合理的組合，而這正是希望避免的情況。

## 用多個函式頭描述允許的參數組合

要表達這種「參數之間互相綁定」的關係，需要用到函式多載（function overloads）。做法是在真正的函式實作之上，先寫出幾個只有簽名、沒有函式主體的「函式頭」：

```ts
function handleMainEvent(elem: HTMLFormElement, handler: FormSubmitHandler): void;
function handleMainEvent(elem: HTMLIFrameElement, handler: MessageHandler): void;
function handleMainEvent(
    elem: HTMLFormElement | HTMLIFrameElement,
    handler: FormSubmitHandler | MessageHandler,
) {
    // ...
}
```

前兩個只有簽名沒有主體的宣告，稱為函式頭，用來列舉出實際允許呼叫的參數組合；最後一個帶有函式主體的，才是真正的實作。有了這兩個函式頭之後，呼叫 `handleMainEvent` 時，TypeScript 會依序比對每一個函式頭，找出第一個參數符合的那一個，再用它對應的第二個參數型別去檢查後續的引數。傳入表單元素時，第二個參數就會被要求是 `FormSubmitHandler`，型別自動對應正確；傳入 iframe 元素時，第二個參數則會被要求是 `MessageHandler`。

## 底下那個帶主體的函式簽名，沒辦法被直接呼叫

一旦寫了函式多載，真正帶函式主體的那個實作簽名，就不再能直接被外部呼叫，只能透過前面列出的那些函式頭來呼叫。如果把其中一個函式頭刪掉（例如刪掉 iframe 那一版），呼叫端就再也無法傳入 iframe 元素，即使底層實作的參數型別（聯集型別）技術上依然允許這麼做。這代表函式多載實際上是把呼叫的入口限縮成只有那幾個明確列出的組合，讓使用端沒辦法繞過去，直接摸到那個範圍更寬鬆、原本允許任意混搭的底層實作。

這個技巧的價值在於，它提供了一種相對容易上手的方式，去表達「參數之間有對應關係」這件事，不需要動用更進階的泛型語法（用其他被參數化的型別去描述型別）。除非真的有必要，否則不建議一開始就往泛型的方向想，函式多載往往已經足夠應付這類需求。

## 多載的函式頭，必須跟底層實作的型別相容

函式多載有一個限制：每一個函式頭列出的參數型別，都必須能被底層那個帶主體的實作簽名所涵蓋。如果函式頭列出的型別超出了實作簽名能接受的範圍，TypeScript 會直接報錯，要求把實作簽名的參數型別放寬，才能讓所有函式頭都相容。

這個限制也帶出一個實務上常見的做法：如果底層實作要涵蓋的型別範圍比較雜，有時候會乾脆在函式實作內部用型別斷言（`as`）直接認定參數的實際型別，省去把每種組合都攤開處理的麻煩。這麼做相對安全，是因為外部完全無法直接呼叫這個實作簽名；能走進實作內部的呼叫，保證都是從前面那幾個函式頭的路徑進來的，跟單純把參數型別寫成 `any`、讓任何呼叫都能長驅直入不是同一個等級的風險。

有學員問，為什麼一定要手動把實作簽名的參數寫成聯集型別，而不能讓 TypeScript 直接從上面的函式頭自動推斷出來？原因在於 TypeScript 處理的順序，是先確立底下這個實作本身的型別，再回頭檢查每一個函式頭是否跟這個型別相容，函式頭並不會反過來影響或決定實作本身的型別。這樣的設計也是有意義的：如果每次新增一個函式頭，實作內部使用到的參數型別就自動跟著膨脹，會讓函式實作變得難以維護，因為函式內部沒辦法確定自己面對的到底是哪些型別。把實作簽名的型別鎖定清楚，再用函式頭去限制外部呼叫時能用的組合，才能兼顧函式內部型別的穩定性，以及對外呼叫介面的精確度。

## 複習

### construct signature 跟 call signature 有什麼關係？

construct signature 的語法跟 call signature 幾乎一模一樣，差別只在於 construct signature 前面多了一個 `new` 關鍵字，用來描述一個型別可以透過 `new` 建立出實例，而不是單純被呼叫。

### 函式多載主要解決的問題是什麼？

解決「多個參數之間彼此綁定、必須成組出現」的情境，例如第一個參數決定了第二個參數該是什麼型別。單純用聯集型別描述每個參數，沒辦法表達這種參數之間的對應關係，還可能允許不合理的參數組合。

### 函式多載裡的「函式頭」跟「實作」是什麼關係？

函式頭是只有簽名、沒有函式主體的宣告，用來列舉外部實際能呼叫的參數組合；實作則是真正帶有函式主體的那個簽名。外部只能透過函式頭來呼叫這個函式，沒辦法直接呼叫底層那個範圍更寬鬆的實作簽名，函式頭列出的每一種型別組合，也都必須能被實作簽名所涵蓋。

### TypeScript 如何決定函式多載的實作型別是否合法？

TypeScript 會先確立底層實作簽名本身的型別，再檢查每一個函式頭是否跟這個實作型別相容；函式頭本身不會反過來決定或影響實作的型別，這是為了避免實作內部使用到的參數型別，隨著函式頭數量增加而不受控地擴大。

## 小測驗

<details>
<summary>TypeScript 中的 construct signature 是什麼？</summary>
用來定義如何以 new 關鍵字建立實例的型別
</details>

<details>
<summary>TypeScript 函式多載中，函式頭有什麼關鍵限制？</summary>
必須跟底層的實作簽名相容
</details>

<details>
<summary>使用函式多載時，外部可以直接呼叫哪一個函式簽名？</summary>
只能透過多載列出的函式頭呼叫，不能直接呼叫實作簽名
</details>

<details>
<summary>要在 TypeScript 中定義一個可以用 new 運算子建立實例的型別，需要用到什麼關鍵字？</summary>
new
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
