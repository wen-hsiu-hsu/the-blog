---
title: 'TypeScript 存取修飾詞：private/protected 誠實制度、真正私有的 # 欄位與 readonly'
description: '用鎖住 car 序號欄位為例，示範 private、protected 這兩個只在編譯期生效的存取修飾詞如何搭配 getter 受控存取，編譯後即消失只是誠實制度，對比真正私有的 # 欄位如何做到執行期封裝、還能用私有欄位存在檢查當型別守衛判斷實例身分，最後看 readonly 如何鎖住欄位不被重新賦值。'
date: 2026-09-09
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 24
chapter: 'Classes & Type Guards'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - AccessModifiers
    - PrivateFields
    - TypeGuards
    - ReadonlyModifier
    - PrivateFieldPresenceCheck
---

# TypeScript 存取修飾詞：private/protected 誠實制度、真正私有的 # 欄位與 readonly

> [[23-class-fields-and-methods|前面]] 用類別欄位初始化器，讓 `serialNumber` 這個欄位在建立車輛時自動產生一個序號。這一節要解決一個明顯的問題：這個欄位目前完全開放，任何人都能隨手把 `car.serialNumber` 改成一個不合理的值。

## 動機：欄位不該被外部任意竄改

如果 `serialNumber` 是完全公開的欄位，代表任何拿到 `Car` 實例的人都能直接寫入一個新值，例如把它改成 `-123` 這種明顯不合理的序號。這種欄位需要被保護起來，只允許在 class 內部控制它的產生方式，外部只能讀取，不能任意寫入。

## private 與 protected：兩種不同範圍的封裝

TypeScript 提供 `private` 跟 `protected` 這兩個存取修飾詞，用來限制欄位跟方法能被誰看到：

```ts
class Car {
    make: string;
    model: string;
    year: number;
    private _serialNumber = Car.generateSerialNumber();

    protected get serialNumber() {
        return this._serialNumber;
    }

    constructor(make: string, model: string, year: number) {
        this.make = make;
        this.model = model;
        this.year = year;
    }
}
```

`private` 代表只有這個 class 自身的內部程式碼能存取，就連繼承這個 class 的子類別也看不到；`protected` 則稍微開放一點，除了 class 自身，子類別也能存取，但外部世界依然完全看不到。上面的寫法示範了一個常見的組合：把真正儲存資料的欄位（`_serialNumber`）標成 `private`，完全鎖起來，再額外定義一個 `protected` 的 getter（`serialNumber`），只回傳這個值、不提供任何寫入的管道，藉此開一道受控制的門，讓子類別能讀到序號，卻沒辦法直接竄改底層的欄位。

## static 成員一樣適用 private 與 protected

`private`、`protected` 也能套用在靜態欄位跟靜態方法上：

```ts
class Car {
    private static nextSerialNumber = 100;

    private static generateSerialNumber() {
        return Car.nextSerialNumber++;
    }
    // ...
}
```

可以把這件事想成一個二維的概念：一個維度是「靜態 vs 實例」，另一個維度是「private vs protected」。`private` 只限這個 class 自身，不管是靜態面還是實例面都一樣；`protected` 則對子類別開放，靜態面跟實例面也是同樣的邏輯。至於 `public`，是所有欄位跟方法預設的存取層級，即使不寫任何修飾詞，效果也等同於明確寫上 `public`。

## private 與 protected 只是編譯期的誠實制度

有一個關鍵限制必須認清：`private`、`protected` 這些修飾詞，本質上是 TypeScript 才有的語法，屬於前面提過的、只在建置期發揮作用的東西，一旦編譯成 JavaScript，這些修飾詞就會完全消失。這代表如果把程式碼部署到瀏覽器上，打開開發者工具的主控台，實際上依然能存取、甚至改寫那些標成 `private` 的欄位。這些修飾詞並沒有在執行期真正阻止任何人存取欄位，它們比較像是一種「誠實制度」，用來提醒開發團隊自己：這個欄位不該被外部直接使用，是一種表達意圖的方式，而不是真正的資安邊界。也因為如此，前面欄位取名 `_serialNumber` 而不是直接叫 `serialNumber`，底線前綴本身也是一種提醒：日後查看 log 或掛上除錯器看到這個值時，能一眼認出它本來就不該被外部使用。

## 真正私有的欄位：# 語法

JavaScript 語言本身後來加入了真正的私有欄位語法，用井字號（`#`）當前綴，TypeScript 也支援這個語法：

```ts
class Car {
    private static nextSerialNumber = 100;

    private static generateSerialNumber() {
        return Car.nextSerialNumber++;
    }

    make: string;
    model: string;
    year: number;
    #serialNumber = Car.generateSerialNumber();

    constructor(make: string, model: string, year: number) {
        this.make = make;
        this.model = model;
        this.year = year;
    }
}

const c = new Car('Honda', 'Accord', 2017);
c.#serialNumber; // 編譯錯誤：無法在 class 外部存取
```

跟前面的 `private` 關鍵字不同，`#serialNumber` 這種寫法在執行期是真正無法存取的，即使程式碼已經編譯成 JavaScript 並部署出去，也沒辦法單純打開瀏覽器主控台就讀到或改到這個欄位，這才是貨真價實的封裝。靜態欄位跟靜態方法一樣可以用同樣的井字號語法標成私有。不過需要留意的是，這種「私有」指的是封裝層面的私有，並不是資安意義上的機密：如果程式碼運行在使用者可以自由操作的環境（例如瀏覽器），使用者依然可以透過附加除錯器之類的手段接觸到這個欄位的值，所以不該把真正的機密資料存放在這裡。

## 私有欄位存在檢查：一種很有力的型別守衛

