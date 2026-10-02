---
title: "Alert Spy 練習：用 vi.spyOn(window, 'alert') 抓出忘記清空欄位的 bug"
description: "這篇是實戰練習：替 AlertButton 元件寫測試，用 vi.spyOn(window, 'alert') 監看按鈕點擊後的 alert 呼叫，過程中因為忘記先清空輸入框，意外抓到預設值跟輸入文字串接在一起的 bug，最後也討論比起監看內建函式，把預設行為改成可覆寫的 prop 傳進去會是更好的做法。"
date: 2026-10-03
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 22
chapter: 'Stubs, Spies, and Mocks'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - React
    - TestDoubles
    - Spies
    - SpyOn
    - ToHaveBeenCalled
    - UserEvent
    - Act
    - DependencyInjection
    - ItOnly
    - TestDrivenDevelopment
---

# Alert Spy 練習：用 vi.spyOn(window, 'alert') 抓出忘記清空欄位的 bug

延續前幾篇對 spy 跟 mock 的介紹，這篇是一個實戰練習：幫一個會觸發 `alert` 的按鈕元件寫測試，監看的對象從先前的 `console.log`、`Math.random` 換成瀏覽器內建的 `window.alert`。

## 練習題：驗證按下按鈕會觸發 alert

要測試的元件是 `AlertButton`：畫面上有一個標籤為「Message」的輸入欄位，預設值是「Alert!」，還有一顆「Trigger Alert」按鈕，點擊後會用輸入框目前的內容呼叫 `alert`：

```jsx
import { useState } from 'react';

export const AlertButton = ({}) => {
    const [message, setMessage] = useState('Alert!');

    return (
        <div>
            <label>
                Message
                <input
                    type='text'
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                />
            </label>

            <button onClick={() => alert(message)}>Trigger Alert</button>
        </div>
    );
};
```

## 一步步找到要測的元素

先把元件掛載上去，再用 `getByLabelText` 找輸入框，`getByRole` 找按鈕。輸入文字這類互動包進 `act` 裡，確保 DOM 更新完成後再往下走，這點跟前面在 Accident Counter 練習裡養成的習慣一致。開發過程中，也可以先在正在寫的這個測試上加 `it.only`，讓測試執行器只跑這一個測試，方便專心除錯，等寫完記得拿掉，不要不小心連著 `.only` 一起 commit 上去。

## 用 vi.spyOn 監看 window.alert

跟前面用 `vi.spyOn` 監看 `console.log`、`Math.random` 的做法一樣，這次改成監看 `window` 物件上的 `alert` 方法：

```javascript
const alertSpy = vi.spyOn(window, 'alert');
```

這次沒有額外用 `mockImplementation` 換掉 `alert` 的行為。在 JSDOM 這種模擬瀏覽器環境裡，呼叫 `alert` 到底會不會產生什麼副作用，其實當下也說不準，索性先不加 `mockImplementation`，直接讓它照原本的方式「執行」，看看測試會不會因此出錯；跟真正攔截、換掉行為的 `mockImplementation` 用法比起來，這算是風險比較小的嘗試方式，結果也證實單純觀察它有沒有被呼叫就夠了。

## 一次因為忘記清空欄位而抓到的 bug

點擊按鈕後，先確認 `alert` 有沒有被呼叫過：

```javascript
expect(alertSpy).toHaveBeenCalled();
```

這個斷言順利通過。但接著想確認 `alert` 是不是帶著正確的訊息文字被呼叫，例如輸入「Hello」之後，預期 `alert` 收到的參數就是 `'Hello'`，卻發現實際呼叫時帶的字串裡還留著輸入框原本的預設值「Alert!」，變成「Alert!」跟「Hello」黏在一起的字串：

```javascript
await act(async () => {
    await userEvent.type(input, 'Hello');
    await userEvent.click(button);
});

expect(alertSpy).toHaveBeenCalledWith('Hello');
// ✗ 實際呼叫時帶的參數其實是 'Alert!Hello'
// 因為 userEvent.type 是接著游標位置輸入，不會先清空原本的內容
```

問題出在 `userEvent.type` 只會把文字接在輸入框現有內容的後面，並不會先清空欄位，而這個輸入框一開始就帶著「Alert!」這個預設值。修正方式是在輸入文字前，先用 `userEvent.clear` 把欄位清空：

