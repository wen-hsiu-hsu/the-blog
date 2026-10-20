---
title: '隔離不純：把副作用推到程式最外層，用 SVG 渲染練習拆出純函數'
description: '隔離不純：把操作 DOM 等副作用推到程式最外層，核心保持純粹。用 SVG 練習把命令式程式碼拆成 pureGetSVG 與 impureRenderApp，看懂純函數為何不能呼叫不純函數。'
date: 2026-10-09
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 5
chapter: 'Programming with Pure Functions'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - PureFunction
    - SideEffect
---

# 隔離不純：把副作用推到程式最外層，用 SVG 渲染練習拆出純函數

> [[04-pure-functions-exercise|上一篇]]最後留下一個挑戰：如果不能印到 console、不能讀寫檔案、不能發 fetch 請求，函數式程式設計要怎麼做真正有用的事？這一篇就來回答這個問題，並用一個渲染 SVG 的練習實際操作一次。

## 只能操作真假值，要怎麼寫程式？

如果嚴格遵守純函數的規則，能做的事少得可憐：

- 不能寫任何東西到 console
- 不能寫檔，也不能讀檔
- 不能發 fetch 請求
- 不能匯入任何函式庫

基本上，除了操作真假值之外什麼都不能做。講師自嘲說，除非是像她這種怪咖哲學家，不然大部分人應該都會問：這樣到底要怎麼寫真正的程式？

這是很合理的疑問，而且整個業界也問了自己好幾十年。從 1930 年代 Alonzo Church 發明函數式程式設計（也就是[[02-what-is-functional-programming|第二篇]]提到的 lambda calculus）開始，一直到今天才有真正能在函數式世界裡處理實際工作的生產力工具。

## 隔離不純：把副作用推到程式的最外層

答案是**隔離不純（isolate the impurity）**。不論是這堂課要看的程式，還是非常複雜的函數式程式，做法都一樣：把所有不純的東西、所有副作用（例如讀取檔案）都推到程式的最外緣，確保這些不純只發生在程式執行時的那層**外殼**裡。

程式的內部核心則保持純粹、函數式，所以非常容易預測。外層負責跟真實世界互動、取得程式需要的輸入，核心拿到這些輸入之後，接下來的處理就全是純函數。

### 程式整體可以不是決定性的

因為外殼裡允許不純，程式整體不一定具有決定性。像是「輸出要寫進哪個檔案」「要用哪個函式庫產生隨機數」，這些都不是決定性的。

但這些都被推到程式最外層、最頂端的地方，其他部分保持純粹，就比較容易預測。換句話說，只要確定了拿到的是哪個發請求用的函式庫之類的外部條件，接下來的一切都是決定性的，也不會有副作用。

這也是 monad 這類艱澀術語登場的地方。函數式程式設計有很多隔離不純的技巧，講師說課程裡會看到，目的都是確保不純不會影響程式的其他部分，避免那些讓 JavaScript 開發者頭痛的不可預測狀況。

## 練習：把 render.js 拆成純與不純兩個函數

這次的練習比之前更貼近真實的程式碼。練習檔案 `render.js` 的起始內容如下：

```js
import { ART } from './art.js';

export function pureGetSVG(svgContent = '') {
    // TODO
}

export function impureRenderApp() {
    // TODO
}

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg', { id: 'art' });
svg.id = 'art';
svg.innerHTML = ART;
svg.setAttribute('width', 200);
svg.setAttribute('height', 200);
svg.setAttribute('viewbox', '0 0 100 100');

const app = document.getElementById('app');

app?.replaceChildren(svg);
```

這個檔案做了三件事：

- 從 `art.js` 匯入 `ART`，它是要畫在 SVG 裡的內容，之後會被塞進 `svg.innerHTML`
- 宣告兩個還沒有實作的函數 `pureGetSVG` 與 `impureRenderApp`
- 在最外層直接執行一連串程式碼：建立一個 SVG 元素 `svg`，設定它的 `id`、內容、寬高等屬性，再用 `getElementById` 找到頁面上 id 為 `app` 的元素，用 `replaceChildren` 把 `svg` 掛進 DOM

