---
title: 'Date 物件的隱藏屬性 `[[DateValue]]` 與方括號記法動態存取'
description: '介紹 JavaScript Date 物件內部的 [[DateValue]] 隱藏屬性與 Unix Epoch 時間戳記，並說明方括號記法如何對變數求值以動態決定屬性名稱，作為元程式設計的前置概念。'
date: 2026-05-11
section: dev
category: JavaScript Hard Parts v3
series: javaScript_the_hard_part_v3
seriesTitle: 'JavaScript Hard Parts v3'
order: 23
chapter: 'Type Coercion & Metaprogramming'
tags:
    - JavaScript
    - Date
    - frontendMasters
    - javaScriptTheHardPartsV3
---

# Date 物件的隱藏屬性 `[[DateValue]]` 與方括號記法動態存取

## Date 物件與時間戳記

JavaScript 內建了一個 `Date` 函式，搭配 `new` 關鍵字呼叫後，會回傳一個物件，其中有一個**隱藏屬性 `[[DateValue]]`**，儲存的值是從 **1970 年 1 月 1 日午夜（Unix Epoch）至今所經過的毫秒數**。

```javascript
const time1 = new Date(); // 例如 Jan 15 2027 00:00:00
// 3 秒後
const time2 = new Date(); // 例如 Jan 15 2027 00:00:03
```

假設 `time1` 建立時距 Epoch 已過了約 1.8 兆毫秒，則 `time2` 的 `[[DateValue]]` 就是 1.8 兆加上 3000 毫秒。這個精確的時間戳記極具實用價值，例如可以用來**防止使用者短時間內重複送出表單**：若兩次提交之間相差不到 2000 毫秒，就拒絕第二次提交。

然而問題在於：`[[DateValue]]` 是隱藏屬性，無法透過 `time1.dateValue` 或 `time1[["dateValue"]]` 存取，且 `time1` 和 `time2` 都是物件，儲存在 Heap 中，`==` 與 `===` 比較的都只是記憶體位址而非內容。直接相減或比較兩個 Date 物件的做法，在 JavaScript 中行不通。

## Date 物件本質上是普通物件

儘管有隱藏屬性，`Date` 回傳的物件在其他方面與一般物件無異，可以自由新增屬性。以下範例示範用**方括號記法（square bracket notation）** 動態新增屬性：

```javascript
const month = 'jan';

time1[month] = true; // 等同於 time1["jan"] = true，即 time1.jan = true
time2[month] = true;
```

方括號記法的關鍵行為：`time1[month]` 中，`month` **不是**屬性名稱本身，而是一個需要先被求值的變數。JavaScript 先查找 `month` 的值（`"jan"`），再以這個值作為屬性名稱。最終在 `time1` 上建立的屬性是 `jan`，而非 `month`。

相比之下，點記法 `time1.month` 會直接建立名為 `month` 的屬性，而不會對變數求值。這個差異在後續的元程式設計中將會非常重要：當屬性名稱本身需要動態決定時，只有方括號記法能勝任。

## 問題尚未解決

現在的情況是：

- `time1` 和 `time2` 是兩個普通物件，都存在 Heap 中，只能透過參考存取
- 時間戳記藏在 `[[DateValue]]` 這個隱藏屬性中，無法直接讀取
- 直接比較兩個 Date 物件，得到的永遠是 `false`

理想的做法是直接對兩個 Date 物件做減法 `time2 - time1`，得到相差的毫秒數。要讓這件事成為可能，需要一種機制讓開發者能手動控制物件在運算子作用時的行為，而這正是接下來要探討的主題。

## 複習

### JavaScript 的 Date 物件是從哪個日期開始計算毫秒數的？

從 1970 年 1 月 1 日午夜（Unix Epoch）開始計算。這是 JavaScript Date 系統中毫秒計數的起始點。

### 使用方括號記法設定物件屬性時，例如 `time1[month] = true`，其中 `month = "jan"`，實際上建立的屬性名稱是什麼？

建立的屬性名稱是 `"jan"`。方括號記法會先對 `month` 這個變數求值，取得其內容（`"jan"`），再以這個值作為屬性名稱。變數名稱本身不會成為屬性名稱。

### 若第一個 Date 物件的時間戳記為 1.8 兆毫秒，3 秒後建立第二個 Date 物件，其 `[[DateValue]]` 是多少？

1.8 兆加上 3000 毫秒（即 1,800,000,003,000 毫秒）。因為 3 秒等於 3000 毫秒，第二個時間戳記就是原始時間戳記加上 3000。

### 比較兩個 Date 物件的時間戳記，有什麼實際的使用情境？

防止使用者短時間內重複送出表單。透過比對時間戳記，可以判斷使用者是否在近期（例如 2000 至 3000 毫秒內）已經按過送出，若時間間隔不足則拒絕第二次提交。

## 小測驗

<details>
<summary>JavaScript 的 Date 毫秒計數從哪個日期與時間開始？</summary>
1970 年 1 月 1 日午夜
</details>

<details>
<summary>執行 `time1[month]`，其中 `month` 的值為 "jan" 時，建立的屬性名稱是什麼？</summary>
jan
</details>

<details>
<summary>課程中提到，比較 Date 物件時間戳記有什麼實際用途？</summary>
防止使用者短時間內重複送出表單
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [The Hard Parts of JavaScript](https://frontendmasters.com/courses/javascript-hard-parts-v3/) 課程筆記
