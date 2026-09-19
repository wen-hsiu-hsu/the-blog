---
title: 'Testing Library 入門：像螢幕報讀器一樣，用 getByRole 找元素、模擬使用者互動'
description: 'Testing Library 強迫用螢幕報讀器尋找元素的方式查詢 DOM，示範 getByRole 找不到就直接報錯即是一種驗證，並比較 fireEvent 跟更貼近真實使用者行為、需要 async/await 的 user-event 有何差異，也說明如何用 afterEach 清空按鈕。'
date: 2026-09-19
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 15
chapter: 'Testing the DOM'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - DOMTesting
    - Accessibility
    - ArrangeActAssert
    - TestingLibrary
    - UserEvent
---

# Testing Library 入門：像螢幕報讀器一樣，用 getByRole 找元素、模擬使用者互動

延續前一篇用原生 DOM API 測試按鈕的做法，這篇改用 Testing Library 這套工具，把同樣的測試寫得更貼近使用者實際看到、操作頁面的方式。

## Testing Library：一套圍繞 DOM 查詢的輔助工具

前一篇 `vitest.config` 裡其實已經悄悄帶到 Testing Library 的蹤跡。Testing Library 提供一整套操作 DOM 的輔助工具，用純粹的 `document.querySelector` 之類的原生 API 去找元素、模擬互動，其實是可以做到的，但寫起來瑣碎又容易出錯，Testing Library 的目的就是讓這件事變得更順手。

如果只是操作原生的 DOM 節點，用的是 `@testing-library/dom`；如果是 React、Svelte、Vue 元件，則各自有對應的套件。除了針對各框架多做的那一層整合之外，這幾套工具的核心概念幾乎一樣，這篇先從最基礎的 DOM 版本開始。

## 用畫面的角度找元素，而不是用 DOM 結構

Testing Library 匯出一個 `screen` 物件，可以把它想成瀏覽器畫面本身：

```javascript
import { screen } from '@testing-library/dom';
```

Testing Library 裡最有意思的設計，是它提供的查詢方法（selector），都是依照螢幕報讀器（screen reader）尋找元素的方式在運作，而不是像 jQuery 或 `document.querySelector` 那樣直接對照 DOM 結構。這代表寫測試時得用「找不找得到、找起來像不像使用者（包含依賴輔助工具的使用者）眼中看到的樣子」去思考，也連帶逼著標記寫得更符合無障礙標準，讓測試品質跟頁面的無障礙程度綁在一起。

## 把按鈕放上頁面，再用 getByRole 找出它

先把前一篇的 `createButton()` 放進頁面：

```javascript
document.body.replaceChildren(createButton());
```

用 `replaceChildren()` 而不是 `appendChild()`，是為了確保每次測試開始前，頁面上都只有這次測試自己建立的按鈕，不會因為前一個測試留下的節點，讓頁面上同時存在好幾個按鈕。

接著用 `getByRole` 依照角色跟名稱找出這個按鈕：

```javascript
const button = screen.getByRole('button', { name: 'Click Me' });
```

這裡有個值得留意的地方：`getByRole` 如果在頁面上找不到符合條件的元素，會直接拋出錯誤。也就是說，光是這一行程式碼成功執行，本身就已經隱含驗證了「頁面上確實有一個文字是 Click Me 的按鈕」這件事，不一定要再另外寫一行斷言去確認它存在。

## 用 fireEvent 觸發事件，取代直接呼叫 .click()

前一篇直接呼叫 `button.click()` 模擬點擊，這篇改用 Testing Library 提供的 `fireEvent`，用更接近瀏覽器事件機制的方式去觸發：

```javascript
import { fireEvent, screen } from '@testing-library/dom';

it('should change the text to "Clicked!" when clicked', () => {
    document.body.replaceChildren(createButton());

    const button = screen.getByRole('button', { name: 'Click Me' });

    fireEvent.click(button);

    expect(button.textContent).toBe('Clicked!');
});
```

