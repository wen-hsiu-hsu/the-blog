---
title: 'TypeScript interface：extends 建立繼承鏈，implements 定義類別必須遵守的契約'
description: '示範用 interface 描述物件形狀、用 extends 建立繼承鏈，用 implements 讓 class 遵守 interface 定義的契約，說明為何 interface 只能描述物件形狀，這個限制反而讓它天生跟 implements 相容，比含有聯集型別的 type alias 更適合當類別契約用。'
date: 2026-09-04
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 14
chapter: 'Interfaces and Type Aliases'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - Interface
    - TypeAlias
    - Subtyping
    - HeritageClauses
---

# TypeScript interface：extends 建立繼承鏈，implements 定義類別必須遵守的契約

> [[13-type-alias|前面]] 用型別別名替 `Amount` 這個物件型別取了名字。這一節改用 interface 做同樣的事，並看看 interface 專屬的兩個特性：只能描述物件形狀，以及能用 `extends`、`implements` 表達繼承關係。

## interface 語法：跟型別別名很像，但沒有等號

interface 是 TypeScript 提供的另一種替型別命名的方式，用同一個 `Amount` 範例重寫：

```ts
interface Amount {
    currency: string;
    value: number;
}

function printAmount(amt: Amount) {
    console.log(amt);
}
```

這個宣告方式跟型別別名的關鍵差異，是這裡沒有等號，寫上等號反而會是不合法的語法。這種寫法稱為 interface 宣告。

## interface 無法描述任何 TypeScript 型別，只能描述物件形狀

interface 沒辦法像型別別名那樣涵蓋 TypeScript 裡所有合法的型別。舉例來說，沒辦法直接在最外層用 interface 表達一個聯集型別：

```ts
interface MightBeNull {
    // 不能直接寫成 string | null
}
```

這個限制看起來像是缺點，但其實正好對應到 interface 存在的核心用途：inheritance（繼承）。

## extends：讓 interface 之間建立繼承鏈

TypeScript 支援兩種表達繼承關係的語法，稱為 heritage clause（繼承子句）：`extends` 跟 `implements`。先看 `extends`。

在一般 JavaScript 裡，`class` 可以用 `extends` 繼承另一個 `class`：

```js
class AnimalThatEats {
    eat(food) {
        // ...
    }
}

class Cat extends AnimalThatEats {
    meow() {
        return 'meow';
    }
}
```

interface 之間也可以用一模一樣的 `extends` 語法互相繼承，但要注意 interface 沒有函式主體，只是純粹的型別描述，不能像 `class` 那樣寫出方法的實作內容，也沒辦法用 `new` 建立實例：

```ts
interface Animal {
    isAlive(): boolean;
}

interface Mammal extends Animal {
    getFurOrHairColor(): string;
}

interface Hamster extends Mammal {
    squeak(): string;
}

function careForHamster(h: Hamster) {
    h.isAlive();
    h.getFurOrHairColor();
    h.squeak();
}
```

`Hamster` 繼承自 `Mammal`，`Mammal` 又繼承自 `Animal`，`careForHamster` 函式裡因此能存取這三層 interface 全部加起來的方法。心智模型很直接：`class` 可以繼承 `class`，`interface` 也可以繼承 `interface`，`extends` 用在「同類的東西繼承同類的東西」這種情境。

## implements：讓 class 遵守 interface 定義的契約

`implements` 則是讓 `class` 去實作一個 `interface`：

```ts
interface AnimalLike {
    eat(food: string): void;
}

class Dog implements AnimalLike {
    bark() {
        return 'woof';
    }
}
```

如果 `Dog` 沒有實作 `eat` 方法，TypeScript 會直接報錯，訊息會指出 `Dog` 錯誤地實作了 `AnimalLike` 這個 interface，因為 `AnimalLike` 要求的 `eat` 屬性缺失了。這正說明了 interface 代表的意義：它是一份 `class` 必須遵守的契約，只要宣告 `implements` 某個 interface，就得把裡面要求的每一項都具體實作出來。