### 為什麼這段程式碼不是函數式的

第一個線索很明顯：這些程式碼完全沒有放在函數裡。

更重要的是，這裡發生了一大堆不純的事。像是把 DOM 中某個元素的所有子元素換掉，這個動作不是回傳一個值，而是對外部世界做了某件事，跟[[03-pure-functions-overview|第三篇]] `greet` 印到 console 卻沒有回傳值是同樣的問題。

### 練習目標

任務是實作 `pureGetSVG` 與 `impureRenderApp` 兩個函數，讓測試通過：

- **`impureRenderApp`**：隔離出來的不純函數，所有雜亂、有副作用的事都在這裡發生
- **`pureGetSVG`**：具有決定性、沒有副作用的函數，同樣的輸入永遠給出同樣的輸出

這樣分工的好處是，之後如果要除錯，可能得在 `impureRenderApp` 裡花點功夫，但對 `pureGetSVG` 裡的一切都可以完全放心，因為它是函數式、具有決定性的。整個練習就是把這些「做這個、做那個、指定這個、更新那個」的命令式程式碼，搬進這兩個函數裡，改成比較函數式的風格。

### 測試要求

測試只針對 `pureGetSVG`。`beforeAll` 會先在 `document.body` 裡放一個 `div` 當作 app 容器，接著檢查 `pureGetSVG` 的回傳值：

```js
import { beforeAll, describe, expect, it } from 'vitest';
import { pureGetSVG } from './render.js';

describe.only('pureGetSVG', () => {
    beforeAll(() => {
        const app = document.createElement('div', { id: 'app' });
        document.body.appendChild(app);
    });
    it('should return an SVG element with id "art"', () => {
        const svg = pureGetSVG('');
        expect(svg).not.toBeUndefined;
        expect(svg.tagName).toBe('svg');
        expect(svg.id).toBe('art');
    });

    describe('returned SVG', () => {
        it('has the right dimensions', () => {
            const svg = pureGetSVG('<rect x="0" y="0" width="100" height="100" fill="green" />');
            expect(svg.getAttribute('width')).toBe('200');
            expect(svg.getAttribute('height')).toBe('200');
        });

        it('contains the given content', () => {
            const svg = pureGetSVG('<rect x="0" y="0" width="100" height="100" fill="green" />');
            const { children, firstChild } = svg;
            expect(children.length).toBe(1);
            expect(firstChild.tagName).toBe('rect');
            expect(firstChild.getAttribute('fill')).toBe('green');
        });
    });
});
```

三個測試分別確認：

- 回傳的元素 `tagName` 是 `svg`，`id` 是 `art`
- 寬高屬性都是 `200`
- 傳進去的 `svgContent`（這裡是一個綠色的 `rect`）會成為 SVG 裡唯一的子元素

### 練習環境

練習在 StackBlitz 的 tutorial kit 環境裡進行，每次編輯程式碼都會自動重跑測試，看到綠色的通過訊息就代表完成了。

右上角的 solve 按鈕會直接換成參考答案，講師提醒先別按，不然就沒樂趣了。按了 solve 之後會出現 reset 按鈕，可以回到原本的起始程式碼。

## 解答：`impureRenderApp` 負責所有副作用

參考答案先從 `impureRenderApp` 看起：

```js
export const impureRenderApp = (art) => {
    const svg = pureGetSVG(art);
    const app = document.getElementById('app');
    app.replaceChildren(svg);
};
```

`impureRenderApp` 接收要渲染的內容 `art`，交給 `pureGetSVG` 產生 SVG 元素（`pureGetSVG` 怎麼做的等一下再看），然後執行操作 DOM 這個不純的副作用。正因為有這個副作用，它不是純函數。

### 直接讀取外層的 `ART` 也可以

有學員的寫法是把它弄得「更不純」：不透過參數接收內容，而是直接讀取外層匯入的 `ART`。

```js
export const impureRenderApp = () => {
    const svg = pureGetSVG(ART);
    const app = document.getElementById('app');
    app.replaceChildren(svg);
};
```

