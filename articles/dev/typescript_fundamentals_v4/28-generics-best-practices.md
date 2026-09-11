---
title: 'TypeScript 泛型最佳實踐：型別參數要用兩次以上，否則只是方便轉型，makeTuple 示範雙型別參數推斷'
description: '用一個只在回傳型別出現一次型別參數的 returnAs 函式，示範這種寫法其實等同於危險的雙重轉型、讓 TypeScript 說謊，藉此提出核心原則：型別參數至少要在函式簽名裡出現兩次，才能真正描述型別之間的關聯，並用 makeTuple 這個雙泛型範例展示型別推斷如何同時作用在多個型別參數上。'
date: 2026-09-11
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 28
chapter: 'Generics'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - Generics
    - TypeParameters
    - TypeInference
    - TypeCasting
---

# TypeScript 泛型最佳實踐：型別參數要用兩次以上，否則只是方便轉型，makeTuple 示範雙型別參數推斷

> [[27-when-to-use-generics|前面]] 用 `listToDict` 跟 `wrapInArray` 兩個範例，看到型別參數能讓輸入型別跟輸出型別維持精確的對應關係。這一節要點出一個核心原則，幫助判斷一個泛型函式寫得好不好。

## 一個看似合理、實際上有問題的泛型函式

先看一個容易被誤用的寫法：

```ts
function returnAs<T>(arg: any): T {
    return arg; // 這是一個 any，但看起來會「假裝」是 T
}
```

這個函式接受一個 `any` 型別的引數，回傳型別宣告成 `T`。因為函式簽名裡沒有任何線索能讓 TypeScript 推斷出 `T` 該是什麼，呼叫時會被強制要求顯式指定型別參數，而且不管指定成什麼型別都會直接通過：

```ts
const first = returnAs<number>(window); // 危險！
```

這一行程式碼實質上等同於一次危險的雙重轉型：

```ts
const sameAs = window as any as number; // 效果一樣危險
```

`returnAs<number>(window)` 看起來像是在做型別轉換，但骨子裡就是把 `window` 硬轉型成 `number`，這種寫法可以稱作「方便的轉型」（convenient casting），本質上並不是泛型該有的正確用法。

## 核心原則：型別參數至少要用兩次

判斷一個型別參數用得好不好，有一個明確的檢驗標準：型別參數至少要在函式簽名裡出現兩次以上。泛型真正的意義，是用來描述型別之間的關聯，例如「傳入引數的型別」跟「回傳值的型別」之間存在某種對應關係，即使兩者不是完全相同的型別，回傳值也是根據傳入的型別推導出來的。

回頭看 [[27-when-to-use-generics|前面]] 的 `listToDict` 函式，型別參數 `T` 出現的次數遠不只一次：傳入的陣列元素型別是 `T`，用來取得 ID 的回呼函式參數型別也是 `T`，最終回傳字典裡儲存的值型別同樣是 `T`。這幾個地方全部串連在一起，正是型別參數存在的目的：把這些原本獨立的部分之間的關係表達出來，同時保留使用上的彈性。

反過來看 `returnAs` 這個函式，型別參數 `T` 只在回傳型別出現過一次，函式簽名裡完全沒有定義任何跟其他部分的關聯。也正因為如此，TypeScript 的型別推斷在這裡完全派不上用場：型別推斷之所以能運作，靠的正是型別參數在多個地方重複出現、彼此呼應，一旦型別參數只出現一次，就沒有任何依據可以推斷，只能任由呼叫端指定成任何想要的型別，而 TypeScript 會照單全收，不會提出質疑。

## 修正後的對照：恆等函式

如果把 `returnAs` 稍微修改，讓型別參數在參數列表跟回傳型別各出現一次：

```ts
function identity<T>(arg: T): T {
    return arg;
}
```

這個函式本質上就是數學上的恆等函式 `f(x) = x`，這時候型別推斷就能正常運作：傳入什麼型別，就直接推斷、回傳同樣的型別，因為型別參數在輸入端跟輸出端之間確實建立了明確的關聯，不再需要呼叫端手動指定、也不會發生把不相關型別硬套進去的問題。

## 用兩個型別參數描述更複雜的關聯

型別參數不限於只能用一個，一個函式可以同時定義多個型別參數，各自描述不同的關聯：

```ts
function makeTuple<T, U>(a: T, b: U): [T, U] {
    return [a, b];
}

const numPair = makeTuple(1, 2); // T、U 都被推斷為 number，回傳型別 [number, number]
const mixedPair = makeTuple('hello', window); // T 被推斷為 string，U 被推斷為 Window & typeof globalThis
```

`makeTuple` 定義了兩個型別參數 `T`、`U`，各自都在參數列表跟回傳型別裡出現了兩次，型別推斷因此能同時作用在這兩個型別參數上：傳入兩個數字，`T`、`U` 都會被推斷成 `number`；傳入一個字串跟 `window`，`T` 會被推斷成 `string`，`U` 則會被推斷成 `Window & typeof globalThis`。這個範例延續了同一個判斷原則：只要型別參數確實在函式簽名裡建立了不只一次的關聯，型別推斷就能順暢運作，也才稱得上是恰當運用了泛型。

## 複習

### 判斷一個泛型函式裡的型別參數用得好不好，有什麼明確的判斷原則？

型別參數至少要在函式簽名裡出現兩次以上，用來描述型別之間的關聯，例如傳入引數的型別跟回傳值型別之間的對應關係。如果型別參數只出現一次，通常代表這其實只是在做方便的轉型，而不是真正運用泛型描述型別關聯。

### `returnAs<T>(arg: any): T` 這種寫法問題出在哪裡？

型別參數 `T` 只在回傳型別出現過一次，函式簽名裡沒有任何依據能讓 TypeScript 推斷或驗證 `T` 該是什麼，呼叫端可以指定任何型別，效果等同於把傳入值硬轉型成該型別，本質上是一種危險的雙重轉型，而不是恰當的泛型用法。

### 為什麼型別參數只使用一次時，型別推斷無法發揮作用？

型別推斷的運作原理，是依賴型別參數在函式簽名裡多處出現、彼此呼應，從已知的部分反推出型別參數該是什麼。如果型別參數只出現一次，就沒有任何已知的關聯可以用來推導，只能任由呼叫端手動指定型別。

## 小測驗

<details>
<summary>給定函式 `makeTuple<T, U>(a: T, b: U): [T, U]`，用到了幾個型別參數？</summary>
兩個型別參數（T 和 U）
</details>

<details>
<summary>泛型函式中的型別推斷是如何運作的？</summary>
根據傳入函式的引數自動判斷型別參數，不需要顯式標註型別
</details>

<details>
<summary>為什麼型別參數應該在函式簽名裡出現不只一次？</summary>
用來描述輸入型別跟輸出型別之間的關聯
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
