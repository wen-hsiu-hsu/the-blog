---
title: 'Mock Service Worker 入門：在網路邊界攔截請求，搭配 Playwright 錄製重播 HAR'
description: 'Mock Service Worker 借用 service worker 攔截網路請求的能力，在應用程式邊界假造後端回應，不用動到任何自己的程式碼，測試跑得更快更穩定，也能在 API 還沒做完時先往下開發；同時介紹 Playwright 搭配 HAR 錄製重播網路流量，實戰應用在跨裝置視覺回歸測試上。'
date: 2026-10-06
section: dev
category: Testing Fundamentals
series: testing_fundamentals
seriesTitle: 'Testing Fundamentals'
order: 27
chapter: 'End-To-End Testing'
tags:
    - frontendMasters
    - testingFundamentals
    - JavaScript
    - Playwright
    - EndToEndTesting
    - MockServiceWorker
    - ServiceWorker
    - NetworkInterception
    - HAR
    - VisualRegressionTesting
---

# Mock Service Worker 入門：在網路邊界攔截請求，搭配 Playwright 錄製重播 HAR

前面一路談了不少 mock、stub、spy，但這些招式對付的多半是程式碼內部的依賴，那後端呢？這篇要介紹的 Mock Service Worker，就是專門處理「後端」這一塊的工具。

## Mock Service Worker 是什麼：借用 service worker 攔截網路請求的能力

Service worker 原本是漸進式網頁應用程式（PWA）用來支援離線功能的機制：它站在應用程式跟網路之間，攔截每一次網路請求，離線時可以用快取內容頂替，等連上網路後再同步回去。

Mock Service Worker（簡稱 MSW）借用了這套攔截機制，但用途改成測試跟開發：告訴它某些端點不要真的去打伺服器，而是直接回傳指定好的假資料。效果是直接把整個後端假造掉，程式本身完全不用知道這件事，照常發出請求、收到回應，只是回應內容其實來自 MSW，不是真正的伺服器。這套機制同時可以用在瀏覽器裡的開發模式，也可以用在測試裡。

## 為什麼要用它：三個實際的好處

- **測試跑得更快**：不需要真的打一次網路，少了這段等待時間
- **測試更穩定**：回應內容是固定寫死的，不會因為網路或後端的狀況而忽好忽壞
- **能在 API 還沒做完時就先往下開發**：只要先假造好一兩個還沒真正存在的端點，前端工作就不用卡在等後端完工

而且因為攔截發生在應用程式跟外部世界的邊界上，完全不需要為了測試動到程式碼本身：反正正常情況下本來就管不到伺服器實際上做了什麼事（除非連伺服器也是自己負責測試的範圍），MSW 做的事情就是把邊界畫在「離開應用程式、準備打到伺服器」的那一刻，告訴它預期會收到什麼樣的回應。

## 用 handler 定義假的回應

以課程範例裡的待辦清單 app 為例，可以針對 `/api/tasks` 這個路徑定義一個 handler，告訴 MSW 遇到這個 GET 請求時不要真的發出去，直接回傳兩筆假資料：

```javascript
import { http, HttpResponse } from 'msw';

http.get('/api/tasks', async () => {
    return HttpResponse.json([
        { id: 1, title: 'Learn Playwright' },
        { id: 2, title: 'Learn Mock Service Worker' },
    ]);
});
```

這套 handler 不只能在單元測試裡用，瀏覽器裡的開發模式也能直接跑起來，Playwright 裡一樣能用。更進一步的是，不同測試情境可以切換成不同的回應內容：這次想測一般使用者的視角，下次想測管理員帳號會看到的資料，或是刻意回一個格式不對的壞資料、一個 404 錯誤，都只是換一組 handler 的回應內容而已。

## 連寫入也能模擬，但小心別把整個後端重寫一遍

除了讀取，也可以模擬會寫入資料的請求，例如新增一筆任務的 POST 請求：

```javascript
http.post('/api/tasks', async ({ request }) => {
    const { title } = await request.json();

    // ...在這個假的後端邏輯裡，把 title 存進一個暫存在記憶體裡的假任務清單...

    return HttpResponse.json({ title });
});
```

