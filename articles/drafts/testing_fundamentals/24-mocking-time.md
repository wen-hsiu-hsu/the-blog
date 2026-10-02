---
title: '用假時鐘測試時間：vi.useFakeTimers、advanceTimersByTime、setSystemTime'
description: '這篇示範時間這種難靠依賴注入迴避的東西，該怎麼用假時鐘測試：用 vi.useFakeTimers 凍結時鐘、advanceTimersByTime 手動撥快、advanceTimersToNextTimer 跳到下個計時器，搭配 setSystemTime 固定當下時間，測試橫幅計時隱藏與相對時間顯示。'
date: 2026-10-04
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 24
chapter: 'Stubs, Spies, and Mocks'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - TestDoubles
    - FakeTimers
    - AdvanceTimersByTime
    - AdvanceTimersToNextTimer
    - SetSystemTime
    - DependencyInjection
    - ModuleMocking
---

# 用假時鐘測試時間：vi.useFakeTimers、advanceTimersByTime、setSystemTime

前一篇提到，能用依賴注入解決的依賴都該優先這樣處理，真正該留給 mock、spy 的，是隨機數字跟時間這類真的無法避開的東西。這篇就是在講時間：一個畫面顯示幾秒後消失的橫幅、一段「兩小時前發佈」這種會隨時間變化的文字，該怎麼測試。

## 為什麼時間特別難測：不能真的等

橫幅顯示 3 秒後消失，還是 10 秒後消失，測試能不能就真的等 3 秒、10 秒？技術上可以，但測試案例一多，整套測試執行時間很快就會拖到難以忍受的地步。相對時間的顯示（例如「兩小時三分鐘前」這種文字）更麻煩：時間一直在往前走，沒辦法用一個固定不變的答案去斷言。

這類情境的解法是把時鐘凍結住：先把目前時間設成想要的值，讓它暫時停在那裡，需要的時候再手動把時鐘往前撥，而不是真的等時間自己流逝。

## 用 vi.useFakeTimers 凍結時鐘

要凍結時鐘，先用 `vi.useFakeTimers()` 切換成假的計時器環境，測試結束後記得用 `vi.useRealTimers()` 把真實的計時器還回來，這跟前面提過「用完就要放回去」的測試隔離精神是一致的：

```javascript
beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});
```

## 用 advanceTimersByTime 手動撥快時鐘

假設有個函式會在呼叫後一秒才觸發傳入的 callback，用 `setTimeout` 就能做到。在假時鐘的環境下，呼叫完之後先確認 callback 還沒被呼叫，再用 `vi.advanceTimersByTime` 手動把時鐘往前撥一秒，確認 callback 這時候才真的被觸發：

```javascript
it('calls the callback after the delay', () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
});
```

這樣一來，測試完全不用真的等一秒鐘，時鐘凍結的情況下直接把它撥快到該觸發的那個時間點就好。

## 不用算死等多久：advanceTimersToNextTimer

如果不想自己算準確切該撥快多少毫秒，`vi.advanceTimersToNextTimer()` 可以直接跳到下一個已經註冊、但還沒觸發的計時器該觸發的時間點，不用自己指定數字：

```javascript
setTimeout(callback, 1000);

vi.advanceTimersToNextTimer();

expect(callback).toHaveBeenCalled();
```

這個方法也能拿來驗證時鐘確實有被凍結住。把當下時間固定在某個午夜 0 點（UTC），呼叫 `vi.advanceTimersToNextTimer()` 之後，因為剛好跳到了下一個計時器觸發的時間點，`new Date()` 讀到的時間就會剛好是午夜過後一秒，但除此之外時間依然是凍結的，不會自己繼續往前走：

```javascript
vi.setSystemTime(midnightUTC); // 哪一天不重要，只在意是 UTC 午夜 0 點

setTimeout(callback, 1000);

vi.advanceTimersToNextTimer();

console.log(new Date());
// 午夜過後 1 秒，時間因為跳到下一個計時器的時間點而往前移動了，
// 除此之外依然維持凍結
```

## 相對時間顯示的測試：固定時鐘、逐步往前推進

「兩小時前發佈」這類相對時間的顯示，可以用 `vi.setSystemTime` 把目前時間固定在某個基準點，再用 `vi.advanceTimersByTime` 一步步往前推進，每推進一段時間就重新驗證顯示的文字有沒有跟著更新：

