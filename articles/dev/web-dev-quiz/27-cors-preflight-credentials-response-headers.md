---
title: CORS Config 解析：Preflight、Credentials 與 Response Headers
description: 解析一道 CORS 設定題，涵蓋 Same-Origin Policy、Simple Request 與 Preflighted Request 的判斷條件，以及各 CORS Response Header 的作用與限制。
date: 2026-04-17
category: 程式筆記
section: dev
tags:
    - advancedWebDevelopmentQuiz
    - frontendMasters
    - CORS
    - HTTP
---

# CORS Config 解析：Preflight、Credentials 與 Response Headers

> 此文章是 [FrontendMasters](https://frontendmasters.com/) 上的 [Advanced Web Development Quiz](https://frontendmasters.com/courses/web-dev-quiz/) 課程筆記

## 問題

What is true about the following CORS config?

Select the correct answer.

```
Access-Control-Allow-Origin: https://www.website.com
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: *
Access-Control-Expose-Headers: X-Custom-Header
Access-Control-Max-Age: 600
```

[1] A preflight request is required
[2] Only requests from https://www.website.com are allowed
[3] Requests with cookies are allowed
[4] The actual response is cached for 600ms
[5] X-Custom-Header will be the only included response header
[6] GET, POST, PATCH and PUT methods are allowed, but not DELETE

## CORS

說明 CORS 之前需要先了解 `Same-Origin Policy` (同源政策)。

瀏覽器預設實作「同源政策」，限制不同來源之間的資源存取。`同源` 指的是 protocol + domain + port 三者完全相同。

```
https://www.website.com:443/page
│       │               │
protocol domain          port
```

### CORS 是什麼？

CORS（Cross-Origin Resource Sharing）是同元政策的延伸機制，允許伺服器明確宣告哪些跨來源請求是被允許的

> 重要觀念：CORS 是瀏覽器的安全機制，不是伺服器的防火牆。伺服器仍然會收到並處理請求，是瀏覽器決定要不要把回應給前端 JavaScript 讀取。

### 流程

```
前端 (www.website.com)          伺服器 (api.other.com)
        │                               │
        │── GET /posts ──────────────►  │
        │   Origin: www.website.com     │
        │                               │ 處理請求
        │  ◄── 200 OK ───────────────── │
        │   Access-Control-Allow-Origin │
        │   : www.website.com           │
        │                               │
   瀏覽器檢查 header
   origin 符合 → 允許 JS 讀取回應
   origin 不符 → 封鎖，JS 無法讀取
```

### Simple Request vs Preflighted Request

#### Simple Request（簡單請求）

符合以下條件即稱為簡單請求，不需要 preflight:

- method 為 `GET`、`HEAD`、`POST` 之一
- Header 只包含 CORS 安全清單內的欄位（`Content-Type`、`Accept`、`Accept-Language`、`Content-Language`、`Range` 等）
- `Content-Type` 只能是 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`

#### Preflighted Request（預檢請求）

不符合簡單請求條件時（例如使用 `DELETE`、`PUT`、自訂 header），瀏覽器會先送一個 `OPTIONS` 請求詢問伺服器是否允許，再決定要不要送真正的請求。

```
前端                              伺服器
  │                                 │
  │── OPTIONS /posts ─────────────► │  ← preflight
  │   Origin: www.website.com       │
  │   Access-Control-Request-Method │
  │   : DELETE                      │
  │                                 │
  │ ◄── 204 No Content ──────────── │
  │   Access-Control-Allow-Origin   │
  │   : www.website.com             │
  │   Access-Control-Allow-Methods  │
  │   : GET, POST   ← 沒有 DELETE    │
  │                                 │
  ❌ DELETE 不被允許，實際請求不送出
```

若 preflight 通過，瀏覽器才會送出真正的請求。

### 常見 CORS Response Headers 說明

| Header                             |                                                          |
| ---------------------------------- | -------------------------------------------------------- |
| `Access-Control-Allow-Origin`      | 允許的來源，可指定單一 origin 或 `*`                     |
| `Access-Control-Allow-Methods`     | 允許的 HTTP 方法                                         |
| `Access-Control-Allow-Headers`     | 允許的請求 header                                        |
| `Access-Control-Allow-Credentials` | 是否允許攜帶 cookie/credentials，需明確設為 `true`       |
| `Access-Control-Expose-Headers`    | 允許前端 JS 讀取的自訂 response header                   |
| `Access-Control-Max-Age`           | preflight 回應的快取時間（秒），避免每次都重新 preflight |

### `Access-Control-Allow-Credentials`

若需要攜帶 cookie，除了設定該 header 之外，`Access-Control-Allow-Origin` 不能使用 `*`，必須指定明確的 origin

## 答案

只有這個是正確的

```
[2] Only requests from https://www.website.com are allowed
```

## 參考

- [跨來源資源共享（CORS） "MDN"](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Guides/CORS)
