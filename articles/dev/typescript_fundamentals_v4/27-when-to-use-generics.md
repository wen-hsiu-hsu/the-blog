---
title: 'TypeScript 泛型入門：從 listToDict 到 wrapInArray 看型別參數如何取代 any'
description: '用一個把電話清單轉成字典的 listToDict 函式，示範直接用 any 雖然帶來彈性、卻犧牲了型別資訊，再改用泛型型別參數 <T> 讓函式依傳入的陣列型別自動推斷、同時保留完整型別檢查，並用 wrapInArray 這個更簡單的例子說明型別參數如何被 TypeScript 自動推斷出來，不必每次手動指定。'
date: 2026-09-11
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 27
chapter: 'Generics'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - Generics
    - TypeParameters
    - TypeInference
---

# TypeScript 泛型入門：從 listToDict 到 wrapInArray 看型別參數如何取代 any

這門課最後一個主題是泛型（generics），也是從基礎邁向中階 TypeScript 的一個關鍵概念。泛型讓型別本身可以被參數化，藉此寫出能重複套用在不同型別上、卻依然保有精確型別資訊的可重用型別。

## 動機：把陣列轉成字典，卻不想寫死型別

回到 [[07-index-signatures|用索引簽名描述電話簿]] 的通訊錄例子。有時候用鍵值字典整理資料比較方便（就像索引簽名那節用字典結構描述電話簿），有時候用陣列或清單反而比較方便。假設手上有一份電話清單，想把它轉換成一個以顧客 ID 為鍵的字典：

```ts
interface PhoneInfo {
    customerId: string;
    areaCode: string;
    num: string;
}

const phoneList: PhoneInfo[] = [
    { customerId: '0001', areaCode: '321', num: '123-4566' },
    { customerId: '0002', areaCode: '174', num: '142-3626' },
];
```

目標是寫一個函式，把上面這種陣列轉換成長這樣的字典：

```ts
const phoneDict: { [k: string]: PhoneInfo } = {
    '0001': { customerId: '0001', areaCode: '321', num: '123-4566' },
    '0002': { customerId: '0002', areaCode: '174', num: '142-3626' },
};
```

## 針對 PhoneInfo 寫死的第一版

第一版直接針對 `PhoneInfo` 這個型別實作：

```ts
function listToDict(
    list: PhoneInfo[],
    idGen: (arg: PhoneInfo) => string,
): { [k: string]: PhoneInfo } {
    const dict: { [k: string]: PhoneInfo } = {};
    list.forEach((element) => {
        const dictKey = idGen(element);
        dict[dictKey] = element;
    });
    return dict;
}
```

除了清單本身，這個函式還需要第三個參數：一個用來從每個元素取出字典鍵的回呼函式。要用哪個欄位當鍵，是呼叫端才知道的資訊，所以交給呼叫端提供這個函式，`listToDict` 內部只需要負責建立一個空字典，逐一走過清單裡的每個元素，呼叫這個回呼取得鍵，再把元素存進字典對應的鍵底下。這個版本能正常運作，把 `phoneList` 傳進去，確實能得到想要的 `phoneDict`。

## 用 any 換取彈性，卻犧牲了型別資訊

這個函式的問題是完全綁死在 `PhoneInfo` 這個型別上，如果想拿同一個函式處理日期陣列、或是任何其他有 ID 的資料，就無法重複使用。要讓它更通用，第一個直覺的做法可能是把型別都換成 `any`：

```ts
function listToDict(list: any[], idGen: (arg: any) => string): { [k: string]: any } {
    // ...
}
```

這樣確實讓函式能接受任何型別的陣列，但代價是字典裡每一個值的型別也全部變成 `any`，原本精確的型別資訊整個流失掉了。這裡真正需要的，是一種能表達「傳入的元素型別」跟「回傳字典裡值的型別」之間的對應關係的機制，讓兩者能夠一起變動、但彼此保持一致，這正是泛型存在的核心目的。

## 定義型別參數：函式的「型別版」參數列表

型別參數可以想成是函式的型別版參數列表。一般函式會依傳入的參數值回傳不同的結果，泛型函式則是依傳入的型別參數改變它的型別。把 `listToDict` 改寫成泛型版本：

```ts
function listToDict<T>(list: T[], idGen: (arg: T) => string): { [k: string]: T } {
    const dict: { [k: string]: T } = {};
    list.forEach((element) => {
        const dictKey = idGen(element);
        dict[dictKey] = element;
    });
    return dict;
}
```

