---
title: '測試裡的隨機值：用 expect.any 與 stringMatching 驗證帶有隨機 UUID 的物件'
description: '講師 Steve Kinney 用一個會產生隨機 UUID 的 Person 類別，示範直接用 toEqual 比對整個物件為什麼注定失敗；並介紹用 expect.any(String) 只驗證型別、或用 expect.stringMatching 驗證 ID 前綴，只鎖定真正在乎的部分，放過真正隨機的那一段。'
date: 2026-09-16
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 10
chapter: 'Testing Equality'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - Assertions
    - DeepEquality
    - AsymmetricMatchers
---

# 測試裡的隨機值：用 expect.any 與 stringMatching 驗證帶有隨機 UUID 的物件

延續前一篇對 `toEqual` 的討論，這篇處理一個更棘手的情境：如果物件裡有一部分內容本來就不該固定，測試該怎麼寫。

## 非決定性的資料，會讓精確比對失效

前面幾篇處理的都是決定性（deterministic）的情況：同樣的輸入，永遠會得到同樣的輸出。但程式碼裡經常出現非決定性（non-deterministic）的值，例如當下的日期時間、亂數，或是像 UUID 這種隨機產生的字串。UUID 的設計目的，就是讓每次產生的字串幾乎不可能重複，理論上長時間下來有極小機率撞號，但在合理的時間範圍內幾乎不可能發生，這正是它對測試造成麻煩的原因：沒辦法預先知道這次執行會產生哪個字串。

Steve 先劇透了處理這類問題的三種思路：不在乎隨機的那部分、想辦法讓它變得不隨機，或是主動控制它什麼時候該隨機、什麼時候不該。這篇先聚焦在前兩種，第三種留到後面再談。

## Person 範例：建構函式裡藏著一個隨機 ID

範例是一個 `Person` 類別，建構時需要傳入名字和姓氏，缺一個就會拋出錯誤，同時類別內部會自動產生一個以 `person-` 開頭、後面接著隨機 UUID 的 `id`：

```javascript
import { v4 as id } from 'uuid';

export class Person {
    constructor(firstName, lastName) {
        this.id = 'person-' + id();
        this.firstName = firstName;
        this.lastName = lastName;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
```

`fullName` 是一個 getter，讀取 `person.fullName` 時會即時運算出全名，不需要另外呼叫方法。

## 直接用 toEqual 比對整個物件，注定失敗

如果直接建立一個 `Person`，拿它跟一個只有 `firstName`、`lastName` 兩個屬性的物件做 `toEqual` 比對，測試會失敗：

```javascript
it('should create a person with a first name and last name', () => {
    const person = new Person('Grace', 'Hopper');

    expect(person).toEqual({ firstName: 'Grace', lastName: 'Hopper' });
});
```

錯誤訊息只會告訴你兩者不相等，因為實際的 `person` 物件上多了一個 `id` 屬性，而且這個 `id` 每次執行都不一樣，不可能事先寫死一個固定值放進期待的物件裡去比對。

## 只驗證有沒有這個屬性、型別對不對

第一種思路，是不去管 `id` 具體的值，只確認它確實存在、而且是字串型別，用 `expect.any(String)` 來表示「這裡應該是某個字串，值是什麼我不在乎」：

```javascript
it('should create a person with a first name and last name', () => {
    const person = new Person('Grace', 'Hopper');

    expect(person).toEqual({
        id: expect.any(String),
        firstName: 'Grace',
        lastName: 'Hopper',
    });
});
```

這樣一來，`toEqual` 依然會確認 `firstName`、`lastName` 是不是精確符合預期，同時也確認 `id` 這個屬性確實存在、型別正確，只是不去比對它實際的字串內容。

## 只驗證真正在乎的部分：前綴對不對

如果連「型別是字串」都覺得不夠精準，還想進一步確認這個 `id` 至少符合預期的格式，例如一定要以 `person-` 開頭，可以改用 `expect.stringMatching`，帶入一個正規表示式：

```javascript
it('should create a person with a first name and last name', () => {
    const person = new Person('Grace', 'Hopper');

    expect(person).toEqual({
        id: expect.stringMatching(/^person-/),
        firstName: 'Grace',
        lastName: 'Hopper',
    });
});
```

這樣測試只會驗證 `id` 是不是以 `person-` 開頭，後面接的隨機字串完全不管，只要前綴符合，程式碼的行為就算是正確的。如果日後不小心把前綴改掉，或忘了加上前綴，這個測試依然抓得出來；但每次執行都不同的隨機部分，就不會讓測試無端失敗。

這正是這幾種寫法背後共通的精神：測試該驗證的是真正在乎、也真正能控制的部分，而不是強迫自己去比對一個本來就注定每次都不一樣的值。

## 複習

### 處理測試裡非決定性的部分，有哪三種方式？

一是不在乎那些隨機的部分，二是讓隨機的部分變得不隨機，三是主動控制它什麼時候該隨機

### UUID 在軟體測試裡帶來什麼樣的挑戰？

UUID 是隨機產生的，這讓測試裡的精確比對變得困難，因為每次執行產生的 ID 都不一樣

### 該怎麼測試一個帶有隨機產生 ID 的物件？

驗證前綴、必填欄位、結構這些可預期的部分，同時忽略 ID 裡真正隨機的那段內容

### 驗證一個帶有隨機 ID 的物件時，該關注哪些關鍵重點？

確認 ID 有正確的前綴、確認姓名這類必填欄位的值是正確的，並確認 ID 本身是字串型別

### 有哪三個常見的例子，屬於會讓測試變困難的非決定性數值？

當下的日期時間、亂數，以及 UUID 這類隨機產生的字串。這些值每次執行都會改變，讓斷言很難預先寫出一個固定值

## 小測驗

<details>
<summary>測試像 UUID 這種非決定性元素的程式碼時，主要的挑戰是什麼？</summary>
隨機產生的值會讓測試結果變得不一致
</details>

<details>
<summary>在這篇示範裡，測試帶有隨機 ID 的物件時，用了什麼驗證技巧讓測試能通過、同時忽略隨機的部分？</summary>
只驗證像前綴這類非隨機的部分，忽略隨機產生的部分
</details>

<details>
<summary>下列何者是程式碼中非決定性行為的例子？</summary>
當下的日期時間
</details>

<details>
<summary>在測試裡，`expect.stringMatching()` 可以用來做什麼？</summary>
驗證一個字串是否符合特定的模式，或是否以某個前綴開頭
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
