---
title: 'TypeScript 陣列型別與 tuple：固定長度結構、readonly 保護與型別安全的落差'
description: '說明陣列型別用 T[] 表示的慣例、為何避免用 Array<T> 語法，示範 tuple 如何用固定位置描述像 [year, make, model] 這種有語意順序的結構，並指出 tuple 本質仍是 JavaScript 陣列、push/pop 不受限制的安全落差，readonly 如何補上這層保護。'
date: 2026-09-01
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 8
chapter: 'Objects, Arrays and Tuples'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - ArrayTypes
    - Tuples
    - ReadonlyModifier
    - LiteralTypes
---

# TypeScript 陣列型別與 tuple：固定長度結構、readonly 保護與型別安全的落差

## 陣列型別：在元素型別後面加上方括號

TypeScript 描述陣列型別的慣用寫法，是在元素型別後面直接接上一對方括號：

```ts
const fileExtensions = ['js', 'ts'];
// 型別：string[]
```

TypeScript 也支援另一種寫法 `Array<string>`，但課程建議避免使用這種寫法，因為如果是 React 開發者，這種帶尖括號的語法容易跟 JSX 語法衝突，造成奇怪的解析問題。所以 `T[]` 這種寫法才是比較推薦的用法。

這個語法在描述更複雜的物件陣列時一樣適用，只要把物件型別整個包起來，後面照樣接上方括號：

```ts
const cars: {
    make: string;
    model: string;
    year: number;
}[] = [{ make: 'Toyota', model: 'Corolla', year: 2002 }];
```

陣列本身代表的是「任意長度」的集合：可以不斷把元素塞進去，也可以清空到一個不剩，長度本身沒有任何限制或特殊意義。

## Tuple：固定長度、每個位置各有意義的陣列

跟陣列相對的是 tuple，也就是固定長度的陣列。有些程式語言有專門的 tuple 型別，語法跟一般陣列完全不同，但因為 TypeScript 最終仍要編譯成能在 JavaScript 執行的程式碼，所以 tuple 本質上是「借用」JavaScript 既有的陣列型別實作出來的。

用 tuple 描述一台車，可以把年份、廠牌、型號依序放進陣列：

```ts
let myCar = [2002, 'Toyota', 'Corolla'];
const [year, make, model] = myCar;
```

這裡有一個隱含的慣例：第一個元素是年份，第二個是廠牌，第三個是型號，就像一份 CSV 檔案裡的一列資料，只要知道欄位名稱，就能讀懂這一列代表什麼。但如果直接解構 `myCar`，會發現 `year`、`make`、`model` 的型別全都被推斷成 `string | number`，因為 TypeScript 只能在不妨礙你操作的前提下，做出最安全的推斷。既然陣列常見的用法是任意增減元素、特定位置沒有特殊意義，TypeScript 自然不會主動假設這裡的三個位置分別代表年份、廠牌、型號。

## 用型別標註明確宣告 tuple 的形狀

如果不特別處理，這個陣列其實可以任意塞入不同數量、不同型別的元素，TypeScript 完全不會反對，因為它看到的只是「一個內容全是 `string | number` 的陣列」而已。要讓 TypeScript 真正把它當成 tuple 看待，除了用 [[04-any-and-type-casting|前面提過的型別轉換]] 硬轉之外，更常見的做法是用明確的型別標註把每個位置該有的型別寫清楚：

```ts
let myCar: [number, string, string] = [2002, 'Toyota', 'Corolla'];

myCar = ['Honda', 2017, 'Accord']; // 錯誤：第一個位置的型別不對
myCar = [2017, 'Honda', 'Accord', 'Sedan']; // 錯誤：元素數量超過宣告的長度
```

有了這個標註，TypeScript 會擋下把字串放進原本該是年份的第一個位置，也會擋下多塞一個元素、超出宣告長度的情況。

這種帶有明確位置語意的固定長度結構，特別適合拿來當函式的回傳值，例如回傳一組「成功或失敗」的結果：第一個位置放布林值或錯誤字串表示成功與否，第二個位置放對應的資料或錯誤內容，這種長度為 2 的 tuple 是很常見的用法。

## tuple 的 length 也是字面值型別

比較一般陣列跟 tuple 在 `length` 屬性上的差異也很有意思。一般陣列字面量的 `length` 型別是 `number`，因為陣列理論上隨時可能被增減元素。但一個型別為 `[number, number]` 的 tuple，TypeScript 會把它的 `length` 型別推斷為字面值型別 `2`，也就是只包含數字 `2` 這一個值的集合，因為 TypeScript 知道這個 tuple 就是固定兩個元素。

