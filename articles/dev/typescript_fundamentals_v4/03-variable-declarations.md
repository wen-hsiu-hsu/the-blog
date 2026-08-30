---
title: 'TypeScript 變數宣告與型別推斷：let/const 差異、字面值型別與 implicit any'
description: '用 let、const 宣告變數會如何影響 TypeScript 推斷出一般型別或字面值型別，說明變數型別一旦建立就固定不變，並解析型別轉換（casting）將型別轉為更寬泛或更精確型別的用途與風險，以及 as const 語法、變數未初始化時為何會出現 implicit any，最後示範用型別標註修正這個問題。'
date: 2026-08-30
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 3
chapter: 'Variables and Values'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - TypeInference
    - LiteralTypes
    - ImplicitAny
    - TypeAnnotations
    - TypeCasting
    - AsConst
---

# TypeScript 變數宣告與型別推斷：let/const 差異、字面值型別與 implicit any

## let 宣告：TypeScript 依初始值推斷一般型別

用 `let` 宣告一個變數並給予初始值時，TypeScript 會依這個初始值推斷出型別：

```ts
let temperature = 6;
```

雖然沒有寫出型別標註，把滑鼠移到 `temperature` 上會看到 TypeScript 已經推斷出 `number` 型別，因為初始值 `6` 就是數字。有了這個推斷結果，之後如果嘗試把字串指派給 `temperature`，TypeScript 就會直接報錯，提示字串不能指派給 `number` 型別。

這裡有一個重要的觀念：變數的型別是在建立的當下就決定好的，之後永遠不會改變。就算某一行程式碼會影響變數初始建立時取得的型別，一旦這個變數被建立出來，它的型別就固定了，不可能中途切換成別的型別。

## const 宣告：型別會被推斷得更精確

用 `const` 宣告一個數字變數時，情況不太一樣：

```ts
const humidity = 79;
```

常見的誤解是「const 只是不能改值」，但更精確的說法是：`const` 讓變數不能被重新指派，而數字本身在 JavaScript 裡又是不可變的值型別（immutable value type），沒辦法「原地修改」一個數字，只能建立新的數字。這兩個特性疊加在一起，讓 TypeScript 可以放心把 `humidity` 的型別推斷得比 `number` 更精確，直接推斷成字面值型別 `79`，因為這個變數不可能再變成別的值。

物件跟陣列則不同，即使用 `const` 宣告一個陣列，陣列本身的內容還是可以被修改（例如 `push` 新元素進去），變數只是不能重新指向另一個陣列。這正是因為陣列本身不是不可變值型別，`const` 提供的「不可重新指派」保證，跟裡面內容能不能被修改是兩回事。

## 用集合的角度理解型別

理解型別最有用的心智模型，是把型別想成一個「允許值的集合」，集合裡不會有重複的元素。用這個角度來看：

- `number` 型別代表「所有數字組成的集合」
- 字面值型別 `79` 代表「只包含 79 這一個值的集合」

`let temperature = 79` 之後可以被重新指派成任何數字，因為它的型別是涵蓋範圍較廣的 `number` 集合。但如果試圖把 `humidity`（型別是只包含 79 的集合）指派給另一個一樣被推斷為字面值型別 79 的變數，只有值恰好是 79 才會被接受，78 就會被 TypeScript 擋下來，因為 78 根本不在「只包含 79」這個集合裡。

每次寫下等號賦值，TypeScript 都會做一次型別相容性檢查：等號左邊變數的型別代表的集合，是否能容納右邊這個值的型別。這個檢查邏輯不只用在變數賦值，函式參數、函式回傳值等等場合都適用同樣的規則。用課程網站上的集合寫法來看，`{ 79 }` 是 `{ 所有數字 }` 的子集，所以我們會說字面值型別 `79` 是 `number` 型別的子型別（subtype），子型別的值永遠可以安全地放進涵蓋範圍更廣的型別裡，但反過來就不成立。

## 用 casting 覆寫型別推斷

如果想讓一個用 `let` 宣告的變數也擁有字面值型別，可以用型別轉換（casting）明確告訴 TypeScript「把這個值當成某個型別來看待」：

```ts
let humidity = 79 as 79;
```

`as` 這個語法是在告訴型別檢查系統「相信我，這個值就是這個型別」，等於是暫時繞過 TypeScript 原本會做的合理假設。這是一種相對強硬的做法，會覆蓋掉 TypeScript 原本的安全檢查，如果亂用它去宣稱一個值是它明顯不可能是的型別（例如把數字 10 硬轉型成字面值型別 79），TypeScript 依然會因為型別完全不相容而報錯，並不是加了 `as` 就萬能。

TypeScript 平常不會自動把每個 `let` 宣告的初始值都推斷成字面值型別，是因為那樣會嚴重限制 `let` 原本該有的彈性，讓變數幾乎沒辦法正常重新賦值。這也是為什麼只有 `const` 宣告才會觸發這個更精確的字面值型別推斷，因為 `const` 語意上就保證了不會被重新賦值，TypeScript 可以放心做出更大膽的假設，不會因此妨礙到使用者。

casting 並不是只能拿來把型別變得更精確，也可以反過來把型別轉成更寬泛的型別，例如把一個字面值型別轉型成它所屬的一般型別：

```ts
const humidity = 79 as number;
```

