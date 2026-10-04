---
title: 'vi.mock 整個模組 vs 依賴注入：重構一個難測的 log 函式，擺脫 vi.stubEnv 權宜之計'
description: '這篇拆解一個天生難測的 log 函式：內部直接讀取環境變數、也直接 import 外部依賴，示範用 vi.stubEnv 假造環境變數、用 vi.mock 整個模組硬解，並點出這些做法容易讓測試失去意義的代價，最後示範改用依賴注入，把環境判斷跟外部依賴都變成參數，讓測試回歸單純的輸入輸出驗證。'
date: 2026-10-04
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 23
chapter: 'Stubs, Spies, and Mocks'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - TestDoubles
    - Mocks
    - SpyOn
    - StubEnv
    - ViMock
    - Automock
    - DependencyInjection
    - DefaultParameters
---

# vi.mock 整個模組 vs 依賴注入：重構一個難測的 log 函式，擺脫 vi.stubEnv 權宜之計

延續前面幾篇對 test double 的介紹，這篇拿一個真實會讓人頭痛的例子出來拆解：一個表面上單純、實際上很難測試的 `log` 函式，示範幾種硬解的辦法，最後歸結出治本的做法。

## 一個先天難測的 log 函式

這個 `log` 函式的用途，是避免有人不小心把 `console.log` 留在正式環境的程式碼裡：開發模式下呼叫它，會直接印出 `console.log`；正式環境下呼叫它，則會把訊息送到後端的 log 伺服器。立意良好，但這個函式在測試上有兩個天生的麻煩：

- 函式內部直接判斷目前的執行模式（development、production、test），但測試執行的時候，這個模式本來就固定會是 `test`，沒辦法直接測出它在 development、production 底下各自的行為
- 函式內部直接 `import` 了負責送到伺服器的那個依賴，只要載入這個檔案，就會連帶把送伺服器的邏輯也載進來，沒有辦法不呼叫真正的網路請求

面對這種狀況，可以乾脆放棄測試這段邏輯，也可以想辦法繞過去。這篇就是在示範幾種繞過去的辦法，順便看看代價有多大。

## 解法一：用 vi.stubEnv 假造環境變數

第一個問題（環境判斷）比較好解決，最原始的做法是手動把環境變數物件的屬性直接換掉、測試結束後再改回來，而 `vi.stubEnv` 做的正是同一件事的語法糖：可以在測試期間暫時把某個環境變數換成想要的值，測試結束後再用 `vi.unstubAllEnvs` 把所有被換掉的環境變數都還原：

```javascript
describe('development', () => {
    beforeEach(() => {
        vi.stubEnv('MODE', 'development');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('logs to the console in development mode', () => {
        const logSpy = vi.spyOn(console, 'log');

        log('message');

        expect(logSpy).toHaveBeenCalled();
    });
});
```

正式環境的情境則反過來，驗證這時候不該呼叫 `console.log`：

```javascript
describe('production', () => {
    beforeEach(() => {
        vi.stubEnv('MODE', 'production');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should not call console.log in production', () => {
        const logSpy = vi.spyOn(console, 'log');

        log('message');

        expect(logSpy).not.toHaveBeenCalled();
    });
});
```

有學員問「stub」到底是什麼，得到的答案很直白：把一個值暫時換成假的，用完之後再放回去。跟 mock 的差異也不用太計較，mock 通常指的是一個函式，stub 通常指的是一個值，但概念上都是同一件事：暫時騙過程式碼，用完就把真相還回去。這跟前面提過術語本身不是重點、概念抓到就好的態度是一致的。

## 解法二：用 vi.mock 整個模組硬解，但代價不小

第二個問題（直接 `import` 了送伺服器的依賴）比較棘手。一個直接但粗暴的做法是用 `vi.mock` 整個取代掉那個模組：

```javascript
vi.mock('./send-to-server');
```

`vi.mock` 有個特殊的行為：不管實際寫在檔案的哪個位置，Vitest 都會把它搬到整個測試檔案的最上面優先執行。效果是只要有任何程式碼嘗試 `import` 這個模組，Vitest 就會自動把它換成一堆假的空值（automock），不會真的去載入原本的實作。

這個做法確實能擋掉對外的網路請求，但代價是連正常的行為驗證都跟著失真。例如原本預期送伺服器的邏輯在某種條件下應該要丟出錯誤：

```javascript
vi.mock('./send-to-server');

it('should throw when sending fails', () => {
    expect(() => log('message')).toThrow();
});
// ✗ 預期會丟出錯誤，實際上不會，因為 automock 之後
// send-to-server 根本沒被載入過，這段邏輯自然也驗證不到
```

如果想更精準地控制被取代的內容，`vi.mock` 可以帶第二個參數，用一個工廠函式指定要換成什麼樣的假模組：

```javascript
vi.mock('./send-to-server', () => ({
    sendToServer: vi.fn(),
}));
```

