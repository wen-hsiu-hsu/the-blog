---
title: Singleton 與 Factory 模式：JavaScript 建立型設計模式入門
description: 建立型設計模式把建立物件的邏輯從其他程式碼拆開。整理 singleton 與 factory 各自要解決的問題、使用情境，以及在 JavaScript 用物件字面值寫 singleton 的做法。
date: 2026-11-10
section: dev
category: JavaScript Design Patterns
series: javascript_design_patterns_for_web_apps
seriesTitle: JavaScript Design Patterns for Web Apps
order: 6
chapter: Classic Patterns
tags:
    - JavaScript
    - frontendMasters
    - javaScriptDesignPatterns
    - DesignPatterns
---

# Singleton 與 Factory 模式：JavaScript 建立型設計模式入門

> 延續 [[blog/courses_notes/javascript-design-patterns-for-web-apps/05-classic-patterns|JavaScript 經典設計模式]]，上一篇提到經典設計模式分成建立型、結構型、行為型三類，這篇從建立型開始，看 singleton 和 factory 兩個模式。

## 建立型設計模式

建立型設計模式（creational design patterns）要解決的是跟建立物件有關的問題。與其到處用 `new` 直接建立物件（例如 `new User()`），建立型模式想做到的是重用既有的程式碼，並且把建立物件的邏輯跟其他程式碼分開。

大部分的設計模式，至少是經典設計模式，一直在做同一件事：解耦（decouple）。可重用性來自把問題拆開，放進彼此分離、但可以互相溝通的層裡。

## Singleton：只有一個實例

### 要解決的問題與解法

- **問題**：確保一個 class 只有一個實例，並提供一個全域的存取點
- **解法**：限制這個 class 只能實例化成一個物件，並提供一個方法來取得這個實例

網路上找到的 singleton 程式碼大多以 Java 為基礎。Java 可以把建構子設成 private，這樣外部就沒辦法用 `new` 建立新的實例。JavaScript 沒有 private 建構子的概念，得自己想辦法解決，不過做法其實很簡單。

### 使用情境

- **管理全域設定物件**：web app 裡的目前語言、目前主題、使用者是否已登入，這些資訊應該只有一個實例
- **資料庫連線池**：例如使用 IndexedDB 的時候
- **日誌服務**：不需要好幾個複製品，只要一個實例
- **狀態管理**：web app 的狀態，是決定畫面目前怎麼渲染的所有資料與資訊

### 最簡單的 singleton：物件字面值

在 JavaScript 裡，最簡單的 singleton 就是一個物件字面值（object literal）：

```javascript
const Database = {
    open: async () => {},
    sendQuery: async (query) => {},
};
```

`Database` 是一個全域物件，裡面有兩個非同步方法：`open` 用來開啟資料庫，`sendQuery` 接收一個查詢 `query` 並送出。這段只是示意，方法本體都是空的。

這個物件只有一個實例，沒辦法再用 `new` 建立新的，頂多被複製一份。這樣就是 JavaScript 版的 singleton。

寫 JavaScript 時常常忘記一件事：物件可以直接建立，不一定每次都要寫 class。讀 singleton 的說明時，文件會叫人先建立一個 class，於是就開始想 class 要怎麼寫。在 JavaScript 裡，其實直接建立一個全域物件就夠了。

這正是上一篇說的「別把 JavaScript 寫成 Java」：善用 JavaScript 本身的能力。之後也會再看一個用 class 實作的例子。

## Factory：把建立物件的流程封裝起來

### 要解決的問題與解法

- **問題**：建立物件的過程可能變得很複雜，牽涉到多個步驟、條件判斷或相依性
- **解法**：把建立物件的流程封裝在獨立的方法或 class 裡，跟其他應用程式邏輯隔開

套用 factory 之前，要先確認自己真的有這個問題。

### 以 Google Drive 的「新增」選單為例

Google Drive 的「新增」選單可以建立很多種文件：文字文件、試算表、簡報，現在還能建立跑 Python 程式碼的筆記本等等。

