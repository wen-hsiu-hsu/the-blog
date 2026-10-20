---
title: '遞迴畫圖練習：用 SVG 與模板字串畫出層層交替的菱形圖案'
description: '遞迴畫圖練習：寫一個回傳 SVG 字串的純函數 diamondPattern，用模板字串組出正方形，每層互換顏色、縮小寬度，再用 g 元素的 transform 旋轉與平移，畫出內嵌菱形。'
date: 2026-10-11
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 10
chapter: 'Recursion'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - Recursion
    - PureFunction
---

# 遞迴畫圖練習：用 SVG 與模板字串畫出層層交替的菱形圖案

> [[09-performance-of-iterative-vs-recursive|上一篇]]看了遞迴在效能上的代價。這一篇回到遞迴好玩的一面，用遞迴函數算出一張 SVG 圖案，也順便用上[[05-managing-impurity-exercise|第五篇]]拆出來的純與不純兩個渲染函數。

## 練習情境：Functional Art Studio

這次的練習是一個叫做 Functional Art Studio 的小專案，跑在一個小小的 Vite app 裡，畫面上一開始是一張空白的畫布。

任務是實作 `patterns.js` 裡的函數，這次要寫的是 `diamondPattern`。專案在底層會這樣使用它：

- `art.js` 會呼叫 `diamondPattern`，再把結果以全域變數的形式匯出。講師順帶提到，這一步的寫法不太函數式
- 匯出的結果會交給[[05-managing-impurity-exercise|第五篇]]寫過的不純渲染函數與純函數 `pureGetSVG`，渲染到頁面上

講師說，原始碼有興趣可以之後再看，做的事跟第五篇幾乎一模一樣：拿到一份描述 SVG 的資料，把它掛到 DOM 上顯示出來。

### 目標圖案

要畫的是一個用遞迴構成的圖案：最外層是一個正方形，裡面放一個轉了 45 度的菱形，菱形裡又是一個正方形，兩種顏色一層一層交替，越往內越小。講師把它叫做 `diamondPattern`，雖然她也承認畫出來的其實是正方形和菱形。

`diamondPattern` 要做的是**算出一個字串**，代表這張 SVG 裡面的內容，再由專案把它渲染到頁面上。例如直接回傳一個寫死寬高與顏色的 `<rect>` 字串：

```js
return '<rect x=0 y=0 width=50 height=50 fill=rebeccapurple />';
```

畫面上就會出現一個紫色的正方形。

### 為什麼用 SVG

講師說這不是一堂講 SVG 繪圖的課，有需要可以查 MDN 的 SVG 參考文件。選 SVG 而不是 canvas 之類的工具，是因為兩者的寫法剛好站在兩端：

- **SVG**：宣告式的，描述想在畫面上看到哪些元素
- **Canvas API**：非常命令式

這呼應[[02-what-is-functional-programming|第二篇]]提到的宣告式思維：描述想要的結果，而不是一步步畫出來的步驟。講師也小小暗示，這題基本上只需要 `<rect>`，再加上「也許還有別的東西」。

## 起始程式碼

`diamondPattern` 接收兩個顏色 `color1`、`color2`，以及一個寬度 `width`。起始程式碼已經把 base case 與遞迴情況的架子搭好：

```js
export function diamondPattern(color1, color2, width) {
    if (width <= 20) {
        // BASE CASE
        // TODO return a string representing a color1-filled square with the given width
        return '';
    } else {
        // RECURSIVE CASE
        const smallerWidth = (width * Math.SQRT2) / 2;
        // TODO
        // Return a string representing the color1-width square, along with the rest of the recursive pattern
        // At each recursive step, alternate the colors and translate & rotate the rest of the pattern to create the nested alternating diamonds effect
        return '';
    }
}
```

題目要做的，就是不再寫死固定寬高與顏色的 `<rect>`，改成依參數即時算出來。

## Base case：只畫一個正方形

講師把停止點設在寬度 20：再小下去畫面會太雜亂，所以這個值是她隨意決定的。寬度小於等於 20 時，只回傳一個正方形，但要確保寬度與顏色正確。這一層只有一個正方形，所以只會有一種顏色，用 `color1`。

### 用模板字串把值塞進字串

要組出這個字串有幾種做法，講師最喜歡、也最宣告式的做法是 JavaScript 的**模板字串（template literal）**：

- 把一般的單引號換成反引號
- 在字串裡用 `${}` 把值塞進去

寬度原本寫死成 50，改成傳進來的 `width`。對 SVG 來說這是 `rect`（矩形），但對我們來說它是正方形，所以高度也一樣用 `width`。

