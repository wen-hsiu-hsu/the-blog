---
title: '測試裡的相等比較：toBe、toEqual、toStrictEqual 三個 matcher 該怎麼選'
description: '講師 Steve Kinney 說明為什麼物件與陣列這類參照型別無法直接用三個等號比較，帶出 toBe 與 toEqual 的適用場景差異，並用真實案例解釋 toStrictEqual 額外檢查的 undefined 屬性與原型型別，也介紹 .not 修飾詞與只該用來除錯的 test.fails。'
date: 2026-09-16
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 9
chapter: 'Testing Equality'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - Assertions
    - ReferentialEquality
    - DeepEquality
---

# 測試裡的相等比較：toBe、toEqual、toStrictEqual 三個 matcher 該怎麼選

## 為什麼物件的相等比較在測試裡特別容易出包

React 這類前端框架的核心概念之一，是用不可變（immutable）的方式替換狀態物件：每次狀態更新，都會產生一個全新的物件，而不是直接修改舊物件，框架正是靠著「這是不是同一個物件」來判斷該不該觸發重新渲染。這個機制在寫測試的時候，反而變成一個容易踩到的坑。

## 基本型別 vs 參照型別：三個等號為什麼會失效

到目前為止，前面幾篇練習的測試都是在比較數字這類基本型別（primitive）的值，例如 `2 + 2` 應該等於 `4`。基本型別的值在記憶體裡可以直接用三個等號（`===`）比較：同樣的數字、同樣的字串，值相同就會判定相等。

但物件跟陣列不是這樣運作的。兩個內容完全相同的陣列，用三個等號比較不會相等；兩個 key、value 都一模一樣的物件，也一樣不會相等。因為它們在記憶體裡是各自獨立的物件，即使外觀一模一樣，也不是同一個東西。

```javascript
it('should not be the same object in memory', () => {
    const objectA = { name: 'Ada' };
    const objectB = { name: 'Ada' };

    expect(objectA).toBe(objectB);
});
```

這個測試會失敗，因為 `toBe` 比較的是「是不是記憶體裡完全同一個物件」。即使某個函式的邏輯是直接修改（mutate）傳入的物件，再用 `toBe` 去比對修改前後的參照，測試依然會通過；但如果函式回傳的是一個屬性內容相同的全新物件，`toBe` 就會判定失敗。

## 換一個 matcher：toEqual 逐層比對內容

要驗證物件或陣列「內容相同」而不是「是不是同一個物件」，需要換成 `toEqual`：

```javascript
expect(objectA).toEqual(objectB);
```

`toEqual` 的運作方式，是遞迴走過物件（或陣列）裡的每一個 key，逐一比對對應的值是否相同，一路比對到最底層的基本型別為止，只要有任何一個值對不上，就判定不相等。

測試框架也會盡量在錯誤訊息裡提示可能的問題，例如提醒「這裡看起來可能是用錯了比較方式」。這個提示很有幫助，因為兩個物件即使序列化成字串後長得一模一樣，也不代表它們真的相等，測試套件不會替你猜測意圖，只會照實比對。

## toStrictEqual：連 undefined 屬性跟原型都要對得上

`toEqual` 跟 `toStrictEqual` 的差異，在於嚴謹程度不同。多數情況下 `toEqual` 已經夠用，但如果需要更嚴格地確認兩個物件真的完全一致，才需要 `toStrictEqual`。

其中一個差異是對待值為 `undefined` 的屬性的方式，`toEqual` 會直接忽略這種屬性，`toStrictEqual` 則會把它當成一個真實存在的差異：

```javascript
const expected = { a: 1, b: 2 };
const actual = { a: 1, b: 2, c: undefined };

expect(actual).toEqual(expected);
expect(actual).toStrictEqual(expected);
```

第一個斷言會通過，因為 `toEqual` 直接忽略值為 `undefined` 的 `c` 屬性；第二個斷言則會失敗，因為 `toStrictEqual` 會把這個多出來的屬性算進比對範圍。

另一個差異是物件的型別（原型）是否相同。`toEqual` 不會檢查兩個物件是不是來自同一個類別，只要屬性內容一致就算相等；`toStrictEqual` 則會連原型也一併比對：

