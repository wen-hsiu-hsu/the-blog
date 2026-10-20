---
title: '不改原陣列的 push、pop 與 update：展開運算子、slice、map'
description: '把會原地修改的 push、pop 與索引指派改寫成回傳新陣列：push 用展開運算子，pop 用 slice(0, -1)，update 用帶索引的 map 或 slice，並留意 slice 只做淺拷貝。'
date: 2026-10-16
section: dev
category: Functional JavaScript First Steps
series: functional_javascript_first_steps
seriesTitle: 'Functional JavaScript First Steps'
order: 20
chapter: 'Immutability'
tags:
    - frontendMasters
    - functionalJavaScriptFirstSteps
    - JavaScript
    - FunctionalProgramming
    - Immutability
    - Mutation
    - SpreadOperator
    - Concat
    - Slice
    - ShallowCopy
    - MethodChaining
---

# 不改原陣列的 push、pop 與 update：展開運算子、slice、map

> [[19-immutable-data|上一篇]]說明了函數式程式設計不原地修改資料，而是用 `map` 這類方法產生更新過的新版本。這一篇動手練習：把平常天天在用、會修改陣列的操作，改寫成不修改原陣列的版本。

## 練習目標

平常寫 JavaScript 時，很習慣用 `push` 把元素加進陣列、用 `pop` 拿掉最後一個元素，或是用 `array[index] = value` 指派新值給某個索引。這些操作都會修改原本的陣列。

講師想讓大家體會一件事：如果不能做這些修改，要怎麼改寫？原本是回傳一個被原地改掉的物件，現在則要回傳一個新的值，用它取代原本的版本。

這個練習會先用一般的資料結構來做。之後再看看怎麼在沿用原本 API 寫法的同時，確保這些操作不會修改資料。

## 題目：arrays.js

`arrays.js` 裡有三個還沒實作的函數，分別對應 `push`、索引指派、`pop`：

```js
// instead of myArray.push(element)
export function push(element, array) {
    // TODO return a new array with the new element at the end
}

// instead of myArray[index] = value
export function update(index, value, array) {
    // TODO return a new copy of the array with the given value at index
}

// instead of myArray.pop();
export function pop(array) {
    // TODO return a new array with the last old element removed
}
```

講師說這些是函數式的對應版本，但不是每個都跟原本的方法一模一樣。例如原生的 `pop` 會回傳被拿掉的元素，這裡的 `pop` 則不是。功能相同，只是少了修改這件事。

### 測試怎麼判斷有沒有修改

目標是讓測試通過。以 `push` 為例，原始陣列是 `[1, 2, 3]`，呼叫 `push(4, original)` 之後，回傳的 `pushed` 要是 `[1, 2, 3, 4]`，`original` 則必須還是 `[1, 2, 3]`：

```js
describe('push', () => {
    const original = [1, 2, 3];
    const pushed = push(4, original);
    it('should return an array with the new element at the end', () => {
        expect(pushed).toStrictEqual([1, 2, 3, 4]);
    });
    it('should not modify the original array', () => {
        expect(original).toStrictEqual([1, 2, 3]);
    });
});
```

每個函數都有兩個測試：一個檢查回傳值對不對，一個檢查原始陣列有沒有被動到。換成原生的 `original.push(4)`，第二個測試就會失敗：

```js
const original = [1, 2, 3];
original.push(4);

original; // [1, 2, 3, 4]
```

講師說，要是原本預期 `original` 只有三個元素，那就慘了。這些測試能用不修改資料的版本通過，函數式程式設計那顆一看到修改資料就渾身不對勁的心，也就稍微被安撫了一點。

## push：回傳加上新元素的新陣列

`push` 要接收一個裝著一些東西的陣列和一個新元素，回傳一個包含原本所有東西、再加上新元素的陣列。

### 做法一：concat

學員第一個提出的做法是用 `concat` 把陣列跟元素接起來。講師提醒，`concat` 處理的是陣列，不能直接拿陣列去接一個元素，要接的是一個裝著那個元素的陣列：

```js
export function push(element, array) {
    return array.concat([element]);
}
```

這裡用的是內建的 `array.concat`。[[12-implement-filter-function-exercise|實作 filter 那篇]]的 `concat` 輔助函數只是把它包一層，讓 API 看起來沒那麼物件導向。所以學員也提到，改用那個輔助函數時，元素同樣要先包成陣列，寫成 `concat(array, [element])`。

### 做法二：展開運算子

另一位學員提出不用 `concat` 的寫法：回傳一個新陣列，先把原陣列展開，再接上新元素。

```js
export function push(element, array) {
    return [...array, element];
}
```

