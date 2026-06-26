---
title: '自動綁定方法的代價：一個不應該存在的 hack'
description: '說明為何「讓 class 方法自動硬綁定」是一個壞主意：展示用 getter 加 WeakMap 實作自動綁定的複雜 hack，以及這個做法如何從根本上違背 JavaScript this aware 函式的動態設計本質。'
date: 2026-06-26
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 63
chapter: 'Objects'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - ThisKeyword
  - class
---

# 自動綁定方法的代價：一個不應該存在的 hack

> 本篇延續[[62-es6-class-keyword|上一篇]]對 `class` 語法的討論。上一篇提到，許多開發者為了解決 `class` 方法的 `this` 遺失問題，會在 `constructor` 中用箭頭函式覆寫方法。本篇進一步探討「自動綁定」這個想法，說明為何它是一條錯誤的路。

## 「讓方法自動綁定」的想法

上一篇的討論留下了一個懸念：既然每次手動 `.bind()` 或在 `constructor` 裡賦值很麻煩，為什麼不讓 JavaScript 自動幫我們做這件事？

事實上，目前確實有一個 `class` 裝飾器提案 `@bound`，考慮讓開發者可以選擇性地讓所有 class 方法自動綁定。Kyle Simpson 對這個方向持明確的反對態度，並透過一個思想實驗說明原因。

## 實作自動綁定的代價

這是社群上有人提供的做法：用 getter 加上 WeakMap。

```javascript
var method = (function defineMethod() {
  var instances = new WeakMap();

  return function method(obj, methodName, fn) {
    Object.defineProperty(obj, methodName, {
      get() {
        if (!instances.has(this)) {
          instances.set(this, {});
        }
        var methods = instances.get(this);
        if (!(methodName in methods)) {
          methods[methodName] = fn.bind(this);
        }
        return methods[methodName];
      }
    });
  };
})();

function bindMethods(obj) {
  for (let ownProp of Object.getOwnPropertyNames(obj)) {
    if (typeof obj[ownProp] == "function") {
      method(obj, ownProp, obj[ownProp]);
    }
  }
}
```

這個工具函式的運作邏輯：

1. 把原型上的方法替換成 getter
2. 每次透過 getter 存取方法時，自動建立一個硬綁定（`.bind(this)`）版本
3. 用 WeakMap 快取各實例對應的硬綁定版本，避免重複建立

使用方式如下：

```javascript
class Workshop { ... }
class AnotherWorkshop extends Workshop { ... }

var JSRecentParts = new AnotherWorkshop("Kyle");

bindMethods(Workshop.prototype);
bindMethods(AnotherWorkshop.prototype);

JSRecentParts.speakUp("What's different here?");
// Kyle What's different here?

setTimeout(JSRecentParts.speakUp, 100, "Oh! But does this feel gross?");
// Kyle Oh! But does this feel gross?
```

`this` 確實不再遺失了。但代價是什麼？

## 為什麼這是個壞主意

Kyle Simpson 展示這段程式碼的目的，不是推廣它，而是說明為了達成「自動綁定」需要付出多大的扭曲代價，藉此反映這個目標本身就與 JavaScript 的設計不符。

`this` aware 函式存在的全部意義，就是讓函式可以在不同上下文中動態執行。強行把它鎖死成「永遠只服務這一個實例」，完全抹去了這個動態性，卻又不像閉包模組那樣乾淨直接。

這個 hack 需要動用 `Object.defineProperty`、WeakMap、getter proxy，只是為了模擬其他語言中類別方法的行為。這是一種根本性的錯誤配適：用一個不適合這個目的的工具，配上複雜的補丁，硬是逼它做另一個工具本來就能做好的事。

## 複習

### 在 JavaScript 中自動綁定方法有什麼潛在問題？

自動綁定方法需要使用 getter 加上 WeakMap 的複雜 hack，違背了 JavaScript 函式的動態本質，製造出過度複雜的程式碼。

### 可以用什麼技術在 JavaScript 中實現自動硬綁定方法？

可以用一個工具函式，把原型上的方法替換成 getter，每次存取時動態建立硬綁定版本，並快取在 WeakMap 中回傳。

### JavaScript 函式的根本目的是什麼，自動綁定為何會破壞它？

JavaScript 函式的目的是動態可用，能夠在不同上下文中執行。自動綁定把函式鎖死在特定實例上，完全剝奪了這個彈性。

### JavaScript 中有什麼與方法綁定相關的未來提案？

有一個考慮中的 class 裝飾器提案 `@bound`，可讓所有 class 方法自動綁定，但其實作與採用與否仍不確定。

### 工具函式如何讓原型方法支援自動綁定？

將原型上的方法替換成 getter，每次透過實例存取該屬性時，getter 自動生成硬綁定版本並快取在 WeakMap 中。

## 小測驗

<details>
<summary>提案中自動綁定方法的技術手法是什麼？</summary>
使用 WeakMap 快取並代理方法
</details>

<details>
<summary>工具函式用什麼機制建立自動綁定方法？</summary>
將原型方法替換成 getter
</details>

<details>
<summary>在這個方法中使用 WeakMap 的主要目的是什麼？</summary>
快取並儲存各實例對應的硬綁定方法版本
</details>

<details>
<summary>為什麼自動綁定方法的做法被認為有問題？</summary>
它違背了 JavaScript 函式動態可用的本質
</details>

<details>
<summary>這個工具函式的核心功能是什麼？</summary>
在存取方法時自動建立並回傳硬綁定版本
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記