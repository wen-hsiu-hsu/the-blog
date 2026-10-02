---
title: 'Accident Counter 練習：用 act() 等待重新渲染，以 initialCount 測不同起始狀態'
description: '這篇透過一系列 Accident Counter 練習題，示範 act() 如何等待重新渲染再斷言、initialCount prop 如何讓元件從特定狀態起跑，也記錄一次因為 getByRole 正規表示式打錯、忘記重新 render 而除錯的過程，並比較單一測試涵蓋完整流程跟拆成多個小測試的取捨。'
date: 2026-10-01
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 17
chapter: 'Testing the DOM'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - React
    - TestingLibrary
    - UserEvent
    - Act
    - DOMTesting
    - TestGranularity
    - InitialCountProp
    - ArrangeActAssert
    - TestDebugging
    - ScopedQueries
---

# Accident Counter 練習：用 act() 等待重新渲染，以 initialCount 測不同起始狀態

延續前一篇對 Accident Counter 元件的介紹，這篇是講師出給學員的練習題，讓大家實際動手替這個計數器元件補上一整批測試，再回來一起檢討寫的過程中遇到的難點。

## 選擇器要挑得夠精準，別被 Testing Playground 的建議牽著走

第一題要驗證天數是 `0` 時，畫面顯示的單位文字是複數的「days」。Testing Playground 這個工具建議用 `getByText('days')` 去找，理由是目前頁面上只有這一個元素符合。但這種選擇器過於通用，一旦畫面上其他地方也出現「days」這個字，測試就可能抓錯元素，或是直接因為找到多個符合結果而報錯。

計數器元件已經替顯示單位的那個字加上了專屬的 test id，跟前一篇替天數本身加上的 `counter-count` 是同樣的做法，因此改用這個更穩定的依據去查詢：

```javascript
it('displays "days" (plural) when the count is 0', () => {
    render(<Counter />);

    const unit = screen.getByTestId('counter-unit');

    expect(unit).toHaveTextContent('days');
});
```

## 共用查詢要不要包進 beforeEach，是取捨而非鐵律

寫「點擊增加按鈕時天數會加一」這個測試前，需要先找到增加按鈕。這裡很容易聯想到把 `getByRole` 這類共用查詢搬進 `beforeEach`，讓每個測試都能直接拿到現成的變數。

但把邏輯抽進 `beforeEach` 也有代價：下次回來看這個測試通常是它壞掉的時候，這時候如果所有的查詢都寫在測試本身裡面，會更容易一眼看出這個測試到底在檢查哪個元件、用了哪些查詢，不用跳到別的地方對照。這沒有絕對正確的答案，寫測試本身也有不少地方是這樣，規則清楚到能寫成硬性規範的部分，早就被編譯器或框架接管掉了，剩下的才輪到工程師自己拿捏取捨。

## 用 act() 確保斷言發生在 DOM 重新渲染完成之後

增加按鈕的測試找到按鈕後，用 `userEvent.click` 模擬點擊，再驗證天數變成 `1`：

```javascript
it('increments the count when the button is clicked', async () => {
    render(<Counter />);

    const incrementButton = screen.getByRole('button', { name: /increment/i });
    const count = screen.getByTestId('counter-count');

    await userEvent.click(incrementButton);

    expect(count).toHaveTextContent('1');
});
```

這個測試在這裡會直接通過，因為狀態變化很單純，畫面很快就更新完成。但如果換成一個會打 API、等回應回來才把結果渲染到頁面上的情境，測試就可能在畫面真正更新之前就跑去斷言，導致明明程式邏輯是對的，測試卻因為時機沒對上而失敗。這種問題常出現在使用框架、且框架本身需要一段時間協調（reconcile）DOM 更新的情況，如果是直接手動操作 DOM，通常不會遇到這個問題。

處理這種情境的方式是用 `act()`，把互動包起來，等 DOM 重新渲染、進入穩定狀態之後，再去查看頁面上的內容：

```javascript
await act(async () => {
    await userEvent.click(incrementButton);
});

expect(count).toHaveTextContent('1');
```

`act()` 呼應的正是測試結構裡「安排、執行、驗證」三段式中的「執行」那一段：做完所有動作之後，先等一次重新渲染，再進到驗證階段。這一步在天數只有一位數的計數器上看不太出差別，但換成得等一輪以上更新週期的情境，就是最先會撞到的關卡。

## 為了未來的變動保持測試穩健，從一開始就用 act()

天數為 `1` 時單位要顯示單數的「day」，這題邏輯上跟前面兩題很像，差別在於這次從一開始就用 `act()` 包住互動，即使目前這個情境嚴格來說不一定需要，也是替測試預先留下對未來變動的容錯空間：

