---
title: 'TypeScript 結構型別 vs 名義型別：printCar 為什麼不管物件從哪裡來'
description: '從型別等價性的集合觀點出發，比較靜態/動態型別與結構型別/名義型別這兩組常被混淆的分類，用 Java 對比 TypeScript，說明為什麼 printCar 函式能接受 Car、Truck 甚至任意物件、額外屬性也不影響相容性，並看 instanceof 如何在結構型別系統裡模擬名義型別的檢查方式。'
date: 2026-09-02
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 9
chapter: 'Objects, Arrays and Tuples'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - StructuralTyping
    - NominalTyping
    - TypeSystem
    - TypeEquivalence
    - DuckTyping
    - InstanceofOperator
---

# TypeScript 結構型別 vs 名義型別：printCar 為什麼不管物件從哪裡來

## 型別檢查的本質：型別等價性

型別檢查會發生在三個地方：把值賦值給變數、把引數傳給函式、函式實際回傳值跟宣告的回傳型別做比對。這三種情境問的其實是同一個問題：型別 y 是否等價於型別 x？更精確地說，是「型別 y 是否落在型別 x 的範圍內」。

用集合的角度來看，這其實是在問「y 代表的集合，是不是 x 代表的集合的子集」。如果一個函式宣告回傳 `number`，而它總是回傳 `43`，這沒問題，因為 `43` 落在「所有數字」這個集合裡。這也呼應了 [[05-functions-and-return-types|前面]] 討論過的例子：一個函式宣告回傳字串陣列，卻在某條分支回傳了 `undefined`，這就會失敗，因為 `undefined` 這個值不存在於「所有可能的字串陣列」這個集合裡，兩者完全沒有交集。

## 分類型別系統的兩種角度：靜態/動態，結構/名義

型別系統可以用不同角度分類，這裡先看第一組：**靜態（static）與動態（dynamic）**。動態型別大致就是 JavaScript 的運作方式，也常被稱為鴨子型別（duck typing）：程式會盡量利用手邊的值往下執行，只要某個功能可以用，就直接拿來用，「如果它叫起來像鴨子，那就把它當鴨子看待」，一切等到執行期才見真章。靜態型別則是明確寫在程式碼裡、建置期就能被分析出來的型別，這正是 TypeScript 加在 JavaScript 之上的東西：寫下 `: string`、宣告函式回傳 `number`，這些都是靜態型別，「靜態」代表這些型別在程式執行過程中不會改變。

- 常見的靜態型別語言：Java、C#、C++
- 常見的動態型別語言：Python、Ruby、Perl、PHP（雖然 Ruby 有 Sorbet、Python 有 TypeShed 這類替動態語言補上型別檢查的工具，但它們核心仍是動態型別語言）

另外還常聽到「強型別（strong）」與「弱型別（weak）」這組說法，但這兩個詞其實沒有業界公認的明確定義，充其量只是大家籠統地把靜態型別語言講得比較「明確」，因此感覺上比較「強」，但這不是一個能嚴謹討論型別系統的分類方式。

## 名義型別系統：看你從哪個建構子來的

接下來是這一節真正的重點：**結構型別（structural）與名義型別（nominal）**。用一段 Java 程式碼當例子：定義一個有 `make`、`model`、`year` 三個欄位的 `Car` 類別，再定義一個 `CarChecker` 類別，裡面有個方法接受一個 `Car` 執行個體並回傳字串。

```java
public class Car {
    public String make;
    public String model;
    public int year;
}

public class CarChecker {
    public static String checkCar(Car car) {
        // ...
    }
}

Car car = new Car();
CarChecker.checkCar(car);
```

在 Java 這種名義型別系統裡，型別等價性檢查問的是：「你是不是 `Car` 這個類別的執行個體？」重點完全在於這個值是從哪個建構子產生出來的，跟它實際擁有哪些屬性無關。哪怕另一個物件擁有一模一樣的 `make`、`model`、`year` 屬性，只要它不是用 `Car` 的建構子生出來的，Java 就不會把它當成 `Car`。

## TypeScript 的結構型別系統：形狀對了就行

TypeScript 的型別系統則是結構型別。

```ts
class Car {
    make: string;
    model: string;
    year: number;
}

class Truck {
    make: string;
    model: string;
    year: number;
}

function printCar(car: { make: string; model: string; year: number }) {
    console.log(`${car.make} ${car.model} (${car.year})`);
}

printCar(new Car());
printCar(new Truck());
printCar({ make: 'Honda', model: 'Accord', year: 2017 });
```

定義一個 `Car` class 跟一個 `Truck` class，兩者之間沒有任何繼承或親緣關係，`printCar` 函式一樣樂於接受 `Car` 的執行個體、`Truck` 的執行個體，甚至是單純用物件字面量建立、帶有正確 `make`、`model`、`year` 欄位的普通物件。函式在意的只有「這個引數是否符合我要求的形狀」，完全不管這個值是從哪個建構子來的，`Car` 跟 `Truck` 之間沒有共同的父類別也無所謂。

