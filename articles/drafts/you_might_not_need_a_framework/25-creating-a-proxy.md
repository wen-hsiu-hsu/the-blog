---
title: 'Proxy 與響應式程式設計：讓資料變動驅動 UI 更新'
description: '介紹 JavaScript Proxy 的概念與 trap 機制，並說明如何用 Proxy 包裝 Store 實現響應式更新，讓資料變動自動廣播事件驅動 UI。'
date: 2026-07-12
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 25
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Proxy
  - ReactiveProgramming
---

# Proxy 與響應式程式設計：讓資料變動驅動 UI 更新

> 前面幾篇建立了 Web Components、Router 和 Services 層，資料也已經能從 API 載入並存入 Store。但 UI 目前還不會自動隨資料更新。這篇介紹最後一塊拼圖：用 JavaScript Proxy 實作響應式程式設計，讓資料的變動能夠廣播出去，驅動 UI 更新。

## 什麼是 Proxy？

Proxy 是 JavaScript 的一個物件包裝機制。你用它包住一個原始物件，之後所有對這個物件的操作，都會先經過 Proxy 的攔截層。你可以在這個攔截層加入自訂行為，例如驗證資料、修改回傳值，或是廣播事件。

簡單來說，它就像是「針對物件的事件監聽器」：每當物件的某個屬性被讀取或修改，你都能知道，也能做出反應。

```javascript
const original = {
  name: 'John Doe',
  age: 30
};

const handler = {
  get: function(target, prop) {
    if (prop === 'age') {
      return target[prop] + ' years old';
    }
    return target[prop];
  }
};

const s = new Proxy(original, handler);
console.log(s.age); // "30 years old"
```

`new Proxy` 接收兩個參數：要包裝的原始物件，以及一個 handler 物件。從此之後，你只對 Proxy 操作，不直接碰原始物件。

## Handler 與 Trap

Handler 是傳入 Proxy 的第二個參數，它是一個包含「trap（攔截器）」的物件。

**Proxy Trap** 是 handler 物件上的特殊方法，每個方法對應一種對物件的操作類型。常用的 trap 包含：

- `get`：某人讀取屬性值時觸發
- `set`：某人修改屬性值時觸發
- `has`：某人用 `in` 運算子檢查屬性是否存在時觸發
- `deleteProperty`：某人刪除屬性時觸發
- `apply`：某人呼叫物件上的函式時觸發
- `construct`：某人用 `new` 建立物件實例時觸發

Proxy 只能包裝物件，不能直接用於數字、字串、布林值這類純值。如果需要對純值做類似的攔截，要改用 class 搭配 getter 和 setter。

## Proxy 的實際用途：資料驗證

`set` trap 可以用來在寫入前驗證資料型別：

```javascript
const handler = {
  set: function(target, property, value) {
    if (property === 'age' && typeof value !== 'number') {
      throw new TypeError('Age not a number');
    }
    target[property] = value;
  }
};

const s = new Proxy(original, handler);
s.age = 40;      // OK
s.age = "hey!";  // 拋出 TypeError
```

## 用 Proxy 包裝 Store 實現響應式更新

在 Coffee Masters 中，`Store` 有兩個屬性：`menu` 和 `cart`。我們希望任何一個屬性被修改時，能夠自動通知 UI 做出更新。

做法是用 Proxy 包裝原始的 Store，在 `set` trap 中攔截每次屬性的修改，並在修改後透過 `window.dispatchEvent` 廣播對應的自訂事件：

```javascript
const proxyStore = new Proxy(Store, {
  set(target, property, value) {
    target[property] = value; // 實際執行修改

    if (property === 'menu') {
      window.dispatchEvent(new Event("appmenuchange"));
    }
    if (property === 'cart') {
      window.dispatchEvent(new Event("appcartchange"));
    }

    return true; // set trap 必須回傳 true 表示接受此次修改
  }
});

export default proxyStore;
```

為什麼把事件派送到 `window` 而不是 `document`？因為應用程式啟用了 Shadow DOM，每個 Web Component 都有自己的獨立 document，而 `window` 對整個應用程式只有一個，是真正全域的廣播對象。

注意 `set` trap 必須回傳 `true` 才表示接受這次的賦值，如果回傳 `false` 或什麼都不回傳，JavaScript 在嚴格模式下會拋出 TypeError。

## 這個設計模式的本質

原始的 `Store` 現在變成私有的，所有外部程式碼只使用 `proxyStore`（也就是那個代理物件）。這個設計和 React 的 Higher Order Component 有相似的概念：用一個包裝層來增強原始物件的行為，而不修改原始物件本身。

現在，每當 `app.store.menu` 或 `app.store.cart` 被修改時，對應的全域事件就會自動發出，任何有在監聽這些事件的 Web Component 就可以做出反應，更新自己的 UI。

## 複習

### 什麼是 JavaScript Proxy？

Proxy 是一個包裝物件，讓你可以攔截並修改對被包裝物件所執行的操作，允許對物件的屬性和方法加入自訂行為或驗證邏輯。它的作用就像是針對資料變動的事件監聽器。

### 在 JavaScript Proxy 的情境中，「trap（攔截器）」是什麼？

Trap 是 proxy handler 物件上的方法，用來攔截並自訂對 JavaScript 物件的特定操作，例如 get（讀取屬性值）、set（修改屬性值）、has（檢查屬性是否存在）、apply（呼叫函式）和 construct（建立實例）。

### 為什麼要在 JavaScript 中使用 Proxy？

Proxy 可以用於資料驗證、為物件加入自訂行為、透過偵測並回應資料變動來實現響應式程式設計，以及建立能攔截物件操作的包裝層。

### JavaScript Proxy 的建構式接受哪些參數？

Proxy 的建構式接受兩個參數：要被包裝的原始物件，以及一個包含 trap 的 handler 物件，用來定義各種物件操作的自訂行為。

### Proxy 中 set trap 的用途是什麼？

set trap 在屬性值被修改時觸發，讓你可以攔截這個變動，執行驗證、觸發 UI 更新，或是在物件屬性被修改時廣播事件。

## 小測驗

<details>
<summary>JavaScript 中的 Proxy 是什麼？</summary>
一個包裝物件，用來攔截並修改對原始物件所執行的操作
</details>

<details>
<summary>Proxy handler 中的 trap 是什麼？</summary>
攔截並自訂對 JavaScript proxy 物件特定操作的方法
</details>

<details>
<summary>在這個響應式程式設計的做法中，為什麼使用 window 物件來派送事件？</summary>
因為應用程式有多個帶有 Shadow DOM 的 document，而 window 是全域唯一的
</details>

<details>
<summary>在 JavaScript 中使用 Proxy 的主要優勢是什麼？</summary>
允許攔截並修改對物件的操作，實現自訂行為和驗證邏輯
</details>

<details>
<summary>Proxy handler 中的 set trap 主要做什麼？</summary>
攔截並處理對屬性值的修改
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記