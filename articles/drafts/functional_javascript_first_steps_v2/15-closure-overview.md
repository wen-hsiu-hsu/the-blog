---
title: '閉包（Closure）：從 makeAdjectifier 看懂部分應用與柯里化'
description: '閉包讓內層函數記住定義時外層作用域的值，離開作用域後依然記得。用 makeAdjectifier 與 curryGreet 範例，看懂部分應用與柯里化怎麼鎖定參數、做出可重用的函數。'
date: 2026-10-14
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 15
chapter: 'Scope & Closure'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - Closure
    - PartialApplication
---

# 閉包（Closure）：從 makeAdjectifier 看懂部分應用與柯里化

> [[14-implement-reduce-function-exercise|上一篇]]實作 reducer 時，講師提到函數式程式設計不靠狀態記住東西，而是用累加器這個值記住目前進行到哪裡。這一篇進入新章節 Scope & Closure，介紹另一種「記住值、留待之後使用」的方式：閉包。

## 另一種記住東西的方式

在命令式的寫法裡，習慣用狀態來記住東西：用變數記住程式在每個時間點的狀態，而這些變數的值會隨時間改變。

函數式程式設計不這麼做。上一篇的 reduce 用累加器這個值，記住重複執行到哪一步；另一種記住東西、留待之後使用的方式，就是**閉包（closure）**。講師說閉包是函數式程式設計裡非常有用、甚至不可或缺的一類函數，而它跟函數的**作用域（scope）**有關。

## 在函數裡定義函數

[[11-higher-order-functions|高階函數那篇]]提到，filter、map、reduce 之所以是高階函數，是因為它們接收另一個函數當參數。除此之外，函數裡也可以定義一個新的函數，形成巢狀的函數定義。

講師這裡用 `function` 關鍵字示範，不過同樣的寫法也可能用箭頭函數寫出來：

```js
function makeAdjectifier(adjective) {
    return function (noun) {
        return adjective + ' ' + noun;
    };
}

const coolify = makeAdjectifier('cool');
coolify('workshop'); // 'cool workshop'
coolify('drink'); // 'cool drink'
```

- **`makeAdjectifier`**：接收一個形容詞 `adjective`，回傳另一個函數
- **回傳的函數**：接收一個名詞 `noun`，把 `adjective` 加在它前面
- **`coolify`**：呼叫 `makeAdjectifier('cool')` 得到的函數，之後傳什麼名詞進去，前面都會加上 `cool`

## cool 被「烤」進了 coolify

注意 `coolify('workshop')` 和 `coolify('drink')` 的呼叫裡都沒有 `cool` 這個字，結果卻都有，為什麼？因為 `cool` 已經被「烤」進 `coolify` 裡了。

對 JavaScript 來說，`adjective` 就只是一個值。定義內層函數的那一刻正在呼叫 `makeAdjectifier`，所以已經知道這個值是 `cool`。JavaScript 把這個只存在於 `makeAdjectifier` 作用域裡的值，拿進回傳的函數裡使用。

所以拿到這個回傳的函數時，`cool` 依然烤在它的程式碼裡。換句話說，內層函數會記住它被定義時所在作用域的值，即使身為程式設計師的我們早就離開了那個作用域。

內層函數就像被鎖進那個作用域：`adjective` 是什麼，在定義的時候就決定了，是 `cool`。從此以後，`coolify` 會讓所有東西都變得很 cool，講師開玩笑說，可惜不會變 hot，對正值冬天的北半球來說有點遺憾。

## 閉包：為什麼不全部放進參數就好

這個例子很簡單，但背後的概念非常強大：計算需要的每一小塊資料，不一定都要放進函數簽名裡。全部塞進參數，函數很快就會變得難以駕馭。

閉包提供了另一條路。說這個內層函數 **closed over** `adjective`，意思是 `adjective` 已經定案，改變它的機會已經「關上」了，閉包（closure）的名稱就是這樣來的。

計算越來越複雜時，閉包會變得非常強大：可以把需要的值烤進內層函數，做出能依需要記住這些值的閉包。

## 術語：部分應用

講師接著介紹一點術語。前面說閉包是「closed over 定義時作用域裡某個值」的內層函數，而像 `coolify` 這樣的做法，還有另一個說法叫**部分應用（partial application）**，閉包是函數部分應用的一種形式。講師強調，提這個術語不是因為術語本身重要，而是之後自己閱讀、學習時可能會碰到。

