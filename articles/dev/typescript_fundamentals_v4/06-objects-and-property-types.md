---
title: 'TypeScript 物件型別與多餘屬性檢查：以 printCar 函式解析選擇性屬性與型別窄化'
description: '用 car 物件與 printCar 函式，說明如何用大括號定義物件型別、用問號標記選擇性屬性，並示範型別守衛與窄化如何讓 number | undefined 在條件式判斷後安全變回 number，最後解釋多餘屬性檢查為何只針對物件字面量生效，以及用 spread operator 繞過檢查的實際效果。'
date: 2026-08-31
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 6
chapter: 'Objects, Arrays and Tuples'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - ObjectTypes
    - OptionalProperties
    - TypeGuards
    - Narrowing
    - ExcessPropertyChecking
    - SpreadOperator
---

# TypeScript 物件型別、選擇性屬性與型別窄化：以 printCar 函式為例解析

## 定義物件型別：大括號加冒號

在 JavaScript 裡建立一台車的物件很直覺，`make`、`model`、`year` 三個屬性，前兩個是字串，最後一個是數字。到了 TypeScript，把滑鼠移到這個變數上，就能看到 TypeScript 已經替它推斷出對應的物件型別。

物件型別的寫法跟物件本身很像，一樣用大括號包起來，關鍵差異在冒號：

```ts
let car: {
    make: string;
    model: string;
    year: number;
};
```

冒號代表這裡不是在賦值或初始化屬性，而是單純描述這個欄位允許的型別，這跟 [[03-variable-declarations|前面章節]] 看過的 `let endTime: Date` 是同一套語法，只是這次描述的是一整個物件的形狀。欄位之間可以用逗號分隔，也可以用分號分隔，選哪一種純粹看你在專案裡慣用的風格。

## 把物件型別用在函式參數上

可以直接把物件型別套用在函式參數上：

```ts
function printCar(car: { make: string; model: string; year: number }) {
    console.log(`${car.make} ${car.model} (${car.year})`);
}
```

在 `printCar` 函式裡打 `car.` 時，編輯器的自動完成會準確列出 `make`、`model`、`year` 這幾個欄位，並且分別標示對應的型別。這代表 TypeScript 能保護函式內部安全地使用這些屬性，如果嘗試存取一個型別裡沒有定義的屬性（例如 `car.flatTires`），TypeScript 會直接報錯，因為車子的型別描述裡從來沒有「爆胎數量」這個欄位。

## TypeScript 會追蹤變數是否已被賦值

如果宣告了 `car` 這個變數但還沒賦值就呼叫 `printCar(car)`，TypeScript 會報錯，提示這個變數在賦值前就被使用了。只有實際把 `car` 指派成一個符合型別的物件之後，函式呼叫才會通過型別檢查。這說明 TypeScript 不只檢查型別本身合不合適，也會追蹤變數有沒有被正確初始化。

## 選擇性屬性：不是所有車都需要充電電壓

假設要替物件型別加上一個充電電壓欄位，用來描述電動車的快充或慢充規格。但不是所有車子都是電動車，汽油車不會有充電電壓這個概念，所以這個欄位得標成「可有可無」。做法是在欄位名稱後面加上問號：

