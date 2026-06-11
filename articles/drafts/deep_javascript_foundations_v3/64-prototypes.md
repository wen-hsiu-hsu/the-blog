---
title: '原型系統：連結而非複製'
description: '探討 JavaScript 原型系統與傳統類別理論的根本差異——類別導向語言透過複製建立實例，而 JavaScript 透過連結實作原型系統，兩種心智模型的落差正是 bug 的根源。'
date: 2026-06-27
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 64
chapter: 'Prototypes'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - PrototypeChain
  - OOP
  - ClassSyntax
---

# 原型系統：連結而非複製

> 本篇進入第三大主題的的核心：原型系統（prototype system）。前幾篇介紹的 `class` 語法是疊加在原型系統之上的語法糖。要真正理解 `class` 如何運作，以及它為何會產生那些令人困惑的行為，必須先理解底層的原型系統，以及它與傳統類別理論之間的根本差異。

## 類別理論的核心：複製操作

在傳統的類別導向語言（如 Java、C++）中，類別（class）與實例（instance）的關係通常用「藍圖與建築物」來比喻：

- 類別是抽象的藍圖、計畫
- 實例是根據藍圖建造出來的具體物件

這個比喻背後隱含了一個假設：**建造的那一刻，藍圖的特性被複製進了實體建築**。之後藍圖與建築物就是兩個完全獨立的存在。

改動藍圖，建築物不會變。在建築物上加一扇窗，藍圖也不會出現這扇窗。複製發生在實例化的瞬間，之後關係就結束了。

繼承（inheritance）本質上也是複製操作。Kyle Simpson 用遺傳作為比喻：他的兒子在出生時獲得了他的 DNA 副本，之後兩人是完全獨立的個體，各自的狀態不互相影響。

從這個角度來看，**類別導向程式設計，在本質上是一種複製操作**。

## JavaScript 的實際行為：連結，不是複製

現在回到 JavaScript。當我們用 `new` 呼叫一個函式（建構子呼叫）時，常見的說法是：「這個物件是根據建構子的 prototype 製造的（made based on the prototype）」。

這個說法的問題在於「based on」這個詞。它暗示的是複製關係，但 JavaScript 實際上做的完全不同：

> **JavaScript 不做任何複製。建構子呼叫建立的物件，是被連結（linked）到 prototype，而非複製自 prototype。**

|              | 複製（copying）    | 連結（linking）        |
| ------------ | ------------------ | ---------------------- |
| 建立後的關係 | 獨立，不再相連     | 持續存在，動態查找     |
| 修改原始來源 | 不影響已建立的實例 | 影響所有連結到它的物件 |
| 心智模型     | 快照、靜態         | 活連結、動態           |

## 為什麼這個差異至關重要

Kyle Simpson 反覆強調：**當程式行為與你的心智模型不一致時，bug 就會發生**。這不是「可能」，而是「必然」。

如果你的腦中預設「JavaScript 的實例是 prototype 的複製」，你就會預期：修改 prototype 不影響已建立的實例，實例各自獨立。

但 JavaScript 的真實行為是連結，修改 prototype 上的屬性，所有連結到它的實例都會受影響。這個差距就是 bug 的來源。

## 複習

### 在 JavaScript 中進行建構子呼叫時，實際上發生了什麼事？

會建立一個新物件並將其連結到 prototype，而非從 prototype 複製。

### 傳統類別導向語言通常如何實作物件建立？

透過複製操作，在實例化的瞬間將類別（藍圖）的特性複製到實例中。

### 複製與連結在物件導向程式設計中的根本差異是什麼？

複製建立的是獨立的特性副本，之後兩者互不影響；連結則維持物件之間的動態連結，修改來源會影響所有連結到它的物件。

### 通常用什麼比喻來描述類別與實例的關係？

藍圖（類別）與實體建築（實例），特性在建造的瞬間被複製過去，之後兩者獨立存在。

### 為什麼理解複製與連結的差異很重要？

心智模型與實際系統行為不符時，必然導致 bug。若你以複製的心智模型理解一個實際上是連結的系統，對程式行為的預期就會持續出錯。

## 小測驗

<details>
<summary>類別導向程式設計所隱含的根本關係是什麼？</summary>
藍圖與實例之間的複製操作
</details>

<details>
<summary>在 JavaScript 中，建構子呼叫建立物件時，實際發生了什麼事？</summary>
物件被連結到 prototype
</details>

<details>
<summary>「複製」與「連結」之間的差異為何在程式設計中如此重要？</summary>
它決定了心智模型與對系統行為的預期
</details>

<details>
<summary>Java 和 C++ 等傳統類別導向語言如何處理類別實例化？</summary>
將類別的特性複製到實例中
</details>

<details>
<summary>常用來描述類別與實例關係的比喻是什麼？</summary>
藍圖與實體建築
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記