## 為什麼 interface 不能描述任意型別

回到前面提過的限制：interface 沒辦法拿來描述任意型別，只能是一個物件形狀的結構。試著寫出「一個 class 實作了 `null`」這種東西完全沒有意義，因為根本無法想像一個 class 的實例可以是 `null`。這也解釋了為什麼 interface 天生就被限制成物件型別：`class` 的實例本質上必須是物件，interface 描述的正是「一個物件形狀」，這兩者的要求恰好完全對齊。

## 把 extends 與 implements 組合起來使用

同一個 class 可以同時使用 `extends` 繼承一個 base class，再用 `implements` 實作多個 interface：

```ts
class LivingOrganism {
    isAlive() {
        return true;
    }
}

interface AnimalLike {
    eat(food: string): void;
}

interface CanBark {
    bark(): string;
}

class Dog2 extends LivingOrganism implements AnimalLike, CanBark {
    bark() {
        return 'woof';
    }
    eat(food: string) {
        // ...
    }
}
```

這裡有幾個規則值得留意：一個 class 最多只能有一個 `extends`（TypeScript 不支援真正的多重繼承），但可以有任意多個 `implements`，而且 `implements` 後面列出的必須全部都是 interface。不管一個方法或屬性是來自 base class（透過 `extends` 繼承而來），還是來自某個 interface 定義的要求，最終攤平來看，這個 class 的實例上到底具備哪些方法跟屬性，才是決定它是否滿足所有契約的依據。

有一個細節值得澄清：`implements` 後面雖然通常放 interface，但技術上也可以放一個 class 的名字，因為每個 `class` 在型別系統裡其實同時是兩個東西：一個值（可以呼叫 `new` 的建構子），跟一個 interface（描述它的實例長什麼樣子）。放進 `implements` 清單時，用到的正是這個 class 的「interface 那一面」，只借用它的型別形狀，不會像 `extends` 那樣連實際的方法內容也一併繼承過來。舉例來說，如果把上面的 `LivingOrganism` 從 `extends` 改放進 `implements`：

```ts
class Dog2 implements LivingOrganism, AnimalLike, CanBark {
    bark() {
        return 'woof';
    }
    eat(food: string) {
        // ...
    }
}
```

這時候 TypeScript 會報錯說 `isAlive` 缺失，因為 `implements` 只檢查 `Dog2` 的實例形狀有沒有符合 `LivingOrganism` 要求的方法簽章，不會把 `LivingOrganism` 原本寫好的 `isAlive` 實作繼承過來，`Dog2` 得自己重新寫一份才能通過檢查。這跟真正用 `extends` 拿到的物件導向繼承（沿著原型鏈找得到方法本體）完全是兩回事，這部分屬於更進階的細節，這裡先點出兩者的差異即可。

## 把重複出現的 interface 組合，也提取出一個新名字

如果發現同一組 interface 常常成群一起被 `implements`，也可以透過 `extends` 把它們合併成一個新的 interface：

```ts
interface DogLike extends AnimalLike, CanBark {}

class Dog3 implements DogLike {
    bark() {
        return 'woof';
    }
    eat(food: string) {
        // ...
    }
}
```

這樣做的價值在於，之後任何函式如果只在意「這個東西是不是像狗一樣的東西」，可以直接針對 `DogLike` 這個統一的名字撰寫，而不用一一列出一長串 interface。這種「只保留真正需要的最小介面」的思路，在 TypeScript 內建的 Promise 型別上也看得到：`Promise` 這個 interface 本身包含 `.then`、`.catch`，但另外還定義了一個更精簡的 `PromiseLike`，只要求具備 `.then`。如果某段程式碼只需要能被 `await`，並不在意有沒有 `.catch`，就可以只依賴 `PromiseLike`，不管使用的是原生 `Promise`，還是某個第三方函式庫提供的、形狀相容的類似物件，都能互換使用。這正是 [[09-structural-vs-nominal-typing|結構型別系統]] 帶來的彈性：只要形狀符合，不必在乎它究竟是從哪個建構子誕生的。

