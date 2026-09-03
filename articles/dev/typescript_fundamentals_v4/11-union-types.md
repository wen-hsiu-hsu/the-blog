---
title: 'TypeScript 聯集型別實戰：型別別名、控制流程回傳值、tuple 屬性限制、instanceof 窄化與判別聯集'
description: '示範用型別別名為字面值聯集命名，也能改用 number、string 這類更寬泛的型別表達集合；整理聯集型別在控制流程回傳值中最常見的用法，指出 tuple 解構出聯集型別後只能存取共同屬性（最大公因數）的限制，並用 instanceof 型別守衛與判別聯集窄化型別、取回完整存取權，也談型別集合基數的侷限。'
date: 2026-09-03
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 11
chapter: 'Union and Intersection Types'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - UnionTypes
    - TypeAlias
    - Tuples
    - TypeGuards
    - Narrowing
    - DiscriminatedUnions
    - LiteralTypes
---

# TypeScript 聯集型別實戰：型別別名、控制流程回傳值、tuple 屬性限制、instanceof 窄化與判別聯集

> [[10-conceptualizing-union-and-intersection-types|前面]] 用偶數跟 1 到 5 兩個集合建立了聯集型別的心智模型，這一節回到編輯器實際動手寫，看看聯集型別在真實程式碼裡最常出現的樣子。

## 用型別別名替字面值集合命名

延續前面字面值型別的概念（`humidity` 只能是 `79`），可以把好幾個字面值型別聯集起來，具名成一個集合：

```ts
type OneThroughFive = 1 | 2 | 3 | 4 | 5;
let lowNumber: OneThroughFive = 3; // 沒問題
lowNumber = 8; // 錯誤：8 不在這個集合裡

type Evens = 2 | 4 | 6 | 8;
let evenNumber: Evens = 2; // 沒問題
evenNumber = 5; // 錯誤：5 不在這個集合裡
```

這種把一個名稱指向某個型別定義的寫法叫做型別別名（type alias），後面章節會更深入介紹這個語法，這裡先看它如何運作即可。有了這兩個集合，就能把它們聯集起來：

```ts
let evenOrLowNumber: Evens | OneThroughFive = 5 as Evens | OneThroughFive;
```

這裡刻意用了一次 casting，是因為 TypeScript 對這個賦值的型別推斷太過聰明，反而不利於這裡想教學的重點，用型別轉換明確指定型別方便觀察聯集的行為；這是一個安全的轉型，因為 `5` 確實落在這個聯集代表的集合裡。

## 用更寬泛的型別表達集合，不必窮舉每個值

有學員問，除了像上面這樣一個個列舉字面值，還有沒有其他方式表達集合？答案是可以用範圍更廣的型別代替，例如 `number` 本身就代表「所有數字」這個集合，`string` 就代表「所有字串」這個集合，`number | string` 則代表兩者的聯集。可以把所有存在的型別都想成一個個集合，型別別名就是把型別組合起來、給它一個名字的做法，之後章節會再深入介紹型別別名的語法細節。

有學員接著問，JavaScript 的數字本質上都是浮點數（double），拿浮點數做金錢計算不是常有精度風險嗎？這個疑慮很合理，但這裡示範的重點不是精度計算，而是純粹觀察集合怎麼運作：畫面上寫的 `1`、`2`、`3` 沒有小數點，不代表它們底層不是浮點數，只是這幾個值剛好在螢幕上顯示得很簡潔，跟這裡想討論的「型別如何表示一組允許的值」沒有衝突。

## 型別集合的侷限：基數與窮舉

有學員問，能不能在型別裡直接寫算術運算式，像是用某種公式表達「所有偶數」這種規則性的集合，而不用一個個列出來？答案是技術上有辦法透過型別的遞迴運算模擬出一些算術效果，但代價非常高：要表達到 1000 的所有數字，得靠遞迴的方式一路做減法運算，對編譯器來說極度沒有效率，講師形容這就像有人證明可以用 90% 表情符號寫 Ruby 程式一樣，理論上可行，但不建議真的這麼做。

這也直接牽涉到一個更根本的限制：TypeScript 目前沒有辦法定義「所有偶數」這種無限或規則性的集合，只能靠明確列舉每一個成員的方式表達。前面 `OneThroughFive` 之所以可行，是因為它只有 5 個成員，這種「集合裡有幾個成員」的概念稱為基數（cardinality），基數小的集合可以放心列舉，但只要嘗試涵蓋到 JavaScript 裡所有可能的數字範圍，窮舉每一個成員就會變得不切實際，甚至不可能。

## 聯集型別傳入更嚴格的函式參數時如何檢查

延續前面定義好的 `Evens`、`OneThroughFive` 與 `evenOrLowNumber`，可以透過幾個限制更嚴格的函式，觀察聯集型別實際被檢查的方式：