```javascript
it('displays "day" (singular) when the count is 1', async () => {
    render(<Counter />);

    const incrementButton = screen.getByRole('button', { name: /increment/i });
    const unit = screen.getByTestId('counter-unit');

    await act(async () => {
        await userEvent.click(incrementButton);
    });

    expect(unit).toHaveTextContent('day');
});
```

## initialCount prop：讓元件能從特定狀態開始測試

減少按鈕的測試遇到一個哲學問題：計數器預設從 `0` 開始，減少按鈕在 `0` 的時候是停用的，要驗證「點擊減少按鈕會讓天數減一」，得先讓元件處在天數大於 `0` 的狀態。有兩個做法：先點一次增加按鈕把狀態墊上去，或是讓元件多接受一個 `initialCount` prop，讓測試可以直接從指定的狀態開始。

班上討論後選了後者，元件多了 `initialCount` prop，沒有傳入時預設維持 `0`。這個決定也連帶讓「用 `beforeEach` 統一掛載元件」這件事變得不再是理所當然的選擇，因為現在不同測試可能想讓元件從不同的初始狀態開始，統一放進 `beforeEach` 反而綁死了這個彈性：

```javascript
it('is not disabled when the count is 1', () => {
    render(<Counter initialCount={1} />);

    const decrementButton = screen.getByRole('button', { name: /decrement/i });

    expect(decrementButton).not.toBeDisabled();
});
```

## 一次因為打錯字而抓出的除錯示範

寫上面這個測試的第一次嘗試，`name` 直接寫成了跟變數名一樣的字面字串，而不是拿來匹配按鈕可存取名稱的正規表示式，測試因此找不到元素而失敗：

```javascript
const decrementButton = screen.getByRole('button', { name: 'decrementButton' });
// TestingLibraryElementError: Unable to find an accessible element
// with the role "button" and name "decrementButton"
```

改成跟前面 `increment` 按鈕一樣、大小寫不敏感的正規表示式後就修好了：

```javascript
const decrementButton = screen.getByRole('button', { name: /decrement/i });
```

修好這個測試之後，等於也確認了「天數是 `1` 時減少按鈕不會被停用」這個行為原本就正確，接下來可以放心繼續往下寫，不用擔心這一步的重構意外破壞了什麼。

## 把多個斷言塞進同一個測試，是覆蓋率跟除錯難度的取捨

驗證「點擊減少按鈕天數會減一」的測試，一樣用了完整的 `act()` 寫法：

```javascript
it('decrements the count when the button is clicked', async () => {
    render(<Counter initialCount={1} />);

    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    const count = screen.getByTestId('counter-count');

    await act(async () => {
        await userEvent.click(decrementButton);
    });

    expect(count).toHaveTextContent('0');
});
```

從這個測試還能再延伸出更多測試，例如驗證傳入 `initialCount` 之後畫面上顯示的數字是否正確，或是天數是 `1` 時按鈕不應該是停用狀態。這些斷言可以拆成獨立的小測試，也可以合併寫進同一個測試裡，串成一個完整流程：從 `1` 開始、確認按鈕沒被停用、點擊減少按鈕、確認天數變成 `0`、再確認按鈕重新變回停用狀態。

拆成小測試的好處是，測試一旦失敗，能立刻知道問題出在哪一步；合併成一個測試則能用一個測試涵蓋更完整的使用情境，代價是測試失敗時得多花點力氣才能定位到底是哪一步出了問題。有趣的是，之後講到 Playwright 時，建議的方向反而相反：因為啟動、關閉瀏覽器的成本很高，通常會傾向把整個流程塞進一個測試裡一次跑完。這些取捨沒有哪個是不可打破的鐵律，更多是各自情境底下權衡出來的合理做法。

## 停用狀態下點擊按鈕，不該產生任何效果

天數是 `0` 時，減少按鈕理應是停用的，但測試依然值得驗證：就算真的點了這顆停用的按鈕，天數也不會意外變成負數。同時也是一個提醒，測試不是只能靠 Testing Library 的查詢方式，真的有需要時，直接用 `document.querySelector` 這類原生 API 也完全可以：

```javascript
it('does not change the count when the disabled decrement button is clicked', async () => {
    render(<Counter />);

    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    const count = screen.getByTestId('counter-count');

    await userEvent.click(decrementButton);

    expect(count).toHaveTextContent('0');
});
```

## 別忘了重新渲染元件：一次真實的除錯過程

最後一題驗證點擊增加按鈕後，`document.title` 也會跟著更新。第一次寫的時候忘了在這個測試裡呼叫 `render(<Counter />)`，直接就去找增加按鈕，測試自然找不到元素而失敗：

```javascript
it('updates the document title after incrementing', async () => {
    const incrementButton = screen.getByRole('button', { name: /increment/i });

    await act(async () => {
        await userEvent.click(incrementButton);
    });

    expect(document.title).toBe('1 day');
    // TestingLibraryElementError: Unable to find an accessible element
    // with the role "button" and name /increment/i
});
```

