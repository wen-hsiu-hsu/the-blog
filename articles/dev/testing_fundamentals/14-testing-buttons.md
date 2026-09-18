---
title: '測試按鈕：用 happy-dom 驗證元素標籤、文字內容與點擊後的文字變化，這套測試手法跟框架無關'
description: '講師示範一個最陽春的原生 JavaScript 按鈕，示範怎麼驗證它是不是真的按鈕元素、初始文字對不對，以及呼叫 button.click() 模擬點擊後文字有沒有正確變化；也回答學員提問，說明 happy-dom 需要額外安裝、且這套測試手法對 Vue、Angular 這類框架同樣適用，跟框架本身無關。'
date: 2026-09-18
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 14
chapter: 'Testing the DOM'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - HappyDOM
    - DOMTesting
    - ArrangeActAssert
    - TestFiltering
---

# 測試按鈕：用 happy-dom 驗證元素標籤、文字內容與點擊後的文字變化，這套測試手法跟框架無關

延續前一篇對 JSDOM、HappyDOM 的介紹，這篇實際動手用最單純的原生 DOM 操作，練習怎麼測試一個會回應點擊的按鈕。

## 一個最陽春的按鈕範例

範例是一個叫 `element-factory` 的目錄，裡面用純 JavaScript（沒有搭配任何框架）建立一個按鈕元素：一開始文字是「Click Me」，加上點擊事件監聽器，點擊後文字會變成「Clicked!」：

```javascript
export function createButton() {
    const button = document.createElement('button');
    button.textContent = 'Click Me';

    button.addEventListener('click', () => {
        button.textContent = 'Clicked!';
    });

    return button;
}
```

這不是什麼複雜的元件，但已經足夠拿來示範怎麼測試會操作 DOM 的程式碼。要讓這類測試能執行，前提只有一個：在 `vitest.config` 裡把 `environment` 設成 `happy-dom`（或 `jsdom`），如果拿掉這行設定，測試會直接報錯，因為執行環境裡根本沒有 `document` 這個全域物件可以用。這一行設定，做的事情就是把 `document`、`window`、`navigator`、`localStorage`、`sessionStorage`、cookie 這些瀏覽器才有的東西，模擬進測試環境裡。

## 第一個測試：確認它真的是個按鈕

先驗證 `createButton` 回傳的東西，標籤名稱確實是 `BUTTON`（DOM 的標籤名稱慣例是全大寫）：

```javascript
it('should create a button element', () => {
    const button = createButton();
    expect(button.tagName).toBe('BUTTON');
});
```

## 驗證初始文字內容

接著確認按鈕一開始顯示的文字是「Click Me」：

```javascript
it('should have the text "Click Me"', () => {
    const button = createButton();
    expect(button.textContent).toBe('Click Me');
});
```

## 模擬點擊，驗證文字變化

最後驗證點擊行為：呼叫 DOM 元素原生的 `click()` 方法模擬使用者點擊，再確認文字有沒有正確變成「Clicked!」：

```javascript
it('should change the text to "Clicked!" when clicked', () => {
    const button = createButton();
    button.click();
    expect(button.textContent).toBe('Clicked!');
});
```

這三個測試合起來，剛好對應到前面提過的 Arrange、Act、Assert 三段式結構：建立按鈕是安排，呼叫 `click()` 是執行，確認文字變了是驗證。雖然這個範例本身還很粗糙，但已經完整走過一次「渲染一個 DOM 元素、跟它互動、驗證它的變化」的流程，這正是後續測試更複雜元件的基礎。

## Q&A：happy-dom 需要額外安裝嗎？

有學員問，`happy-dom` 或 `jsdom` 是不是得自己額外用 npm 安裝，還是 Vitest 會自動處理？答案是需要另外安裝成專案的相依套件，只是 Vitest 對這件事做了一點友善的引導：如果設定裡指定了 `happy-dom`、但專案裡還沒裝這個套件，Vitest 會主動詢問要不要現在安裝，按下確認鍵就會自動幫忙裝好。這樣可以避免專案裡同時裝著兩套用不到的 DOM 模擬函式庫。

## Q&A：換成 Vue，還需要另外設定嗎？

另一個問題是，如果專案用的是 Vue，是不是需要額外的設定檔案來取代 `jsdom`？答案是不需要。這行設定 `environment: 'happy-dom'` 本身跟任何前端框架都無關，只要程式碼會操作到瀏覽器的 DOM API，這套測試手法就通用：不管是拿一個 React 元件、一個 Svelte 元件，理論上也包含 Vue 或 Angular 元件都適用同樣的邏輯，差別只在於範例裡沒有示範 Vue，單純是因為講師自己沒用過 Vue，不是這套方法本身有框架限制。

## 只跑符合關鍵字的測試

Vitest 也支援用關鍵字縮小要執行的測試範圍：直接跑 `npm test` 會執行專案裡所有測試檔案，如果改成 `npm test button`，就只會執行檔名或內容符合 `button` 這個關鍵字的測試，適合在只想確認某一小部分程式碼時，不用每次都跑完整套測試件。

## 邁向能測試整個應用程式的第一小步

這幾個測試目前還很粗略：測試裡直接呼叫 `createButton()`、`click()`，斷言寫得也還不夠講究。但重點不在於這個範例本身多精緻，而在於已經具備了測試更複雜前端應用的雛型：渲染出東西、跟它互動、驗證它的行為符合預期。距離真正有信心測試一整個 Vue 或 React 應用程式還有一段距離，但確實是往那個方向邁出的第一小步。

## 複習

### 在測試裡使用 happy-dom 的目的是什麼？

它會模擬 document、window、navigator、localStorage、sessionStorage、cookie 這類 DOM API，提供一個符合規格的 DOM 版本，讓程式碼可以在測試環境裡運作

### 該怎麼測試一個點擊後會改變文字的按鈕？

按鈕的程式碼會建立一個按鈕元素、把文字設為「click me」，並加上事件監聽器，在點擊時把文字改成「clicked」。測試接著會驗證這個按鈕是不是 HTMLButtonElement、檢查它一開始的文字內容，再用 button.click() 模擬點擊事件，最後驗證文字有沒有正確變成「clicked」

### 在測試裡，有什麼方法可以用程式模擬點擊一個按鈕？

在按鈕元素上呼叫 .click() 方法，就能模擬使用者點擊這個按鈕

### DOM 操作裡的 document 全域物件代表什麼？

document 這個全域物件提供了建立、存取、修改 HTML 元素與文件結構所需的方法與屬性

### 該怎麼設定 vitest，讓它能模擬 document、window、localStorage 這類 DOM API？

在 vitest.config 裡加上 environment: 'happy-dom'（或 'jsdom'），就能提供一個符合規格的 DOM 版本供測試使用，同時也需要把 happy-dom 這個套件另外安裝成相依套件

## 小測驗

<details>
<summary>在這個範例裡，是用什麼 DOM 方法建立按鈕元素的？</summary>
document.createElement('button')
</details>

<details>
<summary>該怎麼限制 npm test 只執行特定的測試？</summary>
在 npm test 後面加上想篩選的測試名稱關鍵字
</details>

<details>
<summary>測試裡用什麼方法模擬按鈕被點擊？</summary>
button.click()
</details>

<details>
<summary>在 vitest 設定檔裡設定 happy-dom 的目的是什麼？</summary>
為測試環境模擬 document、window、navigator、localStorage、sessionStorage 這類 DOM API
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