## tuple 骨子裡仍是陣列：push/pop 不受限制

雖然 tuple 在型別標註的當下能限制元素的型別跟數量，但因為底層實作終究是一般的 JavaScript 陣列，型別系統並沒有擋下 `push`、`pop` 這些會改變陣列長度的方法。也就是說即使宣告了一個長度為 2 的 tuple，還是可以呼叫 `push` 硬塞第三個、第四個元素進去，或是用 `pop` 把裡面的元素一個一個清空：

```ts
let numPair: [number, number] = [4, 5];
numPair.push(6); // 沒有型別錯誤，numPair 變成 [4, 5, 6]
numPair.pop();
numPair.pop();
numPair.pop(); // 沒有型別錯誤，numPair 變成 []

numPair.length; // 型別仍顯示字面值 2，但陣列實際上已經是空的
```

`length` 屬性顯示的型別始終停留在字面值 `2`，跟陣列實際的內容完全對不上。這代表除了一開始賦值那一刻的型別檢查之外，tuple 本身在執行期並沒有真正的長度保護。

## 用 readonly 補上這層保護

要真正杜絕這種「賦值後被任意增減」的問題，可以在 tuple 型別前面加上 `readonly` 修飾詞：

```ts
const roNumPair: readonly [number, number] = [4, 5];
roNumPair.push(6); // 錯誤：readonly 陣列上不存在 push 方法
roNumPair.pop(); // 錯誤：readonly 陣列上不存在 pop 方法
```

把滑鼠移到這個變數上，會看到型別變成 `readonly [number, number]`，`push`、`pop` 這些會修改陣列內容的方法，在型別系統裡直接不存在，一旦嘗試呼叫，TypeScript 就會直接擋下來。這讓開發者可以真正信賴這個 tuple 建立之後的形狀，後續程式碼不會意外改動它。

這個保護是有代價的：如果需要保留固定長度、但又想更新其中某個元素的值，`readonly` 的 tuple 沒辦法直接做到這件事。常見的做法是建立一個全新的 tuple，把不需要變動的部分透過解構跟展開運算子（spread）從舊的 tuple 複製過來，只替換掉需要更新的那個元素，而不是原地修改既有的 tuple。

## 複習

### TypeScript 描述陣列型別的建議寫法是什麼，為什麼？

在元素型別後面加上方括號，例如 `string[]`。另一種寫法 `Array<string>` 雖然也能用，但尖括號容易跟 React 的 JSX 語法衝突，所以官方建議優先採用 `T[]` 這種寫法。

### 什麼是 tuple？

Tuple 是固定長度的陣列，每個位置都可以有各自不同的型別，用方括號明確列出每個位置的型別（例如 `[number, string, string]`）來定義，跟長度可以任意增減、位置沒有特殊意義的一般陣列不同。

### tuple 骨子裡跟一般陣列有什麼關係？這帶來什麼安全性上的落差？

Tuple 本質上仍是一個 JavaScript 陣列，只是型別系統額外限制了長度跟每個位置的型別。這代表 `push`、`pop` 這類會改變陣列內容的方法預設仍然可以呼叫，型別系統不會阻止，`length` 顯示的字面值型別因此可能跟實際內容的長度對不上。

### readonly 修飾詞替 tuple 帶來什麼保護，又有什麼取捨？

加上 `readonly` 後，tuple 上會移除 `push`、`pop` 這類會修改內容的方法，讓這個結構真正維持建立時的形狀，後續程式碼無法更動它。取捨是如果之後需要更新其中某個元素，沒辦法原地修改，得建立一個新的 tuple，把要保留的部分透過解構與展開運算子複製過去。

## 小測驗

<details>
<summary>什麼是 tuple？</summary>
固定元素數量、且每個元素都有各自特定型別的陣列
</details>

<details>
<summary>對一個沒有加上 readonly 的 tuple 呼叫 push 或 pop，會發生什麼事？</summary>
TypeScript 仍然允許呼叫 push 和 pop，即使 tuple 的型別宣告了固定長度
</details>

<details>
<summary>為什麼 React 開發者應該避免使用尖括號語法（Array&lt;string&gt;）描述陣列型別？</summary>
尖括號語法容易跟 JSX 語法衝突
</details>

<details>
<summary>當 TypeScript 推斷一個同時包含字串與數字的一般陣列時，會賦予其中元素什麼型別？</summary>
聯集型別 string | number
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
