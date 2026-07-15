---
title: '用 Proxy 實現雙向資料綁定，以及完成應用程式的最後修正'
description: '用 Proxy 為表單實作雙向資料綁定，說明為何不會產生無限迴圈，以及修正頁面重新進入時選單不渲染的 Bug。'
date: 2026-07-15
section: dev
category: You Might Not Need a Framework
series: you_might_not_need_a_framework
seriesTitle: 'You Might Not Need a Framework'
order: 31
chapter: 'Reactive Programming with Proxies'
tags:
  - JavaScript
  - frontendMasters
  - youMightNotNeedAFramework
  - Proxy
  - ReactiveProgramming
  - DOM
---

# 用 Proxy 實現雙向資料綁定，以及完成應用程式的最後修正

## 私有屬性：JavaScript 的 # 語法

在 `OrderPage` 類別中，先定義一個私有的資料模型：

```javascript
#user = {
  name: "",
  phone: "",
  email: ""
}
```

`#` 前綴是 JavaScript 的私有屬性語法（不是 TypeScript），這個屬性只能在類別內部存取，外部無法取得。它是這個雙向綁定實作的資料來源。

## 建立雙向資料綁定

`setFormBindings` 方法在 `render` 方法的最後被呼叫，因為放在開頭時 template 還沒被載入，`querySelector("form")` 會回傳 `null`。傳入已經渲染完成的表單元素：

```javascript
setFormBindings(form) {
  // 表單 → 物件（一方向）
  Array.from(form.elements).forEach(element => {
    if (element.name) {
      element.addEventListener("change", event => {
        this.#user[element.name] = element.value;
      });
    }
  });

  // 物件 → 表單（另一方向）
  this.#user = new Proxy(this.#user, {
    set(target, property, value) {
      target[property] = value;
      form.elements[property].value = value;
      return true;
    }
  });
}
```

兩個方向分別用不同的機制實現：

「表單 → 物件」：監聽每個表單元素的 `change` 事件，當使用者輸入後，把新值寫入 `#user` 物件對應的屬性。

「物件 → 表單」：把 `#user` 替換成一個 Proxy 包裝。每當 `#user` 的屬性被賦值，Proxy 的 `set` trap 就會同步把新值寫入表單對應的欄位。

這裡要注意的是 `form.elements` 這個 DOM API。它是一個 HTMLFormControlsCollection，不只支援索引存取，還可以用表單欄位的 `name` 屬性以點記法或方括號語法存取對應的輸入元素，例如 `form.elements["phone"]`。由於 `HTMLFormControlsCollection` 沒有 `forEach`，需要先用 `Array.from` 轉換才能迭代。

## 為什麼不需要擔心無限迴圈

當程式透過 Proxy 修改 `#user` 屬性，`set` trap 會把值寫入表單欄位。你可能會擔心：更新表單欄位會觸發 `change` 事件，進而再次修改 `#user`，形成無限迴圈。

但這個問題不會發生。DOM 的 `change` 事件只在使用者透過 UI 操作改變欄位值時才會觸發，用 JavaScript 程式修改 `form.elements[x].value` 不會觸發 `change` 事件。這是規格設計的結果，也是這個雙向綁定得以正常運作的前提。

## set trap 必須回傳 true

這是一個容易忽略但影響程式行為的細節。Proxy 的 `set` trap 必須明確 `return true`，表示這次賦值被接受。如果什麼都不回傳，預設是 `undefined`（falsy），在嚴格模式下會導致錯誤，非嚴格模式下也可能出現難以追蹤的警告。

## 監聽 submit 事件而不是 click 事件

送出表單時，應監聽 `form` 的 `submit` 事件，而不是按鈕的 `click`：

```javascript
form.addEventListener("submit", event => {
  event.preventDefault();
  alert(`Thanks for your order ${this.#user.name}. ...`);
  this.#user.name = "";
  this.#user.email = "";
  this.#user.phone = "";
});
```

原因是 `submit` 事件能涵蓋所有提交方式：點擊按鈕、在輸入框按 Enter，或手機鍵盤上的「確定」、「Go」等按鈕。`click` 事件只能處理點擊，會漏掉其他方式。

`event.preventDefault()` 阻止瀏覽器用 GET 或 POST 把表單資料傳送到伺服器並刷新頁面，讓我們自己掌控送出後的行為。

送出後把 `#user` 的屬性設為空字串，Proxy 的 `set` trap 就會自動把表單欄位也清空，這同時驗證了雙向綁定正在運作。

