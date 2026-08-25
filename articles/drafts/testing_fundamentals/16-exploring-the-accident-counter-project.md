---
title: 'Accident Counter 實戰：用 data-testid 與 jest-dom matcher 測試真實元件'
description: '講師 Steve Kinney 用一個能跑起來的計數器元件示範測試：用 Testing Playground 找選擇器、用 data-testid 取代易變動的 class，並介紹 toHaveTextContent、toBeDisabled 等 jest-dom matcher，測試手法跨框架皆通用。'
date: 2026-09-19
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 16
chapter: 'Testing the DOM'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - TestingLibrary
    - React
    - DOMTesting
    - DataTestId
    - JestDom
    - TestingPlayground
---

# Accident Counter 實戰：用 data-testid 與 jest-dom matcher 測試真實元件

延續前一篇對 Testing Library 的介紹，這篇換成一個實際能跑起來的元件，把前面學到的查詢與斷言技巧整合起來練習。

## Accident Counter：一個看得到、摸得到的範例元件

這次的範例是一個「距離上次 JavaScript 相關事故過了幾天」的計數器（Accident Counter），可以用 `npm start` 實際跑起來看。畫面上有增加、減少、重設三個按鈕，天數是 `0` 時，計數器會停用減少跟重設按鈕，畫面上的文字也會隨著天數是單數或複數自動切換單複數形式。

## Testing Playground：找出最佳選擇器的小工具

在動手寫測試之前，Steve 先介紹一個 Chrome 擴充功能 Testing Playground。它的作用類似瀏覽器內建的「檢查元素」，差別在於它會直接告訴你，針對選中的這個元素，最適合拿來查詢的無障礙選擇器（accessible selector）是什麼。不需要自己去記各種 accessibility 查詢語法的細節，打開這個工具、點選想找的元素，它就會建議該用哪種方式查詢；如果目前的標記沒有寫出理想的查詢方式，工具通常也會順便給出建議，這在開發階段本身也很有幫助。

## render：跨框架共用的統一介面

這個計數器元件是用 React 寫的，但 Steve 強調測試的重點完全不需要理解 React 元件內部在做什麼，需要在意的只有測試本身。這裡改用 `@testing-library/react`，跟前面用的 `@testing-library/dom` 不同的地方，在於它多提供了一個 `render` 方法，可以直接把一個 JSX 元件掛載到頁面上，不需要自己手動處理 `document.body` 這類細節。

如果不是用 React，Testing Library 針對 Svelte、Vue 也都提供了對應的套件，用法幾乎一致：一樣有 `render` 方法，只是不用傳 JSX，改成傳元件本身跟要給它的 props。測試手法本身刻意設計成跟框架無關，這也是為什麼從 React 換成 Svelte 或 Vue，整個測試的思路幾乎不需要調整。

## 用 data-testid，而不是 class 或 id 當查詢依據

除了角色（role）之外，測試裡有時候需要另一種查詢方式，這時可以在標記上加一個 `data-testid` 屬性。這裡背後的理由跟 class、id 有關：class 通常是設計上用來套樣式的，設計一調整就很容易跟著變動，如果測試依賴 class 去查詢元素，樣式一改，測試就可能無故壞掉；`data-testid` 則是專門為了測試而存在的屬性，不會因為視覺設計調整而跟著變動。

計數器上代表目前天數的元素加了 `data-testid="counter-count"`，測試就可以用這個穩定的識別依據找到它：

```javascript
beforeEach(() => {
    render(<Counter />);
});

it('renders with an initial count of 0', () => {
    const countElement = screen.getByTestId('counter-count');

    expect(countElement).toHaveTextContent('0');
});
```

`beforeEach` 裡的 `render(<Counter />)`，確保每個測試開始前，這個計數器元件都會重新掛載一次。

## jest-dom：讓斷言讀起來更貼近人話的一批 matcher

