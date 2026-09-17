---
title: 'beforeEach 與非同步測試：善用 hook 減少重複，但也別為了不重複犧牲測試的清楚易讀性'
description: '講師 Steve Kinney 說明 beforeEach 這類 hook 能省去每個測試重複建立資料的樣板，但也提醒過度抽象會讓人看測試時搞不清楚資料從哪來，測試該追求的是簡單清楚，而不是不重複；也說明現代測試框架只要用 async/await，就不再需要手動呼叫 done callback 處理非同步程式碼。'
date: 2026-09-17
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 12
chapter: 'Testing Equality'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Vitest
    - BeforeEach
    - AsyncAwait
    - DoneCallback
---

# beforeEach 與非同步測試：善用 hook 減少重複，但也別為了不重複犧牲測試的清楚易讀性

## beforeEach：省去每個測試重複建立資料的樣板

前一篇練習裡，幾乎每個測試開頭都要重新 `new` 一個 `Character` 物件。Steve 指出測試框架提供了 `beforeEach` 這類 hook，可以把重複出現的準備動作抽出來，在每個測試執行前自動先跑一次：

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { Character } from './character.js';

describe('Character', () => {
    let character;

    beforeEach(() => {
        character = new Character('Ada', 'Lovelace', 'Computer Scientist');
    });

    it('should create a character with a first name, last name, and role', () => {
        expect(character.firstName).toBe('Ada');
        expect(character.lastName).toBe('Lovelace');
        expect(character.role).toBe('Computer Scientist');
    });

    it('should allow you to increase the level', () => {
        character.levelUp();
        expect(character.level).toBe(2);
    });
});
```

要注意的是，`character` 這個變數必須宣告在 `describe` 區塊的外層作用域，`beforeEach` 才能在每個測試執行前把它重新賦值，讓底下每個 `it` 都能直接存取到同一個變數。

## 但清楚比不重複更重要

雖然 `beforeEach` 確實省去了每個測試裡重複建立角色的樣板程式碼，Steve 也提醒這樣做是有代價的：一旦測試檔案變大，光看某一個測試本身，會很難一眼看出這個 `character` 到底是從哪裡冒出來的，得往上翻到 `beforeEach` 才能搞清楚它的初始狀態。如果某個測試剛好需要一個稍微不一樣的角色，還得想辦法在那個測試裡另外覆寫掉 `beforeEach` 設定好的內容，反而讓事情變得更繞。

這正好牴觸了「不要重複自己」（DRY）這個平常寫程式碼時很看重的原則。Steve 認為在測試的世界裡，過度抽象、想耍點小聰明去減少重複，換來的往往是犧牲掉測試的清楚易懂。測試不需要寫得聰明，寧可讓它笨拙一點、重複一點，也要讓人一眼就看懂每個測試在幹嘛，因為測試失敗、變成紅燈的時候，你會想要盡快弄清楚問題出在哪裡，而不是先花時間回頭理解測試本身的結構。

所以 `beforeEach` 能不能用？當然可以。該不該每次都用？Steve 的立場是不見得，有些情境確實適合，例如需要先建立好一個模擬的網路環境、或替某些依賴預先做好替身（stub）設定，但這不代表任何重複出現的準備動作都值得抽出來共用。

## 非同步測試：不用再手動呼叫 done 了

另一個過去讓測試變得麻煩的地方，是非同步程式碼。過去的測試框架需要測試函式額外接受一個 `done` 回呼函式，得在非同步操作真正完成後手動呼叫它，才能告訴測試框架這個測試已經跑完：

```javascript
it('should fetch the data', (done) => {
    fetchData().then((data) => {
        // 斷言寫在這裡
        done();
    });
});
```

這種寫法很容易踩雷：如果非同步操作沒有照預期完成，程式碼沒有走到寫斷言、呼叫 `done()` 的那段邏輯，測試並不會因此失敗，因為根本沒有任何斷言真的執行到，也就沒有任何機會讓它出錯，正好呼應了先前提過的「測試通過不代表程式碼真的沒問題，只代表沒有失敗」這個道理。

現在多數測試框架已經原生支援 `async`／`await`，只要測試函式本身宣告成 `async`，並且乖乖對每一個非同步操作使用 `await`，就完全不需要再處理 `done` 這類機制：

```javascript
it('should fetch the data', async () => {
    const data = await fetchData();

    // 斷言寫在這裡
});
```

如果在程式碼庫裡看到舊式、還在用 `done` 回呼的測試，直接把它重構成 `async`／`await` 的寫法就好，不需要特地保留舊寫法。

## 忘記 await 會發生什麼事

改用 `async`／`await` 之後，唯一真正需要留意的地方，是別忘了在該加 `await` 的地方加上它。一旦漏掉，拿到的值會是一個還沒解析完成的 `Promise`，而不是原本預期的實際資料，後續的斷言自然對不上，程式碼的行為也會因此跑掉。只要確實把每一個非同步操作都加上 `await`，處理非同步程式碼的測試，現在已經跟處理一般同步程式碼幾乎沒有兩樣。

## 複習

### 撰寫測試時，在程式碼複雜度上該掌握什麼關鍵原則？

測試應該保持笨拙的簡單與清楚，而不是過度抽象化。當測試失敗時，你會希望能快速理解、定位問題所在

### 現代 JavaScript 裡，處理非同步測試建議採用什麼做法？

使用 async/await 函式。只要測試函式本身是 async，並確實對每個非同步操作使用 await，多數測試框架就會自動正確處理

### 在非同步測試裡忘記使用 await 會發生什麼事？

拿到的值可能會是一個 Promise，而不是原本預期的實際結果，因此導致程式碼出錯，務必確保在非同步操作上都加上 await

### 在較舊的 JavaScript 測試做法裡，非同步測試通常是怎麼處理的？

測試函式會接受一個 done 回呼函式，需要在非同步操作完成後手動呼叫它，藉此告訴測試框架這個測試已經完成

### 撰寫測試的準備（setup）程式碼時，該考量什麼原則？

雖然避免重複很重要，但在測試裡，清楚易懂比聰明的抽象化更重要，有時候稍微重複一點的測試反而更容易理解與除錯

## 小測驗

<details>
<summary>現代 JavaScript 裡，處理非同步測試的做法是什麼？</summary>
使用 async/await，並確實正確地等待每個非同步操作
</details>

<details>
<summary>撰寫測試程式碼時，該優先考量什麼原則？</summary>
測試的清楚易懂比追求聰明的抽象化更重要
</details>

<details>
<summary>測試非同步程式碼、卻沒有正確處理 async/await 時，可能出現什麼問題？</summary>
即使非同步操作實際上失敗了，測試依然可能通過
</details>

<details>
<summary>用 beforeEach 建立角色物件這類測試資料，主要的缺點是什麼？</summary>
會降低清楚度，因為單看個別測試時，很難看出這筆資料到底是從哪裡來的
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