## interface 為什麼比含有聯集型別的 type alias 更適合搭配 implements

回到型別別名。如果一個 type alias 純粹描述物件形狀，拿去給 class 用 `implements` 完全沒問題：

```ts
type CanJump = {
    jumpToHeight(): number;
};

class Dog3 implements CanJump {
    eat(food: string) {
        // ...
    }
    jumpToHeight() {
        return 1.7;
    }
}
```

即使之後把回傳型別改成聯集型別：

```ts
type CanJump = {
    jumpToHeight(): number | [number, number];
};
```

`Dog3` 的 `jumpToHeight` 仍然只回傳一個 `number`，但因為 `number` 本來就落在「`number` 或一組座標」這個聯集代表的集合裡，一樣能通過 `implements` 檢查，不用真的把所有可能性都實作一輪。

但如果這個 type alias 本身在最外層就是一個聯集型別，且其中一個分支根本不是物件型別：

```ts
type CanBark2 = number | { bark(): void };

class Dog3 implements CanBark2 {
    // ...
}
```

拿去給 class 用 `implements` 就會直接出錯，TypeScript 會提示一個 class 只能實作一個物件型別，或是由「具備靜態成員的物件型別」組成的交集型別，`number` 不是物件型別，class 的實例不可能會是一個 `number`，這種寫法沒有意義。

這正是為什麼一旦確定某個型別是打算讓 class 用 `implements` 實作的契約，用 interface 定義會比用 type alias 更保險：interface 天生就被限制成只能描述物件形狀，這個限制正好精準對應「一個 class 實例能長什麼樣子」的規則，用 interface 幾乎不可能寫出跟 `implements` 不相容的定義；而 type alias 因為能承載任何型別，反而給了開發者足夠的空間，不小心寫出一個聯集型別、之後才在套用 `implements` 時才發現出了問題。

## 複習

### interface 跟型別別名在語法上最明顯的差異是什麼？

interface 宣告不使用等號，直接用 `interface 名稱 { ... }` 的語法描述物件形狀；型別別名則是 `type 名稱 = 型別定義`，等號右邊可以放任何合法的型別。

### `extends` 跟 `implements` 這兩個繼承子句，分別用在什麼場合？

`extends` 用在「同類的東西繼承同類的東西」，例如 class 繼承 class、interface 繼承 interface；`implements` 則是讓一個 class 去實作一個 interface 定義的契約，一個 class 最多只能有一個 `extends`，但可以有多個 `implements`。

### 為什麼 interface 沒辦法用來描述像聯集型別這種任意型別？

因為 interface 存在的核心用途是描述「一個 class 實例會長什麼樣子」，而 class 的實例本質上必然是物件，這個限制讓 interface 天生只能被用來描述物件形狀，這也剛好讓它跟 `implements` 這個語法完全相容。

### 為什麼用 interface 定義類別契約，會比用含有聯集型別的 type alias 更保險？

因為 interface 只能描述物件形狀，永遠不可能寫出跟 `implements` 不相容的定義；但 type alias 能承載任何型別，如果不小心讓它包含了非物件型別的聯集分支（例如 `number | { bark(): void }`），拿去給 class 用 `implements` 時就會直接出錯，因為 class 的實例不可能是一個 `number`。

## 小測驗

<details>
<summary>TypeScript 中使用 extends 關鍵字的主要目的是什麼？</summary>
讓 class 之間或 interface 之間可以互相繼承
</details>

<details>
<summary>要搭配 class 使用 implements 關鍵字時，建議用型別別名還是 interface 定義型別？</summary>
建議使用 interface
</details>

<details>
<summary>當一個 class 實作（implements）一個 interface 時，會發生什麼事？</summary>
這個 class 必須為 interface 要求的所有成員提供實作
</details>

<details>
<summary>相較於型別別名，TypeScript 的 interface 有什麼關鍵限制？</summary>
interface 沒辦法描述所有可能的 TypeScript 型別，例如最外層無法直接描述聯集型別
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