上面這段程式碼裡出現的 `toHaveTextContent`，不是 Vitest 內建的 matcher，而是由 `@testing-library/jest-dom` 這個套件額外提供、專門針對 DOM 元素設計的斷言方法。除了 `toHaveTextContent`，還有像 `toHaveAttribute`（檢查某個 HTML 屬性是否存在）、`toHaveClass`（檢查是否套用了某個 class）、`toHaveFocus`（檢查是否處於聚焦狀態）、`toHaveFormValues`、`toBeDisabled` 等一整批針對 DOM 情境設計的 matcher，讓斷言不用自己拼湊底層的 DOM 屬性判斷，直接寫出貼近人類語言的斷言句子。

## 驗證按鈕在初始狀態下確實處於停用狀態

用同樣的 `screen.getByRole` 找出減少、重設兩個按鈕，搭配 `toBeDisabled` 驗證它們在天數是 `0` 時確實處於停用狀態：

```javascript
it('disables the "Decrement" and "Reset" buttons when the count is 0', () => {
    const decrementButton = screen.getByRole('button', { name: 'Decrement' });
    const resetButton = screen.getByRole('button', { name: 'Reset' });

    expect(decrementButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
});
```

`getByRole` 的第二個參數 `name` 可以接受大小寫不敏感的正規表示式，是常見的寫法。這樣即使按鈕文字的大小寫略有調整，或文字裡多了一些其他內容（例如「Decrement（0）」這種帶著額外資訊的按鈕文字），只要符合這個模式，測試依然找得到目標，不會因為文字上的小變動就整個壞掉。

## 跟 add、subtract 函式相比，本質上沒有太大不同

如果不想使用這套依照無障礙查詢方式運作的工具，也完全可以直接改用 `document.querySelector` 這類原生 DOM API，Testing Library 提供的只是一種更貼近使用者實際操作方式的選項，而不是唯一的做法。

整理過後可以發現，這裡的測試流程跟前面測 `add`、`subtract` 這類純函式的測試，骨架上幾乎沒有差別：`beforeEach` 裡把元件掛載到頁面上，接著用查詢方法找出想驗證的元素，最後用一連串的斷言確認它們的狀態符合預期。唯一多出來的部分，只是多了「先把東西掛到頁面上」這道手續，以及換了一批更貼近 DOM 情境的 matcher，核心的測試邏輯跟先前完全一致。

## 複習

### 替元素加上 data-testid 屬性的目的是什麼？

data-testid 提供一種穩定的方式來選取要測試的元素，不會因為設計或樣式調整而跟著改變，跟容易變動的 class 或 id 不同

### 測試裡匹配按鈕名稱時，有什麼建議的寫法？

使用大小寫不敏感的正規表示式，這樣即使按鈕文字的大小寫有些微變化，或包含額外的文字內容，測試依然能通過

### 為什麼測試不該依賴 CSS class 來選取元素？

CSS class 經常會因為設計師調整樣式而改變，這可能導致測試因此壞掉。改用像 data-testid 這種穩定的識別方式，能讓測試在設計反覆調整的過程中依然保持穩健

### screen 這個物件在測試裡提供了什麼？

screen 物件提供了一系列依照無障礙查詢方式尋找元素的輔助工具，讓開發者能用更貼近使用者實際使用方式的方法定位並操作頁面上的元素

### 使用無障礙查詢方式進行測試，有什麼好處？

無障礙查詢能確保測試用更貼近依賴輔助科技的使用者實際操作應用程式的方式進行互動；同時也能避免測試跟 CSS class、樣式這類經常變動的實作細節綁在一起，讓測試在設計調整時更不容易壞掉

## 小測驗

<details>
<summary>替 HTML 元素加上「data-testid」屬性的目的是什麼？</summary>
提供一個穩定的選擇器，不會因為設計調整而改變
</details>

<details>
<summary>Testing Library 裡的 screen.getByRole() 方法通常用來做什麼？</summary>
依照元素的無障礙角色與名稱找出元素
</details>

<details>
<summary>選取元素時，為什麼建議使用大小寫不敏感的正規表示式？</summary>
讓測試對文字內容的微小差異更有彈性、更不容易因此壞掉
</details>

<details>
<summary>使用像 getByRole 這類無障礙查詢方式，相較於 querySelector 的主要優勢是什麼？</summary>
即使 CSS class 或樣式改變，測試依然能保持穩定
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