講師說這樣完全合理，測試一樣會通過。反正已經知道這個函數不純，不純的東西就盡量都放在這裡。講師之所以把內容設計成參數，只是為了讓後面的其他練習用起來更順手。

## 解答：`pureGetSVG` 是純函數嗎？

```js
export const pureGetSVG = (svgContent = '') => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg', { id: 'art' });
    svg.id = 'art';
    svg.innerHTML = svgContent;
    svg.setAttribute('width', 200);
    svg.setAttribute('height', 200);
    svg.setAttribute('viewbox', '0 0 100 100');
    return svg;
};
```

`pureGetSVG` 就是把起始程式碼裡「建立並設定 SVG 元素」的那一段搬進函數，差別在於內容改用參數 `svgContent`，最後把 `svg` 回傳出去，而不是直接掛進 DOM。

講師問大家：把這個函數稱作純函數，有沒有人覺得哪裡怪怪的？

### 寫死的 id 讓函數不夠彈性

有學員在意的是設定 `id` 的地方。`id` 寫死在函數裡，所以沒辦法用不同的 id 呼叫它，也就不能產生好幾個不同 id 的 SVG，之後可能會替自己製造麻煩。不過學員自己也補充，這不完全是這裡要討論的重點。

講師同意這確實有點怪，並問大家：如果想多次呼叫這個函數，產生 id 各不相同的 SVG，可以怎麼做？學員的答案是**加一個參數**，讓 id 的值透過參數傳進來再指定給元素。

講師當場把 id 改成用參數接收，結果測試失敗了。提議加參數的那位學員接著提醒，除了 `svg.id = 'art'` 之外，`createElementNS` 呼叫的最後面也寫了 id。真正讓測試失敗的原因是測試呼叫 `pureGetSVG` 時還沒傳入 `'art'`，講師把測試的呼叫改成傳入 `'art'` 之後，測試就重新通過了。講師笑說，這就是為什麼要在社群裡一起寫程式。

所以寫死的 id 影響的是函數夠不夠彈性，而不是純不純。像這樣把函數改得更有彈性，正是函數式程式設計者會大量做的事。講師說課程後面會看到怎麼寫出盡可能有彈性的函數，讓它們能被大量重複使用，也能重新組合出需要的解法。

## 跟 React 這類框架的做法一樣

學員整理了一下這個練習的結構：

- **核心**：建立 SVG 等所有內容，而且確定它是決定性的，每次結果都一樣，所以這個函數可以重複使用
- **外層**：把結果掛進 DOM、渲染，以及呼叫核心函數

講師說完全正確。例如 document 裡到底有沒有一個 id 為 `app` 的元素，這種要看外部世界才知道的事，全都在外層處理。

講師把這個做法比喻成 React 或其他框架。用這些框架時，基本上只要說「頁面上請放這些資料」，實際的渲染交給框架處理。換句話說，不純的渲染工作都推給了自己程式外部的框架，而決定要用什麼值、什麼屬性的邏輯，則保持純粹、具決定性、可預測。

自己寫程式也是一樣：有任何不純的事要做，就放在最外層、最外面的函數裡，底下的一切盡可能保持純粹，這樣就能輕鬆測試、除錯。

## 真實世界不是純函數

講師說，如果這堂課只能帶走一個概念，那就是純函數。如果能帶走兩個，第二個就是：**真實世界不是純函數**。

電腦也不是純函數，雖然可以說它是決定性的，但這個之後再談。作為程式設計者，我們需要做不純的事，因為這正是我們拿薪水要做的工作，這個事實不會消失。

所以我們能做的就是把不純框起來，確保任何可能造成不可預測結果的東西，都跟「計算程式該做的事」的邏輯隔離開來。以這個練習來說，那個邏輯就是產生一個 SVG。

### 純函數可以被不純函數呼叫，反過來不行

這就是函數式程式設計的核心問題：怎麼隔離不純？怎麼確保真實世界那些雜亂的東西被困在某一層裡，不會感染程式的其他部分？

