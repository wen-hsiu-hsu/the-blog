---
title: 'TypeScript 函式回傳型別最佳實踐：明確標註讓型別錯誤集中在宣告處，而非散落到所有呼叫端'
description: '用一個 getData 函式加上條件式回傳的例子，示範沒有明確回傳型別時，漏掉的回傳路徑會讓型別錯誤散落到上百個呼叫端，補上 Promise<{ properties: string[] }> 這種明確標註後，錯誤會直接集中顯示在函式宣告處，變成一個真正可以動手修的問題，而不是滿地開花的連鎖反應。'
date: 2026-09-08
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 22
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeAnnotations
    - ExplicitReturnTypes
---

# TypeScript 函式回傳型別最佳實踐：明確標註讓型別錯誤集中在宣告處，而非散落到所有呼叫端

> [[05-functions-and-return-types|系列第一次談到函式回傳型別]] 時，用一個會回傳 `number | undefined` 的例子，說明過顯式標註能把錯誤攔在函式定義處、而不是分散到所有呼叫端。這一節用一個更貼近真實場景的非同步函式範例，把同樣的原則再示範一次，作為這門課函式部分的收尾。

## 一個看似穩健的非同步函式

從一個負責發送請求、取得資料的函式開始：

```ts
export async function getData(url: string) {
    const resp = await fetch(url);
    const data = (await resp.json()) as {
        properties: string[];
    };
    return data;
}
```

這個函式沒有寫回傳型別標註，但 TypeScript 能從函式邏輯自動推斷出來，一切看起來運作得很好。

## 加上一個條件判斷之後，錯誤跑到了意想不到的地方

假設之後想替這個函式加一個條件判斷，只有在 HTTP 回應狀態正常（`resp.ok`）時才回傳解析出來的資料：

```ts
export async function getData(url: string) {
    const resp = await fetch(url);
    if (resp.ok) {
        const data = (await resp.json()) as {
            properties: string[];
        };
        return data;
    }
}
```

這個改動看起來很小，但函式現在有一條路徑完全沒有 `return` 陳述式，隱含地回傳了 `undefined`。真正的問題在於，這個型別上的變化不會在 `getData` 這個函式定義的地方冒出錯誤，而是會出現在呼叫 `getData` 的地方，提示拿到的結果「可能是 `undefined`」。如果 `getData` 這種函式在一個專案裡被使用了上百次，這個小小的邏輯調整，會讓錯誤同時在上百個呼叫端一次爆開，開發者得逐一跑去每個呼叫的地方，才能搞清楚問題到底出在哪裡、該怎麼修。

## 補上明確的回傳型別，錯誤會直接指向該修的地方

如果一開始就替 `getData` 加上明確的回傳型別：

```ts
export async function getData(url: string): Promise<{ properties: string[] }> {
    const resp = await fetch(url);
    if (resp.ok) {
        const data = (await resp.json()) as {
            properties: string[];
        };
        return data;
    }
}
```

同樣加上那個 `if (resp.ok)` 的條件判斷之後，錯誤這次不會出現在任何呼叫端，而是直接出現在 `getData` 這個函式的宣告處，因為函式已經承諾要回傳 `Promise<{ properties: string[] }>`，但目前的實作有一條路徑沒有滿足這個承諾。原本可能散落在上百個呼叫端的錯誤，現在收斂成一個錯誤，而且這個錯誤精準地指向真正該修的地方。如果這個函式本來就有意讓某些情況回傳 `undefined`，那應該做的是把這個意圖也寫進回傳型別裡（例如改成 `Promise<{ properties: string[] } | undefined>`），再回頭把所有呼叫端一併處理好，而不是讓這個意外的 `undefined` 靠隱式推斷悄悄流出去。

## 明確標註回傳型別值得投資的原因

明確寫出函式回傳型別，等同於替這個函式立下一份對外的承諾，一旦函式實作沒有兌現這份承諾，TypeScript 能在宣告的當下就抓出問題，而不是任由錯誤沿著呼叫鏈到處擴散。這種寫法確實比讓 TypeScript 自動推斷多花一點打字的力氣，也可能讓程式碼看起來稍微囉唆一點，但只要曾經為了追一個型別錯誤的源頭，滿專案到處搜尋過，就會體會到這點投資其實很快就能回本。

## 複習

### 沒有明確回傳型別的函式，加上一個條件式回傳邏輯後，會出現什麼問題？

如果新加的邏輯讓某條路徑不再回傳明確的值，型別錯誤不會出現在函式定義的地方，而是分散出現在所有呼叫這個函式的地方，如果這個函式被廣泛使用，錯誤可能同時在大量呼叫端一次爆開。

### 替函式加上明確的回傳型別標註，能帶來什麼好處？

能把型別錯誤集中顯示在函式宣告的地方，而不是分散到程式碼裡所有呼叫端，讓開發者能直接在問題發生的源頭修正，而不用逐一追查每一個受影響的呼叫點。

### 如果函式確實有意讓某些情況回傳 undefined，該怎麼處理比較好？

應該把這個意圖明確寫進回傳型別裡（例如用聯集型別包含 `undefined`），讓型別系統忠實反映函式實際的行為，再回頭處理所有呼叫端該如何應對這個 `undefined` 的可能性，而不是任由這個結果透過隱式推斷悄悄流出去。

## 小測驗

<details>
<summary>在 TypeScript 函式中使用明確回傳型別，有什麼好處？</summary>
能把錯誤集中顯示在函式宣告的地方，而不是分散到所有呼叫端
</details>

<details>
<summary>函式沒有明確回傳型別、又新增了一個可能不回傳值的條件式邏輯時，會出現什麼問題？</summary>
錯誤可能出現在所有呼叫這個函式的地方，而不是函式宣告本身
</details>

<details>
<summary>替一個原本所有路徑都不完整回傳值的函式加上明確回傳型別後，錯誤會出現在哪裡？</summary>
函式宣告的地方
</details>

<details>
<summary>要標註一個函式回傳「會解析成特定型別的 Promise」，該用什麼語法？</summary>
`Promise<Type>`
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