```ts
function printEven(num: Evens) {
    console.log(num);
}

function printLowNumber(num: OneThroughFive) {
    console.log(num);
}

function printEvenNumberUnder5(num: 2 | 4) {
    console.log(num);
}

function printNumber(num: number) {
    console.log(num);
}
```

`evenOrLowNumber` 本身接受範圍很寬，同時符合 `Evens`、`OneThroughFive`，也符合它自己這個聯集型別。但把它傳進這幾個要求更嚴格的函式時，結果各不相同：傳進 `printEven` 會報錯，錯誤訊息直接寫出 `1 is not assignable to type Evens`，因為 TypeScript 會依序檢查聯集裡的每個成員，`2`、`4`、`6`、`8` 都符合，一遇到 `1` 就判定不成立，直接中止檢查；傳進 `printLowNumber` 一樣會報錯，這次是卡在 `6` 這個成員上；傳進 `printEvenNumberUnder5`（只接受 `2` 或 `4`）則卡在 `6`；只有傳進 `printNumber` 才會全部通過，因為聯集裡的每個成員終究都是數字。這個行為也呼應了 [[10-conceptualizing-union-and-intersection-types|前一篇]]「聯集型別能接受的範圍變大、但能保證的變少」的結論：只要聯集裡有任何一個成員不符合目標型別，TypeScript 就會判定整個聯集型別不能賦值過去。

## 聯集型別最常出現的場合：控制流程

聯集型別在集合論的討論裡看起來只是眾多概念之一，但實務上會遠比交集型別更常遇到，講師預估日常使用中聯集型別出現的頻率可能是交集型別的一百倍以上。原因跟控制流程（control flow）息息相關：只要函式裡有分支邏輯，例如擲硬幣後依正反面走不同路徑，每個分支可能回傳不同的值，這時候函式的回傳型別自然就是一個聯集：

```ts
function flipCoin(): 'heads' | 'tails' {
    if (Math.random() > 0.5) return 'heads';
    return 'tails';
}
```

宣告了 `'heads' | 'tails'` 這個回傳型別之後，函式裡只要嘗試回傳這兩個字串以外的任何值（哪怕只是打錯字，像不小心拼成 `'tails'` 的相近字），TypeScript 都會直接報錯，甚至會主動提示可能是想打哪個正確的字面值。這也代表回傳型別的宣告不一定要涵蓋函式邏輯上實際會用到的所有值：如果函式目前永遠只回傳 `'tails'`，但為了替未來預留 `'heads'` 的可能性，一樣可以把回傳型別宣告成 `'heads' | 'tails'`，因為字串 `'tails'` 本身就落在這個聯集代表的集合裡，型別上完全等價。

## 聯集型別搭配 tuple：只能存取共同的屬性

接下來看一個更複雜的例子，延續前面提過的「長度為 2 的 tuple」用法：假設有一個處理「新增使用者到通訊錄」的函式，可能透過 API 呼叫完成，結果分成成功與失敗兩種情況。

```ts
type UserInfoOutcomeSuccess = ['success', { name: string; email: string }];
type UserInfoOutcomeError = ['error', Error];
type UserInfoOutcome = UserInfoOutcomeSuccess | UserInfoOutcomeError;

function maybeGetUserInfo(): UserInfoOutcome {
    if (Math.random() > 0.5) {
        return ['success', { name: 'Mike North', email: 'mike@example.com' }];
    } else {
        return ['error', new Error('The coin flip was not heads')];
    }
}
```

tuple 的第一個元素是字串 `'success'` 或 `'error'`，第二個元素依情況不同，可能是帶有 `name`、`email` 的物件，也可能是 `Error` 的執行個體。如果解構這個結果，取出第二個位置的值，會發現能存取的屬性只剩下 `name`：

```ts
const [first, second] = maybeGetUserInfo();
second.name; // 可以存取
second.message; // 錯誤：message 不保證存在
```

原因回到前面聯集型別「能保證什麼」的討論：`second` 的型別是「帶有 `name`、`email` 的物件」聯集「`Error`」，TypeScript 沒辦法保證它究竟是哪一種，只能給出兩者都具備的最大公因數，也就是這兩種型別剛好都有的 `name` 屬性（`Error` 執行個體本身也有 `name` 屬性）。這代表聯集型別雖然能接受的值很寬廣，但沒有經過處理之前，能實際拿來用的部分反而被壓縮到最少。

## 用型別守衛把聯集窄化回具體型別

要拿回完整的屬性存取權，需要透過型別守衛做窄化。除了先前看過的 `typeof`，這裡引入另一個 JavaScript 內建、也被 TypeScript 認可為型別守衛的語法：`instanceof`。

```ts
if (second instanceof Error) {
    console.log(second.stack, second.message);
} else {
    console.log(second.name, second.email);
}
```