展開運算子在[[18-implementing-a-pipe-function-exercise|實作 pipe 那篇]]出現過，它會把陣列的所有元素攤開到使用它的位置。所以 `[...array, element]` 就是原陣列的每個元素，加上新元素，一起放進一個新陣列。

## pop：回傳去掉最後一個元素的新陣列

原生的 `pop` 會回傳最後一個元素。這裡不在乎那個元素，它就這樣不見了，要的是一個包含原陣列所有東西、只少了最後一個元素的新陣列。某種程度上就是 `push` 的反向操作。

### 用 slice 切出前面的部分

學員提議用 slice，也就是先前看過的 `array.slice`：

```js
export function pop(array) {
    return array.slice(0, -1);
}
```

依照 `slice` 的文件說明：

- 第一個參數 `0`：從頭開始切
- 第二個參數 `-1`：在走到陣列結尾之前停下來，所以最後一個元素不會被包含進來

講師也提到，理論上可以改用前面的輔助函數來做，例如用 `head` 與 `tail` 取代 `slice`。這部分講師留給讀者當練習。

## 不確定時，查 MDN

用 `slice` 是完全合理的實作，但前提是確認它不會修改被呼叫的那個陣列，才能放心依賴它。講師的做法是去查 MDN 上 `Array.prototype.slice` 的說明。

查完會發現它確實回傳一個新陣列，但有個要注意的地方：`slice` 做的是**淺拷貝（shallow copy）**，不是深拷貝。陣列裡都是數字這類簡單的值時，大概不會有問題；處理層層巢狀的複雜資料時就要小心。

例如陣列裡又包著一個陣列，淺拷貝不會另外複製那個內層陣列，新舊兩個陣列指向的是同一個內層陣列：

```js
const original = [[1, 2], 3];
const popped = pop(original);

popped; // [[1, 2]]
popped[0] === original[0]; // true，指向同一個內層陣列
```

講師的建議是：不確定時就查 MDN，確認要用的操作會不會修改資料。

## update：回傳替換掉指定索引的新陣列

最後一個是 `update`，對應 JavaScript 裡 `array[index] = value` 這種原地指派的寫法。講師說這題比較難一點，要靠前面那些不會修改資料的陣列方法幫忙。

測試的寫法跟 `push` 一樣，原始陣列裡的 `'spellling'` 拼錯了，`update` 要回傳把索引 0 換成 `'spelling'` 的新陣列，原陣列則保持原樣：

```js
describe('update', () => {
    const original = ['spellling', 'is', 'hard'];
    const updated = update(0, 'spelling', original);
    it('should return an array with the updated value at the given index', () => {
        expect(updated).toStrictEqual(['spelling', 'is', 'hard']);
    });
    it('should not modify the original array', () => {
        expect(original).toStrictEqual(['spellling', 'is', 'hard']);
    });
});
```

### 做法一：帶索引的 map

一位學員用 `map` 解這題。講師不確定這裡能不能用前面的輔助函數，所以直接用內建的 `array.map`，它一樣不會修改原陣列。這跟[[19-immutable-data|上一篇]]用 `map` 判斷每個元素要不要更新是同一個模式，差別在這裡要靠索引找出目標。

大多數人寫 `map` 的轉換函數時，習慣只接收一個參數，例如 `(item) => item`。講師提醒，JavaScript 的 `map` 轉換函數還可以多接一個參數，它會拿到每個元素的索引：

```js
export function update(index, value, array) {
    return array.map((item, i) => (i === index ? value : item));
}
```

用 `i` 檢查目前是不是走到要更新的那個索引：

- **是**：不管原本的元素，直接回傳新的 `value`
- **不是**：回傳原本的 `item`

### 做法二：slice 切成前後兩段，再展開

聊天室提出另一個做法，跟 `push` 的展開運算子寫法很像。講師先把陣列切成兩段，存進變數：

```js
export function update(index, value, array) {
    const itemsBefore = array.slice(0, index);
    const itemsAfter = array.slice(index + 1);
    return [...itemsBefore, value, ...itemsAfter];
}
```

- **`itemsBefore`**：`array.slice(0, index)`，從頭切到指定索引，會在那個索引之前停下來
- **`itemsAfter`**：`array.slice(index + 1)`，要的是索引之後的元素，不包含索引上的那一個，所以從 `index + 1` 開始

陣列裡只有一個索引是要處理的，這樣就把它前面的所有元素、後面的所有元素分別抓出來，再用展開運算子攤開。要注意的是，如果只寫 `[...itemsBefore, ...itemsAfter]`，就不符合規格了，更新後的值不見了，所以要把 `value` 放在兩段中間。

