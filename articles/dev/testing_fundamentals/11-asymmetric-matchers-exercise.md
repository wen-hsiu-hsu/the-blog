---
title: '不對稱 matcher 練習：從逐一比對、objectContaining 到依賴注入，馴服帶有隨機值的物件'
description: '講師 Steve Kinney 讓學員動手把一個帶隨機能力值與時間戳記的 Character 類別測試補完，示範用 expect.objectContaining 只驗證關心的欄位、用 expect.any 忽略隨機值，到拆成小測試、用大於比較取代寫死初始值，最後用依賴注入把隨機性搬到函式外部，讓測試徹底控制它。'
date: 2026-09-17
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 11
chapter: 'Testing Equality'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - AsymmetricMatchers
    - DeepEquality
    - DependencyInjection
    - ObjectContaining
    - ArrangeActAssert
---

# 不對稱 matcher 練習：從逐一比對、objectContaining 到依賴注入，馴服帶有隨機值的物件

延續前一篇用 `expect.any` 與 `expect.stringMatching` 處理隨機 UUID 的做法，這篇換成一個更複雜的物件，練習把整套技巧組合起來。

## 練習任務：把 Character 測試補完

這次的範例是一個繼承自 `Person` 的 `Character` 類別，多了角色（role）、等級（level）、六個隨機產生的能力值（力量、敏捷、智力、感知、魅力、體質），以及建立時間、最後修改時間：

```javascript
export class Character extends Person {
    constructor(firstName, lastName, role) {
        super(firstName, lastName);
        this.role = role;
        this.level = 1;
        this.createdAt = new Date();
        this.lastModified = this.createdAt;
        this.strength = rollDice(4, 6);
        this.dexterity = rollDice(4, 6);
        this.intelligence = rollDice(4, 6);
        this.wisdom = rollDice(4, 6);
        this.charisma = rollDice(4, 6);
        this.constitution = rollDice(4, 6);
    }

    levelUp() {
        this.level++;
        this.lastModified = new Date();
    }
}
```

Steve 這次沒有直接示範，而是讓學員自己動手把測試寫到能通過，確認名字、姓氏、角色有正確存進物件，等級預設為 `1`，額外挑戰則是驗證 `levelUp` 之後時間戳記真的有更新。他強調沒有唯一正確答案，只要能讓自己對修改這段程式碼感到安心，用哪一種寫法都算數。

## 最簡單的做法：一個個屬性各自比對

最直接的寫法，是把每個關心的屬性各自拿出來，用 `toBe` 逐一比對：

```javascript
it('should create a character with a first name, last name, and role', () => {
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist');

    expect(character.firstName).toBe('Ada');
    expect(character.lastName).toBe('Lovelace');
    expect(character.role).toBe('Computer Scientist');
});
```

只要驗證了測試名稱裡承諾的每一件事，這個寫法就算是正確答案，不需要多花力氣把整個物件塞進單一個斷言裡。

## 用變數取代重複打字的字串，避免手誤

一個容易被忽略的小技巧，是把要傳入建構函式跟拿來比對的值，都存成同一個變數，而不是分別手打兩次：

```javascript
const firstName = 'Ada';
const lastName = 'Lovelace';
const role = 'Computer Scientist';

const character = new Character(firstName, lastName, role);

expect(character.firstName).toBe(firstName);
expect(character.lastName).toBe(lastName);
expect(character.role).toBe(role);
```

這樣做的用意不是為了少打幾個字，而是避免因為手誤打錯字串，導致測試因為打字錯誤而失敗，卻誤以為是程式碼本身有問題。這種寫法在物件屬性更多的情境下特別有幫助。

## toEqual 整包比對為什麼行不通

如果想用 `toEqual` 一次驗證多個屬性，直接把三個關心的欄位包成一個物件去比對會失敗：

```javascript
expect(character).toEqual({
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'Computer Scientist',
});
```

問題出在 `character` 這個實際物件上還有一大堆其他屬性（等級、六項能力值、時間戳記等），`toEqual` 要求兩邊的屬性要完全對得上，只驗證三個欄位、卻拿去跟一個屬性多更多的實際物件比對，自然會被判定不相等。

## expect.objectContaining：只驗證關心的屬性

要解決這個問題，可以把期待比對的物件包進 `expect.objectContaining`，明確告訴 `toEqual`：只要這個物件「包含」這些屬性、值也對得上就好，其他屬性不重要：

```javascript
it('should create a character with the correct properties', () => {
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist');

    expect(character).toEqual(
        expect.objectContaining({
            firstName: 'Ada',
            lastName: 'Lovelace',
            role: 'Computer Scientist',
        }),
    );
});
```