顏色也不再寫死 `rebeccapurple`。講師說雖然這是她的新歡，但使用者可能不喜歡這麼搶眼的配色，所以讓使用者決定，填入 `color1`。有學員提醒顏色要加上引號，講師也同意：

```js
if (width <= 20) {
    // BASE CASE
    return `<rect x=0 y=0 width=${width} height=${width} fill="${color1}" />`;
}
```

講師一開始沒看到畫面變化，因為傳入的寬度大於 20，走到的是還回傳空字串的遞迴情況。她把傳入的寬度改成 20 再試一次，畫面上出現一個綠色的小正方形，base case 完成。

## 遞迴情況：畫出下一層

接下來要回傳的不只是 `color1` 的正方形，還有圖案剩下的部分。

### 每一層都從同一個大正方形開始

不管是哪一層，畫面上的第一個元素永遠是這一層的大正方形，跟 base case 回傳的一樣。所以講師把這個 `<rect>` 字串提到 `if` 前面存成 `rect`，兩種情況都能用：

```js
const rect = `<rect x=0 y=0 width=${width} height=${width} fill="${color1}" />`;
```

### 計算下一層的寬度

畫完這一層，接著要畫下一層，下一層的寬度比較小。起始程式碼裡已經用內建的 `Math.SQRT2` 算好了：

```js
const smallerWidth = (width * Math.SQRT2) / 2;
```

講師只簡短帶過這是一個斜邊的計算，重點是用這個寬度轉成菱形之後，剛好可以完美塞進目前的正方形裡。

### 呼叫自己，並互換顏色

下一層要畫的是寬度較小、顏色不同，而且斜放的正方形。講師繼續用模板字串，在 `rect` 後面空出位置放其他內容。

這裡要的是一個跟目前圖案非常相似、只是數值不同的圖案，而最擅長產生這種圖案的函數就是 `diamondPattern` 自己，這正是遞迴情況。傳進去的參數要改成：

- **顏色互換**：原本是 `color1, color2`，下一層改傳 `color2, color1`
- **寬度縮小**：原本是 `width`，下一層改傳 `smallerWidth`

```js
return `${rect}
    ${diamondPattern(color2, color1, smallerWidth)}`;
```

畫面上開始出現遞迴的效果：正方形一層比一層小，顏色也不斷交替。有學員說看起來像一條無限延伸的走廊，講師也覺得有種立體的感覺。不過它們還沒轉成菱形，全都疊在左上角。

## 用 `<g>` 元素旋轉與平移

### 用 `<g>` 包住下一層

要讓下一層旋轉，可以把 `diamondPattern` 回傳的內容包起來。講師查了 MDN 的 SVG 元素參考，請大家先相信她：`<g>` 元素有點像 HTML 裡的 `div`：

- 跟用一個 `div` 包住元素再對它做 transform 的習慣一樣，SVG 裡可以用 `<g>` 包住內容
- 設定在 `<g>` 上的屬性會套用到整個群組，所以可以一次替多個元素設定屬性
- `<g>` 本身就像 `div`，單獨存在時什麼事也不做

### 先旋轉 45 度

要操作 `<g>`，就在它的 `transform` 屬性傳入值，可以用一些類似 CSS 的內建 transform 函數。先試著旋轉 45 度：

```js
return `${rect}
    <g transform="rotate(45)">
        ${diamondPattern(color2, color1, smallerWidth)}
    </g>`;
```

畫面看起來還不對，但至少出現一個尖角，跟目標圖案有點像了。

### 再把原點平移到正中間

還要做的是讓每一層都保持置中。所有 SVG 元素都從 `0, 0` 開始畫，旋轉之後 `0, 0` 依然在左上角，跟原本一樣。所以除了旋轉，還要用 translate 移動整個座標系統的原點。

目標是把菱形頂端那個點（因為疊在另一個菱形上，所以有點難看清楚）移到正方形上緣的正中間。講師先試著平移 `width`：

```js
return `${rect}
    <g transform="translate(${width}) rotate(45)">
        ${diamondPattern(color2, color1, smallerWidth)}
    </g>`;
```

結果圖案一路跑到另一邊去了，也不是想要的效果。學員說「只差一半」，於是把寬度除以 2，圖案就對了。完整的解答：

```js
export function diamondPattern(color1, color2, width) {
    const rect = `<rect x=0 y=0 width=${width} height=${width} fill="${color1}" />`;

    if (width <= 20) {
        // BASE CASE
        return rect;
    } else {
        // RECURSIVE CASE
        const smallerWidth = (width * Math.SQRT2) / 2;
        return `${rect}
            <g transform="translate(${width / 2}) rotate(45)">
                ${diamondPattern(color2, color1, smallerWidth)}
            </g>`;
    }
}
```