```javascript
vi.setSystemTime(baseTime);

// ...假設有一段會顯示「X 小時前」的文字，依照 baseTime 當作發佈時間計算...

vi.advanceTimersByTime(2 * 60 * 60 * 1000);
// 推進 2 小時後，顯示應該要變成「2 hours ago」

vi.advanceTimersByTime(60 * 60 * 1000);
// 再推進 1 小時，顯示應該變成「3 hours ago」
```

這種做法本質上跟前面凍結、撥快時鐘是同一套邏輯，差別只在於驗證的對象從「計時器有沒有被觸發」換成「畫面顯示的文字有沒有跟著時間更新」。

## module mocking 的坑：fetch 不是只有 fetch 本身

能不能乾脆把整個模組都 mock 掉？可以，但代價不小，跟前面提過直接 `vi.mock` 整個模組的風險是同一件事：拿 `fetch` 來說，要完整模擬一次請求，不是只有 `fetch` 這個函式本身，還得連帶處理回傳物件上的 `.json()` 這類方法，牽涉到的細節一多，很容易顧此失彼。

## 更好的做法：把跟時間無關的部分抽成獨立函式

如果一個元件把抓資料的邏輯、顯示的邏輯全部攪在一起，測試自然會很痛苦，但這不是測試本身的問題，是程式碼寫法的問題。解法還是同一套依賴注入的精神：把實際發送請求的邏輯抽成獨立的函式，元件本身不需要知道怎麼打 API，只需要知道「我拿到一個函式，呼叫它就對了」。負責發送請求的那個函式可以獨立測試，元件這邊則只要驗證「有沒有正確呼叫傳進來的這個函式」就好，兩邊關注的問題被徹底切開，各自都變得好測很多。

## 複習

### 測試像日期格式化、相對時間顯示這類跟時間敏感的程式碼時，有什麼實用的做法？

把時鐘固定在某個時間點，再用程式的方式往前推進時間，驗證預期的行為，不需要真的等待時間流逝

### 測試涉及 setTimeout 或其他時間相關操作的函式時，有什麼建議的做法？

用 vi.fn() 建立 mock 函式，先凍結時間，呼叫要測試的函式，再把時間往前推進，驗證這個函式有沒有在預期的時間點被呼叫

### 撰寫跟時間相關的可測試程式碼時，該遵循什麼原則？

把跟時間相關的邏輯抽成獨立的函式，讓這部分邏輯可以被隔離測試，同時也讓整個元件或模組變得更模組化

### 測試像橫幅顯示、隱藏這類功能時，為什麼 mock 計時器會有幫助？

Mock 計時器能避免測試真的等待時間流逝。假設橫幅要顯示 10 秒才消失，沒有 mock 計時器的話，測試就得真的等滿 10 秒，測試案例一多，整套測試執行時間會拖得非常長。用 mock 計時器凍結時鐘、再用程式往前推進時間，就能驗證行為而不用真的等待

### 該怎麼用 vi.useFakeTimers() 跟 vi.advanceTimersByTime() 測試一個用到 setTimeout 的函式？

先呼叫 vi.useFakeTimers() 凍結時鐘（通常放在 beforeEach 裡），接著執行會用到 setTimeout 的函式，再呼叫 vi.advanceTimersByTime(毫秒數) 把時鐘往前推進指定的時間長度。這會觸發這段時間內本來該觸發的計時器，讓測試可以驗證 callback 有沒有被呼叫，而不用真的等待

## 小測驗

<details>
<summary>在單元測試裡 mock 時間，能帶來什麼能力？</summary>
不用真的等待，就能測試跟時間敏感的邏輯
</details>

<details>
<summary>有什麼方法可以快轉時間到下一個已註冊的計時器觸發，而不用自己等它實際的持續時間？</summary>
vi.advanceTimersToNextTimer()
</details>

<details>
<summary>為什麼 mock 整個模組可能會有困難？</summary>
牽涉到多層巢狀的方法呼叫，會讓 mock 變得複雜
</details>

<details>
<summary>要改善會跟 API 互動的程式碼的可測試性，有什麼建議的做法？</summary>
把抓資料的邏輯抽成獨立、可測試的函式
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