想像這個選單的點擊事件：裡面有一個 `switch` 或條件判斷，看使用者選了哪一項，再決定要建立哪一種文件。套用 factory 之後，會有一個文件工廠物件，點擊時只要告訴它「使用者點了這一項，給我對應的文件物件」，建立哪種文件由這個 class 負責。

設計模式不是魔法，條件判斷大概還是會存在於某處。factory 做的是把問題或程式碼解耦，拆成 app 裡各自獨立的流程或元件。

### 使用情境

- **建立 UI 元素**：同樣是按鈕，在不同位置可能有不同種類。與其自己用 `new` 建立按鈕，不如跟 factory 說「給我一個按鈕」
- **不同類型的通知**：app 有通知系統時，可以用 factory 建立各種通知
- **資料解析器**：使用者上傳檔案，可能是 JSON、CSV、Excel 試算表或 SQL 檔，依檔案類型請 factory 給一個對應的解析器

### 程式碼：Reader 的 getReader

從程式碼來看，factory 一樣沒有什麼魔法，可以就只是一個 class。以資料解析器為例：

```javascript
class Reader {
    static getReader(url) {
        // 依照 URL 回傳的類型
        // 回傳其中一種 reader
    }
}

class PDFReader extends Reader {}
class CSVReader extends Reader {}
class SQLReader extends Reader {}
```

`Reader` 有一個靜態方法 `getReader`，依據 `url`、URL 的 MIME type 或其他 metadata，回傳 `PDFReader`、`CSVReader`、`SQLReader` 其中一個。這三個 reader 都繼承 `Reader`，方法本體在這裡省略。這裡的三個 reader 只是示意，不必對應上面列的所有檔案類型。

這樣 app 就不會直接建立 `SQLReader`，而是呼叫 `Reader.getReader()` 要一個該用的 reader，再拿來使用。

第一次接觸設計模式的話，看到這段程式碼可能會覺得「這也沒什麼特別的」。確實沒有魔法，設計模式就只是一份食譜。很可能以前就寫過類似的東西，只是不知道這個解法叫做 factory，這也呼應 [[blog/courses_notes/javascript-design-patterns-for-web-apps/03-components-of-a-design-pattern|設計模式的六個組成]]提到的，很多人早就在用設計模式，只是叫不出名字。

## 複習

### 建立型設計模式的主要目標是什麼？

建立型設計模式要解決跟建立物件有關的問題。它著重在重用既有的程式碼，並把物件的邏輯跟其他程式碼分開，主要透過解耦來提升可重用性。

### Singleton 設計模式解決什麼問題？

Singleton 模式確保一個 class 只有一個實例，並提供一個全域的存取點。它限制這個 class 只能實例化成一個物件，並提供一個方法來取得這個實例。

### 實作 singleton 模式的三個常見使用情境是什麼？

常見的使用情境包括：管理全域設定物件（例如目前語言、主題或使用者登入狀態）、資料庫連線池（例如 IndexedDB），以及 web 應用程式的狀態管理。

### 在 JavaScript 實作 singleton 最簡單的方式是什麼？

最簡單的方式是建立一個物件字面值。JavaScript 不需要 class 就能直接建立物件，所以可以建立一個全域物件當作唯一的實例，不需要再建立其他實例。

### Factory 設計模式處理什麼問題？

Factory 模式處理的是建立物件的複雜度，這個過程可能牽涉多個步驟、條件判斷或相依性。它把建立物件的流程封裝在獨立的方法或 class 裡，跟其他應用程式邏輯隔開。

## 小測驗

<details>
<summary>建立型設計模式的主要目標是什麼？</summary>
解決跟建立物件有關的問題，並重用既有的程式碼
</details>

<details>
<summary>在 JavaScript 實作 singleton 最簡單的方式是什麼？</summary>
建立一個物件字面值
</details>

<details>
<summary>以下哪一個是 singleton 模式的合適使用情境？</summary>
管理全域設定物件
</details>

<details>
<summary>Factory 模式處理什麼問題？</summary>
處理牽涉多個步驟、條件判斷或相依性的複雜物件建立
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [JavaScript Design Patterns for Web Apps](https://master.dev/courses/js-design-patterns/) 課程筆記
