---
title: '在 Custom Element 中載入 Template：connectedCallback 與 Shadow DOM 的必要性'
description: '說明為何必須在 connectedCallback 而非 constructor 中載入 template，並透過實驗展示無 Shadow DOM 時 CSS 洩漏到全域的問題。'
date: 2026-07-10
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 22
chapter: 'Web Components'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - WebComponents
  - DOM
---

# 在 Custom Element 中載入 Template：connectedCallback 與 Shadow DOM 的必要性

> [[21-creating-web-components|上一篇]]建立了三個頁面的 Custom Element 類別，並透過 import 鏈讓瀏覽器認識它們。這篇把 template 接進來，讓元件能夠渲染實際的 HTML 內容，同時說明兩個重要的細節：為什麼不能在 constructor 中附加子元素，以及為什麼最終需要 Shadow DOM。

## 在 connectedCallback 中克隆 template

直覺上，你可能會想在 constructor 裡載入 template 並附加內容，但瀏覽器不允許這樣做。在 constructor 執行後，自訂元素的規則要求：**回傳的元素不能有子節點**。如果在 constructor 中呼叫 `appendChild`，瀏覽器會拋出「fail to construct custom element: the result must not have children」的錯誤。

> 使用 Shadow DOM 時，因為是對 Shadow Root 進行操作而非元件本身，在 constructor 中附加內容是允許的，這會在下一篇實作。

正確的做法是把內容的載入和附加移到 `connectedCallback` 中：

```javascript
connectedCallback() {
  // 當元件被附加到 DOM 時執行
  const template = document.getElementById("menu-page-template");
  const content = template.content.cloneNode(true);
  this.appendChild(content);
}
```

`connectedCallback` 在元件被插入 DOM 時觸發，也就是 Router 呼叫 `appendChild` 把元件放進 `<main>` 的那一刻。這個時機下加入子元素是完全合法的。

克隆 template 的步驟：

- 用 `getElementById` 取得 template 元素
- 呼叫 `template.content.cloneNode(true)` 進行深度克隆，`true` 表示連同所有子節點一起複製
- 把克隆的內容（不是 template 本身）附加到元件上

## 這段程式碼看起來有點繁瑣

對，三行程式碼做一件事，如果每個元件都這樣寫確實重複。講師指出一個改善方向：可以建立一個自己的基礎類別，讓它繼承 `HTMLElement` 並封裝這段克隆邏輯，之後其他元件只要繼承這個基礎類別就好。這是 OOP 繼承的典型應用，但這門課不在這裡加這一層抽象。

## CSS 洩漏問題實際出現

加入 template 並能渲染後，講師加了一個實驗：在 template 內的 `<style>` 裡設定 `h2 { color: violet }`，預期只影響元件內的 h2。

但結果是頁面上所有的 h2（包含完全在 template 和 Web Component 之外的 h2）都變成了紫色。

這正是上一篇理論說明時提到的問題：在沒有 Shadow DOM 的情況下，元件的節點是整個頁面 DOM 的一部分，`<style>` 標籤裡的 CSS 規則會對整個文件生效，不受元件邊界的限制。

解決方法就是啟用 Shadow DOM，讓元件擁有自己的隔離 DOM 樹。這也是下一步要做的事。

## 複習

### 如何使用 DOM API 克隆 template 的內容？

使用 template.content.cloneNode(true)，將深度克隆參數設為 true 以克隆所有巢狀元素，然後將克隆的內容以子元素的方式附加進去

### Web Component 中 connectedCallback() 方法的用途是什麼？

connectedCallback() 在元件被附加到 DOM 時觸發，讓你可以執行初始化工作，例如加入在 constructor 中無法加入的子元素

### 為什麼需要使用 Shadow DOM？

Shadow DOM 提供了樣式與 DOM 的封裝，防止樣式和元素洩漏到元件外部，確保元件內定義的樣式不會影響全域文件

### 在 constructor 中嘗試為自訂元素加入子元素時會發生什麼？

在 constructor 中加入子元素會導致「fail to construct custom element」錯誤，規則要求 constructor 不能回傳帶有子元素的元素

### 如何改善 Web Component 中冗長的 template 克隆程式碼？

建立一個繼承自 HTMLElement 的基礎類別，在其中處理 template 克隆與初始化邏輯，其他自訂元件類別再繼承這個基礎類別，以減少重複的程式碼

## 小測驗

<details>
<summary>在 Web Component 中，哪個方法用來克隆 template 的內容？</summary>
template.content.cloneNode(true)
</details>

<details>
<summary>哪個特殊的回呼方法用於在 Web Component 初始建構之後加入元素？</summary>
connectedCallback
</details>

<details>
<summary>防止全域 CSS 樣式影響 Web Component 的建議解決方案是什麼？</summary>
使用 Shadow DOM
</details>

<details>
<summary>哪個方法用來從 DOM 中取得 template 元素？</summary>
document.getElementById()
</details>

<details>
<summary>在克隆 template 時，哪個參數用來包含巢狀元素？</summary>
true
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記