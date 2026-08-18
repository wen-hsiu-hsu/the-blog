---
title: 'TypeScript callable 型別：用 call signature 替函式與回呼定義型別'
description: '示範用 interface 的 call signature（冒號）與 type alias 的箭頭語法（=>）替函式定義型別，並討論何時該選 interface、何時該選 type alias：函式庫傾向用可開放擴充的 interface，需要鎖死型別時則用 type alias。'
date: 2026-09-06
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 18
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - CallSignature
    - Interface
    - TypeAlias
    - OpenInterfaces
---

# TypeScript callable 型別：用 call signature 替函式與回呼定義型別

> [[17-type-registry-pattern|前面]] 用 `keyof` 搭配 `declare module` 解決了資料層的擴充問題。這一節換個方向，回頭看看 TypeScript 怎麼描述「一個函式本身」的型別。

## 動機：如何替「一個函式」本身定義型別

前面已經多次替函式的參數跟回傳值加上型別標註，但這一節要問的問題不太一樣：如果想定義的不是某個具體函式，而是「一個變數應該用來裝一個函式」這件事本身，型別要怎麼寫？這種能被呼叫的型別，這裡稱為 callable。

## 用 interface 的 call signature 描述函式型別

用 interface 描述 callable 的寫法，長得跟一般 interface 不太一樣：

```ts
interface TwoNumberCalculation {
    (x: number, y: number): number;
}
```

這裡用的是小括號，不是先前索引簽名用的中括號。可以把它想成把一個普通的函式宣告拿掉 `function` 關鍵字跟函式名稱，剩下的部分就是這個 call signature：接受兩個 `number` 參數 `x`、`y`，回傳一個 `number`。

## 用 type alias 描述同一件事

同樣的型別也能用 type alias 寫出來：

```ts
type TwoNumberCalc = (x: number, y: number) => number;
```

`TwoNumberCalculation` 跟 `TwoNumberCalc` 這兩個型別彼此等價，代表的是同一件事，差別純粹在語法。這裡有一個需要靠肌肉記憶熟悉的關鍵差異：type alias 要用箭頭（`=>`）表示回傳型別，interface 則是用冒號（`:`）。如果不小心把兩種語法混用，TypeScript 會直接報錯提醒，不用太擔心一時混淆。

## 把這個型別套用在實際的函式上

定義好之後，可以拿它當作型別標註，套用在符合這個形狀的函式上：

```ts
const add: TwoNumberCalculation = (a, b) => a + b;
const subtract: TwoNumberCalc = (x, y) => x - y;
```

因為變數已經標註了 `TwoNumberCalculation`（或 `TwoNumberCalc`），等號右邊的箭頭函式就不需要再手動幫 `a`、`b` 或 `x`、`y` 標註型別，TypeScript 會自動從這個型別標註推斷出每個參數該有的型別。這種手法同樣適用在需要把一個函式當作 callback 傳進另一個函式的情境：只要在參數位置標註這個函式型別，就能約束傳進來的 callback 必須符合對應的參數與回傳值要求，例如要求 callback 必須回傳一個 `number`，因為這是 `TwoNumberCalculation` 這個型別的一部分。

## 為什麼這種 interface 沒辦法被 class 實作

有學員觀察到一個有趣的細節：像 `TwoNumberCalculation` 這種只描述 call signature、完全沒有具名成員的 interface，語法上沒辦法被任何 class 用 `implements` 實作，因為根本沒有一個對應的方法名稱可以拿來實作。這個觀察正確，class 的實例本身其實也是可以被呼叫的，但那已經不是這種 call signature，而是另一個不同的概念，也就是後面要談的 constructable，需要透過 `new` 關鍵字來呼叫，跟這裡討論的一般函式呼叫方式有所不同。

## 選 interface 還是 type alias：關鍵在於是否允許被開放擴充

有學員問，替函式型別命名時，該選 interface 還是 type alias？兩者在功能上其實沒有明顯差異，真正的取捨點在於 interface 具備開放性：一個 interface 可以在不同地方多次宣告，宣告的內容會自動合併起來（[[17-type-registry-pattern|前一篇]]的型別註冊表模式正是靠這個特性，讓不同模組各自把型別註冊進同一個 interface），因此可以描述出「一個函式，身上還掛著一些額外屬性」這種形狀，並讓使用端有機會後續補充內容；用 type alias 硬要做同樣的事，寫法會變得笨拙，而且一旦繞了那個彎路，原本 TypeScript 提供的型別推斷能力也會跟著消失。

這個差異延伸出一個實務上的判斷原則：如果是在開發一個要發布出去的函式庫，作者通常會傾向使用 interface，因為它保留了讓下游使用者擴充型別的彈性；但如果希望某個型別的定義維持固定、不希望被任何人在別處偷偷加東西進去，type alias 會是更保險的選擇，因為它不具備這種可以到處被開放擴充的特性。這也是為什麼常聽到「應用程式裡多半用 type alias，函式庫則傾向用 interface」這個經驗法則，不過這只是大致的傾向，而不是絕對的規則：即使是函式庫，有時也會刻意用 type alias 鎖死某個型別，避免任何人不小心修改到它；應用程式這一側，因為修改型別的風險相對可控，這個選擇通常也就沒那麼重要。

## 複習

### 什麼是 call signature？它怎麼定義一個函式的型別？

call signature 是用來描述一個函式型別的寫法，只列出參數型別跟回傳型別，省略掉 `function` 關鍵字與函式名稱，在 interface 裡用小括號表示，跟索引簽名用的中括號不同。

### 在 TypeScript 中，如何為一個函式型別建立 type alias？

用箭頭語法（`=>`）建立，例如 `type TwoNumberCalc = (x: number, y: number) => number;`，等號右邊用箭頭表示回傳型別，這跟 interface 用冒號表示回傳型別的寫法不同。

### 描述函式型別時，用 interface 跟用 type alias 有什麼差異？

interface 具備開放性，可以在不同地方多次宣告並自動合併，因此更適合用來描述「函式身上還掛著額外屬性」這種形狀，也讓使用端保有擴充的彈性；type alias 則是封閉的，適合用在希望型別定義維持固定、不被隨意擴充的情境。一般來說，函式庫作者傾向用 interface 保留彈性，應用程式則傾向用 type alias。

### 用一個定義好的函式型別去標註變數或參數時，會帶來什麼好處？

一旦變數或參數已經標註了某個函式型別，實際賦值的箭頭函式就不需要再重複幫每個參數手動標註型別，TypeScript 會自動從這個函式型別推斷出對應的參數型別，同時也會依這個型別檢查回傳值是否符合要求。

## 小測驗

<details>
<summary>在 TypeScript 的函式型別中，宣告參數時最重要的是什麼？</summary>
參數的位置與型別
</details>

<details>
<summary>在不同情境下使用 type alias 與 interface，建議的做法是什麼？</summary>
函式庫適合用 interface 保留彈性，需要較嚴格限制的定義則用 type alias
</details>

<details>
<summary>在 interface 中，call signature 用什麼符號來表示參數？</summary>
小括號
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
