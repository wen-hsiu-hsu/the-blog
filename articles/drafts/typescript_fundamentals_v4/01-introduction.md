---
title: 'TypeScript 入門筆記：JavaScript 語法超集定位、編譯器角色與編譯期抓錯的實例解析'
description: '講師 Mike North（Stripe principal staff engineer）說明 TypeScript 作為 JavaScript 語法超集的定位、編譯器與語言伺服器的角色分工，並用一個字串誤加數字的實例，解釋型別如何把原本只在執行期才會爆炸的問題提前搬到編譯期，讓工具在寫程式當下就攔住錯誤。'
date: 2026-08-29
section: dev
category: TypeScript Fundamentals
series: typescript_fundamentals
seriesTitle: 'TypeScript Fundamentals'
order: 1
chapter: 'Introduction'
tags:
    - frontendMasters
    - typescriptFundamentals
    - TypeScript
    - JavaScript
    - TypeSystem
    - TypeAnnotations
    - DuckTyping
---

# TypeScript 是什麼：編譯期抓錯，讓程式碼說出你的真實意圖

講師 Mike North 是 Stripe 的 principal staff engineer，同時是外部開發者平台團隊的 tech lead，負責 Stripe Node.js SDK（用 TypeScript 寫成）與 Stripe Workbench 等工具，也參與 Stripe 對外公開 API 的型別設計，這個 API 支撐著每年近兆美元的支付流量。這門課的目標不是讓學員背熟某個版本的語言特性，而是建立一套「如何思考型別」的心智模型，讓學員之後不管 TypeScript 怎麼演進，都能自己推理新特性的行為。

## TypeScript 是 JavaScript 的語法超集

TypeScript 是 Microsoft 維護的開源專案，定位是 JavaScript 的語法超集：JavaScript 語法結束的地方，就是 TypeScript 開始擴充的地方。但這個「超集」關係是單向的，所有你平常寫的 JavaScript 語法都能直接用在 TypeScript 程式裡，但不代表所有 JavaScript 程式都是合法的 TypeScript 程式。

TypeScript 由三個部分組成：

- **語言本身**：程式語言的語法與型別系統
- **編譯器**：把 TypeScript 轉成乾淨、可讀的 JavaScript
- **語言伺服器**：驅動 VS Code、WebStorm 等編輯器裡的型別提示與即時驗證

## 把 TypeScript 想成一個進階版的 linter

理解 TypeScript 最有用的心智模型是把它當成一個進階版的 linter。它只在建置期（build time）幫你做事，實際跑在瀏覽器或 Node.js 裡的，仍然是編譯後那份普通的 JavaScript，編譯器會在建置過程中把型別系統整個抹除掉，不會出現在最終輸出的 JavaScript 裡。

這跟 Java、C# 這類具備執行期型別驗證的語言不同，那些語言在執行期驗證型別是有額外成本的。TypeScript 選擇把型別檢查完全留在建置期，讓輸出的 JavaScript 可以跑在任何能執行 JavaScript 的地方，無論是瀏覽器、Node.js 還是嵌入式裝置。

## 型別讓程式碼說出作者的真實意圖

以一個把 `a`、`b` 兩個參數相加的函式為例，如果沒有型別標註，光看函式名稱 `add` 很難確定作者的意圖：這個函式究竟是設計來做數字加法，還是字串串接？兩種呼叫方式在 JavaScript 裡都能執行。

```ts
// 沒有型別標註：無法從簽名判斷作者的真實意圖
function add(a, b) {
    return a + b;
}
```

假設後來有人要替這個函式加上第三個可選參數 `c`，並把它預設為 `0`，用來把 `c` 加進 `a + b` 的結果。這個改動對原本拿這個函式做數字加法的呼叫者沒有影響，但如果先前有人是拿它來做字串串接，現在字串尾端就會硬生生多出字元 `0`，行為就壞了。問題根源在於函式簽名本身沒有留下足夠的意圖線索，沒有人能從程式碼看出作者原本只打算讓它處理數字。

