---
series: web-dev-quiz
seriesTitle: 'Advanced Web Dev Quiz'
order: 23
title: CSS 選擇器：如何只選中第一個 <li> 元素
description: 如何使用 CSS 的各種 (pseudo) 選擇器，例如 first-child、first-of-type、> 與 +，並透過程式範例解析如何正確鎖定網頁結構中的第一個 <li> 元素
date: 2026-02-25
category: Advanced Web Dev Quiz
section: dev
tags:
    - CSS
    - frontendMasters
    - advancedWebDevelopmentQuiz
---

# CSS 選擇器：如何只選中第一個 `<li>` 元素

> 此文章是 [FrontendMaster](https://frontendmasters.com/) 上的 [Advanced Web Development Quiz](https://frontendmasters.com/courses/web-dev-quiz/) 課程筆記

## 問題

Which of the CSS (pseudo) selectors can we use to only target the first list item `<li>One</li>`?
Select all the correct answers.

```html
<div>
    <ul>
        <li>One</li>
        <ul>
            <li>Two</li>
            <li>Three</li>
        </ul>
    </ul>
    <ul>
        <li>Four</li>
    </ul>
</div>
```

[a] ul:first-child > li
[b] ul:first-child + li
[c] ul:first-child > li:first-child
[d] ul:first-of-type > li:first-of-type
[e] ul:first-child + li:first-child

## `:first-child`

在父元素的所有直接子元素中，排第一個的那個元素

下面的範例中，`<li>One</li>`、`<li>Three</li>` 會被套用紅色

```html
<ul>
    <li>One</li>
    <li>Two</li>
</ul>
<ul>
    <li>Three</li>
    <li>Four</li>
</ul>
```

```css
li:first-child {
    color: red;
}
```

## `:first-of-type`

在父元素的所有直接子元素中，第一個「該標籤類型」的元素

下方範例中，`<span>Span 1</span>` 就會被套用紅色

```html
<div>
    <p>Paragraph</p>
    <span>Span 1</span>
    <span>Span 2</span>
</div>
```

```css
span:first-of-type {
    color: red;
}
```

## `>` 子代選擇器 child combinator

只選到「直接子元素」，不包含更深層的後代

下方範例只有 `<span>Span 1</span>`、`<span>Span 2</span>` 兩個元素會被套用紅色

```html
<div id="container">
    <span>Span 1</span>
    <span>Span 2</span>
    <div>
        <span> Span 3 </span>
    </div>
</div>
```

```css
#container > span {
    color: red;
}
```

## `+` 相鄰兄弟選擇器 adjacent sibling combinator

只選到「緊接在某元素後面的下一個同層兄弟元素」。

下方範例只有 `<p>Paragraph 1</p>` 會被套用紅色

```html
<h2>Title</h2>
<p>Paragraph 1</p>
<p>Paragraph 2</p>
```

```css
h2 + p {
    color: red;
}
```

## 答案

[a] ul:first-child > li
[c] ul:first-child > li:first-child