```javascript
await act(async () => {
    await userEvent.clear(input);
    await userEvent.type(input, 'Hello');
    await userEvent.click(button);
});

expect(alertSpy).toHaveBeenCalledWith('Hello');
```

這也是測試意外幫忙抓到問題的一個例子：不是元件本身有 bug，而是測試寫法本身漏了一步，測試失敗的訊息剛好提醒了這件事。

## 完整測試解答

把上面幾步串起來，完整的測試如下：

```jsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AlertButton } from './alert-button';

describe('AlertButton', () => {
    beforeEach(() => {});

    afterEach(() => {});

    it('should trigger an alert', async () => {
        render(<AlertButton />);

        const alertSpy = vi.spyOn(window, 'alert');

        const input = screen.getByLabelText('Message');
        const button = screen.getByRole('button');

        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, 'Hello');
            await userEvent.click(button);
        });

        expect(alertSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Hello');
    });
});
```

## 更好的做法：依賴注入，把預設行為變成可覆寫的 prop

寫完這個測試後，也提出一個延伸的問題：與其伸手進去監看 `window.alert` 這個內建的東西，能不能一開始就讓這個元件更好測？呼應前一篇提過的依賴注入精神，可以讓元件接受一個外部傳入的處理函式，預設才是呼叫 `alert`，例如傳入 `handleSubmit`，測試時就能直接傳一個 mock 函式進去，驗證 `handleSubmit` 有沒有被正確呼叫、帶的參數對不對，完全不需要碰 `window.alert`：

```javascript
expect(handleSubmit).toHaveBeenCalled();
expect(handleSubmit).toHaveBeenCalledWith('Hello');
```

這個轉換過程正好也是測試驅動開發精神的延伸應用：先把測試改成期望呼叫 `handleSubmit` 的樣子，這時候測試理所當然會先失敗，因為元件還不支援外部傳入的處理函式，再回頭修改元件讓它接受這個 prop、預設才呼叫 `alert`，測試才會轉綠。

這個原則不只適用在 `alert`，換成 `console.log`、`Math.random`，或任何拿不到手的外部依賴都一樣：如果為了 mock 某個東西而感到卡關、困惑，通常代表不需要用 mock 硬解，該做的是把這段行為改成可以從外部傳進去的參數，讓預設值維持原本的行為，但使用的人也能自由替換掉它。

## 複習

### 在 JavaScript 測試裡，該怎麼監看像 alert 這種內建函式？

用 vi.spyOn(window, 'alert') 建立一個監看 window 物件 alert 方法的 spy，藉此追蹤這個函式有沒有被呼叫、呼叫時帶了什麼參數

### 讓函式更好測試、更有彈性的建議做法是什麼？

把原本寫死的功能改成用 prop 或參數傳進去，而不是直接呼叫內建方法，這樣測試時更容易替換掉這段行為，也能取得更多控制權

### 該怎麼驗證一個函式在測試裡是用特定參數被呼叫的？

可以用像 expect(handleSubmit).toHaveBeenCalledWith('expectedArgument') 這樣的斷言，同時確認函式有沒有被呼叫，以及呼叫時帶的參數是否正確

### 用參數傳入函式，而不是寫死實作，有什麼好處？

這樣能提供更多彈性、讓測試更容易進行，也能讓使用這個函式的人視情況覆寫掉預設行為，同時保留一個合理的預設實作

### 測試時該怎麼跟表單欄位互動，模擬使用者操作？

可以用 userEvent.type() 把文字輸入到表單欄位裡，用 userEvent.clear() 清空欄位內容，模擬真實使用者的操作方式

## 小測驗

<details>
<summary>測試裡有什麼方法可以用來監看內建的 window.alert 函式？</summary>
vi.spyOn(window, 'alert')
</details>

<details>
<summary>先寫一個會失敗的測試，再寫最少量的程式碼讓它通過，最後再重構，這種開發方式叫什麼？</summary>
測試驅動開發（Test-Driven Development，TDD）
</details>

<details>
<summary>比起直接使用全域方法，把函式當成參數傳入有什麼關鍵好處？</summary>
能取得更多控制權，測試起來也更容易
</details>

<details>
<summary>當元件用到像 alert 或 Math.random() 這類內建函式時，有什麼建議的做法能讓測試更容易？</summary>
把這段行為變成可以傳入的 prop 或參數，預設值維持原本的內建函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