這裡的「形狀」不只限於資料屬性，也可以包含方法（本質上仍是一種屬性，只是值剛好是函式），甚至可以要求物件具備索引簽名。TypeScript 純粹比較兩個結構是否相容，完全不考慮這個物件的出身。這種彈性是必要的，因為 TypeScript 的目標是把型別疊加在既有的 JavaScript 之上，而市面上大量的 JavaScript 程式碼本來就需要極大的彈性才能被描述成型別，這也是為什麼幾乎任何 JavaScript 能寫出來的東西，都能找到辦法替它寫出對應的型別。

用集合角度重新看 `printCar` 的參數型別：它代表的集合是「所有擁有字串 `make`、字串 `model`、數字 `year` 屬性的值」，只要能在 JavaScript 裡創造出符合這個條件的東西，`printCar` 都樂意接受。`Car` 的所有可能執行個體、`Truck` 的所有可能執行個體，都只是這個更大集合底下的子集，每一個都滿足這個條件，所以都能通過型別檢查。這正好回應了前面「型別等價性」的問題：y 是否等價於 x，其實就是 y 代表的集合是不是 x 代表的集合的子集。

## 多出來的屬性完全不影響相容性

有學員問，如果物件的屬性比函式要求的還多，還能正常運作嗎？答案是可以，只要必要的屬性都齊全且型別正確，多出來的屬性完全不影響。

```ts
class Car {
    make: string;
    model: string;
    year: number;
    isElectric: boolean;
}

class Truck {
    make: string;
    model: string;
    year: number;
    towingCapacity: number;
}

printCar(new Car()); // isElectric 用不到，但不影響
printCar(new Truck()); // towingCapacity 用不到，但不影響
```

例如 `Car` 額外多了 `isElectric` 屬性，`Truck` 多了 `towingCapacity` 屬性，這些都能直接通過 `printCar` 的檢查，函式根本不在乎這些用不到的額外欄位。

這跟 [[06-objects-and-property-types|多餘屬性檢查]] 略有關聯但情境不同：多餘屬性檢查針對的是直接寫在呼叫當下的物件字面量，因為那些多出來的欄位注定用不到；但如果這個值是先透過變數、或是像 `Car`、`Truck` 這種執行個體傳進來的，TypeScript 完全不會計較物件身上到底掛了多少額外屬性，哪怕掛了一千個用不到的屬性也無所謂，只要必要的欄位都符合要求就好。

這種特性讓開發者不需要事先規劃一套完整的物件繼承體系，把程式裡所有東西都塞進某個類別階層，才能讓型別系統理解它們的關係。可以反過來思考：只要問「要安全地印出這筆資料，我需要它具備哪些欄位」，直接針對這個最小需求定義型別即可，不用管這個值實際上是從哪裡建立出來的。

## 結構型別系統可以模擬名義型別的行為

有學員好奇，`typeof` 是不是就是用來取得類別名稱的方式。這裡要澄清，TypeScript 裡的 `typeof` 語意跟 JavaScript 完全一樣，並不是用來檢查類別名稱的工具；如果想確認一個值是不是某個建構子產生的執行個體，應該用的是 `instanceof`，例如判斷一個值是否為 `Date` 的執行個體：

```ts
function isDate(value: unknown): value is Date {
    return value instanceof Date;
}
```

值得注意的是，`instanceof` 這種寫法本質上正是名義型別系統的做法：它問的不是「這個值有沒有符合某組屬性要求」，而是「這個值是不是從某個特定建構子產生的」。這說明結構型別系統其實涵蓋了名義型別系統能做到的所有事情，可以說結構型別系統是能力範圍更大的超集，在需要的時候依然能用 `instanceof` 模擬出名義型別的檢查方式，同時保留「只看形狀、不看出身」這種更大彈性的預設選項。

## 複習

### TypeScript 做型別檢查時，問的核心問題是什麼？

問的是型別等價性：型別 y 是否落在型別 x 代表的範圍內，也就是 y 所代表的值的集合，是不是 x 所代表的值的集合的子集。

### 靜態型別與動態型別的差異是什麼？

靜態型別是明確寫在程式碼裡、建置期就能被分析出來的型別，例如 TypeScript 的型別標註；動態型別則是像 JavaScript 這樣，在執行期盡量利用手邊的值往下執行，也就是俗稱的鴨子型別。

### 名義型別系統與結構型別系統的核心差異是什麼？

名義型別系統（例如 Java）只看物件是不是某個特定建構子或類別產生的執行個體；結構型別系統（例如 TypeScript）只看物件的結構跟屬性是否符合要求，完全不管這個物件實際上是從哪裡建立出來的。

### 如果一個物件擁有的屬性比函式要求的還多，還能通過結構型別的檢查嗎？

可以。只要必要的屬性都齊全、型別正確，物件多出來的其他屬性完全不影響型別相容性，函式根本不會在意這些用不到的額外欄位。

## 小測驗

<details>
<summary>靜態型別的特徵是什麼？</summary>
型別明確寫在程式碼裡，並且能在建置期就被分析出來
</details>

<details>
<summary>在 TypeScript 的結構型別系統中，如果物件擁有的屬性比要求的還多，會發生什麼事？</summary>
只要必要的屬性都符合要求，多餘的屬性會被忽略，不影響型別相容性
</details>

<details>
<summary>在像 Java 這樣的名義型別系統裡，決定型別等價性的依據是什麼？</summary>
這個物件是不是某個特定具名類別的執行個體
</details>

<details>
<summary>下列哪些程式語言是動態型別語言的例子？</summary>
Python 和 Ruby
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