函式名稱後面的 `<T>`，代表這個函式的型別由型別參數 `T` 參數化，`T` 具體是什麼，會依每次呼叫的情境而變動。`list: T[]` 代表這個函式接受一個元素型別為 `T` 的陣列，TypeScript 會依實際傳入的陣列型別，自動推斷出 `T` 應該是什麼；如果傳進去的是 `string[]`，`T` 就會被推斷成 `string`。

型別參數的命名習慣上用大寫字母，最常見的是 `T`，這個慣例可以追溯到 C++ 裡樣板類別（template class）用 `T` 代表 template 的傳統，並不是強制規定，可以取任何名字，重點只是約定用大寫，方便跟一般函式參數（習慣用小寫開頭）區分開來，也能一次定義多個型別參數，寫法就像函式的引數列表一樣。

## 呼叫泛型函式：型別參數通常會被自動推斷

呼叫這個泛型版本的 `listToDict`：

```ts
const dict = listToDict(phoneList, (p) => p.customerId);
```

不需要手動在角括號裡指定 `T` 是什麼，TypeScript 會依傳入的 `phoneList`（型別是 `PhoneInfo[]`）自動推斷出 `T` 就是 `PhoneInfo`，讓回呼函式裡的參數 `p` 自動獲得正確的 `PhoneInfo` 型別，回傳的字典型別也精準對應成 `{ [k: string]: PhoneInfo }`。這正是使用泛型很理想的情況：大多數時候完全不需要顯式指定型別參數，只有在少數 TypeScript 無法從引數推斷出型別的情況下才需要手動標明，很多時候甚至沒有意識到自己正在受益於型別參數，卻依然拿到完整、精確的型別檢查。

## 一個更簡單的例子：wrapInArray

用一個更精簡的函式，把泛型的運作方式看得更清楚：

```ts
function wrapInArray<T>(arg: T): [T] {
    return [arg];
}

wrapInArray(3); // T 被推斷為 number，回傳型別是 [number]
wrapInArray(new Date()); // T 被推斷為 Date，回傳型別是 [Date]
wrapInArray(new RegExp('/s/')); // T 被推斷為 RegExp，回傳型別是 [RegExp]
```

`wrapInArray` 只是單純把傳入的引數包進一個長度為 1 的 tuple，沒有其他邏輯。每次呼叫時，TypeScript 都會在背後自動把 `T` 設成當下傳入值的型別，讓函式回傳的 tuple 型別跟著精準對應。這帶來的彈性跟直接用 `any` 一樣寬廣，能接受任何型別的引數，但完全不會犧牲型別的精確度：`RegExp` 傳進去，回傳的 tuple 裡就能安心存取 `exec` 這種只有 `RegExp` 才有的方法，型別資訊完整地從輸入一路流動到輸出。

## 複習

### 泛型主要解決的問題是什麼？

讓型別可以被參數化，藉此寫出可重複套用在不同型別上、卻依然保有精確型別資訊的可重用函式或型別，取代用 `any` 換取彈性、卻犧牲型別檢查的做法。

### 泛型函式的型別參數要怎麼定義？呼叫時通常需要手動指定嗎？

在函式名稱後面用角括號定義，習慣用大寫字母（最常見是 `T`）命名，例如 `function wrapInArray<T>(arg: T): [T]`。呼叫時通常不需要手動指定，TypeScript 會依傳入引數的型別自動推斷出型別參數，只有在少數無法自動推斷的情況下才需要顯式標明。

### 泛型相較於直接使用 any，最大的優勢是什麼？

`any` 雖然能接受任何型別的輸入，但會讓型別資訊在函式內部完全流失，型別檢查形同虛設；泛型則能在保有這種彈性的同時，讓輸入型別跟輸出型別之間維持精確的對應關係，型別檢查跟自動完成依然完整有效。

## 小測驗

<details>
<summary>TypeScript 中型別參數的命名習慣是什麼？</summary>
通常用大寫字母，常見是以 T 開頭
</details>

<details>
<summary>使用泛型函式時，型別參數通常是怎麼決定的？</summary>
TypeScript 會依傳入函式的引數自動推斷出來
</details>

<details>
<summary>用 any 取代泛型來寫彈性函式，最大的缺點是什麼？</summary>
會完全流失型別資訊與型別安全
</details>

<details>
<summary>TypeScript 中泛型的主要用途是什麼？</summary>
把型別參數化，藉此建立可以用型別參數表達的可重用型別
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