加上型別標註後，型別標註就明確鎖死了這個模糊地帶：

```ts
// a、b 皆為 number，回傳值也必須是 number
function add(a: number, b: number): number {
    return a + b;
}
```

此時若誤傳字串進去，TypeScript 會直接在編輯器裡標紅，報出「引數型別 string 不能指派給型別 number 的參數」這樣的錯誤，在你寫下這行程式碼的當下就攔截問題，而不是等到程式實際執行、字串悄悄跟數字混在一起才爆炸。

## 把執行期的問題搬到編譯期

TypeScript 的核心價值，可以總結成一句話：把原本只會在執行期才浮現的問題，提前搬到編譯期。你在呼叫端就會立刻看到錯誤，而不是要深入函式內部，或是等到單元測試跑過才發現。函式邏輯越複雜（例如牽涉到 Promise、非同步錯誤處理），這種提前攔截的價值就越明顯，因為錯誤發生的地點跟根本原因所在地會離得更遠。

TypeScript 並不是要取代單元測試，而是提供另一層更即時、更明確的回饋。這一層回饋直接發生在你打字的當下，錯誤訊息也直接指向誤用的呼叫點，而不是深藏在函式內部某處。

## 為什麼即使是有經驗的開發者也值得改用 TypeScript

有學員提問，對於已經熟悉 JavaScript 動態特性的開發者來說，型別系統帶來的「不夠靈活」是否划算。講師的回答回到前面 `add` 函式的例子：JavaScript 的動態型別（duck typing）允許你把函式、class 實例，甚至 DOM 節點都傳進同一個參數位置，程式會一路嘗試執行下去，直到真正衝突的那一刻才報錯，而那個衝突點往往離問題的根源很遠。

TypeScript 讓你明確畫出一個程式碼單元的邊界，並宣告這個邊界能接受的限制條件。這帶來的不只是更精確的錯誤訊息（明確指出是哪個值出了問題），更關鍵的是錯誤會出現在呼叫端，而不是深埋在函式內部。當程式碼變複雜、資料結構變得龐大時，光靠開發者自己在腦中維護所有隱性約定並不夠可靠，型別系統能把這些約定寫進原始碼裡，變成編譯器會主動幫你檢查的東西。

值得留意的是，型別系統也不是萬能的：即使宣告了回傳值是 `number`，像 `'1' + '1'` 這種字串相加會得到字串 `'11'` 而非數字，若沒有明確的回傳型別標註，TypeScript 一樣抓不到這個問題。這也是為什麼函式回傳型別的標註格外重要，它能在編譯期就攔下「回傳值型別不符合宣告」的情況。

## 這門課的學習路徑

課程會先用 TSC CLI 建立一個最小的 TypeScript 專案，接著依序深入語言細節：

- **變數與型別基礎**：變數宣告、物件、陣列與 tuple 型別
- **結構型別與名義型別**：對比 TypeScript 的結構型別系統與 Java、C# 這類語言採用的名義型別系統
- **聯集與交集型別**：型別世界裡的「或」與「且」
- **型別命名**：透過 interface 與 type alias 為型別命名，並跨模組匯入匯出，課程會用「描述任何合法 JSON 值」作為練習題
- **型別查詢**：從既有的值反推出它的型別，再套用到別的地方
- **callable 與 constructable**：分別對應可呼叫的函式與可用 `new` 建立實例的 class
- **型別守衛與窄化（narrowing）**：針對型別的不同分支寫出對應的處理邏輯
- **泛型（generics）**：把函式參數化數值的概念，延伸到型別本身也能被參數化這件事上

課程最後會把整天學到的內容整合起來，動手實作一套 map、filter、reduce 風格的工具函式庫，只是這次操作的對象不是陣列，而是字典（dictionary）結構。

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [TypeScript Fundamentals](https://master.dev/courses/typescript-v4/) 課程筆記
