---
title: 'TypeScript 交集型別實戰：用 printEven 等函式驗證嚴格但通用的型別，兼談與聯集的不對稱關係'
description: '延續前一篇聯集型別的 printEven、printLowNumber 等函式範例，改用交集型別（&）重新測試，示範它接受的值範圍極窄，卻能同時滿足多個函式各自的型別要求，並整理聯集與交集在「接受什麼值」與「能保證什麼」上呈現的不對稱關係，最後說明交集型別為何在實務中比聯集罕見得多，以及最常出現的實際場合。'
date: 2026-09-03
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 12
chapter: 'Union and Intersection Types'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - IntersectionTypes
    - UnionTypes
    - ObjectAssign
    - SpreadOperator
---

# TypeScript 交集型別實戰：用 printEven 等函式驗證嚴格但通用的型別

> [[11-union-types|前面]] 用 `printEven`、`printLowNumber`、`printEvenNumberUnder5`、`printNumber` 這幾個函式，實際驗證了較嚴格函式會逐一擋下聯集型別 `evenOrLowNumber` 傳入的值。這一節用同樣的手法，換成交集型別再測一次，正好能看出兩者完全相反的行為。

## 用同一組函式，反過來驗證交集型別

延續 `Evens`、`OneThroughFive` 這兩個集合，這次建立它們的交集型別：

```ts
let evenAndLowNumber: Evens & OneThroughFive;
evenAndLowNumber = 4 as Evens & OneThroughFive; // 可以
evenAndLowNumber = 6 as Evens & OneThroughFive; // 錯誤：6 不是 1 到 5 之間的數字
evenAndLowNumber = 3 as Evens & OneThroughFive; // 錯誤：3 不是偶數
```

聯集型別 `evenOrLowNumber` 幾乎來者不拒，只要值屬於任一集合就能通過，唯獨不接受完全不相關的型別（例如字串）。交集型別則完全相反，非常挑剔：`6` 不被接受，因為 `6` 不在 1 到 5 之間；`3` 也不被接受，因為 `3` 不是偶數。整個交集型別只願意接受 `2` 跟 `4` 這兩個值。

但如果換個角度，看這個交集型別實際上可以拿去哪裡用：

```ts
printEven(evenAndLowNumber); // 可以
printLowNumber(evenAndLowNumber); // 可以
printEvenNumberUnder5(evenAndLowNumber); // 可以
printNumber(evenAndLowNumber); // 可以
```

`printEven`、`printLowNumber`、`printEvenNumberUnder5`、`printNumber` 這幾個函式全都樂意接受這個交集型別，因為它保證同時是偶數、也保證落在 1 到 5 之間，自然也保證是一個數字。回頭比較 [[11-union-types|前面]] 那組函式套用在聯集型別 `evenOrLowNumber` 上失敗的結果：傳進 `printEven` 卡在 `1`、傳進 `printLowNumber` 卡在 `6`、傳進 `printEvenNumberUnder5` 也卡在 `6`，只有 `printNumber` 這個要求最寬鬆的函式能接受。同樣是這幾個函式，聯集型別幾乎全部碰壁，交集型別卻全部過關，形成鮮明的對照。

## 聯集與交集之間的不對稱關係

這個現象揭露了聯集型別跟交集型別之間有趣的不對稱關係。交集型別代表的是「同時屬於兩個集合」的值，因為值同時滿足兩邊的要求，也就同時擁有兩邊各自允許的所有行為跟方法，可以放心拿去用在任何一邊原本各自需要的地方。

從「值能接受什麼」與「能對成員保證什麼」這兩個角度重新對照：聯集型別在「能接受什麼值」這一端非常寬鬆，幾乎任何屬於其中一個集合的值都能加入，但「能對每個成員保證什麼」這一端卻很薄弱，最多只能確定它是一個小於十的數字，既不能保證是偶數，也不能保證落在 1 到 5 之間。交集型別剛好相反，「能接受什麼值」這一端極度嚴格，但「能對每個成員保證什麼」這一端反而最豐富，保證它同時是偶數、也同時落在 1 到 5 之間，前面那幾個函式全部都能接受，正是這份不對稱關係最直接的示範。

## 交集型別在實務中很罕見，主要出現在合併物件的場合

雖然交集型別的概念值得理解，但在實際應用程式的程式碼裡非常少見。相較於聯集型別因為控制流程而幾乎無所不在，交集型別出現的比例可能低到五十分之一甚至一百分之一。

交集型別比較常出現的場合，是像 `Object.assign` 或物件展開運算子這類「把兩個物件合併成一個」的操作。這些情境下，開發者通常不會自己動手明確寫出交集型別的語法，而是這個合併行為在背後自然產生出一個交集型別，讓合併後的物件同時擁有兩個來源物件各自的屬性。

## 複習

### 交集型別跟聯集型別在「能接受哪些值」上有什麼差異？

交集型別對能接受的值非常挑剔，值必須同時符合構成交集的每一個集合的要求；聯集型別則寬鬆得多，只要值屬於其中任何一個集合就能被接受。

### 交集型別搭配函式使用時會有什麼行為？

交集型別可以傳進任何一個原本只接受其中一個構成型別的函式，因為交集型別同時滿足兩個集合的所有要求，等於同時具備兩邊各自允許的行為，可以拿去用在任何一邊原本需要的地方。例如同時是「偶數」與「1 到 5 之間的低數字」的交集型別（如 2 或 4），可以傳進只接受偶數的函式、只接受低數字的函式，也可以傳進只接受一般數字的函式，因為它同時滿足這些限制條件。

### 交集型別在實際應用程式中最常出現在哪兩種情境？

交集型別在應用程式碼裡相當罕見（相較於聯集型別，比例可能低到五十分之一甚至一百分之一），比較常出現的兩種情境是 `Object.assign` 和物件展開運算子，這兩種操作都在把兩個物件合併成一個，這種情況下交集型別經常是在背後隱含產生的，不一定是開發者親手寫出來的。

### 一個由「偶數」與「1 到 5 之間的數字」組成的交集型別，具體能接受哪些值？

只能接受 `2` 跟 `4` 這兩個值，因為它們是唯一同時滿足「是偶數」跟「落在 1 到 5 之間」這兩個條件的數字。

## 小測驗

<details>
<summary>交集型別在實際應用程式碼中，常見的使用場合是什麼？</summary>
Object.assign 與物件展開運算子這類合併物件的操作
</details>

<details>
<summary>相較於聯集型別，交集型別提供了什麼樣的型別保證？</summary>
交集型別保證同時具備兩個型別各自的所有屬性，聯集型別則只能保證兩者共同擁有的屬性
</details>

<details>
<summary>交集型別當作函式引數傳遞時，有什麼關鍵特性？</summary>
可以傳進任何一個原本只接受其中一個構成型別的函式
</details>

<details>
<summary>由「偶數」與「1 到 5 之間的數字」組成的交集型別，能接受哪些值？</summary>
只有 2 和 4
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
