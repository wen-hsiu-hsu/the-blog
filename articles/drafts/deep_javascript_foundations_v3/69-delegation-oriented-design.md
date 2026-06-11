---
title: '委派導向設計：從父子繼承到平行協作'
description: '說明委派（delegation）如何用平行協作取代垂直繼承，透過原型鏈與 this 共享上下文讓物件動態組合，以及委派模式在可測試性上的優勢。'
date: 2026-06-29
section: dev
category: Deep JavaScript Foundations v3
series: deep_javascript_foundations_v3
seriesTitle: 'Deep JS Foundations v3'
order: 69
chapter: 'Prototypes'
tags:
  - JavaScript
  - frontendMasters
  - deepJavaScriptFoundationsV3
  - PrototypeChain
  - OOP
  - ThisKeyword
---

# 委派導向設計：從父子繼承到平行協作

> 本篇是第三大主題的收尾。前幾篇建立了原型鏈的完整理解，並介紹了 OLOO 模式作為 `class` 的替代寫法。本篇更進一步，說明委派（delegation）不只是不同的程式碼風格，而是解決問題的不同思維方式。

## 三種傳統的物件組合方式

以一個登入頁面為例，假設需要兩個 controller：`AuthController`（處理伺服器認證）與 `LoginFormController`（處理 UI 互動）。如何讓它們協同運作？

### **透過繼承組合（Composition Thru Inheritance）**

讓 `LoginFormControllerClass` 繼承 `AuthControllerClass`，實例化後得到包含兩者所有方法的 `pageInstance`。這是 1980、90 年代的主流思維，也是典型的垂直繼承鏈。

### **優於繼承的組合（Composition Over Inheritance）**

分別實例化兩個類別，把 `authInstance` 作為 `pageInstance` 的屬性。不再使用深層繼承鏈，改用水平組合。

### **混入組合（Mixin Composition）**

分別實例化後，把 `authInstance` 的所有方法複製到 `pageInstance` 上，讓它們共存於同一個物件中。

這三種方式都在回答同一個問題：如何讓兩個邏輯上分開的東西，在需要的時候能夠合作？但它們都從類別與實例的角度思考，只是組合的方式不同。

## 委派的思維轉換：平行協作取代父子繼承

委派要求的是一個根本的心智轉變：

> **停止思考父類別與子類別，開始思考平行存在的對等物件（peer-to-peer）。**

在委派的思維中，`LoginFormController` 不是 `AuthController` 的子類別，也不是它的實例。兩者是兩個獨立的物件，只是透過原型鏈相互連結。當它們需要合作時，透過原型鏈委派方法呼叫，並共享 `this` 上下文。

### 委派導向設計的實作

```javascript
var AuthController = {
  authenticate() {
    server.authenticate(
      [this.username, this.password],
      this.handleResponse.bind(this)
    );
  },
  handleResponse(resp) {
    if (!resp.ok) this.displayError(resp.msg);
  }
};

var LoginFormController = Object.assign(
  Object.create(AuthController),
  {
    onSubmit() {
      this.username = this.$username.val();
      this.password = this.$password.val();
      this.authenticate();
    },
    displayError(msg) {
      alert(msg);
    }
  }
);
```

這裡有兩個獨立的具體物件，`LoginFormController` 透過原型鏈連結到 `AuthController`。

當 `onSubmit` 呼叫 `this.authenticate()` 時，`LoginFormController` 本身沒有這個方法，因此委派給 `AuthController`。但 `this` 仍然指向 `LoginFormController`，因此 `AuthController.authenticate` 裡的 `this.username` 和 `this.password` 存取的是 `LoginFormController` 上的屬性。

當 `handleResponse` 呼叫 `this.displayError()` 時，`AuthController` 本身沒有 `displayError`，透過原型鏈回頭找到 `LoginFormController` 上的方法。

兩個物件透過共享的 `this` 上下文，在函式呼叫的當下實現動態組合，Kyle Simpson 稱之為 Virtually Composed。

## 委派的可測試性優勢

委派模式在測試上帶來顯著的好處。由於物件之間只透過原型鏈相互連結，要替換連結對象非常容易，不需要修改任何原始程式碼。

**測試 `LoginFormController`（mock 掉 `AuthController`）：**

只需建立一個 `MockAuthController`，並讓 `LoginFormController` 的原型指向它，而非真實的 `AuthController`。

**測試 `AuthController`（mock 掉 `LoginFormController`）：**

建立一個 `MockLoginFormController`，讓它的原型連結到 `AuthController`，再透過它發出呼叫。

每個物件都可以獨立測試，不需要 dependency injection，不需要修改程式碼，只需要改變原型鏈的連結目標。

## 委派是 JavaScript 的 DNA

Kyle Simpson 以這個對比作為整個主題的結語：

`class` 語法試圖讓 JavaScript 表現得像 Java 或 C++，但那是一個複製操作的心智模型套在一個連結操作的系統上。JavaScript 原生就能做的事，是委派，是原型連結。

委派不只是另一種程式碼風格，它是更貼近 JavaScript 設計本質的問題解決方式：兩個獨立的物件，各自負責自己的事，需要合作時透過連結共享上下文，而不是強行把一切都塞進同一個繼承鏈。

## 複習

### 委派與傳統類別繼承的主要差異是什麼？

委派強調平行的對等物件關係，而非父子繼承層級。物件透過原型鏈連結與 `this` 共享上下文來合作，而非透過繼承把所有行為塞進同一個實例。

### 原型委派如何讓物件之間共享方法？

當一個物件需要某個它沒有的方法時，可以透過原型鏈委派該方法呼叫，同時在執行期間保持原始物件的 `this` 上下文不變。

### 委派在測試上提供了什麼優勢？

只需改變原型鏈的連結目標，即可輕鬆 mock 物件，不需要複雜的 dependency injection 或修改原始程式碼，讓各物件可以獨立測試。

### 委派要求開發者在設計軟體時進行什麼思維轉變？

停止以父子關係思考，改以對等物件的視角出發：物件各自獨立，需要合作時透過原型連結共享上下文。

### 委派的物件在方法呼叫時如何互相存取資料？

透過 `this` 關鍵字，委派的物件可以在保持原始執行上下文的情況下，互相存取和使用對方的屬性與方法。

## 小測驗

<details>
<summary>委派與傳統類別繼承在物件組合上的關鍵差異是什麼？</summary>
委派強調平行的對等物件關係，而非父子繼承層級
</details>

<details>
<summary>JavaScript 中委派如何讓物件之間共享方法？</summary>
透過原型鏈與共享的 `this` 上下文
</details>

<details>
<summary>委派在測試軟體元件上提供了什麼優勢？</summary>
只需改變原型鏈連結即可獨立 mock 物件
</details>

<details>
<summary>在委派方式中，物件需要合作時如何互動？</summary>
透過原型鏈共享呼叫上下文
</details>

<details>
<summary>委派在物件組合上的核心思維轉變是什麼？</summary>
從父子繼承關係轉向對等物件的平行協作
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Deep JavaScript Foundations, v3](https://frontendmasters.com/courses/deep-javascript-v3) 課程筆記