`fireEvent.click` 做的事情，是真的組出一個點擊事件、發送到這個按鈕上，而不是單純呼叫 DOM 元素上現成的 `click()` 方法，行為上更貼近瀏覽器實際處理事件的方式。

## 每次測試後清乾淨，避免頁面上按鈕愈疊愈多

如果每個測試都往 `document.body` 裡塞一個新按鈕，卻沒有清掉上一個測試留下的內容，很快就會在頁面上同時存在好幾個按鈕，讓查詢結果變得混亂。解法是在每個測試跑完後，把 `document.body` 清空：

```javascript
afterEach(() => {
    document.body.innerHTML = '';
});
```

這樣就能確保每個測試開始時，頁面永遠是乾淨的狀態，不會被前一個測試留下的節點干擾。

## user-event：更貼近真實使用者行為的模擬

`fireEvent` 已經比直接呼叫 `.click()` 更接近瀏覽器事件機制，但 Testing Library 生態系裡還有另一個搭配使用的套件 `user-event`，模擬的層次又更進一步：它不只是丟出一個點擊事件，而是把使用者實際操作時會發生的一連串行為都模擬出來，例如滑鼠移入、按下、放開等等，盡量重現一個真人使用者互動時真正會觸發的完整過程：

```javascript
import userEvent from '@testing-library/user-event';

it('should change the text to "Clicked!" when clicked', async () => {
    document.body.replaceChildren(createButton());

    const button = screen.getByRole('button', { name: 'Click Me' });

    await userEvent.click(button);

    expect(button.textContent).toBe('Clicked!');
});
```

因為 `user-event` 提供的方法都是非同步的，測試函式必須宣告成 `async`，並且對每一次呼叫加上 `await`。

## 呼應 Arrange、Act、Assert

整理過後，這個測試依然是同一套安排、執行、驗證的結構：把按鈕安排到頁面上、確認它確實以預期的角色掛載上去，是安排；用 `user-event` 模擬一次真實的點擊，是執行；驗證文字內容有沒有照預期改變，是驗證。跟前一篇用原生 API 寫的版本相比，這裡驗證的內容一樣，但整個查詢與互動的方式都更貼近使用者（包含依賴螢幕報讀器的使用者）實際體驗頁面的方式。

## 複習

### Testing Library 選取 DOM 元素的核心設計原則是什麼？

Testing Library 強迫開發者使用依照螢幕報讀器尋找元素的方式來選取元素，這樣的設計能促使開發者寫出更具無障礙性的標記

### Testing Library 裡，有什麼函式可以用來找到一個按鈕元素？

可以用 screen.getByRole() 來找按鈕，通常會搭配特定的 name 或 role 參數一起使用

### Testing Library 裡的 fireEvent 跟 user-event 有什麼差異？

fireEvent 模擬的是基本的事件，而 user-event 則更完整地模擬使用者實際的互動行為，例如滑鼠移動、點擊，以及更複雜的操作序列

### Testing Library 的查詢方式鼓勵採用什麼樣的測試方法？

Testing Library 透過強迫使用依照螢幕報讀器尋找元素的選取方式（例如 getByRole），鼓勵以無障礙為優先的測試方法，確保測試與標記都寫得具有無障礙性

### 為什麼 Testing Library 建議使用以角色（role）為基礎的選取方式？

以角色為基礎的選取方式，能確保測試用跟螢幕報讀器相同的方式找到元素，藉此促進整體網頁的無障礙品質

## 小測驗

<details>
<summary>Testing Library 在網頁開發裡的主要用途是什麼？</summary>
提供操作 DOM 的輔助工具，並促使開發者寫出具有無障礙性的標記
</details>

<details>
<summary>Testing Library 裡，哪個工具是專門用來對 DOM 元素觸發瀏覽器事件的？</summary>
fireEvent 這個工具
</details>

<details>
<summary>有哪個套件能搭配 Testing Library，提供更進階的使用者互動模擬？</summary>
user-event 這個套件
</details>

<details>
<summary>Testing Library 的選取器設計，鼓勵採用什麼樣的測試方法？</summary>
以無障礙為核心、依照螢幕報讀器的方式進行測試
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