`itemsBefore`、`itemsAfter` 這兩個變數其實不一定需要，也可以直接寫在同一行裡，差別只在可讀性。

### 做法三：串接方法呼叫

講師按下解答按鈕，看到的是另一種寫法。它跟展開運算子那個版本很像，只是把呼叫串在一起：

```js
export function update(index, value, array) {
    return array
        .slice(0, index)
        .concat([value])
        .concat(array.slice(index + 1));
}
```

這種「陣列點這個、再點那個、再點另一個」的串接寫法，在程式碼裡應該很常見。它其實就是讓資料依序流過好幾個函數，前提是這些方法接收的資料型別一致。這裡的 `slice` 接收陣列、回傳陣列，`concat` 也是，`map` 也是。

如果在中間插一個 `reduce`，回傳的就變成單一個值而不是整個陣列，這時就可能有點混亂。只要處理的都是同一種型別的資料，就能把方法呼叫串起來，形成一條函數式的管線。不必像[[18-implementing-a-pipe-function-exercise|實作 pipe 那篇]]那樣自己實作工具函數，也不用在腦中把巢狀呼叫倒過來讀。

## 練習的重點

這幾種寫法都是合理的，背後的想法也大致相同。講師說，這個練習的重點是讓大家仔細想想，什麼時候在修改資料、什麼時候沒有。

講師不會要求從此只用 `update`，不再用中括號指派值。但不論在 JavaScript 或其他地方，都建議弄清楚自己用的語言功能、內建方法或函式庫，哪些會動到資料、哪些會複製一份，這樣才能確定舊資料永遠不會被搞亂。

## 複習

### 有什麼不修改原陣列、可以取代 array.push 的做法？

用陣列的展開運算子或 `concat`，建立一個包含原本元素與新元素的新陣列，不修改原陣列。

### 有什麼不修改原陣列、可以取代 array.pop 的做法？

用 `array.slice(0, -1)` 回傳一個新陣列，包含原陣列除了最後一個以外的所有元素，不修改原陣列。

### 會修改與不會修改的陣列操作，關鍵差別是什麼？

會修改的操作直接原地改動原陣列；不會修改的操作則回傳新陣列，原陣列保持不變。

### 用 array.slice() 複製陣列時要注意什麼？

`array.slice()` 做的是淺拷貝。遇到巢狀陣列時，它複製的是內層陣列的參照，不會另外深拷貝一份。

### 建立不修改原陣列的陣列方法，建議用什麼做法？

用展開運算子、`concat()` 或 `slice()` 這些技巧建立新陣列，不修改原陣列，保持資料的不可變性。

### 哪一種 JavaScript 語法可以展開原陣列的元素、再加上新元素建立新陣列，實作不修改原陣列的 push？

陣列字面值裡的展開運算子（`...`）。

### Array.slice() 建立的是哪一種拷貝？

淺拷貝。

### 實作不修改原陣列的陣列方法，展現了哪一個關鍵原則？

函數式程式設計的做法。

### 要做出不修改原陣列、移除最後一個元素的版本，可以用哪個方法？

`array.slice(0, -1)`。

### 在 JavaScript 裡，有哪兩種不修改原陣列、更新陣列元素的做法？

用 `.map()` 搭配索引參數，依條件回傳新的值；或是用陣列展開運算子搭配 `.slice()`，建立一個包含更新後元素的新陣列。

### 用 .map() 更新陣列元素時，回呼函數可以接收哪兩個參數？

元素本身與索引。`map` 的回呼函數其實還能接收第三個參數（原陣列），但最常用的是前兩個。同時用元素與索引這兩個參數，就能依索引判斷，只更新特定的元素、其他元素保持原樣。

### 在 JavaScript 裡使用陣列方法時，處理資料的關鍵原則是什麼？

弄清楚哪些方法會修改原本的資料，哪些方法會建立一份新的副本、不動到原陣列。

### 怎麼用方法串接以函數式的方式更新陣列元素？

把 `.slice()`、`.concat()`、`.map()` 這類方法串在一起，形成一條函數式管線，在不修改原資料的情況下轉換陣列。

### 要確保資料不可變，更新陣列元素時建議用什麼做法？

用 `.map()` 或展開語法這類不會修改原陣列、會建立新陣列的方法，而不是用索引指派直接修改原陣列。

### 在不可變地更新單一陣列元素的情境下，哪個方法會對每個元素套用轉換函數，並能用索引參數依條件替換特定元素？

`map`。

### JavaScript 的 map 回呼函數中，提供目前元素索引的第二個參數，慣例上叫什麼名字？

`index`。

### 用展開語法不修改原陣列地更新一個陣列元素，可以怎麼寫？