```ts
function printCar(car: { make: string; model: string; year: number; chargeVoltage?: number }) {
    let str = `${car.make} ${car.model} (${car.year})`;
    if (typeof car.chargeVoltage !== 'undefined') {
        str += `// ${car.chargeVoltage}v`;
    }
    console.log(str);
}
```

把滑鼠移到 `chargeVoltage` 上，會看到它的型別是 `number | undefined`，這個直式的符號代表「聯集」（union），也就是這個欄位的值可能是 `number`，也可能是 `undefined`，兩者擇一。

## 型別守衛與窄化：條件判斷之後型別會變得更精確

程式裡用 `typeof car.chargeVoltage !== 'undefined'` 這個條件式，本身在一般 JavaScript 裡就能正常運作，但 TypeScript 額外理解了這個條件跟 `chargeVoltage` 型別之間的關聯，這種帶有型別意涵的條件判斷，就叫做型別守衛（type guard）。

進入這個條件式的區塊之後，`chargeVoltage` 的型別會從 `number | undefined` 變成單純的 `number`，這個現象叫做窄化（narrowing），意思是在這個程式碼分支裡，型別的允許範圍變得更具體了。用前面提過的集合角度來看：`number | undefined` 代表「所有數字加上 `undefined`」這個集合，一旦條件式排除了 `undefined` 的可能性，剩下的就是「所有數字」這個子集，範圍變小了，但也因此讓程式可以放心把這個值當成 `number` 使用。

這個窄化機制在函式參數上一樣適用。如果 `printCar` 的參數 `car` 本身也是可有可無的（型別是物件型別本身跟 `undefined` 的聯集），直接呼叫 `car.make` 會被 TypeScript 擋下來，因為 `car` 有可能根本不存在。這時候可以在函式一開始加上一個提早返回的判斷：

```ts
function printCar(car?: { make: string; model: string; year: number }) {
    if (!car) return;
    console.log(`${car.make} ${car.model} (${car.year})`);
}
```

`if (!car) return` 同樣是一個型別守衛，TypeScript 知道一旦執行到這行之後的程式碼，`car` 就一定不是 `undefined`，因此後面存取 `car.make` 不需要再加問號，型別已經窄化成確定存在的物件。

## 多餘屬性檢查：物件字面量不能塞多餘的欄位

如果直接呼叫 `printCar` 時，在物件字面量裡多塞一個型別沒有定義的欄位（例如 `color: 'red'`），TypeScript 會報錯，提示這個物件字面量只能指定型別裡已知的屬性，`color` 不在 `printCar` 參數型別的定義裡：

```ts
printCar({
    make: 'Tesla',
    model: 'Model 3',
    year: 2020,
    color: 'red', // 錯誤：color 不在型別定義中
});
```

即使 `make`、`model`、`year` 這幾個必要欄位都給齊了，`chargeVoltage` 也不是必填，TypeScript 還是會拒絕這個多出來的 `color` 欄位。原因在於這是一個物件字面量，直接寫在呼叫的當下，`printCar` 函式內部完全沒有辦法碰到 `color` 這個屬性，因為函式參數的型別裡根本沒有宣告它。多寫這個欄位沒有任何意義，TypeScript 才會主動把它擋下來，避免開發者誤以為這個欄位有作用。

如果先把這個物件賦值給一個變數，再把變數傳進 `printCar`，TypeScript 就不會抱怨了：

```ts
const myCar = { make: 'Tesla', model: 'Model 3', year: 2020, color: 'red' };
printCar(myCar);
```

差別在於這裡多了一個變數作用域，`color` 屬性在這個作用域裡是可以被存取到的（即使 `printCar` 內部用不到），它不再是一個「幾乎確定用不到、可以安全刪除」的多餘欄位。

## 用 spread operator 也能繞過檢查，但原理不同

有學員問，如果改用展開運算子（spread operator）把物件展開後傳進函式，是不是也能避開多餘屬性檢查？答案是確實能繞過，但背後原理跟前面「先賦值給變數」不一樣：

```ts
const carDetails = { make: 'Tesla', model: 'Model 3', year: 2020, color: 'red' };
printCar({ ...carDetails });
```

TypeScript 一樣不會對這段程式碼發出多餘屬性的警告，但這不代表 `color` 就能在 `printCar` 內部被安全存取到，它一樣是碰不到的。真正的原因是這種情況已經不是單純的物件字面量了，展開運算子背後牽涉到更動態的組裝行為，甚至可以想像成展開一個函式呼叫回傳的物件，要精準分析「哪個欄位真的用得到、哪個用不到」，需要比單純檢查字面量複雜得多的靜態分析。TypeScript 目前選擇不對這種較複雜的情況做多餘屬性檢查，但這不代表這種寫法背後沒有跟原本一樣的問題存在。

## 複習

### 如何在 TypeScript 中定義一個物件型別？

用大括號包住欄位定義，每個欄位名稱後面接冒號跟型別，欄位之間可以用逗號或分號分隔。

### 物件型別裡的問號（`?`）代表什麼意思？

代表這個屬性是選擇性的，可能存在也可能不存在，型別會變成「原本的型別或 `undefined`」的聯集。

### 什麼是型別守衛？

型別守衛是一個帶有型別意涵的條件判斷，這個條件在一般 JavaScript 裡就能正常運作，但 TypeScript 會額外理解它跟某個值的型別之間的關聯，並依此在對應的程式碼分支裡調整型別範圍。

### 什麼是型別窄化？

型別窄化是指在某個程式碼分支裡，一個值的型別範圍變得更具體、更小的過程，例如把 `number | undefined` 排除掉 `undefined` 的可能性後，範圍窄化成只剩 `number`。

### 為什麼 TypeScript 會對物件字面量做多餘屬性檢查？

因為物件字面量是直接寫在呼叫當下的值，如果多寫了型別裡沒有定義的欄位，接收端的函式參數型別根本沒有宣告這個欄位，永遠不可能存取到它，這個欄位注定是多餘的，TypeScript 因此主動擋下來提醒開發者。

## 小測驗

<details>
<summary>直式符號（|）在 TypeScript 型別標註中代表什麼意思？</summary>
型別聯集，代表值可能是這幾個型別中的其中一種
</details>

<details>
<summary>TypeScript 的多餘屬性檢查目的是什麼？</summary>
避免在物件字面量裡加入型別中未定義的多餘屬性
</details>

<details>
<summary>型別窄化在 TypeScript 中代表什麼意思？</summary>
在某個程式碼分支裡讓型別的範圍變得更具體、更小
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
