---
title: 'TypeScript this 型別：用第一個參數標註 this，搭配 bind/call/apply 呼叫'
description: '示範用函式的第一個參數位置標註 this 型別，解決 DOM 事件處理常見的 this 型別問題，說明這個參數編譯後會消失、不算真正的引數，並解釋為何直接呼叫會失敗，得改用 bind、call、apply 提供正確的 this，也提到 noImplicitThis 編譯器選項與自由函式該不該依賴 this 的取捨。'
date: 2026-09-08
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 21
chapter: 'Type Queries, Callables & Constructables'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - ThisType
    - NoImplicitThis
    - DOMEvents
---

# TypeScript this 型別：用第一個參數標註 this，搭配 bind/call/apply 呼叫

> [[20-constructables-function-overloads|前面]] 看的是函式簽名跟建構子之間的型別技巧。這一節接著討論函式型別裡另一個容易被忽略的角落：函式內部的 `this` 該怎麼給型別。

## 動機：DOM 事件處理常常仰賴 this

用原生 JavaScript 的 `addEventListener` 綁定事件時，回呼函式裡的 `this` 常常會被瀏覽器自動設成觸發事件的那個 DOM 元素。如果想寫一個依賴這種行為的點擊處理函式：

```ts
function myClickHandler(event: Event) {
    this.disabled = true; // 沒有標註 this 型別時，TypeScript 會直接標紅提示
}
```

在沒有額外處理的情況下，函式內部的 `this` 型別是不明確的，因為 TypeScript 沒有任何依據能推斷這個函式被呼叫時，`this` 究竟會是什麼。

## 用第一個參數的位置替 this 標註型別

要讓 TypeScript 理解 `this` 應該是什麼型別，做法是在參數列表最前面加上一個名叫 `this` 的參數，並給它型別標註：

```ts
function myClickHandler(this: HTMLButtonElement, event: Event) {
    this.disabled = true; // 型別檢查通過
}
```

這裡容易讓人誤會成函式變成兩個參數，但實際上不是：這個 `this` 參數只是一個特殊語法位置，用來告訴 TypeScript 呼叫這個函式時 `this` 該是什麼型別，它在編譯後會完全消失，不會出現在真正輸出的 JavaScript 裡，也不會被算進函式實際的參數個數。有了這個標註之後，函式內部使用 `this.disabled` 就能正確通過型別檢查，因為 TypeScript 已經知道 `this` 是一個 `HTMLButtonElement`。

## noImplicitThis：這門課的專案本來就開著這個選項

這門課使用的 tsconfig 已經開啟 `noImplicitThis`，所以前面範例裡沒有標註 `this` 型別的 `myClickHandler`，一開始就會被 TypeScript 直接標紅提示，而不是悄悄把 `this` 當成 `any` 通過檢查，這也是為什麼要用第一個參數位置替 `this` 標註型別。同一個 tsconfig 裡如果一併開啟 `strictBindCallApply`，還能讓 `bind`、`call`、`apply` 這幾個方法回傳更精確的型別，而不是籠統的 `any`。

## 直接呼叫這個函式會失敗，需要透過 bind、call、apply 提供正確的 this

替 `this` 加上型別標註之後，如果直接呼叫這個函式並傳入一個事件物件，TypeScript 會報錯，提示這個函式的 `this` context 型別是 `void`。這裡的 `void` 又出現了同樣的語意：代表「這裡沒有一個安全、有意義的 `this` 可以依賴」，直接呼叫這個函式並不安全，因為根本沒有提供任何 `this`。

要正確使用這個函式，需要透過 `bind`、`call`、`apply` 這幾個方法明確提供 `this`：

```ts
const myButton = document.getElementsByTagName('button')[0];

const boundHandler = myClickHandler.bind(myButton);
boundHandler(new Event('click')); // 可以直接呼叫，this 已經綁定好了

myClickHandler.call(myButton, new Event('click')); // 也可以，呼叫時一併提供 this
```