`[...array.slice(0, index), newValue, ...array.slice(index + 1)]`

### 避免修改陣列，在 JavaScript 裡主要的目的是什麼？

確保原始資料保持不變。

### 把 slice、concat、map 這些陣列方法串接起來，展現的是哪一種程式設計範式？

函數式程式設計。

## 小測驗

<details>
<summary>有什麼不修改原陣列、可以取代 <code>array.push</code> 的做法？</summary>
用陣列的展開運算子或 <code>concat</code>，建立一個包含原本元素與新元素的新陣列，不修改原陣列
</details>

<details>
<summary>有什麼不修改原陣列、可以取代 <code>array.pop</code> 的做法？</summary>
用 <code>array.slice(0, -1)</code> 回傳一個新陣列，包含原陣列除了最後一個以外的所有元素，不修改原陣列
</details>

<details>
<summary>會修改與不會修改的陣列操作，關鍵差別是什麼？</summary>
會修改的操作直接原地改動原陣列；不會修改的操作則回傳新陣列，原陣列保持不變
</details>

<details>
<summary>用 <code>array.slice()</code> 複製陣列時要注意什麼？</summary>
<code>array.slice()</code> 做的是淺拷貝。遇到巢狀陣列時，它複製的是內層陣列的參照，不會另外深拷貝一份
</details>

<details>
<summary>建立不修改原陣列的陣列方法，建議用什麼做法？</summary>
用展開運算子、<code>concat()</code> 或 <code>slice()</code> 這些技巧建立新陣列，不修改原陣列，保持資料的不可變性
</details>

<details>
<summary>哪一種 JavaScript 語法可以展開原陣列的元素、再加上新元素建立新陣列，實作不修改原陣列的 push？</summary>
陣列字面值裡的展開運算子（<code>...</code>）
</details>

<details>
<summary><code>Array.slice()</code> 建立的是哪一種拷貝？</summary>
淺拷貝
</details>

<details>
<summary>實作不修改原陣列的陣列方法，展現了哪一個關鍵原則？</summary>
函數式程式設計的做法
</details>

<details>
<summary>要做出不修改原陣列、移除最後一個元素的版本，可以用哪個方法？</summary>
<code>array.slice(0, -1)</code>
</details>

<details>
<summary>在 JavaScript 裡，有哪兩種不修改原陣列、更新陣列元素的做法？</summary>
用 <code>.map()</code> 搭配索引參數，依條件回傳新的值；或用陣列展開運算子搭配 <code>.slice()</code>，建立一個包含更新後元素的新陣列
</details>

<details>
<summary>用 <code>.map()</code> 更新陣列元素時，回呼函數可以接收哪兩個參數？</summary>
元素本身與索引。<code>map</code> 的回呼函數其實還能接收第三個參數（原陣列），但最常用的是前兩個。同時用元素與索引這兩個參數，就能依索引判斷，只更新特定的元素、其他元素保持原樣
</details>

<details>
<summary>在 JavaScript 裡使用陣列方法時，處理資料的關鍵原則是什麼？</summary>
弄清楚哪些方法會修改原本的資料，哪些方法會建立一份新的副本、不動到原陣列
</details>

<details>
<summary>怎麼用方法串接以函數式的方式更新陣列元素？</summary>
把 <code>.slice()</code>、<code>.concat()</code>、<code>.map()</code> 這類方法串在一起，形成一條函數式管線，在不修改原資料的情況下轉換陣列
</details>

<details>
<summary>要確保資料不可變，更新陣列元素時建議用什麼做法？</summary>
用 <code>.map()</code> 或展開語法這類不會修改原陣列、會建立新陣列的方法，而不是用索引指派直接修改原陣列
</details>

<details>
<summary>在不可變地更新單一陣列元素的情境下，哪個方法會對每個元素套用轉換函數，並能用索引參數依條件替換特定元素？</summary>
<code>map</code>
</details>

<details>
<summary>JavaScript 的 <code>map</code> 回呼函數中，提供目前元素索引的第二個參數，慣例上叫什麼名字？</summary>
<code>index</code>
</details>

<details>
<summary>用展開語法不修改原陣列地更新一個陣列元素，可以怎麼寫？</summary>
<code>[...array.slice(0, index), newValue, ...array.slice(index + 1)]</code>
</details>

<details>
<summary>避免修改陣列，在 JavaScript 裡主要的目的是什麼？</summary>
確保原始資料保持不變
</details>

<details>
<summary>把 slice、concat、map 這些陣列方法串接起來，展現的是哪一種程式設計範式？</summary>
函數式程式設計
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Functional JavaScript First Steps, v2](https://frontendmasters.com/courses/functional-first-steps-v2/) 課程筆記
