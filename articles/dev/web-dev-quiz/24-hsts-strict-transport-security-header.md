---
series: web-dev-quiz
seriesTitle: 'Advanced Web Dev Quiz'
order: 24
title: 從 HSTS 看網站安全：理解 Strict-Transport-Security Header
description: 本文介紹 HTTP 安全性標頭 Strict-Transport-Security (HSTS) 的作用與設定方式，說明它如何強制使用 HTTPS 連線並保護網站免於中間人攻擊
date: 2026-02-26
category: Advanced Web Dev Quiz
section: dev
tags:
    - Security
    - HTTP
    - frontendMasters
    - advancedWebDevelopmentQuiz
---

# 從 HSTS 看網站安全：理解 Strict-Transport-Security Header

> 此文章是 [FrontendMaster](https://frontendmasters.com/) 上的 [Advanced Web Development Quiz](https://frontendmasters.com/courses/web-dev-quiz/) 課程筆記

## 問題

What is true about the following header?
Select all the correct answers.

`Strict-Transport-Security: max-age=31536000; includeSubdomains;`

[a] The header enforces HTTPS for one year on the domain and its subdomains
[b] When max-age expires, browsers will default to HTTP
[c] The max-age is refreshed every time the browser reads the header
[d] Insecure requests to subdomains are allowed

## Strict-Transport-Security（HSTS）

HSTS 是一個 HTTP 回應 header，用來告訴瀏覽器「這個網站未來只能用 HTTPS 存取，不要再用 HTTP」。

也就是說，第一次執行對伺服器請求時，伺服器若回應的 headers 中包含這個 header，瀏覽器就會把這個網站記錄下來，當第二次請求時，就會確保使用 HTTPS，這樣子可以確保使用者不會誤連 HTTP 造成曝露在中間人攻擊的風險中。

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

有兩個參數

- `max-age`: 單位是秒，用來告訴瀏覽器這個記錄要留存多久，當每一次請求時，這個記錄會刷新
- `includeSubDomains`: 這個是非必填，加了這個值，所有子網域都會被要求要使用 HTTPS，而不是當前網域而已。

## 答案

[a] The header enforces HTTPS for one year on the domain and its subdomains
[c] The max-age is refreshed every time the browser reads the header

## 參考

- [Strict-Transport-Security header "MDN"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security)
