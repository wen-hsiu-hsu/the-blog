---
title: '強制轉型的實際案例：你已經在用它了'
description: '從實際程式碼出發，說明強制轉型早已存在於日常開發中：模板字串、+ 運算子、一元 +、if 條件判斷，背後都是抽象操作在運作。整理字串、數字、boolean 三類轉型的常見陷阱，以及 Kyle Simpson 對顯式與隱式轉型的使用立場。'
date: 2026-06-01
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 14
chapter: 'Coercion'
tags:
    - JavaScript
    - frontendMasters
    - deepJavaScriptFoundationsV3
    - TypeCoercion
---

# 強制轉型的實際案例：你已經在用它了

> 本文延續對四個核心抽象操作（`ToPrimitive`、`toString`、`ToNumber`、`ToBoolean`）的介紹，進入實際程式碼的場景。這一節的核心論點是：無論你是否意識到，強制轉型已經存在於你的日常程式碼中。理解它，遠比迴避它更有價值。

## 數字轉字串：你已經在用隱式轉型

### 模板字串（Template Literals）

```javascript
var numStudents = 16;
console.log(`There are ${numStudents} students.`);
// "There are 16 students."
```

`numStudents` 是數字，放入模板字串後被隱式地呼叫 `toString` 轉為字串。這是隱式強制轉型，幾乎每個人都在用。

### `+` 運算子：字串優先

規格書明確定義：`+` 運算子在任一側為字串時，優先做字串拼接，並對另一側呼叫 `ToString` 抽象操作：

```javascript
var msg1 = 'There are ';
var numStudents = 16;
var msg2 = ' students.';
console.log(msg1 + numStudents + msg2);
// "There are 16 students."（16 被隱式轉為字串）
```

加上空字串是常見的「轉字串技巧」，本質上也是隱式強制轉型：

```javascript
numStudents + ''; // "16"
```

### 顯式轉字串的選項

若要明確表達轉型意圖，有幾種方式，語意清晰程度由低到高：

```javascript
[numStudents].join(''); // "16"（可行但奇怪，不推薦）
numStudents.toString(); // "16"（呼叫方法，但原始值本身沒有方法，背後仍有隱式 Boxing）
String(numStudents); // "16"（最推薦：明確、語意清楚）
```

`String()` 函式（不加 `new`）是 Kyle Simpson 偏好的顯式轉型方式。

## 字串轉數字：表單輸入是常見場景

從 DOM 表單元素取得的值永遠是字串，直接用於數學運算會出問題：

```javascript
function addAStudent(numStudents) {
    return numStudents + 1;
}
addAStudent(studentsInputElem.value); // "161"  OOPS！（字串拼接）
```

解決方式：顯式轉為數字

```javascript
// 方式一：一元 + 運算子（隱式，呼叫 ToNumber）
addAStudent(+studentsInputElem.value); // 17

// 方式二：Number() 函式（推薦，語意明確）
addAStudent(Number(studentsInputElem.value)); // 17
```

一元 `+` 會觸發 `ToNumber` 抽象操作。`Number()` 函式效果相同，但可讀性更高。

### `-` 運算子：只為數字定義

減法運算子不支援字串，遇到字串會自動觸發 `ToNumber`：

```javascript
function kickStudentOut(numStudents) {
    return numStudents - 1;
}
kickStudentOut(studentsInputElem.value); // 15（字串被隱式轉為數字）
```

這也是隱式強制轉型，只是因為 `-` 沒有字串語意，結果通常符合預期，所以常被忽略。

## Boolean 強制轉型：角落案例比你想的多

### 字串的 Boolean 轉型陷阱

```javascript
if (studentsInputElem.value) {
    numStudents = Number(studentsInputElem.value);
}

Boolean(''); // false（空字串，符合預期）
Boolean('  \t\n'); // true   OOPS！（只有空白的字串是 truthy）
```

用字串是否非空來做條件判斷，看似合理，但只包含空白字元的字串會是 truthy，這是一個常見的 bug 來源。

### 數字的 Boolean 轉型陷阱

```javascript
while (newStudents.length) {
    enrollStudent(newStudents.pop());
}
```

用 `length` 的 truthy/falsy 來控制迴圈是常見做法，但當 `length` 是 `NaN` 時（雖不常見，但可能發生），`NaN` 也是 falsy，行為可能不如預期。更明確的寫法：

```javascript
while (newStudents.length > 0) { ... }
```

這樣不僅更防禦性，語意也更清楚：「繼續直到沒有學生」，而非「繼續直到長度是 truthy」。

### 物件與 null/undefined 的 Boolean 轉型：合理的使用場景

```javascript
var workshop = getRegistration(student);

if (workshop) {
    console.log(`Welcome ${student.name} to ${workshop.name}.`);
}

Boolean(undefined); // false
Boolean(null); // false
Boolean({}); // true
```

當判斷的目的是「這個值是否已被設定」——也就是區分 `null`/`undefined` 與實際物件，隱式 Boolean 轉型是合理且清晰的。Kyle Simpson 認為這是他最願意接受隱式轉型的場景。

### 顯式 vs 隱式：不是好壞，而是意圖

Kyle Simpson 的核心立場不是「永遠顯式」，而是：

- **字串與數字**：角落案例多，建議顯式（`String()`、`Number()`）
- **Boolean 的物件 vs null/undefined 判斷**：隱式可接受，意圖清晰
- **隱式強制轉型本身無罪**，問題在於使用者不理解它的運作機制

```javascript
// 顯式：明確表達意圖
if (!!studentsInputElem.value) { ... }      // 雙重否定強制轉 boolean
if (studentsInputElem.value !== "") { ... } // 更語意化

// 隱式但合理：物件存在性檢查
if (workshop) { ... }
```

## 小結

強制轉型不是可以迴避的黑魔法，它就存在於模板字串、`+` 運算子、`if` 條件判斷等日常程式碼中。理解各個抽象操作的觸發時機與行為，才能在使用這些隱式轉型時做出有意識的選擇，而不是在 bug 出現時茫然不知所措。

## 複習

### 對字串和數字使用 `+` 運算子時會發生什麼？

`+` 運算子優先做字串拼接，導致非字串的值透過 ToString 抽象操作被強制轉型為字串。

### 將數字顯式轉換為字串的兩種方式是什麼？

1. 使用 toString() 方法
2. 使用 String() 函式（推薦方式）

### 對字串使用一元 `+` 運算子時會發生什麼？

它會觸發 ToNumber 抽象操作，將字串轉換為數字。若字串是合法的數值表示，會得到對應數字；空字串會變成 0。

### boolean 強制轉型對不同型別的值有什麼行為？

空字串是 falsy，非空字串是 truthy；物件是 truthy；null 和 undefined 是 falsy。

### 對不同型別使用 `-` 運算子時會發生什麼？

`-` 運算子只為數字定義，遇到非數值會觸發 ToNumber 抽象操作將其轉換為數字。

## 小測驗

<details>
<summary>一元 + 運算子在將值轉換為數字時，會觸發哪個抽象操作？</summary>
ToNumber
</details>

<details>
<summary>對字串和另一個值使用 + 運算子時，會發生什麼？</summary>
發生帶有型別強制轉型的字串拼接
</details>

<details>
<summary>空字串被強制轉換為數字時，結果是什麼？</summary>
變成 0
</details>

<details>
<summary>將值顯式轉換為字串，哪個方法是首選？</summary>
String() 函式
</details>

<details>
<summary>只包含空白字元的字串，其 boolean 值是什麼？</summary>
永遠是 true
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記