這裡確實可以做到很接近真實伺服器的行為：讀取請求本體拿到使用者送出的資料，甚至在記憶體裡模擬一個簡易的資料儲存。但這也是容易失控的地方：如果不停往這個方向加東西，加到最後等於是把整個伺服器重新寫了一遍，模擬的意義也就不大了。保持警覺、拿捏好要模擬到多細，是這個做法真正該注意的地方。

## 搭配 Playwright：錄一次網路流量，到處重播

Chrome 開發者工具的網路分頁裡，可以把一個請求的完整往返內容「複製成 HAR」（HTTP Archive，記錄請求跟回應的完整內容）。Playwright 可以讀取這類 HAR 檔案，告訴它遇到某個端點時，直接用 HAR 裡記錄好的內容回應，不用真的連網路。

更有用的玩法是反過來：讓 Playwright 真的去打一次 staging 或正式環境的伺服器，一邊操作畫面、一邊把所有網路請求錄下來，而且會保留請求發生的順序（例如先取得所有任務、再新增一筆、再重新取得一次清單，順序都完整記錄下來）。錄好之後，之後要重複跑這個測試，就不用再真的連網路，直接把錄好的這一份網路流量重播回去就好。

## 實戰案例：拿來做視覺回歸測試

這整套能力實際的用法之一，是結合 Playwright 跨多種螢幕尺寸開啟瀏覽器、錄好網路流量、再對畫面拍下截圖，用來做視覺回歸測試。講師分享了自己過去踩過的坑：曾經整整三個月忘記處理深色模式，響應式設計也沒做得夠好，事後回頭補救壓力很大。有了這套「多視窗尺寸 + 網路流量錄製 + 截圖比對」的機制，萬一改手機版畫面時不小心弄壞了平板版的樣式，馬上就有視覺證據可以比對出來。

這也呼應了做大型重構時的心態：先把測試布好、布到讓自己有信心的程度，再動手重構。重構的過程中還是可能弄壞一些東西，但重點是自己先發現，而不是等使用者發現。

## 複習

### Mock Service Worker（MSW）在網頁開發裡主要的用途是什麼？

MSW 用來在開發與測試時攔截網路請求，讓開發者可以假造後端的回應，不需要修改應用程式本身的程式碼，藉此加快測試速度並讓開發更有彈性

### Service worker 在處理網路請求時扮演什麼角色？

Service worker 站在應用程式跟網路之間，攔截網路請求，可能提供離線使用的能力，也能自訂怎麼處理這些請求的回應

### 使用 Mock Service Worker 有哪些關鍵好處？

一是測試跑得更快，因為不需要真的打網路；二是測試更可靠，因為回應內容是自己控制的；三是可以在後端還沒做完時就先開發前端；四是可以模擬各種不同的回應情境，例如錯誤或特定的資料狀態

### Mock Service Worker 要怎麼設定來處理不同的 HTTP 方法？

MSW 可以針對 GET、POST、PUT、PATCH 這類不同的 HTTP 方法設定對應的 handler，開發者可以替每個端點自訂回應邏輯，回傳預先寫好的 JSON，或模擬伺服器實際上會有的行為

### Mock Service Worker 跟傳統的 mock 做法有什麼不同？

跟在程式碼層級做 mock 不同，MSW 是在網路邊界攔截請求，代表應用程式的程式碼完全不需要更動，而且這套做法在單元測試、瀏覽器開發模式這類不同的測試環境裡都能通用

## 小測驗

<details>
<summary>Mock Service Worker 最主要的用途是什麼？</summary>
攔截網路請求，回傳預先定義好的回應
</details>

<details>
<summary>Mock Service Worker 在開發階段能帶來什麼幫助？</summary>
可以在 API 還沒完全做好之前，就先針對它開發
</details>

<details>
<summary>Service worker 在網頁應用程式裡扮演什麼角色？</summary>
站在應用程式跟網路之間，攔截請求
</details>

<details>
<summary>Mock Service Worker 在測試上提供了什麼彈性？</summary>
可以針對不同的測試情境，切換成不同的回應內容
</details>

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Testing Fundamentals](https://master.dev/courses/testing/) 課程筆記
