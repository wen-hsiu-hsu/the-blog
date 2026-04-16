---
title: 聰明的處理前端表單 | FormData API | handling-form-without-any-dependencies
description: 透過 FormData API 處理表單可以很輕鬆!
date: 2022-04-15
category: 程式筆記
section: dev
tags:
    - JavaScript
    - HTML
---

# 聰明的處理前端表單 | FormData API | handling-form-without-any-dependencies

其實很久之前就很想寫這篇來記錄一下，每次都會忘記怎麼使用 FormData，因為真的太喜歡了特此紀錄 XD

## 處理表單

在還沒有使用 FormData API 之前，特別不知道該怎麼處理表單，最一開始我都是從 DOM 元素上面取值，再自己組合成 API 需要的格式使用，現在有了前端框架處理起來輕鬆很多，不過在我學了 FormData 之後感覺寫起來程式碼更優雅 ~高級~ (並不會)。

先來個原生範例

<iframe height="300" style="width: 100%;" scrolling="no" title="form" src="https://codepen.io/kevinshu/embed/preview/BaJGNgq?default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
</iframe>

> 看起來沒什麼問題啊 XD

的確，但是學一下新的東西不好嗎 XD

## FormData API

> [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData) 相容性還不錯，加上 IE 已死，所以就放膽地使用吧！

直接把剛剛的範例改寫成

<iframe height="300" style="width: 100%;" scrolling="no" title="form - formdata" src="https://codepen.io/kevinshu/embed/preview/MWrzaYw?default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
</iframe>

是不是看起來好像很方便!?

需要注意的事

1. 建立 FormData 的時候傳入要取值的 Form 的 DOM 元素進去。eg: `new FormData(<FormElement>)`
2. Form 裡面要取值的每一個元素 (input, select, textarea...) 都必須要給 name，不然 FormData 無法取值。

兩個重點，很簡單就可以來操作 FormData 了！

### 好用的 API

#### `FormData.entries()`

也就是剛剛範例裡面所使用的方法，他會回傳 iterator 物件，搭配 `Object.fromEntries` 使用就可以取得整個表單的 key/value 的物件，非常的方便好用。

不過需要注意，如果表單內有 checkbox 的話，只會回傳一個值，必須搭配後面的 `FormData.getAll()` 使用

```html
<form id="form">
    <input type="text" name="username" />
    <input type="number" name="age" />
</form>
```

```javascript
const form = document.querySelector('#form');

const formData = new FormData(form);
const data = Object.formEntries(formData.entries());

console.log(data);
```

> 也可以使用 `for..of` 來替代 `Object.formEntries()` 喔

<br>

#### `FormData.get()`

這個就是可以根據傳入的 String 來取得 Form 元素裡面同名的值

```html
<form id="form">
    <input type="text" name="username" />
</form>
```

```javascript
const form = document.querySelector('#form');

const formData = new FormData(form);
const data = formData.get('username');

console.log(data); // 回傳 name 為 account 元素當前的值
```

<br>

### `FormData.getAll()`

前面有提到，`FormData.getAll()` 是用來取得全部同名稱的值的陣列

```html
<form id="form">
    <input type="text" name="username" />
    <input type="number" name="age" />

    <input type="checkbox" name="habits" value="swimming" />
    <input type="checkbox" name="habits" value="reading" />
    <input type="checkbox" name="habits" value="sleeping" />
</form>
```

```javascript
const form = document.querySelector("#form");

const formData = new FormData(form);

const data = {
    ...Object.fromEntries(formData.entries())
    habits: formData.getAll("habits")
};

console.log(data); // 回傳整個表單的值
```

## 結語

短到不行的文章，就知道我有多不用心了吧 XD
總而言之，學了這個 FormData API，就可以不管套件或框架，原生語法直接給他用下去就是爽啦。

當然 FormData 還有其他方法可以使用，就交給大家自己去研究了，哈哈哈。

## 參考

- [How to Convert HTML Form Field Values to a JSON Object](https://www.learnwithjason.dev/blog/get-form-values-as-json)
- [FormData - MDN](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

<br>

_本文章若有任何資訊誤植或侵權，煩請告知，我會立刻處理。_