一般來說，要把形容詞和名詞拼在一起，需要一個接收兩個參數的函數：

```js
function adjectifyNoun(adjective, noun) {
    return adjective + ' ' + noun;
}
```

`makeAdjectifier` 做的事，是把其中一個參數 `adjective` 先鎖定，讓它在不同的作用域傳進來：`adjective` 傳給 `makeAdjectifier`，`noun` 則留給回傳的函數。

所以 `coolify` 就像只完成了一半的「形容詞加名詞」：它還不知道名詞是什麼，但已經知道形容詞會是 `cool`。部分應用指的就是這種狀態，參數裡有一部分已經鎖定，但還沒有全部到位。

### 好處：更容易重用

這代表可以做出更容易重用的函數。每次想要 cool workshop、cool drink、cool movie 的時候，不用一直重複傳入 `cool`。把它鎖定在 `coolify` 這個部分應用的函數裡，之後只要傳入下一個值，就能完成整個應用；如果是多參數的函數，就傳入其他還需要的值。

## 術語：柯里化

還有一個相關概念，講師說這門課沒時間深入，但一樣可能會碰到，叫做**柯里化（currying）**。

在函數式程式設計裡很常見的做法，是拿一個表面上可以接收兩個參數的函數，像前面的 `adjectifyNoun`，把它轉成一連串巢狀的單參數函數。畢竟每次都要傳入 `cool` 實在很煩。前面把兩個參數的函數改寫成 `makeAdjectifier`，做的正是這件事。

柯里化就是一種部分應用：每個函數接收下一個參數，回傳部分應用後的函數；那個函數再接收下一個參數，再回傳部分應用後的函數，依此類推。

換句話說，有時候與其用多參數的函數簽名，不如拆成好幾個部分應用的函數，把某些值鎖定下來，就不用一再重複。講師說自己一定會在某個 `cool` 打錯字，打成 `cowl` 之類的，所以只想打一次 `cool`，之後再也不用擔心。

柯里化跟閉包常常一起出現，因為柯里化本身就是在利用閉包。

### 範例：把 greet 柯里化

講師再舉一個類似的例子，用的是前面看過的 `greet` 函數。跟[[03-pure-functions-overview|第三篇]]純函數版的 `greet` 只接收 `name` 不同，這個版本接收一個招呼語 `greeting` 和一個名字 `name`，回傳打招呼的字串：

```js
function greet(greeting, name) {
    return `${greeting}, ${name}!`;
}
```

要柯里化這個函數，就是不再讓它當一個**二元函數（binary function）**，也就是接收兩個參數的函數。改成只部分應用 `greeting`，回傳一個接收 `name` 的新函數，由這個新函數回傳最終結果：

```js
function curryGreet(greeting) {
    return function (name) {
        return `${greeting}, ${name}!`;
    };
}

const greetItal = curryGreet('Ciao');
greetItal('Alonzo'); // 'Ciao, Alonzo!'

const greetTex = curryGreet('Howdy');
greetTex('Alonzo'); // 'Howdy, Alonzo!'
greetTex('Alan'); // 'Howdy, Alan!'
```

`greetItal` 鎖定了 `'Ciao'`，`greetTex` 鎖定了 `'Howdy'`，之後只要傳入名字就好，跟 `coolify` 是同一個套路。

### 連續的括號

參數一多，柯里化的程式碼就會開始看起來有點怪，例如不先存成變數，直接寫成 `curryGreet('Howdy')('Alonzo')`，出現一連串的括號。

所以看到「把括號裡的東西拿去呼叫，再對下一組括號呼叫，再對下一組括號呼叫」這種程式碼，八成就是在處理閉包，很可能是一個柯里化的函數。

## 作用域才是重點

拆開函數簽名，常常是為了做出這種可重用的工具。講師說柯里化應該不是近期在 JavaScript 學習路上會用到的東西，但還有很多情況，會希望在程式裡一再重用同一個值，又不想把它當參數傳給每個函數的每一次呼叫。

說到底，重點在作用域，以及閉包的概念：把外層作用域鎖進內層作用域。這讓程式更模組化，函數可以依需要重用與重新組合。至於「組合」的部分，課程後面會再談。