每呼叫一次，就畫出一個 `color1` 的正方形，再把顏色互換、寬度縮小的下一層包進 `<g>` 旋轉平移；寬度縮到 20 以下時碰到 base case，只回傳最後一個正方形，遞迴就此結束。

## 用遞迴宣告式地畫出真實世界的東西

講師說，這是一個純粹用遞迴做出來的真實世界物件。畫面上的像素在這裡算是真實世界的東西，而把字串放進頁面、變成像素的不純工作，都已經包在第五篇寫好的不純渲染函數裡了。

所以 `diamondPattern` 只負責算出字串，而且是完全宣告式的做法：說明想要一個長這樣的字串，以及要塞進去哪些值。

要做到「一直重複、一直重複」的效果，當然也可以用 `for` 迴圈，但講師笑說那就不好玩了。這個例子雖然簡單，卻展示了怎麼用遞迴、以宣告式的方式處理遞迴結構的東西，不需要寫一個 `for` 迴圈逐一處理每個更小的正方形。

## 複習

### 用 SVG 繪製圖形的目的是什麼？

SVG 是一種宣告式的方式，描述要渲染哪些元素，可以精確地繪製向量圖形，不需要處理像素層級的操作。

### 用哪個 JavaScript 功能把動態的值塞進字串？

模板字串，用反引號與 `${}` 語法把值插入字串。

### 哪個 SVG 元素用來將多個元素分組並一起變形？

`<g>`（group）元素，可以對一整組 SVG 元素套用旋轉、平移等變形。

### 建立遞迴菱形圖案需要哪些關鍵參數？

兩個顏色、一個初始寬度，以及停止遞迴的 base case 寬度（這個例子是 20 以下）。

### 在 JavaScript 中怎麼把動態的值塞進字串？

使用帶有反引號與 `${}` 語法的模板字串，例如：

```js
const width = 50;
const color = 'red';
const rect = `<rect width="${width}" fill="${color}" />`;
```

`${}` 讓表達式可以直接嵌進字串裡。

### 哪個 SVG 元素用來把多個 SVG 圖形分組並一起變形？

`<g>` 元素。

### 遞迴菱形圖案用哪個數學常數計算新的寬度？

`Math.SQRT2`。

### 哪個 SVG 屬性用來旋轉、平移圖形元素？

`transform`。

### 哪個 JavaScript 功能可以把表達式直接嵌進字串裡？

使用反引號與 `${}` 的模板字串。

### 產生內嵌的幾何圖案時，用遞迴取代 for 迴圈的主要優點是什麼？

遞迴能用宣告式的方式，描述想要的結果，而不是用命令式的方式指定每一輪迭代的步驟。

## 小測驗

<details>
<summary>用 SVG 繪製圖形的目的是什麼？</summary>
SVG 是一種宣告式的方式，描述要渲染哪些元素，可以精確地繪製向量圖形，不需要處理像素層級的操作
</details>

<details>
<summary>用哪個 JavaScript 功能把動態的值塞進字串？</summary>
模板字串，用反引號與 <code>${}</code> 語法把值插入字串
</details>

<details>
<summary>哪個 SVG 元素用來將多個元素分組並一起變形？</summary>
<code>&lt;g&gt;</code>（group）元素，可以對一整組 SVG 元素套用旋轉、平移等變形
</details>

<details>
<summary>建立遞迴菱形圖案需要哪些關鍵參數？</summary>
兩個顏色、一個初始寬度，以及停止遞迴的 base case 寬度（這個例子是 20 以下）
</details>

<details>
<summary>在 JavaScript 中怎麼把動態的值塞進字串？</summary>
使用帶有反引號與 <code>${}</code> 語法的模板字串，<code>${}</code> 讓表達式可以直接嵌進字串裡
</details>

<details>
<summary>哪個 SVG 元素用來把多個 SVG 圖形分組並一起變形？</summary>
<code>&lt;g&gt;</code> 元素
</details>

<details>
<summary>遞迴菱形圖案用哪個數學常數計算新的寬度？</summary>
<code>Math.SQRT2</code>
</details>

<details>
<summary>哪個 SVG 屬性用來旋轉、平移圖形元素？</summary>
<code>transform</code>
</details>

<details>
<summary>哪個 JavaScript 功能可以把表達式直接嵌進字串裡？</summary>
使用反引號與 <code>${}</code> 的模板字串
</details>

<details>
<summary>產生內嵌的幾何圖案時，用遞迴取代 for 迴圈的主要優點是什麼？</summary>
遞迴能用宣告式的方式，描述想要的結果，而不是用命令式的方式指定每一輪迭代的步驟
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