一旦進入 `second instanceof Error` 這個分支，TypeScript 就知道這裡的 `second` 型別已經窄化成 `Error`，可以完整存取 `stack`、`message` 這些只有 `Error` 才有的屬性；反過來，在 `else` 分支裡，剩下的可能性只有那個帶 `name`、`email` 的物件，一樣能完整存取這兩個屬性。可以把這個過程想像成一塊圓餅圖，一部分代表 `Error`，另一部分代表那個物件，每寫一個 `instanceof` 判斷式，就是從餅圖裡切走已經確認處理過的那一塊，剩下沒被切走的部分，就是 `else` 分支裡還沒被窄化掉的可能性。如果聯集裡的成員更多，也可以連續用多個 `instanceof` 依序處理，走到最後的 `else` 時，剩下的就是所有還沒被排除掉的可能性。

## 判別聯集：用固定位置的字面值當作判斷依據

除了用 `instanceof` 這種型別本身的檢查，還有一種技巧叫做判別聯集（discriminated union）。同樣是這組 tuple，如果只看第二個位置的型別，可能會誤以為 `'success'` 有機會搭配 `Error`，或是 `'error'` 有機會搭配那個帶 `name`、`email` 的物件，但 TypeScript 其實記錄了更精確的資訊：這兩個位置是綁在一起的，只會是「`'success'` 加物件」或「`'error'` 加 `Error`」這兩組固定的配對，不會混搭。

```ts
if (first === 'error') {
    console.log(second.stack, second.message); // second 被窄化成 Error
} else {
    console.log(second.name, second.email); // second 被窄化成物件
}
```

只要檢查 `first`（tuple 的第一個位置）等不等於 `'error'`，TypeScript 就會自動把 `second` 對應窄化成正確的型別，因為第一個位置的字面值等於是替整個 tuple 貼上了一張標籤，只要看到這張標籤，就能推斷出整組值長什麼樣子。這種手法之所以稱為「判別」聯集，是因為它借助一個字面值（或字面值聯集）欄位當作判別依據，藉此反推整個值屬於聯集裡的哪一種可能性。這個技巧生效的前提是每一組配對都得是獨一無二的，如果兩種情況共用同一個 `first` 值（例如都標成 `'success'`），TypeScript 就沒辦法用這個欄位分辨究竟是哪一種情況，判別聯集也就失去作用了。

## 複習

### 什麼是型別別名？

型別別名是用一個名稱指向某個型別定義的寫法，例如把 `1 | 2 | 3 | 4 | 5` 這個聯集型別命名為 `OneThroughFive`，之後就能直接用這個名稱代表這個型別。

### 為什麼聯集型別在實務上比交集型別常見得多？

因為聯集型別經常出現在有分支邏輯的控制流程裡，例如一個函式依條件不同會回傳不同的值，這種「多種可能結果」的情境天生就適合用聯集型別描述，出現頻率遠高於交集型別代表的「同時滿足多個限制」情境。

### 聯集型別搭配 tuple 使用時，為什麼解構出來的值只能存取部分屬性？

因為 TypeScript 沒辦法保證這個值究竟屬於聯集裡的哪一種可能性，只能提供所有可能性共同擁有的屬性，也就是屬性上的最大公因數，要拿回完整的屬性存取權，需要透過型別守衛或判別聯集把型別窄化成聯集裡具體的其中一種。

### 什麼是判別聯集？它跟 instanceof 這種型別守衛有什麼不同？

判別聯集是利用一個字面值（或字面值聯集）欄位當作判斷依據，反推整個值屬於聯集裡的哪一種情況，前提是每一種情況都對應到獨一無二的字面值。跟 `instanceof` 直接檢查值本身的型別不同，判別聯集檢查的是值裡面某個固定位置的欄位。

## 小測驗

<details>
<summary>TypeScript 中什麼是聯集型別？</summary>
用 | 運算子把多個具體型別組合起來的型別
</details>

<details>
<summary>如何在 TypeScript 中定義一組特定數字的集合？</summary>
用字面值型別組成的聯集型別
</details>

<details>
<summary>什麼是型別的基數（cardinality）？</summary>
一個集合或維度裡的成員數量
</details>

<details>
<summary>TypeScript 中的型別別名是什麼？</summary>
用一個名稱搭配其定義來描述一個型別的方式
</details>

<details>
<summary>聯集型別在 TypeScript 中主要用來表達什麼？</summary>
表達控制流程中不同分支各自可能出現的結果
</details>

<details>
<summary>在一個表示成功或失敗結果的 tuple 中，是什麼決定了另一個位置的值屬於哪一種型別？</summary>
tuple 的第一個元素（判別欄位）
</details>

<details>
<summary>什麼是判別聯集？</summary>
一種聯集型別，其中有一個字面值型別的欄位作為判別依據
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