這種寫法特別適合處理內容龐大的 API 回應，或者只是想替一個既有的大物件多加一個屬性、卻不想連帶把物件裡原本就有的其他內容全部列出來比對的情境。如果測試因為不重要的細節而動不動就失敗，最終的結果往往是乾脆不寫測試，或是把礙事的測試刪掉；有時候放寬比對範圍，反而是在克制自己想放棄測試的衝動。

## 忽略隨機值：用 expect.any 一次驗證完整形狀

如果想在同一個測試裡驗證物件的完整結構，包含那些隨機產生、無法預先知道值的屬性，可以搭配 `expect.any` 指定型別，而不是具體的值：

```javascript
it('should create a character with a first name, last name, and role', () => {
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist');

    expect(character).toEqual({
        id: expect.any(String),
        firstName: 'Ada',
        lastName: 'Lovelace',
        role: 'Computer Scientist',
        level: 1,
        strength: expect.any(Number),
        dexterity: expect.any(Number),
        intelligence: expect.any(Number),
        wisdom: expect.any(Number),
        charisma: expect.any(Number),
        constitution: expect.any(Number),
        createdAt: expect.any(Date),
        lastModified: expect.any(Date),
    });
});
```

`id` 只要求是字串、六項能力值只要求是數字、`createdAt` 跟 `lastModified` 只要求是 `Date` 的實例，不去計較實際的值是多少；`firstName`、`lastName`、`role`、`level` 這幾個確定的欄位，則依然要求精確符合。

## 一次測完全部，還是拆成小測試？

把所有屬性都塞進同一個測試裡，好處是一目瞭然，但代價是一旦某個屬性壞掉，錯誤訊息會是一整包難以閱讀的差異，得瞇著眼睛找到底是哪個欄位出了問題。拆成一個個小測試雖然看起來瑣碎，卻能讓失敗訊息直接告訴你是哪一件事沒做到，長期下來對未來的自己比較友善。

例如把升級行為獨立成自己的測試：

```javascript
it('should allow you to increase the level', () => {
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist');

    character.levelUp();
    expect(character.level).toBe(2);
});
```

以及驗證升級之後，最後修改時間確實有跟著更新：

```javascript
it('should update the last modified date when leveling up', () => {
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist');

    const initialLastModified = character.lastModified;

    character.levelUp();

    expect(character.lastModified).not.toBe(initialLastModified);
});
```

這裡刻意不去比對「新的時間應該是什麼」，只驗證新的時間跟原本存起來的時間「不是同一個」，前面章節介紹過的 `.not` 修飾詞正好派上用場：因為時間永遠往未來走，只要能確定它變了，就足以證明 `levelUp` 真的有更新這個欄位。

## Arrange、Act、Assert：測試常見的三段式結構

上面這種「先建立好狀態，再執行動作，最後驗證結果」的寫法，剛好呼應測試裡常見的 AAA 模式：先安排（arrange）測試需要的資料與物件，再執行（act）要測試的行為，最後斷言（assert）結果是否符合預期。這不是硬性規定，只是一種幫助思考測試該怎麼組織的參考架構。

## 讓測試撐過規則改變：用大於比較，取代寫死初始值

如果測試寫死「升級後應該是等級 2」，一旦日後遊戲規則改變、角色不一定從等級 1 開始，這個斷言就會顯得脆弱。更有彈性的寫法，是只驗證等級有沒有變得比原本更高：

```javascript
it('should increase the level after leveling up', () => {
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist');
    const initialLevel = character.level;

    character.levelUp();

    expect(character.level).toBeGreaterThan(initialLevel);
});
```

即使日後角色改成從等級 55 開始（借用大型科技公司職級起跳點不一定是最低階這種現實案例），這個測試依然成立，因為它驗證的是「有沒有變得更高」，而不是某個寫死的數字。在最極端、不想依賴任何額外 matcher 的情況下，甚至可以直接寫成布林邏輯：`expect(character.level > 0).toBe(true)`，這些 matcher 說到底都只是把簡單的邏輯判斷包裝得更好讀。

課堂上有學員當場提問：如果之後把建構函式改成可以指定起始等級，這個「用大於比較」的測試是不是就能涵蓋到這次重構？Steve 現場示範了這個情境，讓 `Character` 的建構函式多接受一個可選的 `level` 參數，預設值維持 `1`：

```javascript
export class Character extends Person {
    constructor(firstName, lastName, role, level = 1) {
        super(firstName, lastName);
        this.role = role;
        this.level = level;
        this.createdAt = new Date();
        this.lastModified = this.createdAt;
        this.strength = rollDice(4, 6);
        this.dexterity = rollDice(4, 6);
        this.intelligence = rollDice(4, 6);
        this.wisdom = rollDice(4, 6);
        this.charisma = rollDice(4, 6);
        this.constitution = rollDice(4, 6);
    }

    levelUp() {
        this.level++;
        this.lastModified = new Date();
    }
}
```

