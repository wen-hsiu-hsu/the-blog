---
title: JavaScript Closure 的真實樣貌：Scope、COVE 與詞彙作用域
description: 拆解 JavaScript Closure 的底層實作：隱藏屬性 Scope 如何儲存背包、Closed Over Variable Environment(COVE)的正式定義，以及 Lexical Scoping 為什麼是 Closure 能夠存在的根本原因。
date: 2026-05-03
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 14
section: dev
category: JavaScript Hard Parts v3
chapter: Closure
tags:
    - JavaScript
    - Closure
    - Scope
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# JavaScript Closure 的真實樣貌：Scope、COVE 與詞彙作用域

## 背包在底層如何儲存？

前幾節一直用「背包」來描述函式攜帶的持久資料，但它在 JavaScript 底層實際上以一個**隱藏屬性**的形式附加在函式物件上：`[[Scope]]`

雙層方括號是 JavaScript 規範表示隱藏連結的慣例寫法。這個隱藏屬性無法從外部直接存取，儲存著函式被定義當下所綁定的外層資料。

## 「Scope」是什麼意思？

Scope（作用域）的意義並不困難，它只是回答一個簡單的問題：

> **在程式碼的某一行，我能取用哪些資料？**

在函式執行時，可取用的資料包含本地記憶體中的變數；而如果函式攜帶了背包，背包中的資料也在可取用的範圍內。

## 「背包」的所有正式名稱

這份持久附加的資料有多個層次的正式說法：

**第一層：Variable Environment（變數環境）**

本地記憶體的另一個名稱是「變數環境（Variable Environment）」，指的是在某個執行環境中，當下圍繞著我的所有資料。

**第二層：Closed Over Variable Environment（COVE，閉合變數環境）**

當這份變數環境被「蓋上蓋子」封存並跟著函式一起帶走時，就稱為 Closed Over Variable Environment，縮寫為 **C.O.V.E.**。

**第三層：Persistent Lexically Scoped Referenced Data（持久的詞彙作用域參照資料）**

更精確的完整描述是：透過 `[[Scope]]` 屬性所參照、持久存在的、以詞彙（lexical）方式確定作用域的資料。

**口語通稱：Closure（閉包）**

以上這些，大家最終都統稱為 **Closure**。

## Lexical Scoping vs. Dynamic Scoping

「背包」能運作的根本原因，在於 JavaScript 採用**詞彙作用域（Lexical Scoping）**，也稱靜態作用域（Static Scoping）。

| 作用域規則                        | 決定資料存取的依據                   |
| --------------------------------- | ------------------------------------ |
| **Lexical Scoping（詞彙作用域）** | 函式被**定義、儲存**在程式碼中的位置 |
| **Dynamic Scoping（動態作用域）** | 函式被**呼叫**時所在的位置           |

在詞彙作用域下，`add1` 被定義在 `outer` 的執行環境內，因此它天生就能存取 `outer` 的本地資料，無論之後在哪裡被呼叫。

若 JavaScript 採用動態作用域，當 `newFunc()` 在全域被呼叫時，它就只能存取全域資料，`counter` 將不復可見，Closure 也就不可能存在。

## 為什麼「Closure」這個詞容易造成混淆？

「Closure」這個詞本身被同時用來指稱：

- 整體的語言概念（「JavaScript 的 closure 機制」）
- 儲存資料的那份背包本身（「把資料存在 closure 裡」）
- 讓函式擁有持久記憶的技術手法（「用 closure 讓函式記住狀態」）

用「背包（Backpack）」或 C.O.V.E. 等術語能更精確地描述背包這個物件本身，但在實務溝通中，Closure 仍是最通用、最被廣泛接受的說法。

## 複習

### JavaScript 中，儲存函式與外層作用域連結的隱藏屬性叫什麼名字？

這個隱藏屬性名為 `[[Scope]]`，以雙層方括號表示。
這是 JavaScript 規範（spec）用來表示隱藏連結的慣例寫法。

### JavaScript 中的「Scope（作用域）」是指什麼？

作用域是指在程式碼的某一行，當下可以存取哪些資料。
它決定了在程式碼執行的特定時刻，哪些變數與資料是可以被取用的。

### JavaScript 中「本地記憶體（local memory）」的另一個說法是什麼？

本地記憶體的另一個說法是「變數環境（variable environment）」，
指的是在某個執行環境中，當下圍繞著函式的所有資料與變數。

### 函式所攜帶的「背包」資料，其基於「封閉環境」概念的正式名稱是什麼？

正式名稱是「閉合變數環境（Closed Over Variable Environment，縮寫 COVE）」。
這指的是函式被建立時，從周圍作用域封存並附帶的資料。

### 什麼是詞彙作用域（lexical scoping）？它與動態作用域（dynamic scoping）有何不同？

詞彙作用域（又稱靜態作用域）是指函式能存取的資料，
由它在程式碼中被儲存（定義）的位置決定，而非被呼叫的位置。
動態作用域則相反，函式只能存取它被呼叫時所在環境的資料，而非定義時的環境。

## 小測驗

<details>
<summary>JavaScript 中，儲存函式背包的隱藏屬性名稱是什麼？</summary>
`[[Scope]]`
</details>

<details>
<summary>JavaScript 中「scope（作用域）」是指什麼？</summary>
在程式碼某一行當下可以存取的資料
</details>

<details>
<summary>JavaScript 中本地記憶體的另一個名稱是什麼？</summary>
變數環境（variable environment）
</details>

<details>
<summary>JavaScript 中的「詞彙作用域（lexical scoping）」是什麼意思？</summary>
資料的可存取性由函式被儲存（定義）的位置決定，而非被呼叫的位置
</details>

<details>
<summary>詞彙作用域（lexical scoping）與動態作用域（dynamic scoping）的差異是什麼？</summary>
詞彙作用域以函式被定義的位置為準；動態作用域以函式被呼叫的位置為準
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