補上 `render()` 之後，還發現另一件事：網頁標題後面其實還接了應用程式本身的名稱，並不是單純只有「1 day」，所以斷言改用 `toContain` 而不是 `toBe`，只要標題裡包含「1 day」這段文字就算通過：

```javascript
it('updates the document title after incrementing', async () => {
    render(<Counter />);

    const incrementButton = screen.getByRole('button', { name: /increment/i });

    await act(async () => {
        await userEvent.click(incrementButton);
    });

    expect(document.title).toContain('1 day');
});
```

## 從 render() 拿到綁定當前元件的查詢方法

前面所有的查詢都是從 `screen` 這個物件開始找，範圍是整個頁面。但 `render()` 的回傳值裡，其實也帶著一組已經綁定這次掛載結果的查詢方法，範圍只會侷限在這次 `render()` 產生的元件內：

```javascript
const { getByRole } = render(<Counter />);

const incrementButton = getByRole('button', { name: /increment/i });
```

這在畫面上可能同時掛載了不只一個計數器、或是同樣的文字散落在頁面各處時特別有用，能把查詢範圍縮小到只鎖定這次要測的那個元件實例，兩種寫法都能用，端看當下需要的是全頁面範圍還是單一元件範圍的查詢。

## 複習

### 測試涉及狀態變化或 DOM 更新的互動時，有什麼方法能確保斷言發生在 DOM 重新渲染完成之後？

使用 act() 方法，它會等待 DOM 重新渲染與協調完成之後才繼續進行斷言，對非同步更新或使用框架的應用程式特別有用

### 一個典型測試結構的三個關鍵部分是什麼？

安排（Arrange）、執行（Act）、驗證（Assert），是組成一個測試的基本步驟

### 用 screen.getByRole() 尋找元素時，這個查詢有什麼關鍵特性？

查詢是大小寫不敏感的，代表 role 或 name 不論大小寫都能匹配到

### 測試涉及快速狀態變化或 DOM 更新的互動時，可能會出現什麼潛在問題？

可能發生時機問題，測試在元素完全渲染完成之前就去檢查它，尤其容易發生在渲染週期較複雜的框架裡

### 挑選測試用的元素選擇器時，有什麼建議的做法能避免未來的麻煩？

使用 Test ID 這類具體的選擇器，因為像 get by text 這種通用選擇器，一旦頁面上出現多個相同文字的元素就容易出問題

### 在使用者測試裡，有什麼方法能模擬點擊按鈕？

可以用 userEvent.click 來模擬點擊按鈕

### 有什麼 testing library 函式可以依角色或名稱找到按鈕？

screen.getByRole('button', { name: /pattern/i }) 可以依角色與名稱找到按鈕。第一個參數指定角色（'button'），name 這個選項則會拿去匹配按鈕的可存取名稱，加上 /i 這個 flag 代表比對時不分大小寫

### 該怎麼檢查測試裡一個元素的文字內容？

可以用 expect(element).toHaveTextContent()，或是直接檢查該元素的 textContent 屬性來驗證文字內容

### 替元件加上 initialCount prop 的目的是什麼？

initialCount prop 讓元件可以用不同的起始狀態進行測試，也讓元件本身更有彈性

### 該怎麼驗證測試裡一顆按鈕是否處於停用狀態？

可以用 toBeDisabled() 這個 matcher 來檢查按鈕是否停用。先用像 getByRole 這樣的查詢拿到按鈕，再呼叫 expect(button).toBeDisabled() 驗證它確實停用，或用 expect(button).not.toBeDisabled() 驗證它是啟用狀態

## 小測驗

<details>
<summary>測試涉及框架重新渲染的 DOM 互動時，有什麼做法能確保斷言發生在 DOM 更新完成之後？</summary>
把互動包進 act() 裡，等待協調完成
</details>

<details>
<summary>測試使用者互動時，關於 user event 有什麼要記得的重點？</summary>
User event 必須搭配 async/await 使用
</details>

<details>
<summary>用 getByText 找「days」這個字，為什麼可能會有問題？</summary>
這個字可能在頁面上出現不只一次
</details>

<details>
<summary>user-event 裡有什麼方法用來模擬按鈕被點擊？</summary>
userEvent.click()
</details>

<details>
<summary>在 React Testing Library 裡，通常怎麼控制被測元件的初始狀態？</summary>
在渲染元件時傳入 props
</details>

<details>
<summary>在 React Testing Library 測試裡，正確的元件渲染方式是什麼？</summary>
render()
</details>

<details>
<summary>測試裡怎麼檢查一顆按鈕是否停用？</summary>
toBeDisabled()
</details>

<details>
<summary>把測試拆成較小、較專注的測試，而不是把多個斷言合併成一個測試，有什麼好處？</summary>
測試失敗時，能立刻知道問題確切出在哪裡
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