從不純函數裡呼叫純函數沒有問題，`impureRenderApp` 呼叫 `pureGetSVG` 並不會引入任何不純。反過來就是壞主意了：純函數裡不應該呼叫不純函數，因為不純會感染整個函數。這正是[[04-pure-functions-exercise|上一篇]] `encodeValue` 被 `encodeArray` 傳染而變得不純的情況。

## 這只是起點

講師說，其實講到這裡就可以停了：想寫函數式程式，就確保程式裡所有雜亂的事都發生在最外層。

不過真實世界的函數式程式設計還有很多眉角，例如：

- 需要讀取檔案裡的資料時怎麼辦
- 需要發出網路請求時怎麼辦
- 像 Haskell 這種根本不允許不純函數的語言，是怎麼做到的（答案是 monad）

但核心概念很單純。`pureGetSVG` 裡其實還是同樣那段命令式、一步一步執行的程式碼，只是被包進函數裡，而我們知道這個函數具有決定性、沒有副作用；所有非決定性的東西，則放到外層。這也呼應[[04-pure-functions-exercise|上一篇]] `truthTable` 的結論：JavaScript 的函數式不是全有全無，不夠函數式的寫法只要被限制在純函數這個沙盒裡就沒問題。

## 複習

### 函數式程式設計處理不純的關鍵策略是什麼？

把不純隔離到程式的最外緣：副作用與非決定性的操作都推到程式的外圍，核心邏輯則保持純粹、具決定性。

### 在函數式程式設計中，要怎麼管理不純的操作？

把不純的操作推到程式的最外層，並用 monad 之類的技巧隔離、控制副作用，讓核心邏輯保持純粹。

### 純函數保證了什麼？

給定相同的輸入，純函數永遠回傳相同的輸出，沒有副作用，也不會修改外部的狀態或資料。

### 為什麼要把純函數和不純函數分開？

讓程式核心更容易預測、除錯與維護：盡量減少副作用，確保主要邏輯的行為具有決定性。

### 哪些操作通常被視為不純？

寫入 console、讀寫檔案、發出網路請求、產生隨機數，以及修改 DOM 或其他外部狀態，例如把某個 DOM 元素的所有子元素換掉。

### 什麼樣的函數算是不純函數？

有副作用（例如修改 DOM 或存取全域狀態），或是依賴輸入以外的外部因素。這會讓函數的行為比較難預測，也更難測試與除錯。

### 要怎麼讓函數更有彈性？

加上參數接收不同的輸入，例如把 id 改成透過參數傳入，而不是寫死在函數裡。

### 為什麼要避免在純函數裡呼叫不純函數？

因為不純會「感染」純函數，讓它變得不具決定性，帶來無法預測的行為。

### 函數式程式設計在函數純度上的主要目標是什麼？

隔離不純，確保真實世界那些雜亂的操作被限制在某一層裡，不會影響核心的邏輯計算。

## 小測驗

<details>
<summary>函數式程式設計處理不純的關鍵策略是什麼？</summary>
把不純的操作隔離在程式最外層，核心邏輯保持純粹且具決定性
</details>

<details>
<summary>在函數式程式設計中，要怎麼管理不純的操作？</summary>
推到程式的最外層外殼，用 monad 之類的技巧隔離副作用
</details>

<details>
<summary>純函數保證了什麼？</summary>
相同的輸入回傳相同的輸出，而且沒有副作用
</details>

<details>
<summary>為什麼要把純函數和不純函數分開？</summary>
降低程式的複雜度，提升可預測性
</details>

<details>
<summary>哪些操作通常被視為不純？</summary>
例如把某個 DOM 元素的所有子元素換掉，以及寫入 console、讀寫檔案、發出網路請求
</details>

<details>
<summary>什麼樣的函數算是不純函數？</summary>
有副作用，或依賴輸入以外的外部因素
</details>

<details>
<summary>要怎麼讓函數更有彈性？</summary>
加上參數，讓設定可以動態傳入
</details>

<details>
<summary>為什麼要避免在純函數裡呼叫不純函數？</summary>
會引入不純，破壞函數的決定性
</details>

<details>
<summary>函數式程式設計在函數純度上的主要目標是什麼？</summary>
隔離不純，避免它感染核心邏輯
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