```javascript
class Person {
    constructor(name) {
        this.name = name;
    }
}

const person = new Person('Ada');
const plainObject = { name: 'Ada' };

expect(person).toEqual(plainObject);
expect(person).toStrictEqual(plainObject);
```

`person` 是 `Person` 類別的實例，`plainObject` 只是一個普通物件，兩者的 `name` 屬性內容相同。`toEqual` 不在意這個差異，會判定相等；`toStrictEqual` 則會因為原型不同而判定不相等。

多數情況下，`toEqual` 已經是最常用的選擇，尤其像是在測試建構函式（constructor）產生的結果時，通常只在意屬性內容對不對，不需要特地去建一個一模一樣類別的實例來比對。只有在真的需要確認「完全沒有多餘的東西」時，才會選擇 `toStrictEqual`。

## .not 修飾詞：反過來驗證「不應該發生」

`expect` 還有一個 `.not` 修飾詞，可以反過來驗證某個情況不應該發生。比較常見的用法是驗證某個函式不應該拋出錯誤：

```javascript
expect(() => doSomething()).not.toThrow();
```

如果這個函式真的拋出了錯誤，測試一樣會失敗，等於用相反的角度確認程式碼的行為符合預期。

## test.fails：只該拿來除錯，別提交進版本庫

除了修飾單一斷言的 `.not`，Vitest 也提供 `test.fails`，可以把整個測試的判定邏輯反過來：預期這個測試「應該要失敗」，如果它真的失敗了，反而算是測試通過。

這個用法比較適合拿來做一次性的除錯，例如懷疑某個測試其實是假陽性、想要刻意讓它顯示失敗訊息、藉此確認程式碼真正的行為，而不是原本設計上就該長期留在測試套件裡的寫法，不建議把 `test.fails` 提交進版本庫。這個道理跟前面提到的 `.skip`、`.todo` 類似：如果專案裡到處都是 `.todo` 標記的測試，等於什麼都沒真正驗證到；也可能在整理、除錯程式碼時，不小心把原本該執行的測試標成跳過卻忘了改回來，因此也可以考慮設定對應的程式碼檢查規則（例如 ESLint），避免這類標記被不小心提交進主要分支。

## 複習

### 在 JavaScript 測試裡，使用 toBe 跟 toEqual 有什麼差異？

toBe 用於基本型別的值，比較的是兩者是不是記憶體裡完全相同的物件；toEqual 則是透過遞迴走訪物件或陣列裡的內容，逐一比對 key 與 value 是否相同

### toStrictEqual 跟 toEqual 相比，多做了哪些檢查？

toStrictEqual 提供更嚴格的比較方式，不只檢查 key 與 value，還會確認沒有多餘的（包含值為 undefined 的）屬性，並且要求物件是完全相同的型別與原型

### 像字串、數字這類 JavaScript 基本型別，在比較相等時是怎麼運作的？

數字、字串這類基本型別的值只要內容相同，用三個等號（===）比較時就會判定相等，因為它們是依照值本身來比較，而不是依照參照

### 為什麼內容完全相同的陣列與物件，不會自動被判定為相等？

陣列與物件屬於參照型別，即使內容完全一致，它們在記憶體裡依然是各自獨立的物件，用 === 比較時不會被視為相等

### .not 修飾詞在測試斷言裡的作用是什麼？

.not 修飾詞可以用來驗證某個預期的相反情況，例如驗證某個值不應該相等，或某個函式不應該拋出例外

## 小測驗

<details>
<summary>在 JavaScript 測試裡，`.toStrictEqual()` 的用途是什麼？</summary>
確保物件完全相等，包括原型與值為 undefined 的屬性都一併檢查
</details>

<details>
<summary>在 JavaScript 測試裡，`.not` 這個修飾詞做的是什麼事？</summary>
驗證與原本測試條件相反的情況
</details>

<details>
<summary>在 JavaScript 測試裡，像數字、字串這類基本型別有什麼關鍵特性？</summary>
相同的值在記憶體裡只會存在單一份實例
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