## 在 Shadow DOM 中查詢元素

在 `setFormBindings` 中取得表單時，必須用 `this.root.querySelector("form")` 而不是 `document.querySelector("form")`，原因是 `OrderPage` 使用了 Shadow DOM，`document` 指的是主文件，找不到 Shadow DOM 裡的元素。

## 修正頁面重新進入時不渲染的問題

課程最後發現一個 Bug：從詳細頁或購物車頁導覽回首頁時，選單不見了。

原因在於 `MenuPage` 的 `connectedCallback` 只監聽了 `appmenuchange` 事件才呼叫 `render`，但選單只在第一次載入時觸發了這個事件。當使用者再次導覽回首頁，Router 建立了一個新的 `MenuPage` 實例，`connectedCallback` 被呼叫，但此時選單資料已經在 Store 裡了，不會再觸發 `appmenuchange`，所以 `render` 不會被呼叫。

修正方式很簡單：在 `connectedCallback` 中直接呼叫一次 `render`，不等事件觸發：

```javascript
connectedCallback() {
  const template = document.getElementById("menu-page-template");
  const content = template.content.cloneNode(true);
  this.root.appendChild(content);

  window.addEventListener("appmenuchange", () => {
    this.render();
  });

  this.render(); // 進入頁面就立刻嘗試渲染
}
```

第一次載入時，`render` 被呼叫但 `app.store.menu` 是 `null`，所以顯示「Loading...」，等到資料載入後 `appmenuchange` 觸發，再次呼叫 `render` 顯示真正的內容。之後每次重新進入首頁，`connectedCallback` 呼叫 `render`，這時 `app.store.menu` 已有資料，就能直接顯示選單。

## 複習

### 在 JavaScript 中使用 Proxy 進行表單資料綁定的目的是什麼？

Proxy 允許在 JavaScript 物件和表單元素之間建立雙向資料綁定，當表單值改變時自動更新物件，當物件的屬性被修改時也自動更新表單元素。

### 如何用 JavaScript 的 DOM API 存取表單元素？

可以使用 form.elements 存取表單元素，它同時支援陣列式和物件式的存取方式，允許透過 name 屬性以點記法或方括號語法取得對應的欄位。

### 為什麼監聽表單的 submit 事件比監聽按鈕的 click 事件更好？

監聽 submit 事件能相容各種輸入方式，例如手機鍵盤的「Go」或「Send」按鈕，以及桌機的 Enter 鍵，提供更通用的表單提交處理方式。

### 在 Proxy 的 set trap 中，回傳 true 有什麼意義？

在 Proxy 的 set trap 中回傳 true 表示屬性修改成功。如果沒有明確回傳，trap 會回傳 falsy 的值，可能導致非預期的行為或錯誤。

### 在現代 JavaScript 中，如何定義私有屬性？

在屬性名稱前加上 # 即可定義私有屬性，這個屬性只能在類別內部存取，提供了封裝的效果。

## 小測驗

<details>
<summary>JavaScript 類別中，用什麼語法定義私有屬性？</summary>
在屬性名稱前加上 # 符號
</details>

<details>
<summary>哪個方法用來阻止表單的預設提交行為？</summary>
preventDefault()
</details>

<details>
<summary>如何用 JavaScript 存取表單元素？</summary>
使用 form.elements 搭配點記法或方括號語法
</details>

<details>
<summary>這個範例中，用什麼技術實現雙向資料綁定？</summary>
結合事件監聽器和 Proxy 物件
</details>

<details>
<summary>設定 Proxy 的 trap 時，有什麼重要的回傳值需要注意？</summary>
必須回傳布林值（true 或 false）
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Vanilla JS: You Might Not Need a Framework](https://frontendmasters.com/courses/vanilla-js-apps/) 課程筆記