真正的私有欄位還有一個有趣的用途：可以拿它來判斷一個未知的值，究竟是不是這個 class 的實例。以替 `Car` 寫一個 `equals` 方法為例：

```ts
class Car {
    #serialNumber = Car.generateSerialNumber();
    // ...

    equals(other: unknown) {
        if (other && typeof other === 'object' && #serialNumber in other) {
            // 到這裡，TypeScript 已經把 other 窄化成 Car
            return other.#serialNumber === this.#serialNumber;
        }
        return false;
    }
}
```

這裡先用 `other &&`（排除 `null`、`undefined`）跟 `typeof other === 'object'` 這兩個型別守衛，確認 `other` 至少是一個物件，接著用 `#serialNumber in other` 做私有欄位存在檢查。重點在於：一個未知的值身上，之所以「能被偵測到擁有 `#serialNumber` 這個私有欄位」，唯一的可能性就是它真的是 `Car` 這個 class 的實例，因為私有欄位的存取權限只屬於定義它的那個 class，其他 class（就算剛好也取了一個叫 `serialNumber` 的欄位）根本沒有辦法讓 TypeScript 判斷出「這是同一個私有欄位」。正因如此，一旦這個檢查通過，TypeScript 就能有把握地把 `other` 的型別窄化成 `Car`，這個型別守衛的判斷依據幾乎跟名義型別系統一樣嚴謹，因為它檢查的其實是「這個值是不是從 `Car` 的建構子產生出來的」。

這也順帶說明了私有欄位一個容易被誤解的地方：私有欄位的存取權限，不是綁定在「某一個特定的實例」上，而是綁定在「這個 class」上。只要拿到另一個 `Car` 執行個體的參考，同一個 `Car` class 裡的程式碼，就能存取那個實例的私有欄位，不需要透過任何 getter，這也是為什麼 `equals` 方法能直接比較 `other.#serialNumber` 跟 `this.#serialNumber`。如果沒有這個特性，私有欄位的實用性會大打折扣，因為同一個 class 的不同實例之間，將完全沒辦法互相交換這些私有資料。

## readonly：讓欄位初始化後不能被重新賦值

最後一個存取相關的修飾詞是 `readonly`，可以搭配其他修飾詞一起用，讓一個欄位只能在初始化（或建構子內）賦值一次，之後任何嘗試修改的程式碼都會被 TypeScript 擋下來：

```ts
class Car {
    make: string;
    model: string;
    year: number;
    readonly #serialNumber = Car.generateSerialNumber();

    changeSerialNumber(num: number) {
        this.#serialNumber = num; // 編譯錯誤：readonly 屬性不能被重新賦值
    }
}
```

跟前面提過的其他 TypeScript 專屬語法一樣，`readonly` 同樣只在建置期有效力：如果程式碼裡有不當的型別轉換，把這個值硬轉型成不帶 `readonly` 限制的型別，理論上還是能繞過這個保護寫入新值。但這依然是一種值得表達的意圖：`readonly` 明確傳達了「這個欄位只該在初始化的當下決定，之後不該再變動」，即使遇到需要修改它的情境，這個限制也能提早提醒開發者，這裡的假設可能被打破了，值得回頭確認邏輯是不是哪裡出了問題。

## 複習

### private 跟 protected 這兩個存取修飾詞，差異是什麼？

`private` 欄位只能在定義它的 class 內部存取，就連子類別也看不到；`protected` 欄位除了 class 自身，子類別也能存取，但外部世界依然完全看不到，兩者都不允許外部直接存取。

### JavaScript 的井字號私有欄位（`#field`），跟 TypeScript 的 `private` 關鍵字有什麼不同？

`private` 關鍵字只在編譯期發揮作用，編譯成 JavaScript 之後這個限制就會消失，執行期依然能透過瀏覽器主控台等方式存取；井字號私有欄位則是真正的執行期封裝，即使程式碼已經編譯成 JavaScript，外部依然無法直接存取這個欄位。

### 私有欄位在同一個 class 的不同實例之間，是怎麼運作的？

私有欄位的存取權限屬於整個 class，而不是綁定在某一個特定的實例上。只要拿到另一個同 class 執行個體的參考，這個 class 內的程式碼就能直接存取那個實例的私有欄位，不需要透過額外的 getter。

### 什麼是私有欄位存在檢查？它為什麼能當作一種可靠的型別守衛？

私有欄位存在檢查是用 `in` 運算子確認一個未知值身上，是否存在某個特定的私有欄位。因為私有欄位只有定義它的 class 才能存取，一旦檢查通過，就能確定這個值必然是該 class 的實例，因此可以放心把型別窄化成這個 class，判斷依據相當嚴謹。

### readonly 修飾詞的作用是什麼？

讓一個欄位只能在初始化（或建構子內）賦值一次，之後任何嘗試重新賦值的程式碼都會在編譯期被擋下來，明確表達這個欄位不該在初始化之後再被修改的意圖。

## 小測驗

<details>
<summary>readonly 修飾詞的目的是什麼？</summary>
建立一個只能在初始化時設定、之後不能再變更的欄位
</details>

<details>
<summary>私有欄位在同一個 class 的不同實例之間是怎麼運作的？</summary>
同一個 class 的所有實例，都能存取彼此的私有欄位
</details>

<details>
<summary>TypeScript 的 private 與 protected 存取修飾詞有什麼關鍵限制？</summary>
它們只在編譯期生效，編譯成 JavaScript 之後這個限制就會消失，執行期依然能存取
</details>

<details>
<summary>在 TypeScript 中，private 跟 protected 這兩個存取修飾詞有什麼差異？</summary>
private 只允許在 class 自身內部存取，protected 則允許 class 自身與其子類別存取
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