這樣至少可以針對這個換掉的 `sendToServer` mock 函式，斷言它有沒有被呼叫。但這整套做法用起來還是有風險：一旦養成「隨手整個模組砍掉重練」的習慣，測試很容易變得近乎沒有意義，尤其是像 `axios` 這種被大量程式碼依賴的第三方套件，整個模組砍掉重練，很容易砍過頭，反而製造出更多麻煩。

## 更好的解法：把環境判斷跟依賴都變成參數

比起前面兩種硬解方式，更推薦的做法還是依賴注入，這跟前幾篇處理 `Math.random`、`alert` 時用的是同一套思路：把原本函式內部自己判斷的環境模式、自己 `import` 的依賴，都改成用參數傳進去，並給一個合理的預設值：

```javascript
function log(message, mode = import.meta.env.MODE, productionCallback = sendToServer) {
    if (mode === 'production') {
        productionCallback(message);
    } else {
        console.log(message);
    }
}
```

改成這樣之後，測試就變得跟驗證一個單純的函式沒有兩樣，直接傳想要的 `mode` 跟一個 mock 函式進去就好，不需要再碰任何環境變數或整個模組的置換：

```javascript
it('calls the production callback in production mode', () => {
    const productionCallback = vi.fn();

    log('message', 'production', productionCallback);

    expect(productionCallback).toHaveBeenCalledWith('message');
});
```

這樣一來，前面為了繞過環境變數、繞過模組依賴而寫的那些 `vi.stubEnv`、`vi.mock` 測試，全部都可以刪掉，換成這種單純的輸入輸出驗證，跟測試一個單純的加法函式沒有本質上的差別。

## 參數多了怎麼辦：用一個帶預設值的 options 物件收斂

如果一個函式的參數會一直增加，一路加到十幾個，逐一列成函式參數並不好維護。這時候常見的做法是把這些選項收進第二個參數的物件裡，並給每個欄位一個預設值：

```javascript
function log(message, { mode = import.meta.env.MODE, productionCallback = sendToServer } = {}) {
    if (mode === 'production') {
        productionCallback(message);
    } else {
        console.log(message);
    }
}
```

呼叫的時候只需要傳自己在意的那幾個欄位，其他保持預設值就好。這種寫法在 TypeScript 裡更好用，因為型別能明確標出每個欄位是什麼，編輯器的自動完成也能派上用場。這個模式不只適用於單純函式，React 元件、class，甚至任何需要外部依賴的程式碼結構都通用。

## 把 mock、spy 留給真正無法控制的東西

整體而言，能夠透過依賴注入解決的依賴，都應該優先這樣處理：把需要的東西當成參數傳進去，測試就只是單純的 JavaScript，不需要在滿地的 mock 跟 spy 之間打轉。`vi.mock`、`vi.spyOn` 這類工具仍然有其存在的價值，適合留給真正沒辦法透過參數控制的東西，例如隨機數字，或是接下來會談到的時間跟日期。

## 複習

### 測試會隨環境而有不同行為的程式碼時，有哪兩個關鍵策略？

一是用 vi.stubEnv 這類方式假造環境變數，暫時切換成 development 或 production 這類模式；二是用依賴注入，依照環境傳入不同的函式或設定

### 在測試情境裡，stub 是什麼？

把一個值或函式暫時替換成假的版本，用來進行測試，測試結束後再還原回原本的狀態

### 為什麼依賴注入對測試有幫助？

依賴注入讓測試可以傳入特定的函式或設定，而不是把依賴寫死在模組內部，這樣程式碼會更容易測試，也更有彈性、更模組化

### 有什麼建議的做法，能讓函式的設定更有彈性？

把第二個參數改成一個帶預設值的 options 物件，這樣可以只針對需要的欄位進行局部設定，也讓函式更能因應不同的使用情境

### 傳統的 mock 跟 spy 做法，可能會有什麼潛在的問題？

當依賴變多時，mock 容易變得複雜，也可能讓測試變得更難理解；有時候還得把整個模組或函式庫都 mock 掉，容易出錯，也不好維護

## 小測驗

<details>
<summary>在測試情境裡，「stub」指的是什麼？</summary>
在測試期間暫時替換掉真實的值或函式的一種假版本
</details>

<details>
<summary>讓一個函式更容易測試，有什麼建議的做法？</summary>
把需要的依賴跟設定當成參數傳進去
</details>

<details>
<summary>面對一個函式有多個設定選項，可以用什麼模式處理？</summary>
用一個帶預設值的設定物件當作參數
</details>

<details>
<summary>為什麼依賴注入對測試有幫助？</summary>
能讓 mock 更容易進行，測試情境也更容易預期
</details>

<details>
<summary>在函式內部直接判斷 process.env.MODE 這類環境變數，寫測試時主要會遇到什麼問題？</summary>
測試執行時這個環境變數幾乎都固定是 test，導致很難測出正式環境或開發環境下該有的行為
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