## 後記

幾年前就看過 currying，當時一直搞不懂把一個函數拆成好幾層有什麼用，多打好幾組括號只覺得麻煩。這次跟著 `coolify` 一路看下來，從「不想一直重複傳 `cool`」這個角度切入，突然就理解這樣做的目的了：重點不是拆開本身，而是先把固定的值鎖進去，做出一個可以一再重用的函數。

## 複習

### JavaScript 裡的閉包是什麼？

閉包是一個函數，它會記住並能存取外層（定義時所在）作用域的值，即使外層函數已經執行完畢也一樣。它讓函數可以「鎖定」某些值並重複使用，不用每次都當參數傳入。

### 函數式程式設計裡的部分應用是什麼？

部分應用是把多參數函數的其中一些參數先固定下來，產生一個參數比較少的新函數。預先設定好部分參數的值，可以做出更專門、更容易重用的函數。

### 函數式程式設計裡的柯里化是什麼？

柯里化是把一個多參數函數，轉換成一連串巢狀、每個只接收一個參數的函數。每個函數都回傳一個新函數，等待下一個參數，直到所有參數都處理完，才回傳最終結果。

### 在閉包的範例中，`makeAdjectifier` 函數是怎麼運作的？

`makeAdjectifier` 接收一個形容詞當參數，回傳一個可以把這個形容詞加到任何名詞前面的新函數。回傳的函數會「記住」原本的形容詞，不用每次都傳入形容詞就能重複使用。

### 閉包為函數式程式設計帶來什麼好處？

閉包讓內層函數保有對定義時作用域裡的值的存取權，讓開發者能寫出更模組化、更容易重用的函數。這樣可以避免重複傳遞參數，寫出更有彈性、更精簡的程式碼。

### 在閉包的脈絡下，說一個函數 closed over 某個值是什麼意思？

這個函數保有對原本定義時作用域裡那個值的存取權，即使那個作用域已經執行完畢。

### 下面的程式碼中，`coolify('workshop')` 會回傳什麼？

```js
function makeAdjectifier(adjective) {
    return function (noun) {
        return adjective + ' ' + noun;
    };
}
const coolify = makeAdjectifier('cool');
```

`'cool workshop'`。

## 小測驗

<details>
<summary>JavaScript 裡的閉包是什麼？</summary>
閉包是一個函數，它會記住並能存取外層（定義時所在）作用域的值，即使外層函數已經執行完畢也一樣。它讓函數可以「鎖定」某些值並重複使用，不用每次都當參數傳入
</details>

<details>
<summary>函數式程式設計裡的部分應用是什麼？</summary>
把多參數函數的其中一些參數先固定下來，產生一個參數比較少的新函數。預先設定好部分參數的值，可以做出更專門、更容易重用的函數
</details>

<details>
<summary>函數式程式設計裡的柯里化是什麼？</summary>
把一個多參數函數，轉換成一連串巢狀、每個只接收一個參數的函數。每個函數都回傳一個新函數，等待下一個參數，直到所有參數都處理完，才回傳最終結果
</details>

<details>
<summary>在閉包的範例中，<code>makeAdjectifier</code> 函數是怎麼運作的？</summary>
<code>makeAdjectifier</code> 接收一個形容詞當參數，回傳一個可以把這個形容詞加到任何名詞前面的新函數。回傳的函數會「記住」原本的形容詞，不用每次都傳入形容詞就能重複使用
</details>

<details>
<summary>閉包為函數式程式設計帶來什麼好處？</summary>
閉包讓內層函數保有對定義時作用域裡的值的存取權，讓開發者能寫出更模組化、更容易重用的函數。這樣可以避免重複傳遞參數，寫出更有彈性、更精簡的程式碼
</details>

<details>
<summary>在閉包的脈絡下，說一個函數 closed over 某個值是什麼意思？</summary>
這個函數保有對原本定義時作用域裡那個值的存取權，即使那個作用域已經執行完畢
</details>

<details v-pre>
<summary>下面的程式碼中，<code>coolify('workshop')</code> 會回傳什麼？
<pre><code>function makeAdjectifier(adjective) {
    return function (noun) {
        return adjective + ' ' + noun;
    };
}
const coolify = makeAdjectifier('cool');</code></pre></summary>
'cool workshop'
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