`bind` 會建立一份原函式的副本，並把指定的 `this` 永久綁定在這份副本上，之後這個 `boundHandler` 就能直接呼叫，不用再擔心 `this` 該傳什麼。`call`（跟功能類似、只是傳參數方式不同的 `apply`）則是呼叫函式的同時，明確指定這次呼叫要用的 `this`，屬於另一種呼叫函式的方式。不管用哪一種，TypeScript 都會依照 `this` 型別標註，要求傳入的物件必須是 `HTMLButtonElement`，如果傳入型別不符的值，一樣會被擋下來。

## this 型別相對少見，但在特定場合很重要

明確替函式標註 `this` 型別，在日常寫程式時算是相對少見的情境。如果是寫在 class 裡的方法，`this` 已經自動被理解成該 class 執行個體的型別，不需要額外處理。這個技巧真正重要的場合，是像這裡示範的 DOM 事件監聽這類情境，或是在寫 React 元件時，如果同時混用不需要在意 `this` 的獨立函式跟需要依賴 `this` 的方法，也可能需要區分清楚。

## 一個對照：如果不用 this，改用一般命名參數會怎樣

有學員問，如果把第一個參數改成一般命名（例如叫 `element`），是不是也能達到一樣的效果，直接寫 `element.disabled = true`？技術上可以，但代價是每次呼叫這個函式時，都得手動把這個元素當作真正的引數傳進去，而不是像 `this` 那樣，可以透過 `bind` 事先綁定成隱含的一部分。這也是為什麼獨立、自由的函式（freestanding function）通常不太需要在意 `this`，用一般命名參數傳遞需要的物件即可，寫法更直覺；但如果是要掛在 DOM 元素上的事件監聽器，呼叫方式是由瀏覽器決定的，開發者沒辦法插手要求瀏覽器改成把元素當一般引數傳進來，這時候如果想在 TypeScript 裡取得型別安全，就必須透過 `this` 型別這個機制。

## 複習

### 如何在 TypeScript 函式裡替 this 標註型別？

在函式參數列表的最前面加上一個名為 `this` 的參數，並給它型別標註，例如 `function myClickHandler(this: HTMLButtonElement, event: Event) {}`。這個 `this` 參數是特殊語法，編譯後會消失，不算是函式真正的引數。

### 直接呼叫一個標註了 this 型別的函式，會發生什麼事？為什麼？

會直接報錯，因為函式沒有被賦予任何 `this`，TypeScript 會提示 `this` 的 context 型別是 `void`，代表這裡沒有安全、有意義的 `this` 可以依賴。要正確使用，需要透過 `bind`、`call` 或 `apply` 明確提供符合型別要求的 `this`。

### bind、call、apply 這三個方法，在提供 this 的方式上有什麼差異？

`bind` 會建立一份綁定好 `this` 的函式副本，之後可以直接呼叫這份副本，不用再處理 `this`；`call` 跟 `apply` 則是在呼叫函式的當下，同時明確指定這次呼叫要用的 `this`，兩者差異只在傳遞其餘引數的方式不同。

### 什麼情境特別需要替函式標註 this 型別？

最常見的情境是 DOM 事件監聽器，因為瀏覽器會自動把觸發事件的元素設成 `this`，開發者沒辦法改變這個呼叫慣例；另外在撰寫 React 元件、同時混用不依賴 `this` 的獨立函式與依賴 `this` 的方法時，也可能需要用到。寫在 class 裡的方法則不需要額外處理，因為 `this` 已經自動對應到該 class 的執行個體。

## 小測驗

<details>
<summary>.bind() 方法在函式呼叫的情境中做了什麼？</summary>
建立一份 this 已經固定好的函式副本
</details>

<details>
<summary>在 TypeScript 中，如何替函式的 this 情境指定型別？</summary>
在函式簽名的第一個參數位置加上 this，並給它型別標註
</details>

<details>
<summary>替 TypeScript 函式簽名加上 this 參數後，對函式的引數會有什麼影響？</summary>
它會消失，不會被算成一個正常的引數
</details>

<details>
<summary>在 TypeScript 中，把 this 型別標註成 void 代表什麼意思？</summary>
這個函式不應該使用或依賴 this
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