這種轉型是安全的，因為 `79` 本來就屬於 `number` 這個集合。但如果拿 casting 去宣稱兩個完全不相容的型別，像是把一個字串直接轉型成 `Date`，TypeScript 會直接擋下來，提示這個轉換可能是個錯誤：

```ts
let oops = 'oops' as Date;
// 錯誤：字串轉型為 Date 可能是個錯誤
```

TypeScript 會擋下這種明顯不相容的直接轉型，但如果先把值轉型成 `any`，再從 `any` 轉型成任何其他型別，這個安全機制就會被繞過去：

```ts
let oops = 'oops' as any as Date;
oops.toISOString(); // 編譯期不會報錯，但執行時會直接壞掉
```

這種「先轉 any 再轉目標型別」的雙重轉型是一個危險的逃生口，編譯期完全看不出問題，但執行到這行程式碼時會直接壞掉。之所以特地設計成要先繞道 `any` 才能完成這種轉型，就是要讓使用者清楚意識到自己正在放棄 TypeScript 的保護，不是可以隨手就做的事。

## 用 as const 取代重複寫型別

除了寫成 `79 as 79` 這種重複值本身的寫法，也可以用 `as const` 表達同樣的意圖：

```ts
let temp2 = 19 as const;
```

`as const` 的意思是「維持 `let` 帶來的可重新賦值特性，但取得型別時把它當成 `const` 來推斷」，效果跟前面 `79 as 79` 的寫法一致，只是不需要把字面值再打一次。

## 變數宣告但未初始化：implicit any

有時候需要先宣告變數，之後才賦值，例如計算一段時間間隔：

```ts
const randomWait = Math.floor(Math.random() * 1000);
const startTime = new Date();
let endTime;

setTimeout(() => {
    endTime = new Date();
}, randomWait);
```

`startTime` 因為初始化時就給了 `new Date()`，型別自然被推斷成 `Date`。但 `endTime` 宣告時沒有初始值，TypeScript 沒有任何線索可以判斷它未來會是什麼型別，只好把它標成 `any`。因為使用者沒有主動寫出這個型別，是編譯器在無計可施下的預設結果，所以稱為 implicit any（隱式 any）。

`any` 是一種「上限型別」（top type），代表它可以接受 JavaScript 裡任何可能存在的值，不管是函式、數字，還是一個 HTML input 元素都能塞進去。這聽起來很有彈性，但代價是完全失去型別檢查的保護，之後即使把 `endTime` 賦值成一個 `Date` 實例，型別資訊也已經在宣告的那一刻就流失掉了。

## 用型別標註修正 implicit any

要修正上面這個問題，可以在宣告時直接加上型別標註（type annotation），寫法是變數名稱後面接冒號跟型別名稱：

```ts
let endTime: Date;
```

有了這個標註，`endTime` 就被明確鎖定為 `Date` 型別。這時候如果不小心把它賦值成 `0` 這種在一般 JavaScript 裡完全合法、但其實邏輯上是錯誤的寫法，TypeScript 會立刻報錯，因為 `0` 不是一個 `Date` 實例。這正呼應了系列開頭提到的核心價值：把原本要等到執行期才會爆炸的問題，提前攔在編譯期。這種寫法之後在函式參數、函式回傳型別、class 欄位等各種地方都會反覆出現，都是同樣的「冒號加型別名稱」語法。

## 複習

### let 宣告與 const 宣告在型別推斷上有什麼差異？

`let` 宣告的變數因為之後可能被重新賦值成同型別的其他值，TypeScript 只會推斷出較寬泛的一般型別（例如 `number`）；`const` 宣告如果初始值是不可變值型別（如數字、字串），因為變數保證不會被重新賦值，TypeScript 會推斷出更精確的字面值型別（例如 `79`），代表這個變數只可能是這一個值。

### 什麼是「字面值型別」？

字面值型別是只代表單一具體值的型別，例如 `const humidity = 79` 會讓 `humidity` 的型別被推斷為 `79`，只允許這一個值，不能是任何其他數字。

### 什麼是 implicit any？

當一個變數宣告時沒有給初始值，也沒有寫型別標註，TypeScript 無從推斷它的型別，只好把它標成 `any`。因為這個型別不是使用者主動要求的，是編譯器在缺乏資訊時的預設結果，所以稱為隱式 any，這個變數會因此完全失去型別檢查的保護。

### 如何替一個變數加上型別標註？

在變數名稱後面加上冒號，再接上型別名稱，例如 `let endTime: Date;`，這會明確鎖定這個變數只能被賦值成 `Date` 型別的值。

## 小測驗

<details>
<summary>const 宣告一個像 79 這樣的數字時，TypeScript 會推斷出什麼型別？</summary>
恰好代表這個值本身的字面值型別
</details>

<details>
<summary>「字面值型別」代表什麼意思？</summary>
只代表單一特定值的型別
</details>

<details>
<summary>一個變數被宣告時沒有給初始值，會被自動賦予什麼型別？</summary>
any
</details>

<details>
<summary>如何替一個變數加上型別標註？</summary>
在變數名稱後面加上冒號，接著寫上型別名稱
</details>

<details>
<summary>一個變數建立之後，它的型別會發生什麼變化？</summary>
型別會固定下來，之後永遠不會改變
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