改完之後重跑測試，全部依然通過。原本寫死等於 `2` 的測試，本來就已經拆到自己的測試裡了，如果改壞了什麼，會知道是哪一個測試出的問題；而這個用大於比較寫的測試，完全不需要跟著修改，就自然涵蓋了這次重構，證明了選對比對方式，能讓測試本身更能承受程式碼日後的變化。

## 依賴注入：把隨機性從函式內部搬到外部

前面用 `expect.any(Number)` 處理了能力值的隨機性，但那終究只是繞過問題，沒有真正掌控它。`rollDice` 這個函式目前是直接在模組裡被匯入、寫死在建構函式內部呼叫，這代表外部完全無法插手它的行為。

這裡可以借用一個不只限於測試領域的通用軟體設計原則：依賴注入（dependency injection）。做法是讓建構函式額外接受一個可以擲骰的函式，預設用原本的 `rollDice`，但允許呼叫端換成別的實作：

```javascript
export class Character extends Person {
    constructor(firstName, lastName, role, roll = rollDice) {
        super(firstName, lastName);
        this.role = role;
        this.level = 1;
        this.createdAt = new Date();
        this.lastModified = this.createdAt;
        this.strength = roll(4, 6);
        this.dexterity = roll(4, 6);
        this.intelligence = roll(4, 6);
        this.wisdom = roll(4, 6);
        this.charisma = roll(4, 6);
        this.constitution = roll(4, 6);
    }

    levelUp() {
        this.level++;
        this.lastModified = new Date();
    }
}
```

測試時，就可以傳入一個永遠回傳固定值的假函式，徹底拔掉隨機性：

```javascript
it('should allow a custom roll function to be injected', () => {
    const roll = () => 15;
    const character = new Character('Ada', 'Lovelace', 'Computer Scientist', roll);

    expect(character.strength).toBe(15);
});
```

這個原則不只適用在擲骰子這種明顯的隨機情境。舉例來說，一個 React 元件如果在掛載時直接呼叫 API，測試起來就會很麻煩；但如果把抓資料的邏輯改成透過一個可以從外部傳入的 prop（例如 `fetchData`），預設呼叫真正的 API，測試時就能換成一個直接回傳假資料的函式，完全不需要真的呼叫網路，也不需要額外的 mock 或 stub 工具介入。核心精神都一樣：把那些自己控制不了、或者不想在測試裡處理的依賴，改成可以從外部替換掉的參數。

## 複習

### 把測試拆成小而命名清楚的單位，有什麼好處？

拆成更小、更聚焦的測試，有助於準確定位程式碼裡到底是哪個部分壞掉，讓除錯更容易，也能對程式碼的行為提供更精確的回饋

### 依賴注入模式在測試裡能帶來什麼好處？

依賴注入允許把函式或依賴當作參數傳入，這讓測試時可以用受控制的假實作，取代真正的依賴，讓測試更容易進行

### 測試裡的「Triple A」模式是什麼？

Triple A 模式包含 Arrange（安排測試所需的條件）、Act（執行要測試的動作），以及 Assert（驗證預期的結果）

### 使用 objectContaining() 在測試裡有什麼好處？

使用 objectContaining() 能讓測試驗證物件裡有特定屬性存在，而不需要要求所有屬性都完全一致，這在處理複雜物件或帶有額外欄位的 API 回應時特別有用

### expect.objectContaining() 在測試裡的用途是什麼？

expect.objectContaining() 讓你可以驗證一個物件擁有特定屬性，而不需要所有屬性都完全吻合。這在測試大型物件或只在乎特定欄位的 API 回應時很有用，例如 `expect(character).toEqual(expect.objectContaining({ firstName, lastName, role }))` 只要 character 物件包含這三個屬性就會通過，不管它還有其他哪些屬性

## 小測驗

<details>
<summary>在測試裡使用「expect object containing」的目的是什麼？</summary>
只驗證物件裡特定的屬性，忽略其他額外的屬性
</details>

<details>
<summary>依賴注入在軟體測試裡能幫上什麼忙？</summary>
把寫死的依賴替換成可以自由設定的函式
</details>

<details>
<summary>測試裡的「expect any」matcher 可以用來做什麼？</summary>
驗證一個值屬於特定型別，而不檢查它實際的值
</details>

<details>
<summary>測試裡的 Triple A 模式，目的是什麼？</summary>
Arrange、Act、Assert：安排測試情境、執行動作，再驗證結果
</details>

<details>
<summary>為什麼把測試拆成更小、更明確的單位會有幫助？</summary>
能在除錯時快速找出究竟是哪一個測試失敗了
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
